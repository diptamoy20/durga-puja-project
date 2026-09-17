import { Prisma, PrismaService } from '@dpgc/database';
import {
  PaginatedResult,
  buildPaginationMeta,
  toPrismaPagination,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';

export interface RecordAuditInput {
  userId: number | null;
  action: string;
  module: string;
  auditableType?: string;
  auditableId?: number;
  description?: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Centralised audit trail, replacing Laravel's AuditLogService.
 *
 * Writes are best-effort: a failure to record history must never roll back or
 * reject the business operation that triggered it.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          module: input.module,
          auditableType: input.auditableType ?? null,
          auditableId: input.auditableId ?? null,
          description: input.description ?? null,
          oldValues: input.oldValues ?? Prisma.DbNull,
          newValues: input.newValues ?? Prisma.DbNull,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to write audit log (${input.module}/${input.action}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async findAll(query: {
    page: number;
    perPage: number;
    search?: string;
    sortDir: 'asc' | 'desc';
  }): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.AuditLogWhereInput = query.search
      ? {
          OR: [
            { action: { contains: query.search, mode: 'insensitive' } },
            { module: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortDir },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }
}
