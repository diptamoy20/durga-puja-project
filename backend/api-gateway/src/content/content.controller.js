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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentFilesController = exports.ContentMediaController = exports.SubcategoriesController = exports.CategoriesController = exports.PublicNewsController = exports.ArticlesController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const content_dto_1 = require("./dto/content.dto");
const content_upload_util_1 = require("./content-upload.util");
const PUBLIC_UPLOAD_DIR = process.env.UPLOAD_DIR ?? './storage/uploads';
function parseOptionalInt(value) {
    if (value === undefined || value === null || value === '')
        return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function parseOptionalBool(value) {
    if (value === undefined || value === null || value === '')
        return undefined;
    return value === true || value === 'true' || value === '1';
}
function parseArticleCreateBody(body, file) {
    if (!body.title?.trim()) {
        throw new common_1.BadRequestException('Title is required.');
    }
    if (!body.subcategoryId) {
        throw new common_1.BadRequestException('Subcategory is required.');
    }
    if (!body.content || String(body.content).length < 10) {
        throw new common_1.BadRequestException('Content must be at least 10 characters.');
    }
    return {
        title: body.title.trim(),
        subcategoryId: Number(body.subcategoryId),
        slug: body.slug?.trim() || undefined,
        authorId: parseOptionalInt(body.authorId),
        excerpt: body.excerpt?.trim() || undefined,
        content: String(body.content),
        featuredImage: file
            ? (0, content_upload_util_1.relativeArticleFeaturedPath)(file)
            : body.featuredImage?.trim() || undefined,
        seoTitle: body.seoTitle?.trim() || undefined,
        seoDescription: body.seoDescription?.trim() || undefined,
        seoKeywords: body.seoKeywords?.trim() || undefined,
        isFeatured: parseOptionalBool(body.isFeatured),
        allowComments: parseOptionalBool(body.allowComments),
    };
}
function parseArticleUpdateBody(body, file) {
    const data = {};
    if (body.title !== undefined)
        data.title = body.title?.trim();
    if (body.subcategoryId !== undefined && body.subcategoryId !== '')
        data.subcategoryId = Number(body.subcategoryId);
    if (body.slug !== undefined)
        data.slug = body.slug?.trim() || undefined;
    if (body.authorId !== undefined && body.authorId !== '')
        data.authorId = parseOptionalInt(body.authorId);
    if (body.excerpt !== undefined)
        data.excerpt = body.excerpt?.trim() || null;
    if (body.content !== undefined)
        data.content = String(body.content);
    if (file) {
        data.featuredImage = (0, content_upload_util_1.relativeArticleFeaturedPath)(file);
    }
    else if (body.featuredImage !== undefined) {
        data.featuredImage = body.featuredImage?.trim() || null;
    }
    if (body.seoTitle !== undefined)
        data.seoTitle = body.seoTitle?.trim() || null;
    if (body.seoDescription !== undefined)
        data.seoDescription = body.seoDescription?.trim() || null;
    if (body.seoKeywords !== undefined)
        data.seoKeywords = body.seoKeywords?.trim() || null;
    const isFeatured = parseOptionalBool(body.isFeatured);
    if (isFeatured !== undefined)
        data.isFeatured = isFeatured;
    const allowComments = parseOptionalBool(body.allowComments);
    if (allowComments !== undefined)
        data.allowComments = allowComments;
    return data;
}
function isAllowedContentFilePath(safePath) {
    return (safePath.startsWith('articles/') || safePath.startsWith('media/')) && !safePath.includes('..');
}
/** Maps article workflow actions to the least-privilege permission keys. */
function assertArticleWorkflowPermission(actor, action) {
    if (actor.isSuperAdmin)
        return;
    const permissionMap = {
        submit_for_review: [shared_1.PERMISSIONS.EDIT_ARTICLES, shared_1.PERMISSIONS.CREATE_ARTICLES],
        start_review: [shared_1.PERMISSIONS.REVIEW_ARTICLES],
        return_to_draft: [shared_1.PERMISSIONS.REVIEW_ARTICLES],
        reject: [shared_1.PERMISSIONS.REVIEW_ARTICLES],
        approve: [shared_1.PERMISSIONS.APPROVE_ARTICLES],
        schedule: [shared_1.PERMISSIONS.PUBLISH_ARTICLES],
        publish: [shared_1.PERMISSIONS.PUBLISH_ARTICLES],
        archive: [shared_1.PERMISSIONS.PUBLISH_ARTICLES],
    };
    const required = permissionMap[action];
    if (!required) {
        throw new common_1.BadRequestException(`Unknown workflow action: ${action}`);
    }
    if (!required.some((key) => actor.permissions.includes(key))) {
        throw new common_1.ForbiddenException({
            message: 'You do not have permission to perform this action.',
            code: 'FORBIDDEN',
            details: { action, requiredAnyOf: required },
        });
    }
}
// ============================================================================
// Articles
// ============================================================================
let ArticlesController = class ArticlesController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_FIND_ALL, query);
    }
    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_STATS, {});
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_FIND_ONE, { id });
    }
    create(body, file, actor) {
        const dto = parseArticleCreateBody(body, file);
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    update(id, body, file, actor) {
        const dto = parseArticleUpdateBody(body, file);
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_UPDATE, {
            id,
            data: dto,
            actorId: actor.id,
        });
    }
    remove(id, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_REMOVE, {
            id,
            actorId: actor.id,
        });
    }
    workflow(id, dto, actor) {
        assertArticleWorkflowPermission(actor, dto.action);
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_WORKFLOW, {
            id,
            action: dto.action,
            comment: dto.comment,
            scheduledAt: dto.scheduledAt,
            actorId: actor.id,
        });
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Articles retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List articles with pagination and filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof content_dto_1.ListArticlesQueryDto !== "undefined" && content_dto_1.ListArticlesQueryDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Article counts by status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single article with its history' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('featured_image', (0, content_upload_util_1.articleFeaturedUploadOptions)(PUBLIC_UPLOAD_DIR))),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article created successfully'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new article (starts as DRAFT)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, typeof (_c = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('featured_image', (0, content_upload_util_1.articleFeaturedUploadOptions)(PUBLIC_UPLOAD_DIR))),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article updated successfully'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an article' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object, typeof (_d = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.DELETE_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete an article' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/workflow'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.REVIEW_ARTICLES, shared_1.PERMISSIONS.APPROVE_ARTICLES, shared_1.PERMISSIONS.PUBLISH_ARTICLES, shared_1.PERMISSIONS.EDIT_ARTICLES, shared_1.PERMISSIONS.CREATE_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article workflow action completed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perform a workflow action on an article',
        description: 'Actions: submit_for_review, start_review, approve, reject, schedule, publish, archive',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof content_dto_1.ArticleWorkflowDto !== "undefined" && content_dto_1.ArticleWorkflowDto) === "function" ? _h : Object, typeof (_j = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "workflow", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, swagger_1.ApiTags)('Articles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], ArticlesController);
// ============================================================================
// Public article (news) view
// ============================================================================
let PublicNewsController = class PublicNewsController {
    client;
    constructor(client) {
        this.client = client;
    }
    findBySlug(slug) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_FIND_BY_SLUG, { slug });
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_PUBLIC_LIST, query);
    }
};
exports.PublicNewsController = PublicNewsController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(),
    (0, response_interceptor_1.ResponseMessage)('Published articles retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Public listing of published news articles' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof content_dto_1.ListArticlesQueryDto !== "undefined" && content_dto_1.ListArticlesQueryDto) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], PublicNewsController.prototype, "findAll", null);
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)(':slug'),
    (0, response_interceptor_1.ResponseMessage)('Article retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a published article by slug' }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicNewsController.prototype, "findBySlug", null);
