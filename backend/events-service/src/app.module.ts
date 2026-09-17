import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';

import { EventsController } from './events.controller';
import { EventsService } from './events.service';

const eventsConfig = registerAs('events', () => ({
  host: process.env.EVENTS_SERVICE_HOST ?? 'localhost',
  port: Number(process.env.EVENTS_SERVICE_PORT ?? 5007),
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [eventsConfig],
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class AppModule {}
