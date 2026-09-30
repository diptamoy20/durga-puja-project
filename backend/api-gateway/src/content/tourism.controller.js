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
    return function (target, key) { decorator(target, key, paramIndex); };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTourismController = exports.PublicTourismController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const microservice_client_1 = require("../clients/microservice.client");
const response_interceptor_1 = require("../interceptors/response.interceptor");

// ============================================================================
// Public Tourism Controller
// ============================================================================
let PublicTourismController = class PublicTourismController {
    client;
    constructor(client) {
        this.client = client;
    }

    circuits(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.CIRCUITS_PUBLIC, query || {});
    }

    featuredCircuits() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.CIRCUITS_PUBLIC, { featured: true });
    }

    circuitDetail(slug) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.CIRCUIT_DETAIL, { slug });
    }

    stays(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.STAYS_PUBLIC, query || {});
    }

    featuredStays() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.STAYS_PUBLIC, { featured: true });
    }

    stayDetail(slug) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.STAYS_PUBLIC, { slug });
    }

    transports() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.TRANSPORTS_PUBLIC, {});
    }

    transportDetail(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.TRANSPORTS_PUBLIC, { id: Number(id) });
    }

    festivalDays() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.CALENDAR_PUBLIC, {});
    }

    itineraries(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ITINERARIES_PUBLIC, query || {});
    }

    curatedItineraries() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ITINERARIES_PUBLIC, { isCurated: true });
    }

    itineraryDetail(slug) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ITINERARY_DETAIL, { slug });
    }

    knowledge(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.KNOWLEDGE_PUBLIC, query || {});
    }

    knowledgeDetail(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.KNOWLEDGE_PUBLIC, { id: Number(id) });
    }

    operators(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.OPERATORS_PUBLIC, query || {});
    }

    verifiedOperators() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.OPERATORS_PUBLIC, { isVerified: true });
    }

    operatorDetail(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.OPERATORS_PUBLIC, { id: Number(id) });
    }

    recommendations(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.RECOMMENDATIONS, body || {});
    }

    chatbot(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ASSISTANT_CHAT, body || {});
    }

    captcha() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.CAPTCHA_GENERATE, {});
    }

    enquirySubmit(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ENQUIRY_SUBMIT, body || {});
    }

    enquiryTrack(code) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ENQUIRY_TRACK, { code });
    }
};
exports.PublicTourismController = PublicTourismController;

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('circuits'),
    (0, response_interceptor_1.ResponseMessage)('Tourism circuits retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public tourism circuits' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "circuits", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('circuits/featured'),
    (0, response_interceptor_1.ResponseMessage)('Featured circuits retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured pilgrimage circuits' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "featuredCircuits", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('circuits/:slug'),
    (0, response_interceptor_1.ResponseMessage)('Tourism circuit details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tourism circuit details by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "circuitDetail", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('stays'),
    (0, response_interceptor_1.ResponseMessage)('Tourism stays retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verified stays & WBTDCL accommodations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "stays", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('stays/featured'),
    (0, response_interceptor_1.ResponseMessage)('Featured stays retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured stays' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "featuredStays", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('stays/:slug'),
    (0, response_interceptor_1.ResponseMessage)('Stay details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stay details by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "stayDetail", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('transports'),
    (0, response_interceptor_1.ResponseMessage)('Transport options retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get festive transit options' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "transports", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('transports/:id'),
    (0, response_interceptor_1.ResponseMessage)('Transport details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transport details by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "transportDetail", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('festival-days'),
    (0, response_interceptor_1.ResponseMessage)('Festival calendar retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Durga Puja 2026 festival calendar days' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "festivalDays", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('itineraries'),
    (0, response_interceptor_1.ResponseMessage)('Tourism itineraries retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get day-by-day curated itineraries' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "itineraries", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('itineraries/curated'),
    (0, response_interceptor_1.ResponseMessage)('Curated itineraries retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get curated itineraries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "curatedItineraries", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('itineraries/:slug'),
    (0, response_interceptor_1.ResponseMessage)('Itinerary details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get itinerary details by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "itineraryDetail", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('knowledge'),
    (0, response_interceptor_1.ResponseMessage)('Tourism knowledge items retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tourism travel knowledge base' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "knowledge", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('knowledge/:id'),
    (0, response_interceptor_1.ResponseMessage)('Knowledge details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tourism knowledge details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "knowledgeDetail", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('operators'),
    (0, response_interceptor_1.ResponseMessage)('Tour operators retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verified tour operators' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "operators", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('operators/verified'),
    (0, response_interceptor_1.ResponseMessage)('Verified tour operators retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verified tour operators' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "verifiedOperators", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('operators/:id'),
    (0, response_interceptor_1.ResponseMessage)('Tour operator details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get operator details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "operatorDetail", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('recommendations'),
    (0, response_interceptor_1.ResponseMessage)('Recommendations generated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate personalised recommendations' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "recommendations", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('chatbot'),
    (0, response_interceptor_1.ResponseMessage)('Assistant response generated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Chat with Tourism Concierge multilingual assistant' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "chatbot", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('captcha'),
    (0, response_interceptor_1.ResponseMessage)('Captcha generated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate math captcha challenge' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "captcha", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Post)('enquiries'),
    (0, response_interceptor_1.ResponseMessage)('Enquiry submitted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a Tourism Concierge enquiry' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "enquirySubmit", null);

__decorate([
    (0, shared_1.Public)(),
    (0, common_1.Get)('enquiries/:code'),
    (0, response_interceptor_1.ResponseMessage)('Enquiry status retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Track Tourism Concierge enquiry by unique code' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicTourismController.prototype, "enquiryTrack", null);

exports.PublicTourismController = PublicTourismController = __decorate([
    (0, swagger_1.ApiTags)('Public Tourism Concierge'),
    (0, common_1.Controller)('tourism'),
    __metadata("design:paramtypes", [microservice_client_1.MicroserviceClient])
], PublicTourismController);

// ============================================================================
// Admin Tourism Controller
// ============================================================================
let AdminTourismController = class AdminTourismController {
    client;
    constructor(client) {
        this.client = client;
    }

    stats() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_STATS, {});
    }

    // Circuits
    listCircuits(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_CIRCUITS_LIST, query || {});
    }

    createCircuit(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_CIRCUIT_CREATE, body);
    }

    updateCircuit(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_CIRCUIT_UPDATE, { id: Number(id), ...body });
    }

    deleteCircuit(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_CIRCUIT_DELETE, { id: Number(id) });
    }

    // Stays
    listStays(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_STAYS_LIST, query || {});
    }

    createStay(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_STAY_CREATE, body);
    }

    updateStay(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_STAY_UPDATE, { id: Number(id), ...body });
    }

    deleteStay(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_STAY_DELETE, { id: Number(id) });
    }

    // Transports
    listTransports() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORTS_LIST, {});
    }

    createTransport(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORT_CREATE, body);
    }

    updateTransport(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORT_UPDATE, { id: Number(id), ...body });
    }

    deleteTransport(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_TRANSPORT_DELETE, { id: Number(id) });
    }

    // Itineraries
    listItineraries(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ITINERARIES_LIST, query || {});
    }

    createItinerary(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ITINERARY_CREATE, body);
    }

    updateItinerary(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ITINERARY_UPDATE, { id: Number(id), ...body });
    }

    deleteItinerary(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ITINERARY_DELETE, { id: Number(id) });
    }

    // Knowledge
    listKnowledge() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_LIST, {});
    }

    createKnowledge(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_CREATE, body);
    }

    updateKnowledge(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_UPDATE, { id: Number(id), ...body });
    }

    deleteKnowledge(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_KNOWLEDGE_DELETE, { id: Number(id) });
    }

    // Operators
    listOperators() {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_OPERATORS_LIST, {});
    }

    createOperator(body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_OPERATOR_CREATE, body);
    }

    updateOperator(id, body) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_OPERATOR_UPDATE, { id: Number(id), ...body });
    }

    deleteOperator(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_OPERATOR_DELETE, { id: Number(id) });
    }

    // Enquiries
    listEnquiries(query) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRIES_LIST, query || {});
    }

    enquiryDetail(id) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_DETAIL, { id: Number(id) });
    }

    updateStatus(id, body, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_UPDATE_STATUS, {
            id: Number(id),
            status: body.status,
            comment: body.comment,
            changedById: actor?.id,
        });
    }

    assignEnquiry(id, body, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_ASSIGN, {
            id: Number(id),
            assignedToId: body.assignedToId ? Number(body.assignedToId) : null,
            comment: body.comment,
            changedById: actor?.id,
        });
    }

    addNote(id, body, actor) {
        return this.client.send(shared_1.SERVICE_TOKENS.CONTENT, shared_1.TOURISM_PATTERNS.ADMIN_ENQUIRY_ADD_NOTE, {
            id: Number(id),
            note: body.note || body.remarks,
            changedById: actor?.id,
        });
    }
};
exports.AdminTourismController = AdminTourismController;

