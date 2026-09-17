import { ServiceExceptionFilter } from '@dpgc/shared';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('ContentService');

  const configApp = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const config = configApp.get(ConfigService);
  const host = config.get<string>('content.host') ?? 'localhost';
  const port = config.get<number>('content.port') ?? 5004;
  await configApp.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host, port },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new ServiceExceptionFilter());
  app.enableShutdownHooks();

  await app.listen();
  logger.log(`Content service listening on TCP ${host}:${port}`);
}

void bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Content service failed to start:', error);
  process.exit(1);
});
