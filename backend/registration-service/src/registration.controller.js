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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const committees_service_1 = require("./committees/committees.service");
const committee_dto_1 = require("./committees/dto/committee.dto");
const diaspora_service_1 = require("./diaspora/diaspora.service");
let RegistrationController = class RegistrationController {
    diaspora;
    committees;
    constructor(diaspora, committees) {
        this.diaspora = diaspora;
        this.committees = committees;
    }
    ping() {
        return { service: 'registration-service', status: 'ok' };
    }
    // Diaspora
    submitDiaspora(payload) {
        return this.diaspora.submit(payload);
    }
    findAllDiaspora(query) {
        return this.diaspora.findAll(query);
    }
    findOneDiaspora(payload) {
        return this.diaspora.findOne(payload.id);
    }
    diasporaStats() {
        return this.diaspora.stats();
    }
    verifyDiaspora(payload) {
        return this.diaspora.verify(payload);
    }
    rejectDiaspora(payload) {
        return this.diaspora.reject(payload);
    }
    // Committees
    submitCommittee(payload) {
        return this.committees.submit(payload);
    }
    findAllCommittees(query) {
        return this.committees.findAll(query);
    }
    findOneCommittee(payload) {
        return this.committees.findOne(payload.id);
    }
    changeCommitteeStatus(payload) {
        return this.committees.changeStatus(payload);
    }
    createPortalAccount(payload) {
        return this.committees.createPortalAccount(payload);
    }
    committeeStats() {
        return this.committees.stats();
    }
    updateCommittee(payload) {
        return this.committees.update(payload);
    }
    removeCommittee(payload) {
        return this.committees.remove(payload);
    }
};
exports.RegistrationController = RegistrationController;
__decorate([
    (0, microservices_1.MessagePattern)('health.ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], RegistrationController.prototype, "ping", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.DIASPORA_SUBMIT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof diaspora_service_1.SubmitDiasporaPayload !== "undefined" && diaspora_service_1.SubmitDiasporaPayload) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "submitDiaspora", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.DIASPORA_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof diaspora_service_1.ListDiasporaPayload !== "undefined" && diaspora_service_1.ListDiasporaPayload) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "findAllDiaspora", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.DIASPORA_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "findOneDiaspora", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.DIASPORA_STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "diasporaStats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.DIASPORA_VERIFY),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof diaspora_service_1.DecideDiasporaPayload !== "undefined" && diaspora_service_1.DecideDiasporaPayload) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "verifyDiaspora", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.DIASPORA_REJECT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof diaspora_service_1.DecideDiasporaPayload !== "undefined" && diaspora_service_1.DecideDiasporaPayload) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "rejectDiaspora", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_SUBMIT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof committee_dto_1.SubmitCommitteePayload !== "undefined" && committee_dto_1.SubmitCommitteePayload) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "submitCommittee", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_FIND_ALL),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof committee_dto_1.ListCommitteesPayload !== "undefined" && committee_dto_1.ListCommitteesPayload) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "findAllCommittees", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_FIND_ONE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "findOneCommittee", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_CHANGE_STATUS),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof committee_dto_1.ChangeCommitteeStatusPayload !== "undefined" && committee_dto_1.ChangeCommitteeStatusPayload) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "changeCommitteeStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_CREATE_PORTAL_ACCOUNT),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof committee_dto_1.CreatePortalAccountPayload !== "undefined" && committee_dto_1.CreatePortalAccountPayload) === "function" ? _k : Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "createPortalAccount", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_STATS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "committeeStats", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_UPDATE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "updateCommittee", null);
__decorate([
    (0, microservices_1.MessagePattern)(shared_1.REGISTRATION_PATTERNS.COMMITTEE_REMOVE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "removeCommittee", null);
exports.RegistrationController = RegistrationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof diaspora_service_1.DiasporaService !== "undefined" && diaspora_service_1.DiasporaService) === "function" ? _a : Object, typeof (_b = typeof committees_service_1.CommitteesService !== "undefined" && committees_service_1.CommitteesService) === "function" ? _b : Object])
], RegistrationController);
