import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import authConfig from './config/configuration';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [authConfig],
      validate: validateEnv,
      // One shared backend/.env for local development; in production each
      // service receives only the variables it needs from the environment.
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
