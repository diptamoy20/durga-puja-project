import { NotificationStatus } from '@dpgc/database';
import { NOTIFICATION_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { NotificationService, SendEmailPayload } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'notification-service', status: 'ok' };
  }

  /**
   * Request/response send, for callers that need to know the outcome.
   */
  @MessagePattern(NOTIFICATION_PATTERNS.SEND_EMAIL)
  sendEmail(@Payload() payload: SendEmailPayload) {
    return this.notifications.sendEmail(payload);
  }

  /**
   * Fire-and-forget variant. Other services emit this so a slow or failing
   * mail server never delays the business operation that triggered it.
   */
  @EventPattern(NOTIFICATION_PATTERNS.SEND_EMAIL)
  handleEmailEvent(@Payload() payload: SendEmailPayload): void {
    void this.notifications.sendEmail(payload);
  }

  @MessagePattern(NOTIFICATION_PATTERNS.FIND_ALL)
  findAll(
    @Payload()
    query: {
      page: number;
      perPage: number;
      search?: string;
      sortDir: 'asc' | 'desc';
      status?: NotificationStatus;
    },
  ) {
    return this.notifications.findAll(query);
  }
}
