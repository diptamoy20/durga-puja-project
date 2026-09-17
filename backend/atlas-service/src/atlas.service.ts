import { AtlasStatus, Prisma, PrismaService } from '@dpgc/database';
import {
  PaginatedResult,
  ServiceException,
  buildPaginationMeta,
  toPrismaPagination,
  translatePrismaError,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';

export interface ListPandalsPayload {
  page: number;
  perPage: number;
  search?: string;
  sortDir: 'asc' | 'desc';
  status?: AtlasStatus;
  pujaCommitteeId?: number;
  scopeToCommitteeId?: number;
}

export interface PandalData {
  pujaCommitteeId: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  photos?: string[];
  timing: string;
  ritualSchedule?: string;
  livestreamUrl?: string;
  virtualTourUrl?: string;
}

/** Only approved entries appear on the public map. */
const PUBLIC_SELECT = {
  id: true,
  name: true,
  location: true,
  latitude: true,
  longitude: true,
  photos: true,
  timing: true,
  ritualSchedule: true,
  livestreamUrl: true,
  virtualTourUrl: true,
  committee: { select: { id: true, committeeName: true, committeeId: true, city: true } },
} as const;

@Injectable()
export class AtlasService {
  private readonly logger = new Logger(AtlasService.name);

  constructor(private readonly prisma: PrismaService) {}

  private assertCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw ServiceException.badRequest('Latitude must be between -90 and 90.');
    }

    if (longitude < -180 || longitude > 180) {
      throw ServiceException.badRequest('Longitude must be between -180 and 180.');
    }
  }

  /** Decimal columns arrive as Prisma.Decimal; the client expects numbers. */
  private serialise<T extends { latitude: unknown; longitude: unknown }>(row: T) {
    return { ...row, latitude: Number(row.latitude), longitude: Number(row.longitude) };
  }

  async findAll(query: ListPandalsPayload): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.PandalAtlasWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.scopeToCommitteeId
        ? { pujaCommitteeId: query.scopeToCommitteeId }
        : query.pujaCommitteeId
          ? { pujaCommitteeId: query.pujaCommitteeId }
          : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { location: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.pandalAtlas.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortDir },
        include: {
          committee: { select: { id: true, committeeName: true, city: true } },
          approvedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.pandalAtlas.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.serialise(row)),
      pagination: buildPaginationMeta(page, perPage, total),
    };
  }

  async findOne(payload: { id: number; scopeToCommitteeId?: number }) {
    const pandal = await this.prisma.pandalAtlas.findFirst({
      where: { id: payload.id, deletedAt: null },
      include: {
        committee: { select: { id: true, committeeName: true, city: true } },
        reviewedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    if (!pandal) throw ServiceException.notFound(`No pandal entry exists with id ${payload.id}.`);

    if (
      payload.scopeToCommitteeId !== undefined &&
      pandal.pujaCommitteeId !== payload.scopeToCommitteeId
    ) {
      throw ServiceException.notFound(`No pandal entry exists with id ${payload.id}.`);
    }

    return this.serialise(pandal);
  }

  /**
   * Approved entries for the public map.
   *
   * Accepts an optional bounding box so the client fetches only the pins in
   * the current viewport rather than every entry.
   */
  async publicList(query: {
    north?: number;
    south?: number;
    east?: number;
    west?: number;
    search?: string;
    limit?: number;
  }) {
    const bounded =
      query.north !== undefined &&
      query.south !== undefined &&
      query.east !== undefined &&
      query.west !== undefined;

    const rows = await this.prisma.pandalAtlas.findMany({
      where: {
        deletedAt: null,
        status: AtlasStatus.APPROVED,
        ...(bounded
          ? {
              latitude: { gte: query.south, lte: query.north },
              longitude: { gte: query.west, lte: query.east },
            }
          : {}),
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { location: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: PUBLIC_SELECT,
      take: Math.min(query.limit ?? 500, 2000),
      orderBy: { approvedAt: 'desc' },
    });

    return rows.map((row) => this.serialise(row));
  }

  async create(payload: { data: PandalData; actorId: number }) {
    const { data, actorId } = payload;

    this.assertCoordinates(data.latitude, data.longitude);

    const committee = await this.prisma.pujaCommittee.findFirst({
      where: { id: data.pujaCommitteeId, deletedAt: null },
      select: { id: true, userId: true },
    });

    if (!committee) throw ServiceException.badRequest('The selected committee does not exist.');

    try {
      const pandal = await this.prisma.pandalAtlas.create({
        data: {
          pujaCommitteeId: data.pujaCommitteeId,
          userId: committee.userId,
          name: data.name,
          location: data.location,
          latitude: new Prisma.Decimal(data.latitude),
          longitude: new Prisma.Decimal(data.longitude),
          photos: data.photos ?? Prisma.DbNull,
          timing: data.timing,
          ritualSchedule: data.ritualSchedule ?? null,
          livestreamUrl: data.livestreamUrl ?? null,
          virtualTourUrl: data.virtualTourUrl ?? null,
          status: AtlasStatus.DRAFT,
          createdById: actorId,
          updatedById: actorId,
        },
      });

      return this.serialise(pandal);
    } catch (error) {
      translatePrismaError(error, 'pandal entry');
    }
  }

  async update(payload: {
    id: number;
    data: Partial<PandalData>;
    scopeToCommitteeId?: number;
    actorId: number;
  }) {
    const { id, data, actorId } = payload;

    const existing = await this.findOne({ id, scopeToCommitteeId: payload.scopeToCommitteeId });

    // Approved entries are live on the public map, so changes must be
    // resubmitted for moderation rather than applied in place.
    if (existing.status === AtlasStatus.APPROVED) {
      throw ServiceException.badRequest(
        'An approved entry cannot be edited directly. Submit a new revision for review.',
      );
    }

    if (data.latitude !== undefined && data.longitude !== undefined) {
      this.assertCoordinates(data.latitude, data.longitude);
    }

    const pandal = await this.prisma.pandalAtlas.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        latitude: data.latitude !== undefined ? new Prisma.Decimal(data.latitude) : undefined,
        longitude: data.longitude !== undefined ? new Prisma.Decimal(data.longitude) : undefined,
        photos: data.photos,
        timing: data.timing,
        ritualSchedule: data.ritualSchedule,
        livestreamUrl: data.livestreamUrl,
        virtualTourUrl: data.virtualTourUrl,
        updatedById: actorId,
      },
    });

    return this.serialise(pandal);
  }

  async submit(payload: { id: number; scopeToCommitteeId?: number; actorId: number }) {
    const existing = await this.findOne({
      id: payload.id,
      scopeToCommitteeId: payload.scopeToCommitteeId,
    });

    if (existing.status !== AtlasStatus.DRAFT && existing.status !== AtlasStatus.REJECTED) {
      throw ServiceException.badRequest(
        `An entry with status ${existing.status} cannot be submitted for review.`,
      );
    }

    const pandal = await this.prisma.pandalAtlas.update({
      where: { id: payload.id },
      data: { status: AtlasStatus.SUBMITTED, updatedById: payload.actorId },
    });

    return this.serialise(pandal);
  }

  async moderate(payload: {
    id: number;
    decision: 'start_review' | 'approve' | 'reject';
    remarks?: string;
    actorId: number;
  }) {
    const { id, decision, remarks, actorId } = payload;

    const existing = await this.prisma.pandalAtlas.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });

    if (!existing) throw ServiceException.notFound(`No pandal entry exists with id ${id}.`);

    const allowedFrom: Record<typeof decision, AtlasStatus[]> = {
      start_review: [AtlasStatus.SUBMITTED],
      approve: [AtlasStatus.SUBMITTED, AtlasStatus.UNDER_REVIEW],
      reject: [AtlasStatus.SUBMITTED, AtlasStatus.UNDER_REVIEW],
    };

    if (!allowedFrom[decision].includes(existing.status)) {
      throw ServiceException.badRequest(
        `An entry with status ${existing.status} cannot be ${decision.replace(/_/g, ' ')}.`,
        { currentStatus: existing.status, allowedFrom: allowedFrom[decision] },
      );
    }

    if (decision === 'reject' && !remarks?.trim()) {
      throw ServiceException.badRequest('Remarks are required when rejecting an entry.');
    }

    const now = new Date();

    const pandal = await this.prisma.pandalAtlas.update({
      where: { id },
      data: {
        status:
          decision === 'approve'
            ? AtlasStatus.APPROVED
            : decision === 'reject'
              ? AtlasStatus.REJECTED
              : AtlasStatus.UNDER_REVIEW,
        ...(decision === 'approve' ? { approvedById: actorId, approvedAt: now } : {}),
        ...(decision === 'reject' ? { rejectionRemarks: remarks ?? null } : {}),
        reviewedById: actorId,
        reviewedAt: now,
        updatedById: actorId,
      },
    });

    this.logger.log(`Pandal entry #${id} ${decision} by user #${actorId}`);

    return this.serialise(pandal);
  }

  async remove(payload: { id: number; scopeToCommitteeId?: number; actorId: number }) {
    await this.findOne({ id: payload.id, scopeToCommitteeId: payload.scopeToCommitteeId });

    await this.prisma.pandalAtlas.update({
      where: { id: payload.id },
      data: { deletedAt: new Date(), updatedById: payload.actorId },
    });

    return { id: payload.id, deleted: true as const };
  }

  /** Pandal counts by status, for the dashboard summary. */
  async stats(): Promise<Record<string, number>> {
    const grouped = await this.prisma.pandalAtlas.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { _all: true },
    });

    const byStatus = Object.fromEntries(
      grouped.map((row) => [row.status.toLowerCase(), row._count._all]),
    );

    return {
      total: grouped.reduce((sum, row) => sum + row._count._all, 0),
      draft: byStatus.draft ?? 0,
      submitted: byStatus.submitted ?? 0,
      under_review: byStatus.under_review ?? 0,
      approved: byStatus.approved ?? 0,
      rejected: byStatus.rejected ?? 0,
    };
  }
}
