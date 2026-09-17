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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const articles_service_1 = require("./articles/articles.service");
const taxonomy_service_1 = require("./taxonomy/taxonomy.service");
let ContentController = class ContentController {
    articles;
    taxonomy;
    constructor(articles, taxonomy) {
        this.articles = articles;
        this.taxonomy = taxonomy;
    }
    ping() {
        return { service: 'content-service', status: 'ok' };
    }
    // Articles
    findAllArticles(query) {
        return this.articles.findAll(query);
    }
    publicArticles(query) {
        return this.articles.publicList(query);
    }
    articleStats() {
        return this.articles.stats();
    }
    findOneArticle(payload) {
        return this.articles.findOne(payload.id);
    }
    findArticleBySlug(payload) {
        return this.articles.findBySlug(payload.slug);
    }
    createArticle(payload) {
        return this.articles.create(payload);
    }
    updateArticle(payload) {
        return this.articles.update(payload);
    }
    removeArticle(payload) {
        return this.articles.remove(payload);
    }
    workflow(payload) {
        return this.articles.workflow(payload);
    }
    // Taxonomy
    findAllCategories(query) {
        return this.taxonomy.findAllCategories(query);
    }
    findOneCategory(payload) {
        return this.taxonomy.findOneCategory(payload.id);
    }
    createCategory(payload) {
        return this.taxonomy.createCategory(payload);
    }
    updateCategory(payload) {
        return this.taxonomy.updateCategory(payload);
    }
    removeCategory(payload) {
        return this.taxonomy.removeCategory(payload);
    }
    findAllSubcategories(query) {
        return this.taxonomy.findAllSubcategories(query);
    }
    findOneSubcategory(payload) {
        return this.taxonomy.findOneSubcategory(payload.id);
    }
    createSubcategory(payload) {
        return this.taxonomy.createSubcategory(payload);
    }
    updateSubcategory(payload) {
        return this.taxonomy.updateSubcategory(payload);
    }
    removeSubcategory(payload) {
        return this.taxonomy.removeSubcategory(payload);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ContentController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof articles_service_1.ListArticlesPayload !== "undefined" && articles_service_1.ListArticlesPayload) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findAllArticles", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_PUBLIC_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof articles_service_1.ListArticlesPayload !== "undefined" && articles_service_1.ListArticlesPayload) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "publicArticles", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "articleStats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findOneArticle", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_FIND_BY_SLUG),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findArticleBySlug", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createArticle", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateArticle", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "removeArticle", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.ARTICLE_WORKFLOW),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "workflow", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.CATEGORY_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findAllCategories", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.CATEGORY_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findOneCategory", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.CATEGORY_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createCategory", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.CATEGORY_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateCategory", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.CATEGORY_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "removeCategory", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.SUBCATEGORY_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findAllSubcategories", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.SUBCATEGORY_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findOneSubcategory", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.SUBCATEGORY_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createSubcategory", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.SUBCATEGORY_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updateSubcategory", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.SUBCATEGORY_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "removeSubcategory", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof articles_service_1.ArticlesService !== "undefined" && articles_service_1.ArticlesService) === "function" ? _a : Object, typeof (_b = typeof taxonomy_service_1.TaxonomyService !== "undefined" && taxonomy_service_1.TaxonomyService) === "function" ? _b : Object])
], ContentController);
