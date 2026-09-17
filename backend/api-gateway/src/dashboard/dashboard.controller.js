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
var DashboardController_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");
/**
 * Read-only aggregate for the landing screen. The numbers live in four
 * different services, so the gateway fans out once here rather than making the
 * browser issue four requests and add them up itself.
 */
let DashboardController = DashboardController_1 = class DashboardController {
    client;
    logger = new common_1.Logger(DashboardController_1.name);
    constructor(client) {
        this.client = client;
    }
    async summary() {
        const sources = {
            diaspora: () => this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.DIASPORA_STATS, {}),
            committees: () => this.client.send(shared_1.SERVICE_TOKENS.REGISTRATION, shared_1.REGISTRATION_PATTERNS.COMMITTEE_STATS, {}),
            pandals: () => this.client.send(shared_1.SERVICE_TOKENS.ATLAS, shared_1.ATLAS_PATTERNS.STATS, {}),
            articles: () => this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.CONTENT_PATTERNS.ARTICLE_STATS, {}),
        };
        const sections = Object.keys(sources);
        // Queried in parallel, and a single failure degrades one card instead of
        // blanking the dashboard.
        const settled = await Promise.allSettled(sections.map((section) => sources[section]()));
        const counts = {};
        const unavailable = [];
        sections.forEach((section, index) => {
            const result = settled[index];
            if (result.status === 'fulfilled') {
                counts[section] = result.value;
                return;
            }
            counts[section] = {};
            unavailable.push(section);
            this.logger.warn(`Dashboard section "${section}" unavailable: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
        });
        return {
            diasporaMembers: counts.diaspora.total ?? 0,
            pujaCommittees: counts.committees.total ?? 0,
            pandals: counts.pandals.total ?? 0,
            // "Needs review" in the old portal meant committees sitting in either
            // pending or under_review.
            pendingApprovals: (counts.committees.pending ?? 0) + (counts.committees.under_review ?? 0),
            articles: {
                total: counts.articles.total ?? 0,
                draft: counts.articles.draft ?? 0,
                inReview: counts.articles.in_review ?? 0,
                approved: counts.articles.approved ?? 0,
                rejected: counts.articles.rejected ?? 0,
                scheduled: counts.articles.scheduled ?? 0,
                published: counts.articles.published ?? 0,
                archived: counts.articles.archived ?? 0,
            },
            unavailable,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_DASHBOARD),
    (0, response_interceptor_1.ResponseMessage)('Dashboard summary retrieved successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Portal-wide counts for the dashboard',
        description: 'Diaspora registrations, puja committees, pandals and articles, each counted by status. ' +
            'Sections whose service is unreachable are reported in `unavailable` and returned as zero ' +
            'rather than failing the whole response.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The aggregated counts.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Missing the view_dashboard permission.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], DashboardController.prototype, "summary", null);
exports.DashboardController = DashboardController = DashboardController_1 = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [typeof (_a = typeof microservice_client_1.MicroserviceClient !== "undefined" && microservice_client_1.MicroserviceClient) === "function" ? _a : Object])
], DashboardController);
