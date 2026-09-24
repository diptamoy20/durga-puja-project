'use strict';

/**
 * Targeted Sharad Samman Bootstrap Script
 * 
 * Non-destructive:
 * 1. Upserts the 4 Sharad Samman permissions (view_nominations, manage_nominations, review_nominations, shortlist_nominations)
 * 2. Links the 4 permissions to the "Portal Administrator" role (role_permissions table)
 * 3. Upserts the active "Sharad Samman 2026" contest record
 * 
 * Does NOT touch users, passwords, or any unrelated tables.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PERMISSIONS_TO_SEED = [
  { module: 'Sharad Samman', permissionName: 'View Nominations', permissionKey: 'view_nominations' },
  { module: 'Sharad Samman', permissionName: 'Manage Nominations', permissionKey: 'manage_nominations' },
  { module: 'Sharad Samman', permissionName: 'Review Nominations', permissionKey: 'review_nominations' },
  { module: 'Sharad Samman', permissionName: 'Shortlist Nominations', permissionKey: 'shortlist_nominations' },
  { module: 'Sharad Samman', permissionName: 'Manage Contests', permissionKey: 'manage_contests' },
];

async function main() {
  console.log('--- Starting Targeted Sharad Samman Bootstrap ---');

  // 1. Upsert Permissions
  const permissionIds = [];
  for (const item of PERMISSIONS_TO_SEED) {
    const perm = await prisma.permission.upsert({
      where: { permissionKey: item.permissionKey },
      update: { module: item.module, permissionName: item.permissionName },
      create: {
        module: item.module,
        permissionName: item.permissionName,
        permissionKey: item.permissionKey,
        status: 'ACTIVE',
      },
    });
    console.log(`✓ Permission: ${perm.permissionKey} (ID: ${perm.id})`);
    permissionIds.push(perm.id);
  }

  // 2. Link Permissions to "Portal Administrator" Role
  const portalAdminRole = await prisma.role.findUnique({
    where: { slug: 'portal-administrator' },
  });

  if (portalAdminRole) {
    for (const permissionId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: portalAdminRole.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: portalAdminRole.id,
          permissionId,
        },
      });
    }
    console.log(`✓ Assigned 4 permissions to role "${portalAdminRole.name}" (ID: ${portalAdminRole.id})`);
  } else {
    console.log('ℹ Role "portal-administrator" not found, skipping role mapping (Super Admin inherits all via wildcard)');
  }

  // 3. Upsert Active Contest
  const contest = await prisma.contest.upsert({
    where: {
      year_name: {
        year: 2026,
        name: 'Sharad Samman 2026',
      },
    },
    update: {
      status: 'ACTIVE',
    },
    create: {
      name: 'Sharad Samman 2026',
      year: 2026,
      description: 'Official West Bengal Durga Puja Sharad Samman 2026 Competition',
      status: 'ACTIVE',
      startDate: new Date('2026-09-01T00:00:00.000Z'),
      endDate: new Date('2026-10-31T23:59:59.000Z'),
    },
  });
  console.log(`✓ Contest: "${contest.name}" (ID: ${contest.id}, Status: ${contest.status}, Year: ${contest.year})`);

  console.log('--- Targeted Bootstrap Complete ---');
}

main()
  .catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
