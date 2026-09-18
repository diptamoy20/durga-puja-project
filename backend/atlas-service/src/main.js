"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('AtlasService');
    const host = process.env.ATLAS_SERVICE_HOST ?? 'localhost';
    const port = Number(process.env.ATLAS_SERVICE_PORT ?? 5006);
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
