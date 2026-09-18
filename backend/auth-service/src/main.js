"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
/**
 * Auth service: a pure TCP microservice with no HTTP listener, so it is
 * unreachable from the browser. Only the API Gateway speaks to it.
 */
async function bootstrap() {
    const logger = new common_1.Logger('AuthService');
    const host = process.env.AUTH_SERVICE_HOST ?? 'localhost';
    const port = Number(process.env.AUTH_SERVICE_PORT ?? 5001);
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.TCP,
        options: { host, port },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));
    // Keeps typed errors intact across the TCP boundary.
    app.useGlobalFilters(new shared_1.ServiceExceptionFilter());
    app.enableShutdownHooks();
    await app.listen();
    logger.log(`Auth service listening on TCP ${host}:${port}`);
}
void bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Auth service failed to start:', error);
    process.exit(1);
});
