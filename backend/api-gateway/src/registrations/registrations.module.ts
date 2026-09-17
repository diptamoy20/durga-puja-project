import { Module } from '@nestjs/common';

import {
  DiasporaVerificationController,
  PublicRegistrationController,
  PujaCommitteeController,
} from './registrations.controller';

@Module({
  controllers: [PublicRegistrationController, DiasporaVerificationController, PujaCommitteeController],
})
export class RegistrationsModule {}
