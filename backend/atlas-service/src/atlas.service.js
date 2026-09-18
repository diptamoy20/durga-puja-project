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
const FILES_BASE = (process.env.PUBLIC_FILES_BASE_URL ?? 'http://localhost:5050/api/v1/atlas/files').replace(/\/$/, '');
const PLACEHOLDER_PHOTO = '/assets/pandal-placeholder.svg';
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
    resolveFileUrl(path) {
        if (!path || typeof path !== 'string')
            return null;
        if (path.startsWith('http://') || path.startsWith('https://'))
            return path;
        return `${FILES_BASE}/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`;
    }
    photoPaths(raw) {
        if (!raw)
            return [];
        if (Array.isArray(raw))
            return raw.filter(Boolean);
        return [];
    }
    youtubeEmbedUrl(url) {
        if (!url)
            return null;
        const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0` : url;
    }
    virtualTourEmbedUrl(url) {
        if (!url)
            return null;
        if (url.includes('matterport.com') || url.includes('google.com/maps/embed') || url.includes('embed'))
            return url;
        if (url.includes('kuula.co/share/') || url.includes('kuula.co/post/'))
            return url.replace('kuula.co/post/', 'kuula.co/share/');
        return null;
    }
    is360Image(url) {
        if (!url)
            return false;
        const path = url.split('?')[0] ?? url;
        const ext = path.split('.').pop()?.toLowerCase() ?? '';
        return ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
            || url.includes('panorama')
            || url.includes('photosphere')
            || url.includes('360')
            || url.includes('pandal-atlas/tours/');
    }
    enrich(row, options = {}) {
        const base = this.serialise(row);
        const paths = this.photoPaths(base.photos);
        const photoUrls = paths.map((p) => this.resolveFileUrl(p)).filter(Boolean);
        const fullVirtualTourUrl = this.resolveFileUrl(base.virtualTourUrl);
        const hasLivestream = Boolean(base.livestreamUrl && /^https?:\/\//i.test(base.livestreamUrl));
        const hasVirtualTour = Boolean(base.virtualTourUrl);
        return {
            ...base,
            photoUrls,
            primaryPhotoUrl: photoUrls[0] ?? PLACEHOLDER_PHOTO,
            hasLivestream,
            hasVirtualTour,
            fullVirtualTourUrl,
            livestreamEmbedUrl: hasLivestream ? this.youtubeEmbedUrl(base.livestreamUrl) : null,
            virtualTourEmbedUrl: hasVirtualTour ? this.virtualTourEmbedUrl(fullVirtualTourUrl ?? base.virtualTourUrl) : null,
            is360Image: hasVirtualTour && this.is360Image(fullVirtualTourUrl ?? base.virtualTourUrl ?? ''),
            detailsUrl: options.detailsUrl ?? `/public/atlas/${base.id}`,
        };
    }
    assertCoordinates(latitude, longitude) {
        if (latitude < -90 || latitude > 90) {
            throw shared_1.ServiceException.badRequest('Latitude must be between -90 and 90.');
        }
        if (longitude < -180 || longitude > 180) {
            throw shared_1.ServiceException.badRequest('Longitude must be between -180 and 180.');
        }
    }
    async assertUniqueEntry({ name, location, latitude, longitude, pujaCommitteeId, excludeId, }) {
        const nameClean = name.replace(/\s+/g, '').toLowerCase();
        const locationClean = location.replace(/\s+/g, '').toLowerCase();
        const duplicateName = await this.prisma.pandalAtlas.findFirst({
            where: {
                deletedAt: null,
                pujaCommitteeId,
                ...(excludeId ? { id: { not: excludeId } } : {}),
                AND: [
                    { name: { equals: name, mode: 'insensitive' } },
                    { location: { equals: location, mode: 'insensitive' } },
                ],
            },
            select: { id: true },
        });
        if (duplicateName) {
            throw shared_1.ServiceException.badRequest('A Pandal with this exact name and location already exists for this committee.');
        }
        const latRounded = Math.round(latitude * 1e5) / 1e5;
        const lngRounded = Math.round(longitude * 1e5) / 1e5;
        const duplicateCoords = await this.prisma.pandalAtlas.findFirst({
            where: {
                deletedAt: null,
                ...(excludeId ? { id: { not: excludeId } } : {}),
                latitude: new database_1.Prisma.Decimal(latRounded),
                longitude: new database_1.Prisma.Decimal(lngRounded),
            },
            select: { id: true },
        });
        if (duplicateCoords) {
            throw shared_1.ServiceException.badRequest('A Pandal is already mapped at these exact coordinates.');
        }
    }
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
                    committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
                    approvedBy: { select: { id: true, name: true } },
                    reviewedBy: { select: { id: true, name: true } },
                },
            }),
            this.prisma.pandalAtlas.count({ where }),
        ]);
        return {
            items: rows.map((row) => this.enrich(row)),
            pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total),
        };
    }
    async findOne(payload) {
        const pandal = await this.prisma.pandalAtlas.findFirst({
            where: { id: payload.id, deletedAt: null },
            include: {
                committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
                reviewedBy: { select: { id: true, name: true, email: true } },
                approvedBy: { select: { id: true, name: true, email: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        });
        if (!pandal)
            throw shared_1.ServiceException.notFound(`No pandal entry exists with id ${payload.id}.`);
        if (payload.scopeToCommitteeId !== undefined &&
            pandal.pujaCommitteeId !== payload.scopeToCommitteeId) {
            throw shared_1.ServiceException.notFound(`No pandal entry exists with id ${payload.id}.`);
        }
        if (payload.publicOnly && pandal.status !== database_1.AtlasStatus.APPROVED) {
            throw shared_1.ServiceException.notFound(`No pandal entry exists with id ${payload.id}.`);
        }
        return this.enrich(pandal);
    }
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
        return rows.map((row) => this.enrich(row));
    }
    async mapData(query) {
        const items = await this.publicList(query);
        return { count: items.length, data: items };
    }
    async formOptions(payload) {
        const { isModerator, committeeId } = payload;
        if (isModerator) {
            const committees = await this.prisma.pujaCommittee.findMany({
                where: { deletedAt: null, status: database_1.CommitteeStatus.APPROVED },
                select: {
                    id: true,
                    committeeName: true,
                    registrationNo: true,
                    committeeId: true,
                },
                orderBy: { committeeName: 'asc' },
            });
            return {
                isModerator: true,
                defaultCommitteeId: committees[0]?.id ?? null,
                committees,
            };
        }
        if (!committeeId) {
            throw shared_1.ServiceException.badRequest('No approved committee is linked to this account.');
        }
        const committee = await this.prisma.pujaCommittee.findFirst({
            where: {
                id: committeeId,
                deletedAt: null,
                status: database_1.CommitteeStatus.APPROVED,
            },
            select: {
                id: true,
                committeeName: true,
                registrationNo: true,
                committeeId: true,
            },
        });
        if (!committee) {
            throw shared_1.ServiceException.badRequest('Your committee is not approved or no longer exists.');
        }
        return {
            isModerator: false,
            defaultCommitteeId: committee.id,
            committees: [committee],
        };
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
        await this.assertUniqueEntry({
            name: data.name,
            location: data.location,
            latitude: data.latitude,
            longitude: data.longitude,
            pujaCommitteeId: data.pujaCommitteeId,
        });
        const status = data.action === 'submit'
            ? database_1.AtlasStatus.SUBMITTED
            : database_1.AtlasStatus.DRAFT;
        try {
            const pandal = await this.prisma.pandalAtlas.create({
                data: {
                    pujaCommitteeId: data.pujaCommitteeId,
                    userId: committee.userId,
                    name: data.name,
                    location: data.location,
                    latitude: new database_1.Prisma.Decimal(data.latitude),
                    longitude: new database_1.Prisma.Decimal(data.longitude),
                    photos: data.photos?.length ? data.photos : database_1.Prisma.DbNull,
                    timing: data.timing,
                    ritualSchedule: data.ritualSchedule ?? null,
                    livestreamUrl: data.livestreamUrl ?? null,
                    virtualTourUrl: data.virtualTourUrl ?? null,
                    status,
                    createdById: actorId,
                    updatedById: actorId,
                },
                include: {
                    committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
                },
            });
            return this.enrich(pandal);
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'pandal entry');
        }
    }
    async update(payload) {
        const { id, data, actorId } = payload;
        const existing = await this.findOne({ id, scopeToCommitteeId: payload.scopeToCommitteeId });
        const nextLat = data.latitude ?? existing.latitude;
        const nextLng = data.longitude ?? existing.longitude;
        const nextName = data.name ?? existing.name;
        const nextLocation = data.location ?? existing.location;
        const nextCommitteeId = data.pujaCommitteeId ?? existing.pujaCommitteeId;
        if (data.latitude !== undefined && data.longitude !== undefined) {
            this.assertCoordinates(data.latitude, data.longitude);
        }
        await this.assertUniqueEntry({
            name: nextName,
            location: nextLocation,
            latitude: nextLat,
            longitude: nextLng,
            pujaCommitteeId: nextCommitteeId,
            excludeId: id,
        });
        let photos = this.photoPaths(existing.photos);
        if (data.removePhotos?.length) {
            photos = photos.filter((p) => !data.removePhotos.includes(p));
        }
        if (data.photos?.length) {
            photos = [...photos, ...data.photos];
        }
        let status = existing.status;
        if (data.action === 'submit') {
            status = database_1.AtlasStatus.SUBMITTED;
        }
        const pandal = await this.prisma.pandalAtlas.update({
            where: { id },
            data: {
                ...(data.pujaCommitteeId !== undefined ? { pujaCommitteeId: data.pujaCommitteeId } : {}),
                name: data.name,
                location: data.location,
                latitude: data.latitude !== undefined ? new database_1.Prisma.Decimal(data.latitude) : undefined,
                longitude: data.longitude !== undefined ? new database_1.Prisma.Decimal(data.longitude) : undefined,
                photos: data.photos !== undefined || data.removePhotos?.length ? photos : undefined,
                timing: data.timing,
                ritualSchedule: data.ritualSchedule,
                livestreamUrl: data.livestreamUrl,
                virtualTourUrl: data.virtualTourUrl !== undefined ? data.virtualTourUrl : undefined,
                status,
                ...(data.action === 'submit' ? { rejectionRemarks: null } : {}),
                updatedById: actorId,
            },
            include: {
                committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
                reviewedBy: { select: { id: true, name: true, email: true } },
                approvedBy: { select: { id: true, name: true, email: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        });
        return this.enrich(pandal);
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
            data: {
                status: database_1.AtlasStatus.SUBMITTED,
                rejectionRemarks: null,
                updatedById: payload.actorId,
            },
            include: {
                committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
            },
        });
        return this.enrich(pandal);
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
                ...(decision === 'approve' ? { approvedById: actorId, approvedAt: now, rejectionRemarks: null } : {}),
                ...(decision === 'reject'
                    ? { rejectionRemarks: remarks ?? null, approvedAt: null, approvedById: null }
                    : {}),
                reviewedById: actorId,
                reviewedAt: now,
                updatedById: actorId,
            },
            include: {
                committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
                reviewedBy: { select: { id: true, name: true, email: true } },
                approvedBy: { select: { id: true, name: true, email: true } },
            },
        });
        this.logger.log(`Pandal entry #${id} ${decision} by user #${actorId}`);
        return this.enrich(pandal);
    }
    async remove(payload) {
        await this.findOne({ id: payload.id, scopeToCommitteeId: payload.scopeToCommitteeId });
        await this.prisma.pandalAtlas.update({
            where: { id: payload.id },
            data: { deletedAt: new Date(), updatedById: payload.actorId },
        });
        return { id: payload.id, deleted: true };
    }
    async stats() {
        const grouped = await this.prisma.pandalAtlas.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { _all: true },
        });
        const byStatus = Object.fromEntries(grouped.map((row) => [row.status, row._count._all]));
        return {
            total: grouped.reduce((sum, row) => sum + row._count._all, 0),
            DRAFT: byStatus[database_1.AtlasStatus.DRAFT] ?? 0,
            SUBMITTED: byStatus[database_1.AtlasStatus.SUBMITTED] ?? 0,
            UNDER_REVIEW: byStatus[database_1.AtlasStatus.UNDER_REVIEW] ?? 0,
            APPROVED: byStatus[database_1.AtlasStatus.APPROVED] ?? 0,
            REJECTED: byStatus[database_1.AtlasStatus.REJECTED] ?? 0,
        };
    }
};
exports.AtlasService = AtlasService;
exports.AtlasService = AtlasService = AtlasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AtlasService);
