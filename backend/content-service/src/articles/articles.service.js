"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ArticlesService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
/**
 * Legal editorial transitions, mirroring the Laravel ArticleWorkflowService.
 * Encoding them here stops an article being published straight from draft
 * without review, which the old admin screens allowed.
 */
const TRANSITIONS = {
    submit_for_review: {
        from: [database_1.ArticleStatus.DRAFT, database_1.ArticleStatus.REJECTED],
        to: database_1.ArticleStatus.PENDING_REVIEW,
    },
    start_review: { from: [database_1.ArticleStatus.PENDING_REVIEW], to: database_1.ArticleStatus.IN_REVIEW },
    approve: {
        from: [database_1.ArticleStatus.PENDING_REVIEW, database_1.ArticleStatus.IN_REVIEW],
        to: database_1.ArticleStatus.APPROVED,
    },
    reject: {
        from: [database_1.ArticleStatus.PENDING_REVIEW, database_1.ArticleStatus.IN_REVIEW],
        to: database_1.ArticleStatus.REJECTED,
    },
    schedule: { from: [database_1.ArticleStatus.APPROVED], to: database_1.ArticleStatus.SCHEDULED },
    publish: {
        from: [database_1.ArticleStatus.APPROVED, database_1.ArticleStatus.SCHEDULED],
        to: database_1.ArticleStatus.PUBLISHED,
    },
    archive: { from: [database_1.ArticleStatus.PUBLISHED], to: database_1.ArticleStatus.ARCHIVED },
    return_to_draft: {
        from: [database_1.ArticleStatus.REJECTED, database_1.ArticleStatus.PENDING_REVIEW, database_1.ArticleStatus.IN_REVIEW],
        to: database_1.ArticleStatus.DRAFT,
    },
};
/**
 * Tags and attributes permitted in article bodies. Anything else is stripped,
 * so a contributor cannot inject script or event handlers that would run in
 * another user's browser.
 */
