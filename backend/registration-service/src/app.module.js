"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const node_path_1 = require("node:path");
const database_1 = require("@dpgc/database");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const committees_service_1 = require("./committees/committees.service");
const diaspora_service_1 = require("./diaspora/diaspora.service");
const registration_controller_1 = require("./registration.controller");
const registrationConfig = (0, config_1.registerAs)('registration', () => ({
    host: process.env.REGISTRATION_SERVICE_HOST ?? 'localhost',
    port: Number(process.env.REGISTRATION_SERVICE_PORT ?? 5003),
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
}));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                load: [registrationConfig],
                envFilePath: [(0, node_path_1.join)(__dirname, '..', '..', '.env')],
            }),
            database_1.PrismaModule,
        ],
        controllers: [registration_controller_1.RegistrationController],
        providers: [diaspora_service_1.DiasporaService, committees_service_1.CommitteesService],
    })
], AppModule);
