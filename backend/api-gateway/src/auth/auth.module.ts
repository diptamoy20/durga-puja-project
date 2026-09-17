import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

/**
 * The gateway's auth module owns only the HTTP surface; credential handling
 * lives in auth-service. The TCP client comes from the global ClientsModule.
 */
@Module({
  controllers: [AuthController],
})
export class AuthModule {}
