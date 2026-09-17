"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const node_path_1 = require("node:path");
const database_1 = require("@dpgc/database");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const audit_module_1 = require("./audit/audit.module");
const configuration_1 = __importDefault(require("./config/configuration"));
const rbac_module_1 = require("./rbac/rbac.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                load: [configuration_1.default],
                envFilePath: [(0, node_path_1.join)(__dirname, '..', '..', '.env')],
            }),
            database_1.PrismaModule,
            audit_module_1.AuditModule,
            users_module_1.UsersModule,
            rbac_module_1.RbacModule,
        ],
    })
], AppModule);