__decorate([
    (0, common_1.Get)('stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Tourism statistics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tourism concierge dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "stats", null);

// Circuits
__decorate([
    (0, common_1.Get)('circuits'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Circuits retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tourism circuits (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "listCircuits", null);

__decorate([
    (0, common_1.Post)('circuits'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Circuit created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tourism circuit' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "createCircuit", null);

__decorate([
    (0, common_1.Put)('circuits/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Circuit updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a tourism circuit' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "updateCircuit", null);

__decorate([
    (0, common_1.Delete)('circuits/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Circuit deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a tourism circuit' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "deleteCircuit", null);

// Stays
__decorate([
    (0, common_1.Get)('stays'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Stays retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all stays (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "listStays", null);

__decorate([
    (0, common_1.Post)('stays'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Stay created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new stay accommodation' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "createStay", null);

__decorate([
    (0, common_1.Put)('stays/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Stay updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update stay accommodation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "updateStay", null);

__decorate([
    (0, common_1.Delete)('stays/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Stay deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete stay accommodation' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "deleteStay", null);

// Transports
__decorate([
    (0, common_1.Get)('transports'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Transports retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all transports (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "listTransports", null);

__decorate([
    (0, common_1.Post)('transports'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Transport created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create transport option' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "createTransport", null);

__decorate([
    (0, common_1.Put)('transports/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Transport updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transport option' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "updateTransport", null);

__decorate([
    (0, common_1.Delete)('transports/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Transport deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete transport option' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "deleteTransport", null);

// Itineraries
__decorate([
    (0, common_1.Get)('itineraries'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Itineraries retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all itineraries (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "listItineraries", null);

__decorate([
    (0, common_1.Post)('itineraries'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Itinerary created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create curated itinerary' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "createItinerary", null);

__decorate([
    (0, common_1.Put)('itineraries/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Itinerary updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update curated itinerary' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "updateItinerary", null);

__decorate([
    (0, common_1.Delete)('itineraries/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Itinerary deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete curated itinerary' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "deleteItinerary", null);

// Knowledge
__decorate([
    (0, common_1.Get)('knowledge'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Knowledge retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tourism knowledge (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "listKnowledge", null);

__decorate([
    (0, common_1.Post)('knowledge'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Knowledge created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create tourism knowledge' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "createKnowledge", null);

__decorate([
    (0, common_1.Put)('knowledge/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Knowledge updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tourism knowledge' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "updateKnowledge", null);

__decorate([
    (0, common_1.Delete)('knowledge/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Knowledge deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete tourism knowledge' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "deleteKnowledge", null);

// Operators
__decorate([
    (0, common_1.Get)('operators'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Tour operators retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tour operators (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "listOperators", null);

__decorate([
    (0, common_1.Post)('operators'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Tour operator created successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Create tour operator' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "createOperator", null);

__decorate([
    (0, common_1.Put)('operators/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Tour operator updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tour operator' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "updateOperator", null);

__decorate([
    (0, common_1.Delete)('operators/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM),
    (0, response_interceptor_1.ResponseMessage)('Tour operator deleted successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete tour operator' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "deleteOperator", null);

// Enquiries
__decorate([
    (0, common_1.Get)('enquiries'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Tourism enquiries retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tourism enquiries (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "listEnquiries", null);

__decorate([
    (0, common_1.Get)('enquiries/:id'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Tourism enquiry details retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tourism enquiry details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "enquiryDetail", null);

__decorate([
    (0, common_1.Patch)('enquiries/:id/status'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Enquiry status updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Update enquiry status workflow' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "updateStatus", null);

__decorate([
    (0, common_1.Patch)('enquiries/:id/assign'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Enquiry assigned successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign enquiry to user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "assignEnquiry", null);

__decorate([
    (0, common_1.Post)('enquiries/:id/notes'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_TOURISM_ENQUIRIES),
    (0, response_interceptor_1.ResponseMessage)('Note added successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Add note/remarks to enquiry' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AdminTourismController.prototype, "addNote", null);

exports.AdminTourismController = AdminTourismController = __decorate([
    (0, swagger_1.ApiTags)('Admin Tourism Concierge'),
    (0, common_1.Controller)('admin/tourism'),
    __metadata("design:paramtypes", [microservice_client_1.MicroserviceClient])
], AdminTourismController);
