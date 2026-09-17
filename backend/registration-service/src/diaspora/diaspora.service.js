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
var DiasporaService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiasporaService = void 0;
const node_crypto_1 = require("node:crypto");
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
let DiasporaService = DiasporaService_1 = class DiasporaService {
    prisma;
    config;
    logger = new common_1.Logger(DiasporaService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    generatePassword(length = 12) {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        const bytes = (0, node_crypto_1.randomBytes)(length);
        let out = '';
        for (let i = 0; i < length - 2; i += 1)
            out += alphabet[bytes[i] % alphabet.length];
        return `${out}${(0, node_crypto_1.randomInt)(10)}${(0, node_crypto_1.randomInt)(10)}`;
    }
    async nextRegistrationNo() {
        const year = new Date().getFullYear();
        const suffix = (0, node_crypto_1.randomBytes)(4).toString('hex').toUpperCase();
        return `DGC-D-${year}-${suffix}`;
    }
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            ...(query.status ? { status: query.status } : {}),
            ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { fullName: { contains: query.search, mode: 'insensitive' } },
                        { email: { contains: query.search, mode: 'insensitive' } },
                        { registrationNo: { contains: query.search, mode: 'insensitive' } },
                        { mobile: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.diasporaRegistration.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: query.sortDir },
                include: {
                    verifiedBy: { select: { id: true, name: true } },
                    user: { select: { id: true, email: true, status: true } },
                },
            }),
            this.prisma.diasporaRegistration.count({ where }),
        ]);
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    async findOne(id) {
        const registration = await this.prisma.diasporaRegistration.findUnique({
            where: { id },
            include: {
                verifiedBy: { select: { id: true, name: true } },
                rejectedBy: { select: { id: true, name: true } },
                user: { select: { id: true, email: true, status: true, initialPassword: true } },
                histories: {
                    orderBy: { createdAt: 'desc' },
                    include: { changedBy: { select: { id: true, name: true } } },
                },
            },
        });
        if (!registration) {
            throw shared_1.ServiceException.notFound(`No diaspora registration exists with id ${id}.`);
        }
        return registration;
    }
    async submit(payload) {
        if (!payload.termsAccepted) {
            throw shared_1.ServiceException.badRequest('The terms and conditions must be accepted.');
        }
        const duplicate = await this.prisma.diasporaRegistration.findUnique({
            where: { email: payload.email },
            select: { registrationNo: true },
        });
        if (duplicate) {
            throw shared_1.ServiceException.conflict('A registration already exists for this email address.', { registrationNo: duplicate.registrationNo });
        }
        try {
            const registration = await this.prisma.diasporaRegistration.create({
                data: {
                    ...payload,
                    dob: new Date(payload.dob),
                    interests: payload.interests ?? database_1.Prisma.DbNull,
                    volunteer: payload.volunteer ?? false,
                    receiveUpdates: payload.receiveUpdates ?? false,
                    registrationNo: await this.nextRegistrationNo(),
                    status: database_1.DiasporaStatus.PENDING,
                },
            });
            this.logger.log(`Diaspora registration ${registration.registrationNo} submitted`);
            return {
                id: registration.id,
                registrationNo: registration.registrationNo,
                status: registration.status,
            };
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'registration');
        }
    }
    /** Marks a registration verified, provisions a portal account, and records history. */
    async verify(payload) {
        const { id, actorId } = payload;
        const registration = await this.prisma.diasporaRegistration.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                email: true,
                fullName: true,
                mobile: true,
                country: true,
                state: true,
                city: true,
                address1: true,
                address2: true,
                userId: true,
            },
        });
        if (!registration) {
            throw shared_1.ServiceException.notFound(`No diaspora registration exists with id ${id}.`);
        }
        if (registration.status !== database_1.DiasporaStatus.PENDING) {
            throw shared_1.ServiceException.badRequest(`This registration has already been ${registration.status.toLowerCase()}.`);
        }
        const role = await this.prisma.role.findUnique({
            where: { slug: 'diaspora-member' },
            select: { id: true },
        });
        if (!role) {
            throw shared_1.ServiceException.internal('The Diaspora Member role is missing. Run the database seed.');
        }
        const password = this.generatePassword();
        const rounds = this.config.get('registration.bcryptRounds') ?? 12;
        const now = new Date();
        let generatedPassword = null;
        await this.prisma.$transaction(async (tx) => {
            let userId = registration.userId;
            if (!userId) {
                const existingUser = await tx.user.findUnique({
                    where: { email: registration.email },
                    select: { id: true },
                });
                if (existingUser) {
                    userId = existingUser.id;
                }
                else {
                    const [firstName, ...rest] = registration.fullName.trim().split(/\s+/);
                    const address = [registration.address1, registration.address2].filter(Boolean).join(' ');
                    const created = await tx.user.create({
                        data: {
                            firstName: firstName ?? registration.fullName,
                            lastName: rest.join(' ') || null,
                            name: registration.fullName,
                            email: registration.email,
                            phone: registration.mobile,
                            country: registration.country,
                            state: registration.state,
                            city: registration.city,
                            address,
                            password: await bcrypt.hash(password, rounds),
                            initialPassword: password,
                            mustChangePassword: true,
                            status: database_1.UserStatus.ACTIVE,
                            emailVerified: true,
                            emailVerifiedAt: now,
                            createdById: actorId,
                            roles: { create: [{ roleId: role.id, assignedById: actorId }] },
                        },
                        select: { id: true, email: true, initialPassword: true },
                    });
                    userId = created.id;
                    generatedPassword = password;
                }
            }
            const updated = await tx.diasporaRegistration.update({
                where: { id },
                data: {
                    status: database_1.DiasporaStatus.VERIFIED,
                    userId,
                    verifiedById: actorId,
                    verifiedAt: now,
                },
            });
            await tx.diasporaVerificationHistory.create({
                data: {
                    diasporaRegistrationId: id,
                    previousStatus: registration.status,
                    newStatus: database_1.DiasporaStatus.VERIFIED,
                    action: 'verified',
                    changedById: actorId,
                },
            });
        });
        const fullRegistration = await this.findOne(id);
        return { ...fullRegistration, generatedPassword };
    }
    async reject(payload) {
        if (!payload.reason?.trim()) {
            throw shared_1.ServiceException.badRequest('A reason is required when rejecting a registration.');
        }
        await this.decide(payload, database_1.DiasporaStatus.REJECTED);
        return this.findOne(payload.id);
    }
    async decide(payload, status) {
        const { id, reason, actorId } = payload;
        const existing = await this.prisma.diasporaRegistration.findUnique({
            where: { id },
            select: { id: true, status: true, email: true },
        });
        if (!existing) {
            throw shared_1.ServiceException.notFound(`No diaspora registration exists with id ${id}.`);
        }
        // Only pending applications await a decision; re-deciding would discard
        // the original verifier and timestamp.
        if (existing.status !== database_1.DiasporaStatus.PENDING) {
            throw shared_1.ServiceException.badRequest(`This registration has already been ${existing.status.toLowerCase()}.`);
        }
        const now = new Date();
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.diasporaRegistration.update({
                where: { id },
                data: status === database_1.DiasporaStatus.VERIFIED
                    ? { status, verifiedById: actorId, verifiedAt: now }
                    : { status, rejectedById: actorId, rejectedAt: now, rejectionReason: reason ?? null },
            });
            await tx.diasporaVerificationHistory.create({
                data: {
                    diasporaRegistrationId: id,
                    previousStatus: existing.status,
                    newStatus: status,
                    action: status === database_1.DiasporaStatus.VERIFIED ? 'verified' : 'rejected',
                    reason: reason ?? null,
                    changedById: actorId,
                },
            });
            return updated;
        });
    }
    /** Registration counts by status, for the dashboard summary. */
    async stats() {
        const grouped = await this.prisma.diasporaRegistration.groupBy({
            by: ['status'],
            _count: { _all: true },
        });
        const byStatus = Object.fromEntries(grouped.map((row) => [row.status.toLowerCase(), row._count._all]));
        return {
            total: grouped.reduce((sum, row) => sum + row._count._all, 0),
            pending: byStatus.pending ?? 0,
            verified: byStatus.verified ?? 0,
            rejected: byStatus.rejected ?? 0,
        };
    }
};
exports.DiasporaService = DiasporaService;
exports.DiasporaService = DiasporaService = DiasporaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], DiasporaService);
