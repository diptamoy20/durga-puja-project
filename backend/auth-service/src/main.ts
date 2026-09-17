import { ServiceExceptionFilter } from '@dpgc/shared';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

/**
 * Auth service: a pure TCP microservice with no HTTP listener, so it is
 * unreachable from the browser. Only the API Gateway speaks to it.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('AuthService');

  // A temporary context is created first so the port can come from
  // ConfigService (with .env loading and validation) rather than raw env vars.
  const configApp = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const config = configApp.get(ConfigService);

  const host = config.get<string>('auth.host') ?? 'localhost';
  const port = config.get<number>('auth.port') ?? 5001;

  await configApp.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host, port },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Keeps typed errors intact across the TCP boundary.
  app.useGlobalFilters(new ServiceExceptionFilter());
  app.enableShutdownHooks();

  await app.listen();
  logger.log(`Auth service listening on TCP ${host}:${port}`);
}

void bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Auth service failed to start:', error);
  process.exit(1);
});
