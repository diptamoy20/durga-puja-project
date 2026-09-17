import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';

import { CommitteesService } from './committees/committees.service';
import { DiasporaService } from './diaspora/diaspora.service';
import { RegistrationController } from './registration.controller';

const registrationConfig = registerAs('registration', () => ({
  host: process.env.REGISTRATION_SERVICE_HOST ?? 'localhost',
  port: Number(process.env.REGISTRATION_SERVICE_PORT ?? 5003),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [registrationConfig],
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
  ],
  controllers: [RegistrationController],
  providers: [DiasporaService, CommitteesService],
})
export class AppModule {}
