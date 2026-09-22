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
const articles_service_1 = require("./articles/articles.service");
const content_controller_1 = require("./content.controller");
const taxonomy_service_1 = require("./taxonomy/taxonomy.service");
const podcasts_service_1 = require("./podcasts/podcasts.service");
const tourism_service_1 = require("./tourism/tourism.service");
const media_service_1 = require("./media/media.service");
const investments_service_1 = require("./investments/investments.service");
const contentConfig = (0, config_1.registerAs)('content', () => ({
    host: process.env.CONTENT_SERVICE_HOST ?? 'localhost',
    port: Number(process.env.CONTENT_SERVICE_PORT ?? 5004),
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
                load: [contentConfig],
                envFilePath: [(0, node_path_1.join)(__dirname, '..', '..', '.env')],
            }),
            database_1.PrismaModule,
        ],
        controllers: [content_controller_1.ContentController],
        providers: [
            articles_service_1.ArticlesService,
            taxonomy_service_1.TaxonomyService,
            podcasts_service_1.PodcastsService,
            tourism_service_1.TourismService,
            media_service_1.MediaService,
            investments_service_1.InvestmentsService,
        ],
    })
], AppModule);
