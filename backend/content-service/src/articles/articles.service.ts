import { ArticleStatus, Prisma, PrismaService } from '@dpgc/database';
import {
  PaginatedResult,
  ServiceException,
  buildPaginationMeta,
  toPrismaPagination,
  translatePrismaError,
  uniqueSlug,
} from '@dpgc/shared';
import { Injectable, Logger } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

export interface ListArticlesPayload {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'publishedAt' | 'status';
  sortDir: 'asc' | 'desc';
  status?: ArticleStatus;
  subcategoryId?: number;
  authorId?: number;
  isFeatured?: boolean;
}

export interface ArticleData {
  subcategoryId: number;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorId?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isFeatured?: boolean;
  allowComments?: boolean;
  scheduledAt?: string;
}

export type ArticleWorkflowAction =
  | 'submit_for_review'
  | 'start_review'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'schedule'
  | 'archive'
  | 'return_to_draft';

/**
 * Legal editorial transitions, mirroring the Laravel ArticleWorkflowService.
 * Encoding them here stops an article being published straight from draft
 * without review, which the old admin screens allowed.
 */
const TRANSITIONS: Record<ArticleWorkflowAction, { from: ArticleStatus[]; to: ArticleStatus }> = {
  submit_for_review: {
    from: [ArticleStatus.DRAFT, ArticleStatus.REJECTED],
    to: ArticleStatus.PENDING_REVIEW,
  },
  start_review: { from: [ArticleStatus.PENDING_REVIEW], to: ArticleStatus.IN_REVIEW },
  approve: {
    from: [ArticleStatus.PENDING_REVIEW, ArticleStatus.IN_REVIEW],
    to: ArticleStatus.APPROVED,
  },
  reject: {
    from: [ArticleStatus.PENDING_REVIEW, ArticleStatus.IN_REVIEW],
    to: ArticleStatus.REJECTED,
  },
  schedule: { from: [ArticleStatus.APPROVED], to: ArticleStatus.SCHEDULED },
  publish: {
    from: [ArticleStatus.APPROVED, ArticleStatus.SCHEDULED],
    to: ArticleStatus.PUBLISHED,
  },
  archive: { from: [ArticleStatus.PUBLISHED], to: ArticleStatus.ARCHIVED },
  return_to_draft: {
    from: [ArticleStatus.REJECTED, ArticleStatus.PENDING_REVIEW, ArticleStatus.IN_REVIEW],
    to: ArticleStatus.DRAFT,
  },
};