exports.PublicNewsController = PublicNewsController = __decorate([
    (0, swagger_1.ApiTags)('Public Content'),
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [typeof (_k = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _k : Object])
], PublicNewsController);
// ============================================================================
// Categories
// ============================================================================
let CategoriesController = class CategoriesController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.CATEGORY_FIND_ALL, query);
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.CATEGORY_FIND_ONE, { id });
    }
    create(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.CATEGORY_CREATE, { data: dto });
    }
    update(id, dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.CATEGORY_UPDATE, {
            id,
            data: dto,
        });
    }
    remove(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.CATEGORY_REMOVE, { id });
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Categories retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List categories with pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof content_dto_1.ListCategoriesQueryDto !== "undefined" && content_dto_1.ListCategoriesQueryDto) === "function" ? _m : Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Category retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a category with its subcategories' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Category created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof content_dto_1.CreateCategoryDto !== "undefined" && content_dto_1.CreateCategoryDto) === "function" ? _o : Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Category updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_p = typeof content_dto_1.UpdateCategoryDto !== "undefined" && content_dto_1.UpdateCategoryDto) === "function" ? _p : Object]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Category deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "remove", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [typeof (_l = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _l : Object])
], CategoriesController);
// ============================================================================
// Subcategories
// ============================================================================
let SubcategoriesController = class SubcategoriesController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.SUBCATEGORY_FIND_ALL, query);
    }
    findOne(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.SUBCATEGORY_FIND_ONE, { id });
    }
    create(dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.SUBCATEGORY_CREATE, { data: dto });
    }
    update(id, dto) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.SUBCATEGORY_UPDATE, {
            id,
            data: dto,
        });
    }
    remove(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.SUBCATEGORY_REMOVE, { id });
    }
};
exports.SubcategoriesController = SubcategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Subcategories retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List subcategories with pagination and filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_t = typeof content_dto_1.ListSubcategoriesQueryDto !== "undefined" && content_dto_1.ListSubcategoriesQueryDto) === "function" ? _t : Object]),
    __metadata("design:returntype", void 0)
], SubcategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Subcategory retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single subcategory' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SubcategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Subcategory created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a subcategory' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_r = typeof content_dto_1.CreateSubcategoryDto !== "undefined" && content_dto_1.CreateSubcategoryDto) === "function" ? _r : Object]),
    __metadata("design:returntype", void 0)
], SubcategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Subcategory updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subcategory' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_s = typeof content_dto_1.UpdateSubcategoryDto !== "undefined" && content_dto_1.UpdateSubcategoryDto) === "function" ? _s : Object]),
    __metadata("design:returntype", void 0)
], SubcategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_CATEGORIES),
    (0, response_interceptor_1.ResponseMessage)('Subcategory deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subcategory' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SubcategoriesController.prototype, "remove", null);
