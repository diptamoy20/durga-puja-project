import { User, UserStatus } from '@dpgc/database';

/**
 * The user shape returned across the TCP boundary.
 *
 * `password`, `initialPassword` and the lockout counters are deliberately
 * absent: this type is the contract the gateway serialises to the client, so
 * anything listed here is public. A credential hash must never be reachable
 * from an API response.
 */
export interface UserEntity {
  id: number;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
  username: string | null;
  employeeId: string | null;
  phone: string | null;
  status: UserStatus;
  profileImage: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  emailVerified: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  department: { id: number; name: string; code: string } | null;
  roles: Array<{ id: number; name: string; slug: string }>;
}

type UserRecord = User & {
  department?: { id: number; name: string; code: string } | null;
  roles?: Array<{ role: { id: number; name: string; slug: string } }>;
};

/** Single mapping point, so no endpoint can leak a field by accident. */
export function toUserEntity(user: UserRecord): UserEntity {
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
export const USER_ENTITY_INCLUDE = {
  department: { select: { id: true, name: true, code: true } },
  roles: { include: { role: { select: { id: true, name: true, slug: true } } } },
} as const;
