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
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const associations_module_1 = require("./associations/associations.module");
const sharad_samman_module_1 = require("./sharad-samman/sharad-samman.module");
const atlas_module_1 = require("./atlas/atlas.module");
const auth_module_1 = require("./auth/auth.module");
const clients_module_1 = require("./clients/clients.module");
const content_module_1 = require("./content/content.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const events_module_1 = require("./events/events.module");
const gallery_module_1 = require("./gallery/gallery.module");
const configuration_1 = __importDefault(require("./config/configuration"));
const services_config_1 = __importDefault(require("./config/services.config"));
const env_validation_1 = require("./config/env.validation");
const database_1 = require("@dpgc/database");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const notifications_module_1 = require("./notifications/notifications.module");
const permissions_guard_1 = require("./guards/permissions.guard");
const registrations_module_1 = require("./registrations/registrations.module");
const roles_guard_1 = require("./guards/roles.guard");
const health_controller_1 = require("./health/health.controller");
const response_interceptor_1 = require("./interceptors/response.interceptor");
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
                load: [configuration_1.default, services_config_1.default],
                validate: env_validation_1.validateEnv,
                envFilePath: [(0, node_path_1.join)(__dirname, '..', '..', '.env')],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: (config.get('gateway.throttle.ttl') ?? 60) * 1000,
                        limit: config.get('gateway.throttle.limit') ?? 120,
                    },
                ],
            }),
            // Registered globally so the guard can verify tokens without a TCP call.
            jwt_1.JwtModule.register({}),
            clients_module_1.ClientsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            dashboard_module_1.DashboardModule,
            registrations_module_1.RegistrationsModule,
            content_module_1.ContentModule,
            gallery_module_1.GalleryModule,
            atlas_module_1.AtlasModule,
            events_module_1.EventsModule,
            notifications_module_1.NotificationsModule,
            database_1.PrismaModule,
            associations_module_1.AssociationsModule,
            sharad_samman_module_1.SharadSammanModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            /* Order matters: authentication before authorisation. Nest applies global
               guards in registration order, so JwtAuthGuard populates `req.user`
               before the two authorisation guards read it. */
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_GUARD, useClass: permissions_guard_1.PermissionsGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
        ],
    })
], AppModule);
