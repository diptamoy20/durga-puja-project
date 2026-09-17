import { RsvpStatus, WebinarStatus } from '@dpgc/database';
import { EVENTS_PATTERNS } from '@dpgc/shared';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EventsService, ListWebinarsPayload, RsvpData, WebinarData } from './events.service';

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @MessagePattern('health.ping')
  ping(): { service: string; status: string } {
    return { service: 'events-service', status: 'ok' };
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_FIND_ALL)
  findAll(@Payload() query: ListWebinarsPayload) {
    return this.events.findAll(query);
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_PUBLIC_LIST)
  publicList() {
    return this.events.publicList();
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_REPLAYS)
  replays() {
    return this.events.replays();
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_FIND_ONE)
  findOne(@Payload() payload: { id: number }) {
    return this.events.findOne(payload.id);
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_FIND_BY_SLUG)
  findBySlug(@Payload() payload: { slug: string }) {
    return this.events.findBySlug(payload.slug);
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_CREATE)
  create(@Payload() payload: { data: WebinarData; actorId: number }) {
    return this.events.create(payload);
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_UPDATE)
  update(@Payload() payload: { id: number; data: Partial<WebinarData>; actorId: number }) {
    return this.events.update(payload);
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_TOGGLE_STATUS)
  toggleStatus(@Payload() payload: { id: number; status: WebinarStatus; actorId: number }) {
    return this.events.toggleStatus(payload);
  }

  @MessagePattern(EVENTS_PATTERNS.WEBINAR_REMOVE)
  remove(@Payload() payload: { id: number; actorId: number }) {
    return this.events.remove(payload);
  }

  @MessagePattern(EVENTS_PATTERNS.RSVP_CREATE)
  createRsvp(@Payload() payload: RsvpData) {
    return this.events.createRsvp(payload);
  }

  @MessagePattern(EVENTS_PATTERNS.RSVP_FIND_ALL)
  findAllRsvps(
    @Payload()
    query: {
      page: number;
      perPage: number;
      search?: string;
      sortDir: 'asc' | 'desc';
      webinarId?: number;
      status?: RsvpStatus;
    },
  ) {
    return this.events.findAllRsvps(query);
  }

  @MessagePattern(EVENTS_PATTERNS.RSVP_UPDATE_STATUS)
  updateRsvpStatus(@Payload() payload: { id: number; status: RsvpStatus; notes?: string }) {
    return this.events.updateRsvpStatus(payload);
  }

  @MessagePattern(EVENTS_PATTERNS.PUSH_SUBSCRIBE)
  subscribeToPush(
    @Payload()
    payload: {
      subscribableType: 'User' | 'GuestSubscriber';
      subscribableId: number;
      endpoint: string;
      publicKey?: string;
      authToken?: string;
      contentEncoding?: string;
    },
  ) {
    return this.events.subscribeToPush(payload);
  }
}
