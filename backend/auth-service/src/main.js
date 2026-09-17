"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
/**
 * Auth service: a pure TCP microservice with no HTTP listener, so it is
 * unreachable from the browser. Only the API Gateway speaks to it.
 */
async function bootstrap() {
    const logger = new common_1.Logger('AuthService');
    // A temporary context is created first so the port can come from
    // ConfigService (with .env loading and validation) rather than raw env vars.
    const configApp = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: false });
    const config = configApp.get(config_1.ConfigService);
    const host = config.get('auth.host') ?? 'localhost';
    const port = config.get('auth.port') ?? 5001;
    await configApp.close();
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
