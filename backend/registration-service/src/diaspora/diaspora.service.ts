import { DiasporaStatus, Prisma, PrismaService } from '@dpgc/database';
import {
  PaginatedResult,
  ServiceException,
  buildPaginationMeta,
  toPrismaPagination,
  translatePrismaError,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';

export interface ListDiasporaPayload {
  page: number;
  perPage: number;
  search?: string;
  sortDir: 'asc' | 'desc';
  status?: DiasporaStatus;
  country?: string;
}

export interface SubmitDiasporaPayload {
  fullName: string;
  dob: string;
  gender: string;
  email: string;
  mobile: string;
  country: string;
  city: string;
  passportNo?: string;
  nationality: string;
  address1: string;
  address2?: string;
  state?: string;
  postalCode?: string;
  districtOrigin: string;
  village?: string;
  relationshipWithBengal: string;
  languages?: string;
  interests?: string[];
  volunteer?: boolean;
  receiveUpdates?: boolean;
  termsAccepted: boolean;
}

export interface DecideDiasporaPayload {
  id: number;
  reason?: string;
  actorId: number;
}

@Injectable()
export class DiasporaService {
  private readonly logger = new Logger(DiasporaService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async nextRegistrationNo(): Promise<string> {
    const year = new Date().getFullYear();

    const count = await this.prisma.diasporaRegistration.count({
      where: { createdAt: { gte: new Date(`${year}-01-01T00:00:00Z`) } },
    });

    return `DIA-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async findAll(query: ListDiasporaPayload): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.DiasporaRegistrationWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { registrationNo: { contains: query.search, mode: 'insensitive' } },
              { mobile: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.diasporaRegistration.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortDir },
        include: {
          verifiedBy: { select: { id: true, name: true } },
          user: { select: { id: true, email: true, status: true } },
        },
      }),
      this.prisma.diasporaRegistration.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  async findOne(id: number) {
    const registration = await this.prisma.diasporaRegistration.findUnique({
      where: { id },
      include: {
        verifiedBy: { select: { id: true, name: true } },
        rejectedBy: { select: { id: true, name: true } },
        histories: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!registration) {
      throw ServiceException.notFound(`No diaspora registration exists with id ${id}.`);
    }

    return registration;
  }

  async submit(payload: SubmitDiasporaPayload) {
    if (!payload.termsAccepted) {
      throw ServiceException.badRequest('The terms and conditions must be accepted.');
    }

    const duplicate = await this.prisma.diasporaRegistration.findUnique({
      where: { email: payload.email },
      select: { registrationNo: true },
    });

    if (duplicate) {
      throw ServiceException.conflict(
        'A registration already exists for this email address.',
        { registrationNo: duplicate.registrationNo },
      );
    }

    try {
      const registration = await this.prisma.diasporaRegistration.create({
        data: {
          ...payload,
          dob: new Date(payload.dob),
          interests: payload.interests ?? Prisma.DbNull,
          volunteer: payload.volunteer ?? false,
          receiveUpdates: payload.receiveUpdates ?? false,
          registrationNo: await this.nextRegistrationNo(),
          status: DiasporaStatus.PENDING,
        },
      });

      this.logger.log(`Diaspora registration ${registration.registrationNo} submitted`);

      return {
        id: registration.id,
        registrationNo: registration.registrationNo,
        status: registration.status,
      };
    } catch (error) {
      translatePrismaError(error, 'registration');
    }
  }

  /** Marks a registration verified and records the decision in its history. */
  async verify(payload: DecideDiasporaPayload) {
    return this.decide(payload, DiasporaStatus.VERIFIED);
  }

  async reject(payload: DecideDiasporaPayload) {
    if (!payload.reason?.trim()) {
      throw ServiceException.badRequest('A reason is required when rejecting a registration.');
    }

    return this.decide(payload, DiasporaStatus.REJECTED);
  }

  private async decide(payload: DecideDiasporaPayload, status: DiasporaStatus) {
    const { id, reason, actorId } = payload;

    const existing = await this.prisma.diasporaRegistration.findUnique({
      where: { id },
      select: { id: true, status: true, email: true },
    });

    if (!existing) {
      throw ServiceException.notFound(`No diaspora registration exists with id ${id}.`);
    }

    // Only pending applications await a decision; re-deciding would discard
    // the original verifier and timestamp.
    if (existing.status !== DiasporaStatus.PENDING) {
      throw ServiceException.badRequest(
        `This registration has already been ${existing.status.toLowerCase()}.`,
      );
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.diasporaRegistration.update({
        where: { id },
        data:
          status === DiasporaStatus.VERIFIED
            ? { status, verifiedById: actorId, verifiedAt: now }
            : { status, rejectedById: actorId, rejectedAt: now, rejectionReason: reason ?? null },
      });

      await tx.diasporaVerificationHistory.create({
        data: {
          diasporaRegistrationId: id,
          previousStatus: existing.status,
          newStatus: status,
          action: status === DiasporaStatus.VERIFIED ? 'verified' : 'rejected',
          reason: reason ?? null,
          changedById: actorId,
        },
      });

      return updated;
    });
  }

  /** Registration counts by status, for the dashboard summary. */
  async stats(): Promise<Record<string, number>> {
    const grouped = await this.prisma.diasporaRegistration.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const byStatus = Object.fromEntries(
      grouped.map((row) => [row.status.toLowerCase(), row._count._all]),
    );

    return {
      total: grouped.reduce((sum, row) => sum + row._count._all, 0),
      pending: byStatus.pending ?? 0,
      verified: byStatus.verified ?? 0,
      rejected: byStatus.rejected ?? 0,
    };
  }
}
