"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ENTITY_INCLUDE = void 0;
exports.toUserEntity = toUserEntity;
/** Single mapping point, so no endpoint can leak a field by accident. */
function toUserEntity(user) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        username: user.username,
        employeeId: user.employeeId,
        phone: user.phone,
        status: user.status,
        profileImage: user.profileImage,
        country: user.country,
        state: user.state,
        city: user.city,
        address: user.address,
        emailVerified: user.emailVerified,
        mustChangePassword: user.mustChangePassword,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        department: user.department ?? null,
        roles: (user.roles ?? []).map((assignment) => assignment.role),
    };
}
/** Prisma `include` that satisfies UserEntity in a single query. */
exports.USER_ENTITY_INCLUDE = {
    department: { select: { id: true, name: true, code: true } },
    roles: { include: { role: { select: { id: true, name: true, slug: true } } } },
};
