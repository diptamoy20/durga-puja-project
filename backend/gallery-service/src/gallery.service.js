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
var GalleryService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
let GalleryService = GalleryService_1 = class GalleryService {
    prisma;
    logger = new common_1.Logger(GalleryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere(query) {
        return {
            deletedAt: null,
            ...(query.status ? { status: query.status } : {}),
            ...(query.mediaType ? { mediaType: query.mediaType } : {}),
            ...(query.categoryId ? { categoryId: query.categoryId } : {}),
            ...(query.subcategoryId ? { subcategoryId: query.subcategoryId } : {}),
            // An explicit committee filter is narrowed further by the caller's own
            // scope, so a Committee Member cannot read another committee's uploads.
            ...(query.scopeToCommitteeId
                ? { pujaCommitteeId: query.scopeToCommitteeId }
                : query.pujaCommitteeId
                    ? { pujaCommitteeId: query.pujaCommitteeId }
                    : {}),
            ...(query.uploadedById ? { uploadedById: query.uploadedById } : {}),
            ...(query.search
                ? {
                    OR: [
                        { title: { contains: query.search, mode: 'insensitive' } },
                        { description: { contains: query.search, mode: 'insensitive' } },
                        { venueName: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
    }
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = this.buildWhere(query);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.committeeMedia.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: query.sortDir },
                include: {
                    committee: { select: { id: true, committeeName: true, committeeId: true } },
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    uploadedBy: { select: { id: true, name: true } },
                },
            }),
            this.prisma.committeeMedia.count({ where }),
        ]);
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    /** Approved media only, for the public gallery. */
    async publicList(query) {
        return this.findAll({
            ...query,
            status: database_1.MediaModerationStatus.APPROVED,
            scopeToCommitteeId: undefined,
        });
    }
    async findOne(payload) {
        const media = await this.prisma.committeeMedia.findFirst({
            where: { id: payload.id, deletedAt: null },
            include: {
                committee: { select: { id: true, committeeName: true } },
                category: true,
                subcategory: true,
                uploadedBy: { select: { id: true, name: true } },
                moderatedBy: { select: { id: true, name: true } },
            },
        });
        if (!media)
            throw shared_1.ServiceException.notFound(`No media exists with id ${payload.id}.`);
        if (payload.scopeToCommitteeId !== undefined &&
            media.pujaCommitteeId !== payload.scopeToCommitteeId) {
            // Reported as "not found" rather than "forbidden" so the response does
            // not confirm that someone else's media with this id exists.
            throw shared_1.ServiceException.notFound(`No media exists with id ${payload.id}.`);
        }
        return media;
    }
    async create(payload) {
        const actorId = payload.actorId ?? payload.uploadedById;
        const nested = payload.data;
        const { actorId: _actorId, uploadedById: _uploadedById, data: _data, ...flat } = payload;
        const data = nested ?? flat;
        if (!actorId) {
            throw shared_1.ServiceException.badRequest('An uploader id is required.');
        }
        if (!data.pujaCommitteeId) {
            throw shared_1.ServiceException.badRequest('pujaCommitteeId is required.');
        }
        const committee = await this.prisma.pujaCommittee.findFirst({
            where: { id: data.pujaCommitteeId, deletedAt: null },
            select: { id: true, status: true },
        });
        if (!committee)
            throw shared_1.ServiceException.badRequest('The selected committee does not exist.');
        try {
            const media = await this.prisma.committeeMedia.create({
                data: {
                    ...data,
                    fileSize: BigInt(data.fileSize),
                    uploadedById: actorId,
                    // Uploads await the moderation pipeline before becoming visible.
                    status: database_1.MediaModerationStatus.PENDING,
                },
            });
            this.logger.log(`Media #${media.id} uploaded for committee #${data.pujaCommitteeId}`);
            // BigInt is not JSON-serialisable, so it crosses TCP as a string.
            return { ...media, fileSize: media.fileSize.toString() };
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'media item');
        }
    }
    async update(payload) {
        await this.findOne({ id: payload.id, scopeToCommitteeId: payload.scopeToCommitteeId });
        const media = await this.prisma.committeeMedia.update({
            where: { id: payload.id },
            data: payload.data,
        });
        return { ...media, fileSize: media.fileSize.toString() };
    }
    async remove(payload) {
        await this.findOne({ id: payload.id, scopeToCommitteeId: payload.scopeToCommitteeId });
        await this.prisma.committeeMedia.update({
            where: { id: payload.id },
            data: { deletedAt: new Date() },
        });
        return { id: payload.id, deleted: true };
    }
    async moderationQueue(query) {
        return this.findAll({
            ...query,
            status: database_1.MediaModerationStatus.PENDING,
            sortDir: 'asc',
            scopeToCommitteeId: undefined,
        });
    }
    /** Approves or rejects an upload; a rejection must carry a reason. */
    async moderate(payload) {
        const { id, decision, actorId } = payload;
        const reason = payload.reason ?? payload.rejectionReason;
        const media = await this.prisma.committeeMedia.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true },
        });
        if (!media)
            throw shared_1.ServiceException.notFound(`No media exists with id ${id}.`);
        if (media.status !== database_1.MediaModerationStatus.PENDING) {
            throw shared_1.ServiceException.badRequest(`This item has already been ${media.status.toLowerCase()}.`);
        }
        if (decision === 'reject' && !reason?.trim()) {
            throw shared_1.ServiceException.badRequest('A reason is required when rejecting an upload.');
        }
        const updated = await this.prisma.committeeMedia.update({
            where: { id },
            data: {
                status: decision === 'approve'
                    ? database_1.MediaModerationStatus.APPROVED
                    : database_1.MediaModerationStatus.REJECTED,
                rejectionReason: decision === 'reject' ? (reason ?? null) : null,
                moderatedById: actorId,
                moderatedAt: new Date(),
            },
        });
        this.logger.log(`Media #${id} ${decision}d by user #${actorId}`);
        return { ...updated, fileSize: updated.fileSize.toString() };
    }
    // -------------------------------------------------------------------------
    // Albums
    // -------------------------------------------------------------------------
    async findAllAlbums(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            status: database_1.RecordStatus.ACTIVE,
            ...(query.publicOnly ? { isPublic: true } : {}),
            ...(query.scopeToCommitteeId
                ? { pujaCommitteeId: query.scopeToCommitteeId }
                : query.pujaCommitteeId
                    ? { pujaCommitteeId: query.pujaCommitteeId }
                    : {}),
            ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.album.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: query.sortDir },
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    committee: { select: { id: true, committeeName: true } },
                    _count: { select: { media: true } },
                },
            }),
            this.prisma.album.count({ where }),
        ]);
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    async createAlbum(payload) {
        try {
            return await this.prisma.album.create({
                data: { ...payload.data, isPublic: payload.data.isPublic ?? false },
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'album');
        }
    }
    /**
     * Replaces an album's contents with exactly the supplied media, preserving
     * the given order. Only approved media may be added, so a private album
     * cannot be used to publish unmoderated uploads.
     */
    async syncAlbumMedia(payload) {
        const { id, mediaIds } = payload;
        const album = await this.prisma.album.findUnique({
            where: { id },
            select: { id: true, pujaCommitteeId: true },
        });
        if (!album)
            throw shared_1.ServiceException.notFound(`No album exists with id ${id}.`);
        if (mediaIds.length > 0) {
            const eligible = await this.prisma.committeeMedia.findMany({
                where: {
                    id: { in: mediaIds },
                    deletedAt: null,
                    status: database_1.MediaModerationStatus.APPROVED,
                    pujaCommitteeId: album.pujaCommitteeId,
                },
                select: { id: true },
            });
            if (eligible.length !== mediaIds.length) {
                const rejected = mediaIds.filter((mediaId) => !eligible.some((m) => m.id === mediaId));
                throw shared_1.ServiceException.badRequest('Only approved media belonging to this committee can be added to the album.', { ineligible: rejected });
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.albumMedia.deleteMany({ where: { albumId: id } });
            if (mediaIds.length > 0) {
                await tx.albumMedia.createMany({
                    data: mediaIds.map((committeeMediaId, index) => ({
                        albumId: id,
                        committeeMediaId,
                        sortOrder: index,
                    })),
                    skipDuplicates: true,
                });
            }
        });
        return { id, mediaCount: mediaIds.length };
    }
};
exports.GalleryService = GalleryService;
exports.GalleryService = GalleryService = GalleryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], GalleryService);
