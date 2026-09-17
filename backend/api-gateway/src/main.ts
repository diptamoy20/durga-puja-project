import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('ApiGateway');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(ConfigService);
  const port = config.get<number>('gateway.port') ?? 5050;
  const prefix = config.get<string>('gateway.globalPrefix') ?? 'api';
  const version = config.get<string>('gateway.apiVersion') ?? 'v1';
  const corsOrigins = config.get<string[]>('gateway.corsOrigins') ?? ['http://localhost:5173'];
  const swagger = config.get<{ enabled: boolean; path: string }>('gateway.swagger');

  // Everything is served under /api/v1, which is what VITE_API_URL points at.
  app.setGlobalPrefix(`${prefix}/${version}`);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // `whitelist` strips unknown properties and `forbidNonWhitelisted`
      // rejects them outright, so a client cannot smuggle extra fields into a
      // create/update payload.
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableShutdownHooks();

  if (swagger?.enabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Durga Puja Global Connect API')
        .setDescription(
          [
            'Public REST surface for the Durga Puja Global Connect platform.',
            '',
            'Every response uses the same envelope:',
            '`{ success, message, data, meta?, error?, timestamp, path }`.',
            '',
            'Authenticate via `POST /auth/login`, then send the access token as',
            '`Authorization: Bearer <token>`. Tokens carry the caller\'s roles and',
            'permission keys; refresh them with `POST /auth/refresh`.',
          ].join('\n'),
        )
        .setVersion('1.0.0')
        .addBearerAuth(
          { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          'access-token',
        )
        .addTag('Authentication', 'Sign in, registration, tokens and passwords')
        .addTag('Users', 'Administrative user management')
        .addTag('Roles & Permissions', 'RBAC administration')
        .addTag('Health', 'Liveness and readiness probes')
        .build(),
    );

    SwaggerModule.setup(swagger.path, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);

  logger.log(`API Gateway listening on http://localhost:${port}/${prefix}/${version}`);

  if (swagger?.enabled) {
    logger.log(`Swagger UI available at http://localhost:${port}/${swagger.path}`);
  }
}

void bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('API Gateway failed to start:', error);
  process.exit(1);
});
