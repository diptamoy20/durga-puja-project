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
function resolveSlug(name, slug) {
    const trimmedSlug = typeof slug === 'string' ? slug.trim() : '';
    if (trimmedSlug)
        return (0, shared_1.slugify)(trimmedSlug);
    if (name?.trim())
        return (0, shared_1.slugify)(name);
    throw shared_1.ServiceException.badRequest('A slug could not be generated. Provide a name or slug.');
}
function buildCategoryWhere(query) {
    const where = {};
    if (query.search) {
        const search = query.search;
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (query.status) {
        where.status = query.status;
    }
    return where;
}
function buildSubcategoryWhere(query) {
    const where = {};
    if (query.search) {
        const search = query.search;
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
        ];
    }
    if (query.status) {
        where.status = query.status;
    }
    if (query.categoryId) {
        where.categoryId = query.categoryId;
    }
    return where;
}
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
        const where = buildCategoryWhere(query);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where,
                skip,
                take,
                orderBy: { name: query.sortDir ?? 'asc' },
                include: {
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
            include: {
                subcategories: { orderBy: { name: 'asc' } },
                _count: { select: { subcategories: true } },
            },
        });
        if (!category)
            throw shared_1.ServiceException.notFound(`No category exists with id ${id}.`);
        return category;
    }
    async createCategory(payload) {
        const { name, slug, description, status } = payload.data;
        try {
            return await this.prisma.category.create({
                data: {
                    name,
                    slug: resolveSlug(name, slug),
                    description: description ?? null,
                    status: status ?? database_1.RecordStatus.ACTIVE,
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
                    slug: data.name || data.slug ? resolveSlug(data.name, data.slug) : undefined,
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
            include: {
                subcategories: {
                    include: {
                        _count: { select: { articles: true } },
                    },
                },
                _count: { select: { albums: true } },
            },
        });
        if (!category)
            throw shared_1.ServiceException.notFound(`No category exists with id ${payload.id}.`);
        
        const hasArticles = category.subcategories.some(s => s._count?.articles > 0);
        if (hasArticles) {
            throw shared_1.ServiceException.conflict('Cannot delete category because some of its subcategories contain published or drafted articles. Please reassign or delete those articles first.');
        }
        if (category._count.albums > 0) {
            throw shared_1.ServiceException.conflict('Cannot delete category because it is referenced by gallery albums.');
        }

        await this.prisma.$transaction([
            this.prisma.subcategory.deleteMany({ where: { categoryId: payload.id } }),
            this.prisma.category.delete({ where: { id: payload.id } }),
        ]);
        return { id: payload.id, deleted: true };
    }
    async findAllSubcategories(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = buildSubcategoryWhere(query);
        const [items, total] = await this.prisma.$transaction([
            this.prisma.subcategory.findMany({
                where,
                skip,
                take,
                orderBy: { name: query.sortDir ?? 'asc' },
                include: { category: { select: { id: true, name: true, slug: true } } },
            }),
            this.prisma.subcategory.count({ where }),
        ]);
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    async findOneSubcategory(id) {
        const subcategory = await this.prisma.subcategory.findUnique({
            where: { id },
            include: { category: { select: { id: true, name: true, slug: true, status: true } } },
        });
        if (!subcategory)
            throw shared_1.ServiceException.notFound(`No subcategory exists with id ${id}.`);
        return subcategory;
    }
    async createSubcategory(payload) {
        const category = await this.prisma.category.findFirst({
            where: { id: payload.data.categoryId, status: database_1.RecordStatus.ACTIVE },
            select: { id: true },
        });
        if (!category)
            throw shared_1.ServiceException.badRequest('The selected category does not exist or is not active.');
        try {
            return await this.prisma.subcategory.create({
                data: {
                    categoryId: payload.data.categoryId,
                    name: payload.data.name,
                    slug: resolveSlug(payload.data.name, payload.data.slug),
                    description: payload.data.description ?? null,
                    status: payload.data.status ?? database_1.RecordStatus.ACTIVE,
                },
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'subcategory');
        }
    }
    async updateSubcategory(payload) {
        const { id, data } = payload;
        if (data.categoryId) {
            const category = await this.prisma.category.findFirst({
                where: { id: data.categoryId, status: database_1.RecordStatus.ACTIVE },
                select: { id: true },
            });
            if (!category)
                throw shared_1.ServiceException.badRequest('The selected category does not exist or is not active.');
        }
        try {
            return await this.prisma.subcategory.update({
                where: { id },
                data: {
                    categoryId: data.categoryId,
                    name: data.name,
                    slug: data.name || data.slug ? resolveSlug(data.name, data.slug) : undefined,
                    description: data.description,
                    status: data.status,
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
            include: { _count: { select: { articles: true } } },
        });
        if (!subcategory) {
            throw shared_1.ServiceException.notFound(`No subcategory exists with id ${payload.id}.`);
        }
        if (subcategory._count?.articles > 0) {
            throw shared_1.ServiceException.conflict('Cannot delete subcategory because it is referenced by existing articles. Please reassign or delete those articles first.');
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
