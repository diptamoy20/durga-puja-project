import { randomBytes } from 'node:crypto';

import { Prisma, PrismaService, RsvpStatus, WebinarStatus } from '@dpgc/database';
import {
  PaginatedResult,
  ServiceException,
  buildPaginationMeta,
  toPrismaPagination,
  translatePrismaError,
  uniqueSlug,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';

export interface ListWebinarsPayload {
  page: number;
  perPage: number;
  search?: string;
  sortDir: 'asc' | 'desc';
  status?: WebinarStatus;
  isPublished?: boolean;
}

export interface WebinarData {
  title: string;
  subtitle?: string;
  description?: string;
  bannerImage?: string;
  speakers?: Array<{ name: string; title?: string; organization?: string; photo?: string }>;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  timezone?: string;
  maxAttendees?: number;
  requiresRegistration?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
  livePlatform?: string;
  liveStreamUrl?: string;
  liveEmbedCode?: string;
  liveMeetingUrl?: string;
  liveMeetingPasscode?: string;
  replayVideoUrl?: string;
  replayEmbedCode?: string;
  replayDurationMinutes?: number;
  resources?: Array<{ label: string; url: string }>;
}

export interface RsvpData {
  webinarId: number;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  cityCountry?: string;
  userId?: number;
}

/** Fields the public site may read; join links are withheld until registered. */
const PUBLIC_SELECT = {
  id: true,
  title: true,
  slug: true,
  subtitle: true,
  description: true,
  bannerImage: true,
  speakers: true,
  scheduledStartTime: true,
  scheduledEndTime: true,
  timezone: true,
  status: true,
  isFeatured: true,
  requiresRegistration: true,
  maxAttendees: true,
  replayVideoUrl: true,
  replayEmbedCode: true,
  replayDurationMinutes: true,
  resources: true,
  _count: { select: { registrations: true } },
} as const;

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private slugExists = async (slug: string): Promise<boolean> => {
    const found = await this.prisma.webinar.findUnique({ where: { slug }, select: { id: true } });
    return found !== null;
  };

  async findAll(query: ListWebinarsPayload): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.WebinarWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.isPublished !== undefined ? { isPublished: query.isPublished } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { subtitle: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.webinar.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledStartTime: query.sortDir },
        include: { _count: { select: { registrations: true } } },
      }),
      this.prisma.webinar.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  /** Published, upcoming and live webinars for the public site. */
  async publicList() {
    return this.prisma.webinar.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        status: { in: [WebinarStatus.SCHEDULED, WebinarStatus.LIVE] },
      },
      select: PUBLIC_SELECT,
      orderBy: { scheduledStartTime: 'asc' },
    });
  }

  /** Completed webinars that have a replay recording available. */
  async replays() {
    return this.prisma.webinar.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
        status: WebinarStatus.COMPLETED,
        OR: [{ replayVideoUrl: { not: null } }, { replayEmbedCode: { not: null } }],
      },
      select: PUBLIC_SELECT,
      orderBy: { scheduledStartTime: 'desc' },
    });
  }

  async findOne(id: number) {
    const webinar = await this.prisma.webinar.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { registrations: true } } },
    });

    if (!webinar) throw ServiceException.notFound(`No webinar exists with id ${id}.`);

    return webinar;
  }

  async findBySlug(slug: string) {
    const webinar = await this.prisma.webinar.findFirst({
      where: { slug, deletedAt: null, isPublished: true },
      select: PUBLIC_SELECT,
    });

    if (!webinar) throw ServiceException.notFound('That webinar is not available.');

    return webinar;
  }

  async create(payload: { data: WebinarData; actorId: number }) {
    const { data, actorId } = payload;

    const start = new Date(data.scheduledStartTime);
    const end = data.scheduledEndTime ? new Date(data.scheduledEndTime) : null;

    if (end && end <= start) {
      throw ServiceException.badRequest('The end time must be after the start time.');
    }

    try {
      const webinar = await this.prisma.webinar.create({
        data: {
          title: data.title,
          slug: await uniqueSlug(data.title, this.slugExists),
          subtitle: data.subtitle ?? null,
          description: data.description ?? null,
          bannerImage: data.bannerImage ?? null,
          speakers: data.speakers ?? Prisma.DbNull,
          scheduledStartTime: start,
          scheduledEndTime: end,
          timezone: data.timezone ?? 'Asia/Kolkata',
          maxAttendees: data.maxAttendees ?? null,
          requiresRegistration: data.requiresRegistration ?? true,
          isFeatured: data.isFeatured ?? false,
          isPublished: data.isPublished ?? true,
          livePlatform: data.livePlatform ?? 'youtube_live',
          liveStreamUrl: data.liveStreamUrl ?? null,
          liveEmbedCode: data.liveEmbedCode ?? null,
          liveMeetingUrl: data.liveMeetingUrl ?? null,
          liveMeetingPasscode: data.liveMeetingPasscode ?? null,
          replayVideoUrl: data.replayVideoUrl ?? null,
          replayEmbedCode: data.replayEmbedCode ?? null,
          replayDurationMinutes: data.replayDurationMinutes ?? null,
          resources: data.resources ?? Prisma.DbNull,
          status: WebinarStatus.SCHEDULED,
          createdById: actorId,
          updatedById: actorId,
        },
      });

      return webinar;
    } catch (error) {
      translatePrismaError(error, 'webinar');
    }
  }

  async update(payload: { id: number; data: Partial<WebinarData>; actorId: number }) {
    const { id, data, actorId } = payload;
    const existing = await this.findOne(id);

    const start = data.scheduledStartTime
      ? new Date(data.scheduledStartTime)
      : existing.scheduledStartTime;
    const end = data.scheduledEndTime ? new Date(data.scheduledEndTime) : existing.scheduledEndTime;

    if (end && end <= start) {
      throw ServiceException.badRequest('The end time must be after the start time.');
    }

    try {
      return await this.prisma.webinar.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.title && data.title !== existing.title
            ? await uniqueSlug(data.title, this.slugExists)
            : undefined,
          subtitle: data.subtitle,
          description: data.description,
          bannerImage: data.bannerImage,
          speakers: data.speakers,
          scheduledStartTime: data.scheduledStartTime ? start : undefined,
          scheduledEndTime: data.scheduledEndTime ? end : undefined,
          timezone: data.timezone,
          maxAttendees: data.maxAttendees,
          requiresRegistration: data.requiresRegistration,
          isFeatured: data.isFeatured,
          isPublished: data.isPublished,
          livePlatform: data.livePlatform,
          liveStreamUrl: data.liveStreamUrl,
          liveEmbedCode: data.liveEmbedCode,
          liveMeetingUrl: data.liveMeetingUrl,
          liveMeetingPasscode: data.liveMeetingPasscode,
          replayVideoUrl: data.replayVideoUrl,
          replayEmbedCode: data.replayEmbedCode,
          replayDurationMinutes: data.replayDurationMinutes,
          resources: data.resources,
          updatedById: actorId,
        },
      });
    } catch (error) {
      translatePrismaError(error, 'webinar');
    }
  }

  async toggleStatus(payload: { id: number; status: WebinarStatus; actorId: number }) {
    const { id, status, actorId } = payload;
    await this.findOne(id);

    return this.prisma.webinar.update({
      where: { id },
      data: { status, updatedById: actorId },
    });
  }

  async remove(payload: { id: number; actorId: number }) {
    await this.findOne(payload.id);

    await this.prisma.webinar.update({
      where: { id: payload.id },
      data: { deletedAt: new Date(), updatedById: payload.actorId },
    });

    return { id: payload.id, deleted: true as const };
  }

  // -------------------------------------------------------------------------
  // RSVPs
  // -------------------------------------------------------------------------

  /**
   * Registers an attendee, enforcing the capacity limit and one RSVP per
   * email per webinar. Returns the join details, which are withheld from the
   * public webinar payload until someone has registered.
   */
  async createRsvp(data: RsvpData) {
    const webinar = await this.prisma.webinar.findFirst({
      where: { id: data.webinarId, deletedAt: null, isPublished: true },
      select: {
        id: true,
        title: true,
        status: true,
        maxAttendees: true,
        requiresRegistration: true,
        liveMeetingUrl: true,
        liveMeetingPasscode: true,
        liveStreamUrl: true,
        scheduledStartTime: true,
        _count: { select: { registrations: true } },
      },
    });

    if (!webinar) throw ServiceException.notFound('That webinar is not available.');

    if (webinar.status === WebinarStatus.CANCELLED) {
      throw ServiceException.badRequest('This webinar has been cancelled.');
    }

    if (webinar.status === WebinarStatus.COMPLETED) {
      throw ServiceException.badRequest('This webinar has already taken place.');
    }

    const existing = await this.prisma.webinarRegistration.findUnique({
      where: { webinarId_email: { webinarId: data.webinarId, email: data.email } },
      select: { id: true, registrationCode: true },
    });

    if (existing) {
      throw ServiceException.conflict('You are already registered for this webinar.', {
        registrationCode: existing.registrationCode,
      });
    }

    if (webinar.maxAttendees !== null && webinar._count.registrations >= webinar.maxAttendees) {
      throw ServiceException.conflict('This webinar has reached its attendee limit.');
    }

    try {
      const registration = await this.prisma.webinarRegistration.create({
        data: {
          webinarId: data.webinarId,
          userId: data.userId ?? null,
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          organization: data.organization ?? null,
          cityCountry: data.cityCountry ?? null,
          registrationCode: `WR-${randomBytes(4).toString('hex').toUpperCase()}`,
          status: RsvpStatus.REGISTERED,
        },
      });

      this.logger.log(`RSVP ${registration.registrationCode} for webinar #${data.webinarId}`);

      return {
        registrationCode: registration.registrationCode,
        webinarTitle: webinar.title,
        scheduledStartTime: webinar.scheduledStartTime,
        joinUrl: webinar.liveMeetingUrl ?? webinar.liveStreamUrl,
        passcode: webinar.liveMeetingPasscode,
      };
    } catch (error) {
      translatePrismaError(error, 'registration');
    }
  }

  async findAllRsvps(query: {
    page: number;
    perPage: number;
    search?: string;
    sortDir: 'asc' | 'desc';
    webinarId?: number;
    status?: RsvpStatus;
  }): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.WebinarRegistrationWhereInput = {
      ...(query.webinarId ? { webinarId: query.webinarId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { registrationCode: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.webinarRegistration.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortDir },
        include: { webinar: { select: { id: true, title: true, scheduledStartTime: true } } },
      }),
      this.prisma.webinarRegistration.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  async updateRsvpStatus(payload: { id: number; status: RsvpStatus; notes?: string }) {
    const { id, status, notes } = payload;

    const existing = await this.prisma.webinarRegistration.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) throw ServiceException.notFound(`No registration exists with id ${id}.`);

    return this.prisma.webinarRegistration.update({
      where: { id },
      data: {
        status,
        notes: notes ?? undefined,
        attendedAt: status === RsvpStatus.ATTENDED ? new Date() : undefined,
      },
    });
  }

  /**
   * Stores a browser web-push subscription.
   *
   * Upserts on the endpoint so a returning browser refreshes its keys instead
   * of accumulating duplicate rows.
   */
  async subscribeToPush(payload: {
    subscribableType: 'User' | 'GuestSubscriber';
    subscribableId: number;
    endpoint: string;
    publicKey?: string;
    authToken?: string;
    contentEncoding?: string;
  }) {
    const existing = await this.prisma.pushSubscription.findFirst({
      where: { endpoint: payload.endpoint },
      select: { id: true },
    });

    if (existing) {
      return this.prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          subscribableType: payload.subscribableType,
          subscribableId: payload.subscribableId,
          publicKey: payload.publicKey ?? null,
          authToken: payload.authToken ?? null,
          contentEncoding: payload.contentEncoding ?? null,
        },
      });
    }

    return this.prisma.pushSubscription.create({
      data: {
        subscribableType: payload.subscribableType,
        subscribableId: payload.subscribableId,
        endpoint: payload.endpoint,
        publicKey: payload.publicKey ?? null,
        authToken: payload.authToken ?? null,
        contentEncoding: payload.contentEncoding ?? null,
      },
    });
  }

  /**
   * Flips webinars to LIVE or COMPLETED as their scheduled window passes.
   * Replaces the Laravel scheduled command; call from a scheduler.
   */
  async refreshLiveStatuses(): Promise<{ live: number; completed: number }> {
    const now = new Date();

    const [live, completed] = await this.prisma.$transaction([
      this.prisma.webinar.updateMany({
        where: {
          deletedAt: null,
          status: WebinarStatus.SCHEDULED,
          scheduledStartTime: { lte: now },
        },
        data: { status: WebinarStatus.LIVE },
      }),
      this.prisma.webinar.updateMany({
        where: {
          deletedAt: null,
          status: WebinarStatus.LIVE,
          scheduledEndTime: { not: null, lte: now },
        },
        data: { status: WebinarStatus.COMPLETED },
      }),
    ]);

    return { live: live.count, completed: completed.count };
  }
}