const SANITIZE_OPTIONS = {
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
        a: sanitize_html_1.default.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
};
let ArticlesService = ArticlesService_1 = class ArticlesService {
    prisma;
    logger = new common_1.Logger(ArticlesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    slugExists = async (slug, excludeId) => {
        const found = await this.prisma.article.findFirst({
            where: {
                slug,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: { id: true },
        });
        return found !== null;
    };
    dateRange = (dateStr) => {
        const start = new Date(`${dateStr}T00:00:00.000Z`);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        return { gte: start, lt: end };
    };
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            deletedAt: null,
            ...(query.status ? { status: query.status } : {}),
            ...(query.subcategoryId ? { subcategoryId: query.subcategoryId } : {}),
            ...(query.categoryId ? { subcategory: { categoryId: query.categoryId } } : {}),
            ...(query.authorId ? { authorId: query.authorId } : {}),
            ...(query.isFeatured !== undefined ? { isFeatured: query.isFeatured } : {}),
            ...(query.createdDate ? { createdAt: this.dateRange(query.createdDate) } : {}),
            ...(query.publishedDate ? { publishedAt: this.dateRange(query.publishedDate) } : {}),
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
                    updatedAt: true,
                    subcategory: {
                        select: { id: true, name: true, category: { select: { id: true, name: true } } },
                    },
                    author: { select: { id: true, name: true } },
                },
            }),
            this.prisma.article.count({ where }),
        ]);
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    /** Published-only feed for the public site. */
    async publicList(query) {
        return this.findAll({
            ...query,
            status: database_1.ArticleStatus.PUBLISHED,
            sortBy: 'publishedAt',
            sortDir: 'desc',
        });
    }
    async findOne(id) {
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
        if (!article)
            throw shared_1.ServiceException.notFound(`No article exists with id ${id}.`);
        return article;
    }
    async findBySlug(slug) {
        const article = await this.prisma.article.findFirst({
            where: { slug, status: database_1.ArticleStatus.PUBLISHED, deletedAt: null },
            include: {
                subcategory: { select: { id: true, name: true, category: { select: { name: true } } } },
                author: { select: { id: true, name: true } },
            },
        });
        if (!article)
            throw shared_1.ServiceException.notFound('That article is not available.');
        return article;
    }
    async create(payload) {
        const { data, actorId } = payload;
        const subcategory = await this.prisma.subcategory.findUnique({
            where: { id: data.subcategoryId },
            select: { id: true },
        });
        if (!subcategory) {
            throw shared_1.ServiceException.badRequest('The selected subcategory does not exist.');
        }
        try {
            const slugBase = data.slug?.trim() || data.title;
            const article = await this.prisma.article.create({
                data: {
                    subcategoryId: data.subcategoryId,
                    title: data.title,
                    slug: await (0, shared_1.uniqueSlug)(slugBase, (slug) => this.slugExists(slug)),
                    excerpt: data.excerpt ?? null,
                    content: (0, sanitize_html_1.default)(data.content, SANITIZE_OPTIONS),
                    featuredImage: data.featuredImage ?? null,
                    authorId: data.authorId ?? actorId,
                    seoTitle: data.seoTitle ?? null,
                    seoDescription: data.seoDescription ?? null,
                    seoKeywords: data.seoKeywords ?? null,
                    isFeatured: data.isFeatured ?? false,
                    allowComments: data.allowComments ?? false,
                    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                    status: database_1.ArticleStatus.DRAFT,
                    createdById: actorId,
                    updatedById: actorId,
                    histories: {
                        create: [
                            {
                                userId: actorId,
                                action: 'created',
                                newStatus: database_1.ArticleStatus.DRAFT,
                            },
                        ],
                    },
                },
            });
            this.logger.log(`Article "${article.title}" created by user #${actorId}`);
            return article;
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'article');
        }
    }
    async update(payload) {
        const { id, data, actorId } = payload;
        const existing = await this.prisma.article.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, title: true, slug: true },
        });
        if (!existing)
            throw shared_1.ServiceException.notFound(`No article exists with id ${id}.`);
        // A published article must be archived or returned to draft before edits,
        // so live content cannot change without passing review again.
        if (existing.status === database_1.ArticleStatus.PUBLISHED) {
            throw shared_1.ServiceException.badRequest('A published article cannot be edited directly. Return it to draft first.');
        }
        let nextSlug;
        if (data.slug !== undefined && data.slug.trim() && data.slug.trim() !== existing.slug) {
            nextSlug = await (0, shared_1.uniqueSlug)(data.slug.trim(), (slug) => this.slugExists(slug, id));
        }
        else if (data.slug === undefined && data.title && data.title !== existing.title) {
            nextSlug = await (0, shared_1.uniqueSlug)(data.title, (slug) => this.slugExists(slug, id));
        }
        try {
            const article = await this.prisma.article.update({
                where: { id },
                data: {
                    subcategoryId: data.subcategoryId,
                    title: data.title,
                    slug: nextSlug,
                    excerpt: data.excerpt,
                    content: data.content ? (0, sanitize_html_1.default)(data.content, SANITIZE_OPTIONS) : undefined,
                    featuredImage: data.featuredImage,
                    authorId: data.authorId,
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
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'article');
        }
    }
    async remove(payload) {
        const { id, actorId } = payload;
        const existing = await this.prisma.article.findFirst({
            where: { id, deletedAt: null },
            select: { id: true },
        });
        if (!existing)
            throw shared_1.ServiceException.notFound(`No article exists with id ${id}.`);
        await this.prisma.article.update({
            where: { id },
            data: { deletedAt: new Date(), updatedById: actorId },
        });
        return { id, deleted: true };
    }
    /**
     * Single entry point for every editorial transition. Validates the move
     * against TRANSITIONS and appends a history row, so the article's audit
     * trail is complete by construction.
     */
    async workflow(payload) {
        const { id, action, comment, actorId } = payload;
        const transition = TRANSITIONS[action];
        if (!transition) {
            throw shared_1.ServiceException.badRequest(`"${action}" is not a recognised workflow action.`);
        }
        const article = await this.prisma.article.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, title: true },
        });
        if (!article)
            throw shared_1.ServiceException.notFound(`No article exists with id ${id}.`);
        if (!transition.from.includes(article.status)) {
            throw shared_1.ServiceException.badRequest(`An article with status ${article.status} cannot be ${action.replace(/_/g, ' ')}.`, { currentStatus: article.status, allowedFrom: transition.from });
        }
        if (action === 'reject' && !comment?.trim()) {
            throw shared_1.ServiceException.badRequest('A comment is required when rejecting an article.');
        }
        const now = new Date();
        const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;
        if (action === 'schedule') {
            if (!scheduledAt) {
                throw shared_1.ServiceException.badRequest('A scheduled date and time is required.');
            }
            if (scheduledAt <= now) {
                throw shared_1.ServiceException.badRequest('The scheduled time must be in the future.');
            }
        }
        /* `UncheckedUpdateInput` rather than `UpdateInput`: the workflow sets the
           actor foreign keys (approvedById, rejectedById, ...) directly, which the
           checked variant only allows through nested relation objects. */
        const data = {
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
        this.logger.log(`Article #${id} ${article.status} -> ${transition.to} via "${action}" by user #${actorId}`);
        return updated;
    }
    /**
     * Publishes articles whose scheduled time has arrived. Replaces the Laravel
     * `articles:publish-scheduled` cron command; call it from a scheduler.
     */
    async publishDueScheduled() {
        const due = await this.prisma.article.findMany({
            where: {
                status: database_1.ArticleStatus.SCHEDULED,
                scheduledAt: { lte: new Date() },
                deletedAt: null,
            },
            select: { id: true },
        });
        if (due.length === 0)
            return { published: 0 };
        const now = new Date();
        const ids = due.map((article) => article.id);
        await this.prisma.$transaction([
            this.prisma.article.updateMany({
                where: { id: { in: ids } },
                data: { status: database_1.ArticleStatus.PUBLISHED, publishedAt: now, scheduledAt: null },
            }),
            this.prisma.articleHistory.createMany({
                data: ids.map((articleId) => ({
                    articleId,
                    action: 'auto_published',
                    previousStatus: database_1.ArticleStatus.SCHEDULED,
                    newStatus: database_1.ArticleStatus.PUBLISHED,
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
    async stats() {
        const grouped = await this.prisma.article.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { _all: true },
        });
        const byStatus = Object.fromEntries(grouped.map((row) => [row.status.toLowerCase(), row._count._all]));
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
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = ArticlesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], ArticlesService);
