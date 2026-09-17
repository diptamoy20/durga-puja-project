"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CommitteesService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitteesService = void 0;
const node_crypto_1 = require("node:crypto");
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
/**
 * Which status transitions are legal.
 *
 * The Laravel controller allowed any status to be set from the admin screen,
 * which let an approved committee silently revert to pending and orphan its
 * portal account. Encoding the state machine here prevents that.
 */
const ALLOWED_TRANSITIONS = {
    [database_1.CommitteeStatus.PENDING]: [database_1.CommitteeStatus.UNDER_REVIEW, database_1.CommitteeStatus.APPROVED, database_1.CommitteeStatus.REJECTED],
    [database_1.CommitteeStatus.UNDER_REVIEW]: [database_1.CommitteeStatus.APPROVED, database_1.CommitteeStatus.REJECTED],
    [database_1.CommitteeStatus.REJECTED]: [database_1.CommitteeStatus.UNDER_REVIEW],
    [database_1.CommitteeStatus.APPROVED]: [],
};
let CommitteesService = CommitteesService_1 = class CommitteesService {
    prisma;
    config;
    logger = new common_1.Logger(CommitteesService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    /** Sequential, year-scoped reference number, e.g. PC-2026-000042. */
    async nextRegistrationNo() {
        const year = new Date().getFullYear();
        const count = await this.prisma.pujaCommittee.count({
            where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00Z`) } },
        });
        return `PC-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    generatePassword(length = 12) {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        const bytes = (0, node_crypto_1.randomBytes)(length);
        let out = '';
        for (let i = 0; i < length - 2; i += 1)
            out += alphabet[bytes[i] % alphabet.length];
        return `${out}${(0, node_crypto_1.randomInt)(10)}${(0, node_crypto_1.randomInt)(10)}`;
    }
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            deletedAt: null,
            ...(query.status ? { status: query.status } : {}),
            ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { committeeName: { contains: query.search, mode: 'insensitive' } },
                        { registrationNo: { contains: query.search, mode: 'insensitive' } },
                        { committeeId: { contains: query.search, mode: 'insensitive' } },
                        { contactPersonName: { contains: query.search, mode: 'insensitive' } },
                        { email: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.pujaCommittee.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy ?? 'createdAt']: query.sortDir },
                include: {
                    user: { select: { id: true, email: true, status: true } },
                    approvedBy: { select: { id: true, name: true } },
                },
            }),
            this.prisma.pujaCommittee.count({ where }),
        ]);
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    async findOne(id) {
        const committee = await this.prisma.pujaCommittee.findFirst({
            where: { id, deletedAt: null },
            include: {
                user: { select: { id: true, email: true, status: true } },
                approvedBy: { select: { id: true, name: true } },
                rejectedBy: { select: { id: true, name: true } },
                reviewedBy: { select: { id: true, name: true } },
                histories: {
                    orderBy: { createdAt: 'desc' },
                    include: { changedBy: { select: { id: true, name: true } } },
                },
                _count: { select: { committeeMedia: true, albums: true, pandals: true } },
            },
        });
        if (!committee)
            throw shared_1.ServiceException.notFound(`No committee exists with id ${id}.`);
        return committee;
    }
    /** Public submission of a committee registration application. */
    async submit(payload) {
        const duplicate = await this.prisma.pujaCommittee.findFirst({
            where: { email: payload.email, deletedAt: null },
            select: { id: true, registrationNo: true },
        });
        if (duplicate) {
            throw shared_1.ServiceException.conflict('An application has already been submitted with this email address.', { registrationNo: duplicate.registrationNo });
        }
        try {
            const committee = await this.prisma.pujaCommittee.create({
                data: {
                    ...payload,
                    registrationNo: await this.nextRegistrationNo(),
                    status: database_1.CommitteeStatus.PENDING,
                },
            });
            this.logger.log(`Committee application ${committee.registrationNo} submitted`);
            return {
                id: committee.id,
                registrationNo: committee.registrationNo,
                status: committee.status,
            };
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'committee');
        }
    }
    /**
     * Moves an application through the review workflow, recording every
     * transition in the status history so the decision trail is auditable.
     */
    async changeStatus(payload) {
        const { id, status, reason, actorId } = payload;
        const committee = await this.prisma.pujaCommittee.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, committeeName: true, committeeId: true },
        });
        if (!committee)
            throw shared_1.ServiceException.notFound(`No committee exists with id ${id}.`);
        if (committee.status === status) {
            throw shared_1.ServiceException.badRequest(`This committee is already ${status}.`);
        }
        if (!ALLOWED_TRANSITIONS[committee.status].includes(status)) {
            throw shared_1.ServiceException.badRequest(`A committee cannot move from ${committee.status} to ${status}.`, { from: committee.status, to: status, allowed: ALLOWED_TRANSITIONS[committee.status] });
        }
        if (status === database_1.CommitteeStatus.REJECTED && !reason?.trim()) {
            throw shared_1.ServiceException.badRequest('A reason is required when rejecting an application.');
        }
        const now = new Date();
        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.pujaCommittee.update({
                where: { id },
                data: {
                    status,
                    ...(status === database_1.CommitteeStatus.APPROVED
                        ? {
                            approvedById: actorId,
                            approvedAt: now,
                            // Issue the public-facing committee code on approval.
                            committeeId: committee.committeeId ?? `DPGC-${String(id).padStart(5, '0')}`,
                        }
                        : {}),
                    ...(status === database_1.CommitteeStatus.REJECTED
                        ? { rejectedById: actorId, rejectedAt: now, rejectionReason: reason ?? null }
                        : {}),
                    ...(status === database_1.CommitteeStatus.UNDER_REVIEW
                        ? { reviewedById: actorId, reviewedAt: now }
                        : {}),
                },
            });
            await tx.pujaCommitteeStatusHistory.create({
                data: {
                    pujaCommitteeId: id,
                    previousStatus: committee.status,
                    newStatus: status,
                    reason: reason ?? null,
                    changedById: actorId,
                },
            });
            return result;
        });
        this.logger.log(`Committee #${id} moved ${committee.status} -> ${status} by user #${actorId}`);
        return updated;
    }
    /**
     * Provisions the committee's portal login after approval.
     *
     * Creates the user, assigns the Committee Member role and links it back to
     * the committee in one transaction, so a failure cannot leave a half-created
     * account that can neither sign in nor be recreated.
     */
    async createPortalAccount(payload) {
        const { id, actorId } = payload;
        const committee = await this.prisma.pujaCommittee.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                status: true,
                email: true,
                committeeName: true,
                contactPersonName: true,
                mobile: true,
                country: true,
                state: true,
                city: true,
                userId: true,
            },
        });
        if (!committee)
            throw shared_1.ServiceException.notFound(`No committee exists with id ${id}.`);
        if (committee.status !== database_1.CommitteeStatus.APPROVED) {
            throw shared_1.ServiceException.badRequest('A portal account can only be created for an approved committee.', { status: committee.status });
        }
        if (committee.userId) {
            throw shared_1.ServiceException.conflict('This committee already has a portal account.');
        }
        const emailTaken = await this.prisma.user.findUnique({
            where: { email: committee.email },
            select: { id: true },
        });
        if (emailTaken) {
            throw shared_1.ServiceException.conflict(`A user account already exists for ${committee.email}.`);
        }
        const role = await this.prisma.role.findUnique({
            where: { slug: 'committee-member' },
            select: { id: true },
        });
        if (!role) {
            throw shared_1.ServiceException.internal('The Committee Member role is missing. Run the database seed.');
        }
        const password = this.generatePassword();
        const rounds = this.config.get('registration.bcryptRounds') ?? 12;
        const [firstName, ...rest] = committee.contactPersonName.split(' ');
        const user = await this.prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
                data: {
                    firstName,
                    lastName: rest.join(' ') || null,
                    name: committee.contactPersonName,
                    email: committee.email,
                    phone: committee.mobile,
                    country: committee.country,
                    state: committee.state,
                    city: committee.city,
                    password: await bcrypt.hash(password, rounds),
                    mustChangePassword: true,
                    status: database_1.UserStatus.ACTIVE,
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    createdById: actorId,
                    roles: { create: [{ roleId: role.id, assignedById: actorId }] },
                },
                select: { id: true, email: true },
            });
            await tx.pujaCommittee.update({
                where: { id },
                data: { userId: created.id },
            });
            return created;
        });
        this.logger.log(`Portal account ${user.email} created for committee #${id}`);
        // The password is returned once so the administrator can pass it on; it is
        // never stored in plain text.
        return {
            userId: user.id,
            email: user.email,
            generatedPassword: password,
            mustChangePassword: true,
        };
    }
    async update(payload) {
        const { id, data } = payload;
        const existing = await this.prisma.pujaCommittee.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, email: true },
        });
        if (!existing) {
            throw shared_1.ServiceException.notFound(`No committee exists with id ${id}.`);
        }
        if (data.email && data.email !== existing.email) {
            const emailTaken = await this.prisma.user.findUnique({
                where: { email: data.email },
                select: { id: true },
            });
            const committeeTaken = await this.prisma.pujaCommittee.findFirst({
                where: { email: data.email, deletedAt: null, id: { not: id } },
                select: { id: true },
            });
            if (emailTaken || committeeTaken) {
                throw shared_1.ServiceException.conflict(`A record already exists for ${data.email}.`);
            }
        }
        try {
            return await this.prisma.pujaCommittee.update({
                where: { id },
                data: { ...data, updatedAt: new Date() },
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'committee');
        }
    }
    async remove(payload) {
        const { id } = payload;
        await this.findOne(id);
        await this.prisma.pujaCommittee.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { id, deleted: true };
    }
    async stats() {
        const grouped = await this.prisma.pujaCommittee.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { _all: true },
        });
        const byStatus = Object.fromEntries(grouped.map((row) => [row.status.toLowerCase(), row._count._all]));
        return {
            total: grouped.reduce((sum, row) => sum + row._count._all, 0),
            pending: byStatus.pending ?? 0,
            under_review: byStatus.under_review ?? 0,
            approved: byStatus.approved ?? 0,
            rejected: byStatus.rejected ?? 0,
        };
    }
};
exports.CommitteesService = CommitteesService;
exports.CommitteesService = CommitteesService = CommitteesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], CommitteesService);
