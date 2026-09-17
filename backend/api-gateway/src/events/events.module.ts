import { Module } from '@nestjs/common';

import { AdminWebinarsController, PublicWebinarsController } from './events.controller';

@Module({
  controllers: [PublicWebinarsController, AdminWebinarsController],
})
export class EventsModule {}
