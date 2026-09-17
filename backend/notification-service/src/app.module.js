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
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("./notification.service");
const notificationConfig = (0, config_1.registerAs)('notification', () => ({
    host: process.env.NOTIFICATION_SERVICE_HOST ?? 'localhost',
    port: Number(process.env.NOTIFICATION_SERVICE_PORT ?? 5008),
    mail: {
        // `log` prints emails instead of sending them, so local development does
        // not need an SMTP server.
        driver: process.env.MAIL_DRIVER ?? 'log',
        host: process.env.MAIL_HOST ?? '127.0.0.1',
        port: Number(process.env.MAIL_PORT ?? 2525),
        username: process.env.MAIL_USERNAME ?? '',
        password: process.env.MAIL_PASSWORD ?? '',
        fromAddress: process.env.MAIL_FROM_ADDRESS ?? 'no-reply@durgapujaglobalconnect.in',
        fromName: process.env.MAIL_FROM_NAME ?? 'Durga Puja Global Connect',
    },
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
                load: [notificationConfig],
                envFilePath: [(0, node_path_1.join)(__dirname, '..', '..', '.env')],
            }),
            database_1.PrismaModule,
        ],
        controllers: [notification_controller_1.NotificationController],
        providers: [notification_service_1.NotificationService],
    })
], AppModule);
