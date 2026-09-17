import { Global, Module } from '@nestjs/common';

import { AuditService } from './audit.service';

/** Global: every feature module records history through this one service. */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
