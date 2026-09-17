/**
 * Prisma seed: `npm run db:seed` (or `npx prisma db seed`) from backend/.
 *
 * Idempotent throughout — every write is an upsert keyed on a natural unique
 * column, so re-running after the permission catalogue grows is safe and will
 * not duplicate rows.
 */
import { PrismaClient, RecordStatus, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Imported from source rather than from `@dpgc/shared`, because the seed runs
// under ts-node before the shared package has necessarily been built.
import { PERMISSION_DEFINITIONS } from '../../shared/src/constants/permissions';
import { ROLE_DEFINITIONS, permissionsForRole } from '../../shared/src/constants/roles';

const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Password123!';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

const DEPARTMENTS = [
  { name: 'Tourism Department', code: 'TOURISM', description: 'West Bengal Tourism Department' },
  { name: 'Information & Cultural Affairs', code: 'ICA', description: 'Information and Cultural Affairs Department' },
  { name: 'Content & Communications', code: 'CONTENT', description: 'Editorial and communications team' },
  { name: 'IT & Digital Services', code: 'IT', description: 'Platform engineering and support' },
  { name: 'District Administration', code: 'DISTRICT', description: 'District-level coordination offices' },
];

const STAFF_USERS = [
  { email: 'admin@durgapujaglobalconnect.in', firstName: 'Super', lastName: 'Admin', username: 'superadmin', employeeId: 'EMP-0001', roleSlug: 'super-admin', departmentCode: 'IT' },
  { email: 'admin@example.com', firstName: 'Portal', lastName: 'Super Admin', username: 'admin', employeeId: 'SA-0001', roleSlug: 'super-admin', departmentCode: 'TOURISM' },
  { email: 'portal.admin@durgapujaglobalconnect.in', firstName: 'Portal', lastName: 'Administrator', username: 'portaladmin', employeeId: 'EMP-0002', roleSlug: 'portal-administrator', departmentCode: 'TOURISM' },
  { email: 'content.manager@durgapujaglobalconnect.in', firstName: 'Content', lastName: 'Manager', username: 'contentmanager', employeeId: 'EMP-0003', roleSlug: 'content-manager', departmentCode: 'CONTENT' },
  { email: 'committee.manager@durgapujaglobalconnect.in', firstName: 'Committee', lastName: 'Manager', username: 'committeemanager', employeeId: 'EMP-0004', roleSlug: 'committee-manager', departmentCode: 'TOURISM' },
  { email: 'diaspora.manager@durgapujaglobalconnect.in', firstName: 'Diaspora', lastName: 'Manager', username: 'diasporamanager', employeeId: 'EMP-0005', roleSlug: 'diaspora-manager', departmentCode: 'ICA' },
  { email: 'media.manager@durgapujaglobalconnect.in', firstName: 'Media', lastName: 'Manager', username: 'mediamanager', employeeId: 'EMP-0006', roleSlug: 'media-manager', departmentCode: 'CONTENT' },
  { email: 'event.manager@durgapujaglobalconnect.in', firstName: 'Event', lastName: 'Manager', username: 'eventmanager', employeeId: 'EMP-0007', roleSlug: 'event-manager', departmentCode: 'ICA' },
];

const TAXONOMY = [
  {
    name: 'Article',
    slug: 'article',
    description: 'Editorial content published to the public news section.',
    subcategories: [
      { name: 'News', slug: 'news' },
      { name: 'Festival Stories', slug: 'festival-stories' },
      { name: 'Heritage', slug: 'heritage' },
      { name: 'Travel & Tourism', slug: 'travel-tourism' },
      { name: 'Announcements', slug: 'announcements' },
      { name: 'Interviews', slug: 'interviews' },
    ],
  },
  {
    name: 'Media',
    slug: 'media',
    description: 'Committee gallery uploads: photos and videos.',
    subcategories: [
      { name: 'Pandal Photos', slug: 'pandal-photos' },
      { name: 'Idol & Decor', slug: 'idol-decor' },
      { name: 'Rituals', slug: 'rituals' },
      { name: 'Cultural Programmes', slug: 'cultural-programmes' },
      { name: 'Videos', slug: 'videos' },
    ],
  },
  {
    name: 'Nomination',
    slug: 'nomination',
    description: 'Award and recognition nominations.',
    subcategories: [
      { name: 'Best Pandal', slug: 'best-pandal' },
      { name: 'Best Idol', slug: 'best-idol' },
      { name: 'Community Service', slug: 'community-service' },
    ],
  },
];

async function seedPermissions(): Promise<void> {
  for (const definition of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { permissionKey: definition.permissionKey },
      update: { module: definition.module, permissionName: definition.permissionName },
      create: {
        module: definition.module,
        permissionName: definition.permissionName,
        permissionKey: definition.permissionKey,
        status: RecordStatus.ACTIVE,
      },
    });
  }

  console.log(`  Permissions: ${PERMISSION_DEFINITIONS.length}`);
}

