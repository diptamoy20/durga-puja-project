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
var AtlasService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtlasService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
/** Only approved entries appear on the public map. */
const PUBLIC_SELECT = {
    id: true,
    name: true,
    location: true,
    latitude: true,
    longitude: true,
    photos: true,
    timing: true,
    ritualSchedule: true,
    livestreamUrl: true,
    virtualTourUrl: true,
    committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
};
let AtlasService = AtlasService_1 = class AtlasService {
    prisma;
    logger = new common_1.Logger(AtlasService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    assertCoordinates(latitude, longitude) {
        if (latitude < -90 || latitude > 90) {
            throw shared_1.ServiceException.badRequest('Latitude must be between -90 and 90.');
        }
        if (longitude < -180 || longitude > 180) {
            throw shared_1.ServiceException.badRequest('Longitude must be between -180 and 180.');
        }
    }
    /** Decimal columns arrive as Prisma.Decimal; the client expects numbers. */
    serialise(row) {
        return { ...row, latitude: Number(row.latitude), longitude: Number(row.longitude) };
    }
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            deletedAt: null,
            ...(query.status ? { status: query.status } : {}),
            ...(query.scopeToCommitteeId
                ? { pujaCommitteeId: query.scopeToCommitteeId }
                : query.pujaCommitteeId
                    ? { pujaCommitteeId: query.pujaCommitteeId }
                    : {}),
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { location: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.pandalAtlas.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: query.sortDir },
                include: {
                    committee: { select: { id: true, committeeName: true, city: true } },
                    approvedBy: { select: { id: true, name: true } },
                },
            }),
            this.prisma.pandalAtlas.count({ where }),
        ]);
        return {
            items: rows.map((row) => this.serialise(row)),
            pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total),
        };
    }
    async findOne(payload) {
        const pandal = await this.prisma.pandalAtlas.findFirst({
            where: { id: payload.id, deletedAt: null },
            include: {
                committee: { select: { id: true, committeeName: true, city: true } },
                reviewedBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
        if (!pandal)
            throw shared_1.ServiceException.notFound(`No pandal entry exists with id ${payload.id}.`);
        if (payload.scopeToCommitteeId !== undefined &&
            pandal.pujaCommitteeId !== payload.scopeToCommitteeId) {
            throw shared_1.ServiceException.notFound(`No pandal entry exists with id ${payload.id}.`);
        }
        return this.serialise(pandal);
    }
    /**
     * Approved entries for the public map.
     *
     * Accepts an optional bounding box so the client fetches only the pins in
     * the current viewport rather than every entry.
     */
    async publicList(query) {
        const bounded = query.north !== undefined &&
            query.south !== undefined &&
            query.east !== undefined &&
            query.west !== undefined;
        const rows = await this.prisma.pandalAtlas.findMany({
            where: {
                deletedAt: null,
                status: database_1.AtlasStatus.APPROVED,
                ...(bounded
                    ? {
                        latitude: { gte: query.south, lte: query.north },
                        longitude: { gte: query.west, lte: query.east },
                    }
                    : {}),
                ...(query.search
                    ? {
                        OR: [
                            { name: { contains: query.search, mode: 'insensitive' } },
                            { location: { contains: query.search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            select: PUBLIC_SELECT,
            take: Math.min(query.limit ?? 500, 2000),
            orderBy: { approvedAt: 'desc' },
        });
        return rows.map((row) => this.serialise(row));
    }
    async create(payload) {
        const { data, actorId } = payload;
        this.assertCoordinates(data.latitude, data.longitude);
        const committee = await this.prisma.pujaCommittee.findFirst({
            where: { id: data.pujaCommitteeId, deletedAt: null },
            select: { id: true, userId: true },
        });
        if (!committee)
            throw shared_1.ServiceException.badRequest('The selected committee does not exist.');
        try {
            const pandal = await this.prisma.pandalAtlas.create({
                data: {
                    pujaCommitteeId: data.pujaCommitteeId,
                    userId: committee.userId,
                    name: data.name,
                    location: data.location,
                    latitude: new database_1.Prisma.Decimal(data.latitude),
                    longitude: new database_1.Prisma.Decimal(data.longitude),
                    photos: data.photos ?? database_1.Prisma.DbNull,
                    timing: data.timing,
                    ritualSchedule: data.ritualSchedule ?? null,
                    livestreamUrl: data.livestreamUrl ?? null,
                    virtualTourUrl: data.virtualTourUrl ?? null,
                    status: database_1.AtlasStatus.DRAFT,
                    createdById: actorId,
                    updatedById: actorId,
                },
            });
            return this.serialise(pandal);
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'pandal entry');
        }
    }
    async update(payload) {
        const { id, data, actorId } = payload;
        const existing = await this.findOne({ id, scopeToCommitteeId: payload.scopeToCommitteeId });
        // Approved entries are live on the public map, so changes must be
        // resubmitted for moderation rather than applied in place.
        if (existing.status === database_1.AtlasStatus.APPROVED) {
            throw shared_1.ServiceException.badRequest('An approved entry cannot be edited directly. Submit a new revision for review.');
        }
        if (data.latitude !== undefined && data.longitude !== undefined) {
            this.assertCoordinates(data.latitude, data.longitude);
        }
        const pandal = await this.prisma.pandalAtlas.update({
            where: { id },
            data: {
                name: data.name,
                location: data.location,
                latitude: data.latitude !== undefined ? new database_1.Prisma.Decimal(data.latitude) : undefined,
                longitude: data.longitude !== undefined ? new database_1.Prisma.Decimal(data.longitude) : undefined,
                photos: data.photos,
                timing: data.timing,
                ritualSchedule: data.ritualSchedule,
                livestreamUrl: data.livestreamUrl,
                virtualTourUrl: data.virtualTourUrl,
                updatedById: actorId,
            },
        });
        return this.serialise(pandal);
    }
    async submit(payload) {
        const existing = await this.findOne({
            id: payload.id,
            scopeToCommitteeId: payload.scopeToCommitteeId,
        });
        if (existing.status !== database_1.AtlasStatus.DRAFT && existing.status !== database_1.AtlasStatus.REJECTED) {
            throw shared_1.ServiceException.badRequest(`An entry with status ${existing.status} cannot be submitted for review.`);
        }
        const pandal = await this.prisma.pandalAtlas.update({
            where: { id: payload.id },
            data: { status: database_1.AtlasStatus.SUBMITTED, updatedById: payload.actorId },
        });
        return this.serialise(pandal);
    }
    async moderate(payload) {
        const { id, decision, remarks, actorId } = payload;
        const existing = await this.prisma.pandalAtlas.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true },
        });
        if (!existing)
            throw shared_1.ServiceException.notFound(`No pandal entry exists with id ${id}.`);
        const allowedFrom = {
            start_review: [database_1.AtlasStatus.SUBMITTED],
            approve: [database_1.AtlasStatus.SUBMITTED, database_1.AtlasStatus.UNDER_REVIEW],
            reject: [database_1.AtlasStatus.SUBMITTED, database_1.AtlasStatus.UNDER_REVIEW],
        };
        if (!allowedFrom[decision].includes(existing.status)) {
            throw shared_1.ServiceException.badRequest(`An entry with status ${existing.status} cannot be ${decision.replace(/_/g, ' ')}.`, { currentStatus: existing.status, allowedFrom: allowedFrom[decision] });
        }
        if (decision === 'reject' && !remarks?.trim()) {
            throw shared_1.ServiceException.badRequest('Remarks are required when rejecting an entry.');
        }
        const now = new Date();
        const pandal = await this.prisma.pandalAtlas.update({
            where: { id },
            data: {
                status: decision === 'approve'
                    ? database_1.AtlasStatus.APPROVED
                    : decision === 'reject'
                        ? database_1.AtlasStatus.REJECTED
                        : database_1.AtlasStatus.UNDER_REVIEW,
                ...(decision === 'approve' ? { approvedById: actorId, approvedAt: now } : {}),
                ...(decision === 'reject' ? { rejectionRemarks: remarks ?? null } : {}),
                reviewedById: actorId,
                reviewedAt: now,
                updatedById: actorId,
            },
        });
        this.logger.log(`Pandal entry #${id} ${decision} by user #${actorId}`);
        return this.serialise(pandal);
    }
    async remove(payload) {
        await this.findOne({ id: payload.id, scopeToCommitteeId: payload.scopeToCommitteeId });
        await this.prisma.pandalAtlas.update({
            where: { id: payload.id },
            data: { deletedAt: new Date(), updatedById: payload.actorId },
        });
        return { id: payload.id, deleted: true };
    }
    /** Pandal counts by status, for the dashboard summary. */
    async stats() {
        const grouped = await this.prisma.pandalAtlas.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { _all: true },
        });
        const byStatus = Object.fromEntries(grouped.map((row) => [row.status.toLowerCase(), row._count._all]));
        return {
            total: grouped.reduce((sum, row) => sum + row._count._all, 0),
            draft: byStatus.draft ?? 0,
            submitted: byStatus.submitted ?? 0,
            under_review: byStatus.under_review ?? 0,
            approved: byStatus.approved ?? 0,
            rejected: byStatus.rejected ?? 0,
        };
    }
};
exports.AtlasService = AtlasService;
exports.AtlasService = AtlasService = AtlasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AtlasService);