/**
 * Tags and attributes permitted in article bodies. Anything else is stripped,
 * so a contributor cannot inject script or event handlers that would run in
 * another user's browser.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'pre', 'code',
    'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    span: ['class'],
    '*': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    // Force external links to be safe against tab-nabbing.
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private slugExists = async (slug: string): Promise<boolean> => {
    const found = await this.prisma.article.findUnique({ where: { slug }, select: { id: true } });
    return found !== null;
  };

  async findAll(query: ListArticlesPayload): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.ArticleWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.subcategoryId ? { subcategoryId: query.subcategoryId } : {}),
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.isFeatured !== undefined ? { isFeatured: query.isFeatured } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { excerpt: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortDir },
        // The body is excluded from lists: it is large and unused by the table.
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          status: true,
          isFeatured: true,
          scheduledAt: true,
          publishedAt: true,
          createdAt: true,
          subcategory: {
            select: { id: true, name: true, category: { select: { id: true, name: true } } },
          },
          author: { select: { id: true, name: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  /** Published-only feed for the public site. */
  async publicList(query: ListArticlesPayload): Promise<PaginatedResult<unknown>> {
    return this.findAll({
      ...query,
      status: ArticleStatus.PUBLISHED,
      sortBy: 'publishedAt',
      sortDir: 'desc',
    });
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      include: {
        subcategory: { include: { category: true } },
        author: { select: { id: true, name: true, email: true } },
        histories: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!article) throw ServiceException.notFound(`No article exists with id ${id}.`);

    return article;
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, status: ArticleStatus.PUBLISHED, deletedAt: null },
      include: {
        subcategory: { select: { id: true, name: true, category: { select: { name: true } } } },
        author: { select: { id: true, name: true } },
      },
    });

    if (!article) throw ServiceException.notFound('That article is not available.');

    return article;
  }

  async create(payload: { data: ArticleData; actorId: number }) {
    const { data, actorId } = payload;

    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id: data.subcategoryId },
      select: { id: true },
    });

    if (!subcategory) {
      throw ServiceException.badRequest('The selected subcategory does not exist.');
    }

    try {
      const article = await this.prisma.article.create({
        data: {
          subcategoryId: data.subcategoryId,
          title: data.title,
          slug: await uniqueSlug(data.title, this.slugExists),
          excerpt: data.excerpt ?? null,
          content: sanitizeHtml(data.content, SANITIZE_OPTIONS),
          featuredImage: data.featuredImage ?? null,
          authorId: data.authorId ?? actorId,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          seoKeywords: data.seoKeywords ?? null,
          isFeatured: data.isFeatured ?? false,
          allowComments: data.allowComments ?? false,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          status: ArticleStatus.DRAFT,
          createdById: actorId,
          updatedById: actorId,
          histories: {
            create: [
              {
                userId: actorId,
                action: 'created',
                newStatus: ArticleStatus.DRAFT,
              },
            ],
          },
        },
      });

      this.logger.log(`Article "${article.title}" created by user #${actorId}`);

      return article;
    } catch (error) {
      translatePrismaError(error, 'article');
    }
  }

  async update(payload: { id: number; data: Partial<ArticleData>; actorId: number }) {
    const { id, data, actorId } = payload;

    const existing = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, title: true },
    });

    if (!existing) throw ServiceException.notFound(`No article exists with id ${id}.`);

    // A published article must be archived or returned to draft before edits,
    // so live content cannot change without passing review again.
    if (existing.status === ArticleStatus.PUBLISHED) {
      throw ServiceException.badRequest(
        'A published article cannot be edited directly. Return it to draft first.',
      );
    }

    try {
      const article = await this.prisma.article.update({
        where: { id },
        data: {
          subcategoryId: data.subcategoryId,
          title: data.title,
          slug: data.title && data.title !== existing.title
            ? await uniqueSlug(data.title, this.slugExists)
            : undefined,
          excerpt: data.excerpt,
          content: data.content ? sanitizeHtml(data.content, SANITIZE_OPTIONS) : undefined,
          featuredImage: data.featuredImage,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          seoKeywords: data.seoKeywords,
          isFeatured: data.isFeatured,
          allowComments: data.allowComments,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
          updatedById: actorId,
          histories: { create: [{ userId: actorId, action: 'updated' }] },
        },
      });

      return article;
    } catch (error) {
      translatePrismaError(error, 'article');
    }
  }

  async remove(payload: { id: number; actorId: number }) {
    const { id, actorId } = payload;

    const existing = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) throw ServiceException.notFound(`No article exists with id ${id}.`);

    await this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: actorId },
    });

    return { id, deleted: true as const };
  }

  /**
   * Single entry point for every editorial transition. Validates the move
   * against TRANSITIONS and appends a history row, so the article's audit
   * trail is complete by construction.
   */
  async workflow(payload: {
    id: number;
    action: ArticleWorkflowAction;
    comment?: string;
    scheduledAt?: string;
    actorId: number;
  }) {
    const { id, action, comment, actorId } = payload;

    const transition = TRANSITIONS[action];

    if (!transition) {
      throw ServiceException.badRequest(`"${action}" is not a recognised workflow action.`);
    }

    const article = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, title: true },
    });

    if (!article) throw ServiceException.notFound(`No article exists with id ${id}.`);

    if (!transition.from.includes(article.status)) {
      throw ServiceException.badRequest(
        `An article with status ${article.status} cannot be ${action.replace(/_/g, ' ')}.`,
        { currentStatus: article.status, allowedFrom: transition.from },
      );
    }

    if (action === 'reject' && !comment?.trim()) {
      throw ServiceException.badRequest('A comment is required when rejecting an article.');
    }

    const now = new Date();
    const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;

    if (action === 'schedule') {
      if (!scheduledAt) {
        throw ServiceException.badRequest('A scheduled date and time is required.');
      }

      if (scheduledAt <= now) {
        throw ServiceException.badRequest('The scheduled time must be in the future.');
      }
    }

    /* `UncheckedUpdateInput` rather than `UpdateInput`: the workflow sets the
       actor foreign keys (approvedById, rejectedById, ...) directly, which the
       checked variant only allows through nested relation objects. */
    const data: Prisma.ArticleUncheckedUpdateInput = {
      status: transition.to,
      updatedById: actorId,
    };

    switch (action) {
      case 'submit_for_review':
        data.submittedForReviewById = actorId;
        data.submittedForReviewAt = now;
        break;
      case 'start_review':
        data.reviewedById = actorId;
        data.reviewedAt = now;
        break;
      case 'approve':
        data.approvedById = actorId;
        data.approvedAt = now;
        data.reviewComment = comment ?? null;
        break;
      case 'reject':
        data.rejectedById = actorId;
        data.rejectedAt = now;
        data.rejectionReason = comment ?? null;
        break;
      case 'schedule':
        data.scheduledAt = scheduledAt;
        break;
      case 'publish':
        data.publishedAt = now;
        data.scheduledAt = null;
        break;
      default:
        break;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.article.update({ where: { id }, data });

      await tx.articleHistory.create({
        data: {
          articleId: id,
          userId: actorId,
          action,
          previousStatus: article.status,
          newStatus: transition.to,
          comment: comment ?? null,
        },
      });

      return result;
    });

    this.logger.log(
      `Article #${id} ${article.status} -> ${transition.to} via "${action}" by user #${actorId}`,
    );

    return updated;
  }

  /**
   * Publishes articles whose scheduled time has arrived. Replaces the Laravel
   * `articles:publish-scheduled` cron command; call it from a scheduler.
   */
  async publishDueScheduled(): Promise<{ published: number }> {
    const due = await this.prisma.article.findMany({
      where: {
        status: ArticleStatus.SCHEDULED,
        scheduledAt: { lte: new Date() },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (due.length === 0) return { published: 0 };

    const now = new Date();
    const ids = due.map((article) => article.id);

    await this.prisma.$transaction([
      this.prisma.article.updateMany({
        where: { id: { in: ids } },
        data: { status: ArticleStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
      }),
      this.prisma.articleHistory.createMany({
        data: ids.map((articleId) => ({
          articleId,
          action: 'auto_published',
          previousStatus: ArticleStatus.SCHEDULED,
          newStatus: ArticleStatus.PUBLISHED,
          comment: 'Published automatically at its scheduled time.',
        })),
      }),
    ]);

    this.logger.log(`Auto-published ${ids.length} scheduled article(s)`);

    return { published: ids.length };
  }

  /**
   * Article counts keyed by lower-cased status, plus a `total`, for the
   * dashboard summary. Soft-deleted articles are excluded so the numbers agree
   * with the article list.
   */
  async stats(): Promise<Record<string, number>> {
    const grouped = await this.prisma.article.groupBy({
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
      // Two states mean "waiting for a reviewer", so the dashboard reports
      // them as one figure.
      in_review: (byStatus.in_review ?? 0) + (byStatus.pending_review ?? 0),
      approved: byStatus.approved ?? 0,
      rejected: byStatus.rejected ?? 0,
      scheduled: byStatus.scheduled ?? 0,
      published: byStatus.published ?? 0,
      archived: byStatus.archived ?? 0,
    };
  }
}