async function seedRoles(): Promise<void> {
  // Resolve permission keys to ids once rather than per role.
  const permissions = await prisma.permission.findMany({
    select: { id: true, permissionKey: true },
  });
  const permissionIdByKey = new Map(permissions.map((p) => [p.permissionKey, p.id]));

  let grants = 0;

  for (const definition of ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: { slug: definition.slug },
      update: {
        name: definition.name,
        description: definition.description,
        isSystem: definition.isSystem ?? false,
      },
      create: {
        name: definition.name,
        slug: definition.slug,
        description: definition.description,
        isSystem: definition.isSystem ?? false,
        status: RecordStatus.ACTIVE,
      },
    });

    for (const key of permissionsForRole(definition)) {
      const permissionId = permissionIdByKey.get(key);

      if (!permissionId) {
        throw new Error(
          `Role "${definition.name}" references unknown permission key "${key}". ` +
            'Add it to PERMISSION_DEFINITIONS in backend/shared/src/constants/permissions.ts.',
        );
      }

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });

      grants += 1;
    }
  }

  console.log(`  Roles: ${ROLE_DEFINITIONS.length} with ${grants} permission grants`);
}

async function seedDepartments(): Promise<void> {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { code: department.code },
      update: { name: department.name, description: department.description },
      create: department,
    });
  }

  console.log(`  Departments: ${DEPARTMENTS.length}`);
}

async function seedUsers(): Promise<void> {
  const password = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

  const departments = await prisma.department.findMany({ select: { id: true, code: true } });
  const departmentIdByCode = new Map(departments.map((d) => [d.code, d.id]));

  const roles = await prisma.role.findMany({ select: { id: true, slug: true } });
  const roleIdBySlug = new Map(roles.map((r) => [r.slug, r.id]));

  for (const staff of STAFF_USERS) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        firstName: staff.firstName,
        lastName: staff.lastName,
        name: `${staff.firstName} ${staff.lastName}`,
        status: UserStatus.ACTIVE,
        departmentId: departmentIdByCode.get(staff.departmentCode) ?? null,
        password,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      create: {
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        name: `${staff.firstName} ${staff.lastName}`,
        username: staff.username,
        employeeId: staff.employeeId,
        password,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        departmentId: departmentIdByCode.get(staff.departmentCode) ?? null,
        country: 'India',
        state: 'West Bengal',
        city: 'Kolkata',
      },
    });

    const roleId = roleIdBySlug.get(staff.roleSlug);

    if (roleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }
  }

  console.log(`  Users: ${STAFF_USERS.length} staff accounts with roles assigned`);
}

async function seedTaxonomy(): Promise<void> {
  let subcategoryCount = 0;

  for (const category of TAXONOMY) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        status: RecordStatus.ACTIVE,
      },
    });

    for (const sub of category.subcategories) {
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: created.id, slug: sub.slug } },
        update: { name: sub.name },
        create: {
          categoryId: created.id,
          name: sub.name,
          slug: sub.slug,
          status: RecordStatus.ACTIVE,
        },
      });

      subcategoryCount += 1;
    }
  }

  console.log(`  Taxonomy: ${TAXONOMY.length} categories, ${subcategoryCount} subcategories`);
}

async function main(): Promise<void> {
  console.log('Seeding Durga Puja Global Connect database...');

  // Order matters: permissions before roles, departments and roles before users.
  await seedPermissions();
  await seedRoles();
  await seedDepartments();
  await seedUsers();
  await seedTaxonomy();

  console.log('\nSeed complete.');
  console.log(`  Sign in with admin@durgapujaglobalconnect.in / ${SEED_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error('\nSeed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
