import { join } from 'node:path';

import { PrismaModule } from '@dpgc/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuditModule } from './audit/audit.module';
import userConfig from './config/configuration';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [userConfig],
      envFilePath: [join(__dirname, '..', '..', '.env')],
    }),
    PrismaModule,
    AuditModule,
    UsersModule,
    RbacModule,
  ],
})
export class AppModule {}
