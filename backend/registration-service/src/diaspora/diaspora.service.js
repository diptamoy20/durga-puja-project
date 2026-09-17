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
var DiasporaService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiasporaService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
let DiasporaService = DiasporaService_1 = class DiasporaService {
    prisma;
    logger = new common_1.Logger(DiasporaService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async nextRegistrationNo() {
        const year = new Date().getFullYear();
        const count = await this.prisma.diasporaRegistration.count({
            where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00Z`) } },
        });
        return `DIA-${year}-${String(count + 1).padStart(6, '0')}`;
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
    /** Marks a registration verified and records the decision in its history. */
    async verify(payload) {
        return this.decide(payload, database_1.DiasporaStatus.VERIFIED);
    }
    async reject(payload) {
        if (!payload.reason?.trim()) {
            throw shared_1.ServiceException.badRequest('A reason is required when rejecting a registration.');
        }
        return this.decide(payload, database_1.DiasporaStatus.REJECTED);
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
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], DiasporaService);
