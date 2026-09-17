import {
  MediaModerationStatus,
  MediaType,
  Prisma,
  PrismaService,
  RecordStatus,
} from '@dpgc/database';
import {
  PaginatedResult,
  ServiceException,
  buildPaginationMeta,
  toPrismaPagination,
  translatePrismaError,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';

export interface ListMediaPayload {
  page: number;
  perPage: number;
  search?: string;
  sortDir: 'asc' | 'desc';
  status?: MediaModerationStatus;
  mediaType?: MediaType;
  categoryId?: number;
  subcategoryId?: number;
  pujaCommitteeId?: number;
  /** Set for Committee Member callers, to scope results to their own uploads. */
  scopeToCommitteeId?: number;
}

export interface CreateMediaPayload {
  data: {
    pujaCommitteeId: number;
    categoryId?: number;
    subcategoryId?: number;
    mediaType: MediaType;
    title?: string;
    description?: string;
    venueName?: string;
    originalFilename: string;
    storedPath: string;
    thumbnailPath?: string;
    mimeType: string;
    fileSize: number;
  };
  actorId: number;
}

export interface ModerateMediaPayload {
  id: number;
  decision: 'approve' | 'reject';
  reason?: string;
  actorId: number;
}

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: ListMediaPayload): Prisma.CommitteeMediaWhereInput {
    return {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.mediaType ? { mediaType: query.mediaType } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.subcategoryId ? { subcategoryId: query.subcategoryId } : {}),
      // An explicit committee filter is narrowed further by the caller's own
      // scope, so a Committee Member cannot read another committee's uploads.
      ...(query.scopeToCommitteeId
        ? { pujaCommitteeId: query.scopeToCommitteeId }
        : query.pujaCommitteeId
          ? { pujaCommitteeId: query.pujaCommitteeId }
          : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { venueName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  async findAll(query: ListMediaPayload): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.committeeMedia.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortDir },
        include: {
          committee: { select: { id: true, committeeName: true, committeeId: true } },
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
          uploadedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.committeeMedia.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  /** Approved media only, for the public gallery. */
  async publicList(query: ListMediaPayload): Promise<PaginatedResult<unknown>> {
    return this.findAll({
      ...query,
      status: MediaModerationStatus.APPROVED,
      scopeToCommitteeId: undefined,
    });
  }

  async findOne(payload: { id: number; scopeToCommitteeId?: number }) {
    const media = await this.prisma.committeeMedia.findFirst({
      where: { id: payload.id, deletedAt: null },
      include: {
        committee: { select: { id: true, committeeName: true } },
        category: true,
        subcategory: true,
        uploadedBy: { select: { id: true, name: true } },
        moderatedBy: { select: { id: true, name: true } },
      },
    });

    if (!media) throw ServiceException.notFound(`No media exists with id ${payload.id}.`);

    if (
      payload.scopeToCommitteeId !== undefined &&
      media.pujaCommitteeId !== payload.scopeToCommitteeId
    ) {
      // Reported as "not found" rather than "forbidden" so the response does
      // not confirm that someone else's media with this id exists.
      throw ServiceException.notFound(`No media exists with id ${payload.id}.`);
    }

    return media;
  }

  async create(payload: CreateMediaPayload) {
    const { data, actorId } = payload;

    const committee = await this.prisma.pujaCommittee.findFirst({
      where: { id: data.pujaCommitteeId, deletedAt: null },
      select: { id: true, status: true },
    });

    if (!committee) throw ServiceException.badRequest('The selected committee does not exist.');

    try {
      const media = await this.prisma.committeeMedia.create({
        data: {
          ...data,
          fileSize: BigInt(data.fileSize),
          uploadedById: actorId,
          // Uploads await the moderation pipeline before becoming visible.
          status: MediaModerationStatus.PENDING,
        },
      });

      this.logger.log(`Media #${media.id} uploaded for committee #${data.pujaCommitteeId}`);

      // BigInt is not JSON-serialisable, so it crosses TCP as a string.
      return { ...media, fileSize: media.fileSize.toString() };
    } catch (error) {
      translatePrismaError(error, 'media item');
    }
  }

  async update(payload: {
    id: number;
    data: { title?: string; description?: string; venueName?: string; categoryId?: number; subcategoryId?: number };
    scopeToCommitteeId?: number;
    actorId: number;
  }) {
    await this.findOne({ id: payload.id, scopeToCommitteeId: payload.scopeToCommitteeId });

    const media = await this.prisma.committeeMedia.update({
      where: { id: payload.id },
      data: payload.data,
    });

    return { ...media, fileSize: media.fileSize.toString() };
  }

  async remove(payload: { id: number; scopeToCommitteeId?: number; actorId: number }) {
    await this.findOne({ id: payload.id, scopeToCommitteeId: payload.scopeToCommitteeId });

    await this.prisma.committeeMedia.update({
      where: { id: payload.id },
      data: { deletedAt: new Date() },
    });

    return { id: payload.id, deleted: true as const };
  }

  async moderationQueue(query: ListMediaPayload): Promise<PaginatedResult<unknown>> {
    return this.findAll({
      ...query,
      status: MediaModerationStatus.PENDING,
      sortDir: 'asc',
      scopeToCommitteeId: undefined,
    });
  }

  /** Approves or rejects an upload; a rejection must carry a reason. */
  async moderate(payload: ModerateMediaPayload) {
    const { id, decision, reason, actorId } = payload;

    const media = await this.prisma.committeeMedia.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });

    if (!media) throw ServiceException.notFound(`No media exists with id ${id}.`);

    if (media.status !== MediaModerationStatus.PENDING) {
      throw ServiceException.badRequest(
        `This item has already been ${media.status.toLowerCase()}.`,
      );
    }

    if (decision === 'reject' && !reason?.trim()) {
      throw ServiceException.badRequest('A reason is required when rejecting an upload.');
    }

    const updated = await this.prisma.committeeMedia.update({
      where: { id },
      data: {
        status:
          decision === 'approve'
            ? MediaModerationStatus.APPROVED
            : MediaModerationStatus.REJECTED,
        rejectionReason: decision === 'reject' ? (reason ?? null) : null,
        moderatedById: actorId,
        moderatedAt: new Date(),
      },
    });

    this.logger.log(`Media #${id} ${decision}d by user #${actorId}`);

    return { ...updated, fileSize: updated.fileSize.toString() };
  }

  // -------------------------------------------------------------------------
  // Albums
  // -------------------------------------------------------------------------

  async findAllAlbums(query: {
    page: number;
    perPage: number;
    search?: string;
    sortDir: 'asc' | 'desc';
    pujaCommitteeId?: number;
    scopeToCommitteeId?: number;
    publicOnly?: boolean;
  }): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.AlbumWhereInput = {
      status: RecordStatus.ACTIVE,
      ...(query.publicOnly ? { isPublic: true } : {}),
      ...(query.scopeToCommitteeId
        ? { pujaCommitteeId: query.scopeToCommitteeId }
        : query.pujaCommitteeId
          ? { pujaCommitteeId: query.pujaCommitteeId }
          : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.album.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortDir },
        include: {
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
          committee: { select: { id: true, committeeName: true } },
          _count: { select: { media: true } },
        },
      }),
      this.prisma.album.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  async createAlbum(payload: {
    data: {
      categoryId: number;
      subcategoryId?: number;
      pujaCommitteeId: number;
      title: string;
      description?: string;
      isPublic?: boolean;
    };
    actorId: number;
  }) {
    try {
      return await this.prisma.album.create({
        data: { ...payload.data, isPublic: payload.data.isPublic ?? false },
      });
    } catch (error) {
      translatePrismaError(error, 'album');
    }
  }

  /**
   * Replaces an album's contents with exactly the supplied media, preserving
   * the given order. Only approved media may be added, so a private album
   * cannot be used to publish unmoderated uploads.
   */
  async syncAlbumMedia(payload: { id: number; mediaIds: number[]; actorId: number }) {
    const { id, mediaIds } = payload;

    const album = await this.prisma.album.findUnique({
      where: { id },
      select: { id: true, pujaCommitteeId: true },
    });

    if (!album) throw ServiceException.notFound(`No album exists with id ${id}.`);

    if (mediaIds.length > 0) {
      const eligible = await this.prisma.committeeMedia.findMany({
        where: {
          id: { in: mediaIds },
          deletedAt: null,
          status: MediaModerationStatus.APPROVED,
          pujaCommitteeId: album.pujaCommitteeId,
        },
        select: { id: true },
      });

      if (eligible.length !== mediaIds.length) {
        const rejected = mediaIds.filter((mediaId) => !eligible.some((m) => m.id === mediaId));

        throw ServiceException.badRequest(
          'Only approved media belonging to this committee can be added to the album.',
          { ineligible: rejected },
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.albumMedia.deleteMany({ where: { albumId: id } });

      if (mediaIds.length > 0) {
        await tx.albumMedia.createMany({
          data: mediaIds.map((committeeMediaId, index) => ({
            albumId: id,
            committeeMediaId,
            sortOrder: index,
          })),
          skipDuplicates: true,
        });
      }
    });

    return { id, mediaCount: mediaIds.length };
  }
}
