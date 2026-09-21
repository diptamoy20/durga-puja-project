"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const express_1 = __importDefault(require("express"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('ApiGateway');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.use(express_1.default.json({ limit: '25mb' }));
    app.use(express_1.default.urlencoded({ limit: '25mb', extended: true }));
    const config = app.get(config_1.ConfigService);
    const port = config.get('gateway.port') ?? 5050;
    const prefix = config.get('gateway.globalPrefix') ?? 'api';
    const version = config.get('gateway.apiVersion') ?? 'v1';
    const corsOrigins = config.get('gateway.corsOrigins') ?? ['http://localhost:5173'];
    const swagger = config.get('gateway.swagger');
    // Everything is served under /api/v1, which is what VITE_API_URL points at.
    app.setGlobalPrefix(`${prefix}/${version}`);
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        // `whitelist` strips unknown properties and `forbidNonWhitelisted`
        // rejects them outright, so a client cannot smuggle extra fields into a
        // create/update payload.
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));
    app.enableShutdownHooks();
    if (swagger?.enabled) {
        const document = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
            .setTitle('Durga Puja Global Connect API')
            .setDescription([
            'Public REST surface for the Durga Puja Global Connect platform.',
            '',
            'Every response uses the same envelope:',
            '`{ success, message, data, meta?, error?, timestamp, path }`.',
            '',
            'Authenticate via `POST /auth/login`, then send the access token as',
            '`Authorization: Bearer <token>`. Tokens carry the caller\'s roles and',
            'permission keys; refresh them with `POST /auth/refresh`.',
        ].join('\n'))
            .setVersion('1.0.0')
            // Default scheme name is `bearer`, matching @ApiBearerAuth() on controllers.
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
            .addTag('Authentication', 'Sign in, registration, tokens and passwords')
            .addTag('Users', 'Administrative user management')
            .addTag('Roles & Permissions', 'RBAC administration')
            .addTag('Health', 'Liveness and readiness probes')
            .build());
        swagger_1.SwaggerModule.setup(swagger.path, app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
    }
    await app.listen(port);
    logger.log(`API Gateway listening on http://localhost:${port}/${prefix}/${version}`);
    if (swagger?.enabled) {
        logger.log(`Swagger UI available at http://localhost:${port}/${swagger.path}`);
    }
}
void bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('API Gateway failed to start:', error);
    process.exit(1);
});
