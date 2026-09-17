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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomyService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
/**
 * Categories and subcategories are shared reference data: the gallery, albums
 * and articles all point at them, so this service owns them and the other
 * domains read them through the gateway.
 */
let TaxonomyService = class TaxonomyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllCategories(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = query.search
            ? { name: { contains: query.search, mode: 'insensitive' } }
            : {};
        const [items, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where,
                skip,
                take,
                orderBy: { name: query.sortDir },
                include: {
                    subcategories: {
                        where: { status: database_1.RecordStatus.ACTIVE },
                        orderBy: { name: 'asc' },
                        select: { id: true, name: true, slug: true, status: true },
                    },
                    _count: { select: { subcategories: true } },
                },
            }),
            this.prisma.category.count({ where }),
        ]);
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    async findOneCategory(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { subcategories: { orderBy: { name: 'asc' } } },
        });
        if (!category)
            throw shared_1.ServiceException.notFound(`No category exists with id ${id}.`);
        return category;
    }
    async createCategory(payload) {
        try {
            return await this.prisma.category.create({
                data: {
                    name: payload.data.name,
                    slug: (0, shared_1.slugify)(payload.data.name),
                    description: payload.data.description ?? null,
                    status: database_1.RecordStatus.ACTIVE,
                },
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'category');
        }
    }
    async updateCategory(payload) {
        const { id, data } = payload;
        try {
            return await this.prisma.category.update({
                where: { id },
                data: {
                    name: data.name,
                    slug: data.name ? (0, shared_1.slugify)(data.name) : undefined,
                    description: data.description,
                    status: data.status,
                },
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'category');
        }
    }
    async removeCategory(payload) {
        const category = await this.prisma.category.findUnique({
            where: { id: payload.id },
            include: { _count: { select: { subcategories: true, albums: true, committeeMedia: true } } },
        });
        if (!category)
            throw shared_1.ServiceException.notFound(`No category exists with id ${payload.id}.`);
        const inUse = category._count.subcategories + category._count.albums + category._count.committeeMedia;
        // Deleting would cascade into subcategories and orphan albums and media.
        if (inUse > 0) {
            throw shared_1.ServiceException.conflict(`"${category.name}" is still in use by ${inUse} record(s). Deactivate it instead.`, { counts: category._count });
        }
        await this.prisma.category.delete({ where: { id: payload.id } });
        return { id: payload.id, deleted: true };
    }
    async findAllSubcategories(payload) {
        return this.prisma.subcategory.findMany({
            where: payload.categoryId ? { categoryId: payload.categoryId } : {},
            orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
            include: { category: { select: { id: true, name: true } } },
        });
    }
    async createSubcategory(payload) {
        const category = await this.prisma.category.findUnique({
            where: { id: payload.data.categoryId },
            select: { id: true },
        });
        if (!category)
            throw shared_1.ServiceException.badRequest('The selected category does not exist.');
        try {
            return await this.prisma.subcategory.create({
                data: {
                    categoryId: payload.data.categoryId,
                    name: payload.data.name,
                    slug: (0, shared_1.slugify)(payload.data.name),
                    description: payload.data.description ?? null,
                    status: database_1.RecordStatus.ACTIVE,
                },
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'subcategory');
        }
    }
    async updateSubcategory(payload) {
        try {
            return await this.prisma.subcategory.update({
                where: { id: payload.id },
                data: {
                    name: payload.data.name,
                    slug: payload.data.name ? (0, shared_1.slugify)(payload.data.name) : undefined,
                    description: payload.data.description,
                    status: payload.data.status,
                },
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'subcategory');
        }
    }
    async removeSubcategory(payload) {
        const subcategory = await this.prisma.subcategory.findUnique({
            where: { id: payload.id },
            include: { _count: { select: { articles: true, albums: true, committeeMedia: true } } },
        });
        if (!subcategory) {
            throw shared_1.ServiceException.notFound(`No subcategory exists with id ${payload.id}.`);
        }
        const inUse = subcategory._count.articles + subcategory._count.albums + subcategory._count.committeeMedia;
        if (inUse > 0) {
            throw shared_1.ServiceException.conflict(`"${subcategory.name}" is still in use by ${inUse} record(s). Deactivate it instead.`, { counts: subcategory._count });
        }
        await this.prisma.subcategory.delete({ where: { id: payload.id } });
        return { id: payload.id, deleted: true };
    }
};
exports.TaxonomyService = TaxonomyService;
exports.TaxonomyService = TaxonomyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], TaxonomyService);
