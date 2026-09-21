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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const articles_service_1 = require("./articles/articles.service");
const taxonomy_service_1 = require("./taxonomy/taxonomy.service");
const podcasts_service_1 = require("./podcasts/podcasts.service");
const tourism_service_1 = require("./tourism/tourism.service");
const media_service_1 = require("./media/media.service");
let ContentController = class ContentController {
    articles;
    taxonomy;
    podcasts;
    tourism;
    constructor(articles, taxonomy, podcasts, tourism) {
        this.articles = articles;
        this.taxonomy = taxonomy;
        this.podcasts = podcasts;
        this.tourism = tourism;
    media;
    constructor(articles, taxonomy, podcasts, media) {
        this.articles = articles;
        this.taxonomy = taxonomy;
        this.podcasts = podcasts;
        this.media = media;
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
    // Podcasts
    findAllPodcasts(query) {
        return this.podcasts.findAll(query);
    }
    publicPodcasts(query) {
        return this.podcasts.publicList(query);
    }
    featuredPodcast() {
        return this.podcasts.featured();
    }
    findOnePodcast(payload) {
        return this.podcasts.findOne(payload.id);
    }
    findPodcastBySlug(payload) {
        return this.podcasts.findBySlug(payload.slug);
    }
    createPodcast(payload) {
        return this.podcasts.create(payload);
    }
    updatePodcast(payload) {
        return this.podcasts.update(payload);
    }
    togglePodcastStatus(payload) {
        return this.podcasts.toggleStatus(payload);
    }
    removePodcast(payload) {
        return this.podcasts.remove(payload);
    }
    playPodcast(payload) {
        return this.podcasts.play(payload);
    }
    reactPodcast(payload) {
        return this.podcasts.react(payload);
    }
    subscribePodcast(payload) {
        return this.podcasts.subscribe(payload);
    }
    podcastStats() {
        return this.podcasts.stats();
    }
    podcastRss() {
        return this.podcasts.getRssData();
    }
    // Tourism Concierge
    tourismCaptchaGenerate() {
        return this.tourism.generateCaptcha();
    }
    tourismCircuitsPublic(payload) {
        return this.tourism.getCircuits(payload);
    }
    tourismCircuitDetail(payload) {
        return this.tourism.getCircuitBySlug(payload.slug);
    }
    tourismStaysPublic(payload) {
        return this.tourism.getStays(payload);
    }
    tourismTransportsPublic() {
        return this.tourism.getTransports();
    }
    tourismCalendarPublic() {
        return this.tourism.getFestivalCalendar();
    }
    tourismItinerariesPublic(payload) {
        return this.tourism.getItineraries(payload);
    }
    tourismItineraryDetail(payload) {
        return this.tourism.getItineraryBySlug(payload.slug);
    }
    tourismKnowledgePublic() {
        return this.tourism.getKnowledge();
    }
    tourismOperatorsPublic() {
        return this.tourism.getOperators();
    }
    tourismRecommendations(payload) {
        return this.tourism.getRecommendations(payload);
    }
    tourismAssistantChat(payload) {
        return this.tourism.handleChatbot(payload);
    }
    tourismEnquirySubmit(payload) {
        return this.tourism.submitEnquiry(payload);
    }
    tourismEnquiryTrack(payload) {
        return this.tourism.trackEnquiry(payload.code);
    }
    tourismAdminStats() {
        return this.tourism.getAdminStats();
    }
    tourismAdminCircuitsList(payload) {
        return this.tourism.getCircuits(payload);
    }
    tourismAdminCircuitCreate(payload) {
        return this.tourism.createCircuit(payload);
    }
    tourismAdminCircuitUpdate(payload) {
        return this.tourism.updateCircuit(payload);
    }
    tourismAdminCircuitDelete(payload) {
        return this.tourism.deleteCircuit(payload.id);
    }
    tourismAdminStaysList(payload) {
        return this.tourism.getStays(payload);
    }
    tourismAdminStayCreate(payload) {
        return this.tourism.createStay(payload);
    }
    tourismAdminStayUpdate(payload) {
        return this.tourism.updateStay(payload);
    }
    tourismAdminStayDelete(payload) {
        return this.tourism.deleteStay(payload.id);
    }
    tourismAdminTransportsList() {
        return this.tourism.getTransports();
    }
    tourismAdminTransportCreate(payload) {
        return this.tourism.createTransport(payload);
    }
    tourismAdminTransportUpdate(payload) {
        return this.tourism.updateTransport(payload);
    }
    tourismAdminTransportDelete(payload) {
        return this.tourism.deleteTransport(payload.id);
    }
    tourismAdminItinerariesList(payload) {
        return this.tourism.getItineraries(payload);
    }
    tourismAdminItineraryCreate(payload) {
        return this.tourism.createItinerary(payload);
    }
    tourismAdminItineraryUpdate(payload) {
        return this.tourism.updateItinerary(payload);
    }
    tourismAdminItineraryDelete(payload) {
        return this.tourism.deleteItinerary(payload.id);
    }
    tourismAdminKnowledgeList() {
        return this.tourism.getKnowledge();
    }
    tourismAdminKnowledgeCreate(payload) {
        return this.tourism.createKnowledge(payload);
    }
    tourismAdminKnowledgeUpdate(payload) {
        return this.tourism.updateKnowledge(payload);
    }
    tourismAdminKnowledgeDelete(payload) {
        return this.tourism.deleteKnowledge(payload.id);
    }
    tourismAdminOperatorsList() {
        return this.tourism.getOperators();
    }
    tourismAdminOperatorCreate(payload) {
        return this.tourism.createOperator(payload);
    }
    tourismAdminOperatorUpdate(payload) {
        return this.tourism.updateOperator(payload);
    }
    tourismAdminOperatorDelete(payload) {
        return this.tourism.deleteOperator(payload.id);
    }
    tourismAdminEnquiriesList(payload) {
        return this.tourism.getAdminEnquiries(payload);
    }
    tourismAdminEnquiryDetail(payload) {
        return this.tourism.getAdminEnquiryDetail(payload.id);
    }
    tourismAdminEnquiryUpdateStatus(payload) {
        return this.tourism.updateEnquiryStatus(payload);
    }
    tourismAdminEnquiryAssign(payload) {
        return this.tourism.assignEnquiry(payload);
    }
    tourismAdminEnquiryAddNote(payload) {
        return this.tourism.addEnquiryNote(payload);
    // CMS Media Library
    findAllMedia(query) {
        return this.media.findAll(query);
    }
    createMedia(payload) {
        return this.media.create(payload);
    }
    removeMedia(payload) {
        return this.media.remove(payload);
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
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findAllPodcasts", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_PUBLIC_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "publicPodcasts", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_FEATURED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "featuredPodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findOnePodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_FIND_BY_SLUG),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "findPodcastBySlug", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createPodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "updatePodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_TOGGLE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "togglePodcastStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "removePodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_PLAY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "playPodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_REACT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "reactPodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_SUBSCRIBE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "subscribePodcast", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "podcastStats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.PODCAST_RSS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "podcastRss", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.CAPTCHA_GENERATE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismCaptchaGenerate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.CIRCUITS_PUBLIC),
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.MEDIA_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismCircuitsPublic", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.CIRCUIT_DETAIL),
], ContentController.prototype, "findAllMedia", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.MEDIA_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismCircuitDetail", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.STAYS_PUBLIC),
], ContentController.prototype, "createMedia", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.CONTENT_PATTERNS.MEDIA_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismStaysPublic", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.TRANSPORTS_PUBLIC),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismTransportsPublic", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.CALENDAR_PUBLIC),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismCalendarPublic", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ITINERARIES_PUBLIC),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismItinerariesPublic", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ITINERARY_DETAIL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismItineraryDetail", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.KNOWLEDGE_PUBLIC),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismKnowledgePublic", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.OPERATORS_PUBLIC),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismOperatorsPublic", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.RECOMMENDATIONS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismRecommendations", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ASSISTANT_CHAT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAssistantChat", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ENQUIRY_SUBMIT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismEnquirySubmit", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ENQUIRY_TRACK),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismEnquiryTrack", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminStats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_CIRCUITS_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminCircuitsList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_CIRCUIT_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminCircuitCreate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_CIRCUIT_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminCircuitUpdate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_CIRCUIT_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminCircuitDelete", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_STAYS_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminStaysList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_STAY_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminStayCreate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_STAY_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminStayUpdate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_STAY_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminStayDelete", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORTS_LIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminTransportsList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORT_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminTransportCreate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORT_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminTransportUpdate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORT_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminTransportDelete", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ITINERARIES_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminItinerariesList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ITINERARY_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminItineraryCreate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ITINERARY_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminItineraryUpdate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ITINERARY_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminItineraryDelete", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_LIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminKnowledgeList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminKnowledgeCreate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminKnowledgeUpdate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminKnowledgeDelete", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_OPERATORS_LIST),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminOperatorsList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_OPERATOR_CREATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminOperatorCreate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_OPERATOR_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminOperatorUpdate", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_OPERATOR_DELETE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminOperatorDelete", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRIES_LIST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminEnquiriesList", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_DETAIL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminEnquiryDetail", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_UPDATE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminEnquiryUpdateStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_ASSIGN),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminEnquiryAssign", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_ADD_NOTE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tourismAdminEnquiryAddNote", null);
], ContentController.prototype, "removeMedia", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [
        typeof (_a = typeof articles_service_1.ArticlesService !== "undefined" && articles_service_1.ArticlesService) === "function" ? _a : Object,
        typeof (_b = typeof taxonomy_service_1.TaxonomyService !== "undefined" && taxonomy_service_1.TaxonomyService) === "function" ? _b : Object,
        typeof (_c = typeof podcasts_service_1.PodcastsService !== "undefined" && podcasts_service_1.PodcastsService) === "function" ? _c : Object,
        typeof (_d = typeof tourism_service_1.TourismService !== "undefined" && tourism_service_1.TourismService) === "function" ? _d : Object
        typeof (_d = typeof media_service_1.MediaService !== "undefined" && media_service_1.MediaService) === "function" ? _d : Object
    ])
], ContentController);