exports.SubcategoriesController = SubcategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Subcategories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('subcategories'),
    __metadata("design:paramtypes", [typeof (_q = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _q : Object])
], SubcategoriesController);
// ============================================================================
// CMS Media Library
// ============================================================================
let ContentMediaController = class ContentMediaController {
    client;
    constructor(client) {
        this.client = client;
    }
    findAll(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.MEDIA_FIND_ALL, query);
    }
    async create(file, body, actor) {
        if (!file) {
            throw new common_1.BadRequestException('A file is required.');
        }
        const fileType = (0, content_upload_util_1.detectContentFileType)(file.mimetype);
        if (!fileType) {
            throw new common_1.BadRequestException('Unsupported file type.');
        }
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.MEDIA_CREATE, {
            data: {
                fileName: file.filename,
                originalName: file.originalname,
                filePath: (0, content_upload_util_1.relativeContentPath)(file, fileType),
                fileType,
                mimeType: file.mimetype,
                fileSize: file.size,
                title: body.title?.trim() || null,
                altText: body.alt_text?.trim() || body.altText?.trim() || null,
            },
            actorId: actor.id,
        });
    }
    remove(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.MEDIA_REMOVE, { id });
    }
};
exports.ContentMediaController = ContentMediaController;
__decorate([
    (0, common_1.Get)(),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media library retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List CMS media library items' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_u = typeof content_dto_1.ListMediaQueryDto !== "undefined" && content_dto_1.ListMediaQueryDto) === "function" ? _u : Object]),
    __metadata("design:returntype", void 0)
], ContentMediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, content_upload_util_1.cmsMediaUploadOptions)(PUBLIC_UPLOAD_DIR))),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media uploaded successfully'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a file to the CMS media library' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, typeof (_v = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _v : Object]),
    __metadata("design:returntype", Promise)
], ContentMediaController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_MEDIA),
    (0, response_interceptor_1.ResponseMessage)('Media deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a CMS media library item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContentMediaController.prototype, "remove", null);
exports.ContentMediaController = ContentMediaController = __decorate([
    (0, swagger_1.ApiTags)('Content Media'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('content-media'),
    __metadata("design:paramtypes", [typeof (_t = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _t : Object])
], ContentMediaController);
// ============================================================================
// Public content file serving
// ============================================================================
let ContentFilesController = class ContentFilesController {
    async file(relativePath, res) {
        const safePath = decodeURIComponent(relativePath).replace(/\\/g, '/');
        if (!isAllowedContentFilePath(safePath)) {
            throw new common_1.NotFoundException('File not found.');
        }
        const absolutePath = (0, node_path_1.resolve)(PUBLIC_UPLOAD_DIR, safePath);
        if (!(0, node_fs_1.existsSync)(absolutePath)) {
            throw new common_1.NotFoundException('File not found.');
        }
        const ext = (0, node_path_1.extname)(absolutePath).toLowerCase();
        const mimeByExt = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.mp4': 'video/mp4',
        };
        const contentType = mimeByExt[ext];
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(absolutePath);
    }
};
exports.ContentFilesController = ContentFilesController;
__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('*'),
    (0, response_interceptor_1.ResponseMessage)('File retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Serve uploaded CMS content files' }),
    __param(0, (0, common_1.Param)('0')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentFilesController.prototype, "file", null);
exports.ContentFilesController = ContentFilesController = __decorate([
    (0, swagger_1.ApiTags)('Public Content'),
    (0, common_1.Controller)('content/files'),
    __metadata("design:paramtypes", [])
], ContentFilesController);
