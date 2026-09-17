"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RbacService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../audit/audit.service");
const MODULE = 'Role Management';
/**
 * The keys the guards and decorators reference in code. Rows carrying one of
 * these are the portal's own wiring rather than data an administrator added,
 * so they are protected from deletion and deactivation.
 */
const BUILT_IN_PERMISSION_KEYS = new Set(Object.values(shared_1.PERMISSIONS));
const isBuiltInPermission = (key) => BUILT_IN_PERMISSION_KEYS.has(key);
let RbacService = RbacService_1 = class RbacService {
    prisma;
    audit;
    logger = new common_1.Logger(RbacService_1.name);
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    // -------------------------------------------------------------------------
    // Roles
    // -------------------------------------------------------------------------
    async findAllRoles(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            // The trash view is the same list with the soft-delete filter inverted.
            deletedAt: query.trashed ? { not: null } : null,
            ...(query.status ? { status: query.status } : {}),
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { slug: { contains: query.search, mode: 'insensitive' } },
                        { description: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.role.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy ?? 'name']: query.sortDir },
                include: { _count: { select: { permissions: true, users: true } } },
            }),
            this.prisma.role.count({ where }),
        ]);
        const items = rows.map((role) => ({
            id: role.id,
            name: role.name,
            slug: role.slug,
            description: role.description,
            status: role.status,
            isSystem: role.isSystem,
            permissionCount: role._count.permissions,
            userCount: role._count.users,
            createdAt: role.createdAt,
            deletedAt: role.deletedAt,
        }));
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    /** Role counts for the list header: live totals plus what sits in the trash. */
    async roleStats() {
        const [total, active, inactive, trashed] = await this.prisma.$transaction([
            this.prisma.role.count({ where: { deletedAt: null } }),
            this.prisma.role.count({ where: { deletedAt: null, status: database_1.RecordStatus.ACTIVE } }),
            this.prisma.role.count({ where: { deletedAt: null, status: database_1.RecordStatus.INACTIVE } }),
            this.prisma.role.count({ where: { deletedAt: { not: null } } }),
        ]);
        return { total, active, inactive, trashed };
    }
    async findOneRole(id) {
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } },
            },
        });
        if (!role)
            throw shared_1.ServiceException.notFound(`No role exists with id ${id}.`);
        return {
            id: role.id,
            name: role.name,
            slug: role.slug,
            description: role.description,
            status: role.status,
            isSystem: role.isSystem,
            userCount: role._count.users,
            permissions: role.permissions.map((link) => link.permission),
        };
    }
    async createRole(payload) {
        const { data, actorId } = payload;
        try {
            const role = await this.prisma.role.create({
                data: {
                    name: data.name,
                    slug: (0, shared_1.slugify)(data.name),
                    description: data.description ?? null,
                    status: database_1.RecordStatus.ACTIVE,
                    createdById: actorId,
                    updatedById: actorId,
                    permissions: data.permissionIds?.length
                        ? { create: data.permissionIds.map((permissionId) => ({ permissionId })) }
                        : undefined,
                },
                include: { permissions: { include: { permission: true } } },
            });
            await this.audit.record({
                userId: actorId,
                action: 'created',
                module: MODULE,
                auditableType: 'Role',
                auditableId: role.id,
                description: `Created role ${role.name}`,
                newValues: { name: role.name, permissionIds: data.permissionIds ?? [] },
            });
            return role;
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'role');
        }
    }
    async updateRole(payload) {
        const { id, data, actorId } = payload;
        const existing = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, name: true, isSystem: true },
        });
        if (!existing)
            throw shared_1.ServiceException.notFound(`No role exists with id ${id}.`);
        // Renaming a system role would break the code that looks it up by name.
        if (existing.isSystem && data.name && data.name !== existing.name) {
            throw shared_1.ServiceException.forbidden(`"${existing.name}" is a system role and cannot be renamed.`);
        }
        try {
            const role = await this.prisma.role.update({
                where: { id },
                data: {
                    name: data.name,
                    slug: data.name ? (0, shared_1.slugify)(data.name) : undefined,
                    description: data.description,
                    updatedById: actorId,
                },
            });
            await this.audit.record({
                userId: actorId,
                action: 'updated',
                module: MODULE,
                auditableType: 'Role',
                auditableId: id,
                description: `Updated role ${role.name}`,
                oldValues: { name: existing.name },
                newValues: { name: role.name },
            });
            return role;
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'role');
        }
    }
    async removeRole(payload) {
        const { id, actorId } = payload;
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
            include: { _count: { select: { users: true } } },
        });
        if (!role)
            throw shared_1.ServiceException.notFound(`No role exists with id ${id}.`);
        if (role.isSystem) {
            throw shared_1.ServiceException.forbidden(`"${role.name}" is a system role and cannot be deleted.`);
        }
        // Deleting an assigned role would silently strip those users' access.
        if (role._count.users > 0) {
            throw shared_1.ServiceException.conflict(`"${role.name}" is still assigned to ${role._count.users} user(s). Reassign them first.`, { userCount: role._count.users });
        }
        await this.prisma.role.update({
            where: { id },
            data: { deletedAt: new Date(), status: database_1.RecordStatus.INACTIVE, updatedById: actorId },
        });
        await this.audit.record({
            userId: actorId,
            action: 'deleted',
            module: MODULE,
            auditableType: 'Role',
            auditableId: id,
            description: `Deleted role ${role.name}`,
        });
        return { id, deleted: true };
    }
    /** Brings a soft-deleted role back, inactive, so nobody regains access silently. */
    async restoreRole(payload) {
        const { id, actorId } = payload;
        const role = await this.prisma.role.findUnique({
            where: { id },
            select: { id: true, name: true, deletedAt: true },
        });
        if (!role)
            throw shared_1.ServiceException.notFound(`No role exists with id ${id}.`);
        if (!role.deletedAt) {
            throw shared_1.ServiceException.conflict(`"${role.name}" is not in the trash.`);
        }
        const restored = await this.prisma.role.update({
            where: { id },
            data: { deletedAt: null, status: database_1.RecordStatus.INACTIVE, updatedById: actorId },
        });
        await this.audit.record({
            userId: actorId,
            action: 'restored',
            module: MODULE,
            auditableType: 'Role',
            auditableId: id,
            description: `Restored role ${role.name}`,
        });
        return {
            id: restored.id,
            name: restored.name,
            slug: restored.slug,
            status: restored.status,
        };
    }
    async toggleRoleStatus(payload) {
        const { id, actorId } = payload;
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, name: true, status: true, isSystem: true },
        });
        if (!role)
            throw shared_1.ServiceException.notFound(`No role exists with id ${id}.`);
        // Deactivating Super Admin would lock everyone out of role management.
        if (role.isSystem && role.status === database_1.RecordStatus.ACTIVE) {
            throw shared_1.ServiceException.forbidden(`"${role.name}" is a system role and cannot be deactivated.`);
        }
        const status = role.status === database_1.RecordStatus.ACTIVE ? database_1.RecordStatus.INACTIVE : database_1.RecordStatus.ACTIVE;
        const updated = await this.prisma.role.update({
            where: { id },
            data: { status, updatedById: actorId },
        });
        await this.audit.record({
            userId: actorId,
            action: 'updated',
            module: MODULE,
            auditableType: 'Role',
            auditableId: id,
            description: `Changed status of role ${role.name} to ${status}`,
            oldValues: { status: role.status },
            newValues: { status },
        });
        return { id: updated.id, name: updated.name, status: updated.status };
    }
    /** Replaces a role's permissions with exactly the supplied set. */
    async syncPermissions(payload) {
        const { id, permissionIds, actorId } = payload;
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
            include: { permissions: { select: { permissionId: true } } },
        });
        if (!role)
            throw shared_1.ServiceException.notFound(`No role exists with id ${id}.`);
        const known = await this.prisma.permission.findMany({
            where: { id: { in: permissionIds }, deletedAt: null },
            select: { id: true },
        });
        if (known.length !== permissionIds.length) {
            const unknown = permissionIds.filter((pid) => !known.some((p) => p.id === pid));
            throw shared_1.ServiceException.badRequest('One or more permissions do not exist.', { unknown });
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.rolePermission.deleteMany({ where: { roleId: id } });
            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
                    skipDuplicates: true,
                });
            }
            await tx.role.update({ where: { id }, data: { updatedById: actorId } });
        });
        await this.audit.record({
            userId: actorId,
            action: 'permissions_synced',
            module: MODULE,
            auditableType: 'Role',
            auditableId: id,
            description: `Updated permissions for role ${role.name}`,
            oldValues: { permissionIds: role.permissions.map((p) => p.permissionId) },
            newValues: { permissionIds },
        });
        this.logger.log(`Role ${role.name} now has ${permissionIds.length} permission(s) (actor #${actorId})`);
        return this.findOneRole(id);
    }
    /**
     * The full role x permission grid for the matrix UI, returned as a set of
     * granted pairs so the client does not have to cross-reference nested lists.
     */
    async matrix() {
        const [roles, permissions, grants] = await this.prisma.$transaction([
            this.prisma.role.findMany({
                where: { deletedAt: null },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, slug: true, isSystem: true },
            }),
            this.prisma.permission.findMany({
                where: { deletedAt: null },
                orderBy: [{ module: 'asc' }, { permissionName: 'asc' }],
                select: { id: true, module: true, permissionName: true, permissionKey: true },
            }),
            this.prisma.rolePermission.findMany({ select: { roleId: true, permissionId: true } }),
        ]);
        const modules = [...new Set(permissions.map((p) => p.module))].map((module) => ({
            module,
            permissions: permissions.filter((p) => p.module === module),
        }));
        return {
            roles,
            modules,
            granted: grants.map((grant) => `${grant.roleId}:${grant.permissionId}`),
        };
    }
    // -------------------------------------------------------------------------
    // Permissions
    // -------------------------------------------------------------------------
    async findAllPermissions(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            // The trash view is the same list with the soft-delete filter inverted.
            deletedAt: query.trashed ? { not: null } : null,
            ...(query.module ? { module: query.module } : {}),
            ...(query.status ? { status: query.status } : {}),
            ...(query.search
                ? {
                    OR: [
                        { permissionName: { contains: query.search, mode: 'insensitive' } },
                        { permissionKey: { contains: query.search, mode: 'insensitive' } },
                        { module: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        // Within a module the permission name is the meaningful secondary order,
        // and it is what the previous portal's default listing used.
        const orderBy = query.sortBy
            ? [{ [query.sortBy]: query.sortDir }]
            : [{ module: 'asc' }, { permissionName: 'asc' }];
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.permission.findMany({
                where,
                skip,
                take,
                orderBy,
                include: { _count: { select: { roles: true } } },
            }),
            this.prisma.permission.count({ where }),
        ]);
        const items = rows.map((permission) => ({
            id: permission.id,
            module: permission.module,
            permissionName: permission.permissionName,
            permissionKey: permission.permissionKey,
            description: permission.description,
            status: permission.status,
            roleCount: permission._count.roles,
            createdAt: permission.createdAt,
            deletedAt: permission.deletedAt,
        }));
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    async findOnePermission(id) {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
            include: {
                roles: { include: { role: { select: { id: true, name: true, slug: true } } } },
            },
        });
        if (!permission)
            throw shared_1.ServiceException.notFound(`No permission exists with id ${id}.`);
        return {
            id: permission.id,
            module: permission.module,
            permissionName: permission.permissionName,
            permissionKey: permission.permissionKey,
            description: permission.description,
            status: permission.status,
            createdAt: permission.createdAt,
            deletedAt: permission.deletedAt,
            roles: permission.roles.map((link) => link.role),
        };
    }
    /** Counts for the list header, including how many distinct modules exist. */
    async permissionStats() {
        const [total, active, trashed, modules] = await this.prisma.$transaction([
            this.prisma.permission.count({ where: { deletedAt: null } }),
            this.prisma.permission.count({ where: { deletedAt: null, status: database_1.RecordStatus.ACTIVE } }),
            this.prisma.permission.count({ where: { deletedAt: { not: null } } }),
            this.prisma.permission.groupBy({
                by: ['module'],
                where: { deletedAt: null },
                orderBy: { module: 'asc' },
            }),
        ]);
        return { total, active, modules: modules.length, trashed };
    }
    /** Distinct module names, for the list filter. */
    async permissionModules() {
        const grouped = await this.prisma.permission.groupBy({
            by: ['module'],
            where: { deletedAt: null },
            orderBy: { module: 'asc' },
        });
        return grouped.map((row) => row.module);
    }
    async createPermission(payload) {
        const { data, actorId } = payload;
        try {
            const permission = await this.prisma.permission.create({
                data: {
                    module: data.module,
                    permissionName: data.permissionName,
                    // Keys are compared verbatim by the guards, so they are normalised
                    // once here rather than at every call site.
                    permissionKey: data.permissionKey.trim().toLowerCase(),
                    description: data.description ?? null,
                    status: database_1.RecordStatus.ACTIVE,
                },
            });
            await this.audit.record({
                userId: actorId,
                action: 'created',
                module: MODULE,
                auditableType: 'Permission',
                auditableId: permission.id,
                description: `Created permission ${permission.permissionKey}`,
                newValues: { module: permission.module, permissionKey: permission.permissionKey },
            });
            return permission;
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'permission');
        }
    }
    async updatePermission(payload) {
        const { id, data, actorId } = payload;
        const existing = await this.prisma.permission.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, module: true, permissionName: true, permissionKey: true },
        });
        if (!existing)
            throw shared_1.ServiceException.notFound(`No permission exists with id ${id}.`);
        try {
            const permission = await this.prisma.permission.update({
                where: { id },
                // The key is deliberately not editable: the guards and the seed data
                // both reference it, so renaming one would silently revoke access.
                data: {
                    module: data.module,
                    permissionName: data.permissionName,
                    description: data.description,
                },
            });
            await this.audit.record({
                userId: actorId,
                action: 'updated',
                module: MODULE,
                auditableType: 'Permission',
                auditableId: id,
                description: `Updated permission ${permission.permissionKey}`,
                oldValues: { module: existing.module, permissionName: existing.permissionName },
                newValues: { module: permission.module, permissionName: permission.permissionName },
            });
            return permission;
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'permission');
        }
    }
    async removePermission(payload) {
        const { id, actorId } = payload;
        const permission = await this.prisma.permission.findFirst({
            where: { id, deletedAt: null },
            include: { _count: { select: { roles: true } } },
        });
        if (!permission)
            throw shared_1.ServiceException.notFound(`No permission exists with id ${id}.`);
        // A permission the code still checks for cannot be removed without
        // silently locking everyone out of that feature.
        if (isBuiltInPermission(permission.permissionKey)) {
            throw shared_1.ServiceException.forbidden(`"${permission.permissionName}" is built into the portal and cannot be deleted.`);
        }
        await this.prisma.permission.update({
            where: { id },
            data: { deletedAt: new Date(), status: database_1.RecordStatus.INACTIVE },
        });
        await this.audit.record({
            userId: actorId,
            action: 'deleted',
            module: MODULE,
            auditableType: 'Permission',
            auditableId: id,
            description: `Deleted permission ${permission.permissionKey}`,
            oldValues: { roleCount: permission._count.roles },
        });
        return { id, deleted: true };
    }
    /** Brings a soft-deleted permission back, inactive, as roles do. */
    async restorePermission(payload) {
        const { id, actorId } = payload;
        const permission = await this.prisma.permission.findUnique({
            where: { id },
            select: { id: true, permissionName: true, permissionKey: true, deletedAt: true },
        });
        if (!permission)
            throw shared_1.ServiceException.notFound(`No permission exists with id ${id}.`);
        if (!permission.deletedAt) {
            throw shared_1.ServiceException.conflict(`"${permission.permissionName}" is not in the trash.`);
        }
        const restored = await this.prisma.permission.update({
            where: { id },
            data: { deletedAt: null, status: database_1.RecordStatus.INACTIVE },
        });
        await this.audit.record({
            userId: actorId,
            action: 'restored',
            module: MODULE,
            auditableType: 'Permission',
            auditableId: id,
            description: `Restored permission ${permission.permissionKey}`,
        });
        return {
            id: restored.id,
            permissionName: restored.permissionName,
            status: restored.status,
        };
    }
    async togglePermissionStatus(payload) {
        const { id, actorId } = payload;
        const permission = await this.prisma.permission.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, permissionName: true, permissionKey: true, status: true },
        });
        if (!permission)
            throw shared_1.ServiceException.notFound(`No permission exists with id ${id}.`);
        // Deactivating a built-in key revokes it for every role at next sign-in,
        // which would break the feature it guards.
        if (isBuiltInPermission(permission.permissionKey) && permission.status === database_1.RecordStatus.ACTIVE) {
            throw shared_1.ServiceException.forbidden(`"${permission.permissionName}" is built into the portal and cannot be deactivated.`);
        }
        const status = permission.status === database_1.RecordStatus.ACTIVE ? database_1.RecordStatus.INACTIVE : database_1.RecordStatus.ACTIVE;
        const updated = await this.prisma.permission.update({ where: { id }, data: { status } });
        await this.audit.record({
            userId: actorId,
            action: 'updated',
            module: MODULE,
            auditableType: 'Permission',
            auditableId: id,
            description: `Changed status of permission ${permission.permissionKey} to ${status}`,
            oldValues: { status: permission.status },
            newValues: { status },
        });
        return { id: updated.id, permissionName: updated.permissionName, status: updated.status };
    }
    // -------------------------------------------------------------------------
    // Departments
    // -------------------------------------------------------------------------
    async findAllDepartments() {
        return this.prisma.department.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { users: true } } },
        });
    }
    async createDepartment(payload) {
        try {
            const department = await this.prisma.department.create({
                data: {
                    name: payload.data.name,
                    code: payload.data.code.toUpperCase(),
                    description: payload.data.description ?? null,
                },
            });
            await this.audit.record({
                userId: payload.actorId,
                action: 'created',
                module: 'Master Management',
                auditableType: 'Department',
                auditableId: department.id,
                description: `Created department ${department.name}`,
            });
            return department;
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'department');
        }
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = RbacService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof audit_service_1.AuditService !== "undefined" && audit_service_1.AuditService) === "function" ? _b : Object])
], RbacService);
