import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

const notificationConfig = registerAs('notification', () => ({
  host: process.env.NOTIFICATION_SERVICE_HOST ?? 'localhost',
  port: Number(process.env.NOTIFICATION_SERVICE_PORT ?? 5008),

  mail: {
    // `log` prints emails instead of sending them, so local development does
    // not need an SMTP server.
    driver: process.env.MAIL_DRIVER ?? 'log',
    host: process.env.MAIL_HOST ?? '127.0.0.1',
    port: Number(process.env.MAIL_PORT ?? 2525),
    username: process.env.MAIL_USERNAME ?? '',
    password: process.env.MAIL_PASSWORD ?? '',
    fromAddress: process.env.MAIL_FROM_ADDRESS ?? 'no-reply@durgapujaglobalconnect.in',
    fromName: process.env.MAIL_FROM_NAME ?? 'Durga Puja Global Connect',
  },
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [notificationConfig],
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class AppModule {}
