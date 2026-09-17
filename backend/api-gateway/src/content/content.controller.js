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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubcategoriesController = exports.CategoriesController = exports.PublicNewsController = exports.ArticlesController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
const content_dto_1 = require("./dto/content.dto");
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
    create(dto, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_CREATE, {
            data: dto,
            actorId: actor.id,
        });
    }
    update(id, dto, actor) {
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
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.CREATE_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new article (starts as DRAFT)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof content_dto_1.CreateArticleDto !== "undefined" && content_dto_1.CreateArticleDto) === "function" ? _c : Object, typeof (_d = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ARTICLES),
    (0, response_interceptor_1.ResponseMessage)('Article updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an article' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof content_dto_1.UpdateArticleDto !== "undefined" && content_dto_1.UpdateArticleDto) === "function" ? _e : Object, typeof (_f = typeof shared_1.AuthenticatedUser !== "undefined" && shared_1.AuthenticatedUser) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.EDIT_ARTICLES),
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
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.REVIEW_ARTICLES),
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
};
exports.PublicNewsController = PublicNewsController;
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
    __metadata("design:paramtypes", [typeof (_m = typeof shared_1.PaginationQueryDto !== "undefined" && shared_1.PaginationQueryDto) === "function" ? _m : Object]),
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
    findAll(categoryId) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.SUBCATEGORY_FIND_ALL, {
            categoryId: categoryId ? Number(categoryId) : undefined,
        });
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
    (0, swagger_1.ApiOperation)({ summary: 'List subcategories, optionally filtered by category' }),
    __param(0, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SubcategoriesController.prototype, "findAll", null);
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
