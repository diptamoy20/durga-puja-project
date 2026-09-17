"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('AtlasService');
    const configApp = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: false });
    const config = configApp.get(config_1.ConfigService);
    const host = config.get('atlas.host') ?? 'localhost';
    const port = config.get('atlas.port') ?? 5006;
    await configApp.close();
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.TCP,
        options: { host, port },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new shared_1.ServiceExceptionFilter());
    app.enableShutdownHooks();
    await app.listen();
    logger.log(`Atlas service listening on TCP ${host}:${port}`);
}
void bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Atlas service failed to start:', error);
    process.exit(1);
});
