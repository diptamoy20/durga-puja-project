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
var MediaService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
let MediaService = MediaService_1 = class MediaService {
    prisma;
    logger = new common_1.Logger(MediaService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    serialise(row) {
        if (!row)
            return row;
        return {
            ...row,
            fileSize: row.fileSize !== undefined ? Number(row.fileSize) : row.fileSize,
        };
    }
    mapPage(result) {
        return {
            items: result.items.map((row) => this.serialise(row)),
            pagination: result.pagination,
        };
    }
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            deletedAt: null,
            ...(query.type ? { fileType: query.type } : {}),
            ...(query.search
                ? {
                    OR: [
                        { originalName: { contains: query.search, mode: 'insensitive' } },
                        { title: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.media.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: query.sortDir ?? 'desc' },
                include: {
                    uploadedBy: { select: { id: true, name: true } },
                },
            }),
            this.prisma.media.count({ where }),
        ]);
        return this.mapPage({
            items: rows,
            pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total),
        });
    }
    async create(payload) {
        const { data, actorId } = payload;
        try {
            const media = await this.prisma.media.create({
                data: {
                    fileName: data.fileName,
                    originalName: data.originalName,
                    filePath: data.filePath,
                    fileType: data.fileType,
                    mimeType: data.mimeType,
                    fileSize: BigInt(data.fileSize),
                    title: data.title ?? null,
                    altText: data.altText ?? null,
                    uploadedById: data.uploadedById ?? actorId,
                },
                include: {
                    uploadedBy: { select: { id: true, name: true } },
                },
            });
            this.logger.log(`Media "${media.originalName}" uploaded by user #${actorId}`);
            return this.serialise(media);
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'media');
        }
    }
    async remove(payload) {
        const { id } = payload;
        const existing = await this.prisma.media.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (!existing) {
            throw shared_1.ServiceException.notFound(`No media exists with id ${id}.`);
        }
        await this.prisma.media.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { id, deleted: true };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], MediaService);
