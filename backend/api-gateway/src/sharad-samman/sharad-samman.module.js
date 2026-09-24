"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharadSammanModule = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@dpgc/database");
const sharad_samman_controller_1 = require("./sharad-samman.controller");
const committee_sharad_samman_controller_1 = require("./committee-sharad-samman.controller");
const voting_controller_1 = require("./voting.controller");
const sharad_samman_service_1 = require("./sharad-samman.service");
const voting_service_1 = require("./voting.service");

let SharadSammanModule = class SharadSammanModule {
};
exports.SharadSammanModule = SharadSammanModule;
exports.SharadSammanModule = SharadSammanModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.PrismaModule],
        controllers: [
            voting_controller_1.VotingController,
            sharad_samman_controller_1.SharadSammanController,
            committee_sharad_samman_controller_1.CommitteeSharadSammanController,
        ],
        providers: [
            sharad_samman_service_1.SharadSammanService,
            voting_service_1.VotingService,
        ],
        exports: [
            sharad_samman_service_1.SharadSammanService,
            voting_service_1.VotingService,
        ],
    })
], SharadSammanModule);
