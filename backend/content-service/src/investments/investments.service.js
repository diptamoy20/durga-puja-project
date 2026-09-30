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
var InvestmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const sanitize_html_1 = __importDefault(require("sanitize-html"));

const InvestmentOpportunityStatus = database_1.InvestmentOpportunityStatus || {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
};

const InvestmentEnquiryStatus = database_1.InvestmentEnquiryStatus || {
    NEW: 'NEW',
    UNDER_REVIEW: 'UNDER_REVIEW',
    CONTACTED: 'CONTACTED',
    IN_DISCUSSION: 'IN_DISCUSSION',
    MEETING_SCHEDULED: 'MEETING_SCHEDULED',
    CLOSED_CONVERTED: 'CLOSED_CONVERTED',
    CLOSED_REJECTED: 'CLOSED_REJECTED',
};

/**
 * Editorial workflow state machine for Investment Opportunities.
 * Enforces strict lifecycle transitions and prevents unreviewed publishing.
 */
const TRANSITIONS = {
    submit_for_approval: {
        from: [InvestmentOpportunityStatus.DRAFT, InvestmentOpportunityStatus.REJECTED],
        to: InvestmentOpportunityStatus.PENDING_APPROVAL,
    },
    approve: {
        from: [InvestmentOpportunityStatus.PENDING_APPROVAL],
        to: InvestmentOpportunityStatus.APPROVED,
    },
    reject: {
        from: [InvestmentOpportunityStatus.PENDING_APPROVAL],
        to: InvestmentOpportunityStatus.REJECTED,
    },
    publish: {
        from: [InvestmentOpportunityStatus.APPROVED],
        to: InvestmentOpportunityStatus.PUBLISHED,
    },
    return_to_draft: {
        from: [InvestmentOpportunityStatus.PENDING_APPROVAL, InvestmentOpportunityStatus.REJECTED],
        to: InvestmentOpportunityStatus.DRAFT,
    },
    archive: {
        from: [InvestmentOpportunityStatus.PUBLISHED],
        to: InvestmentOpportunityStatus.ARCHIVED,
    },
};

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
};

let InvestmentsService = InvestmentsService_1 = class InvestmentsService {
    prisma;
    logger = new common_1.Logger(InvestmentsService_1.name);

    constructor(prisma) {
        this.prisma = prisma;
    }

    slugExists = async (slug, excludeId) => {
        const found = await this.prisma.investmentOpportunity.findFirst({
            where: {
                slug,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: { id: true },
        });
        return found !== null;
    };

    // =========================================================================
    // Public Endpoints (Strictly Published Only)
    // =========================================================================

    /**
     * Public listing: Guarantees that only APPROVED + PUBLISHED items are retrieved.
     */
    async publicList(query = {}) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            status: InvestmentOpportunityStatus.PUBLISHED,
            deletedAt: null,
            ...(query.sector ? { sector: { equals: query.sector, mode: 'insensitive' } } : {}),
            ...(query.category ? { category: { equals: query.category, mode: 'insensitive' } } : {}),
            ...(query.location ? { location: { contains: query.location, mode: 'insensitive' } } : {}),
            ...(query.district ? { district: { equals: query.district, mode: 'insensitive' } } : {}),
            ...(query.associationId ? { associationId: Number(query.associationId) } : {}),
            ...(query.isFeatured !== undefined ? { isFeatured: query.isFeatured === true || query.isFeatured === 'true' } : {}),
            ...(query.search
                ? {
                    OR: [
                        { title: { contains: query.search, mode: 'insensitive' } },
                        { summary: { contains: query.search, mode: 'insensitive' } },
                        { sector: { contains: query.search, mode: 'insensitive' } },
                        { location: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.investmentOpportunity.findMany({
                where,
                skip,
                take,
                orderBy: query.isFeatured ? [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }] : [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
                include: {
                    association: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            category: true,
                            logoUrl: true,
                            website: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            }),
            this.prisma.investmentOpportunity.count({ where }),
        ]);

        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }

    /**
     * Public detail: Guarantees that only APPROVED + PUBLISHED item is accessible.
     */
    async publicDetail(slug) {
        const opportunity = await this.prisma.investmentOpportunity.findFirst({
            where: {
                slug,
                status: database_1.InvestmentOpportunityStatus.PUBLISHED,
                deletedAt: null,
            },
            include: {
                association: true,
            },
        });

        if (!opportunity) {
            throw shared_1.ServiceException.notFound('Investment opportunity not found or is not currently published.');
        }

        return opportunity;
    }

    /**
     * Public associations list
     */
    async publicAssociations(query = {}) {
        return this.prisma.industryAssociation.findMany({
            where: {
                isActive: true,
                deletedAt: null,
                ...(query.category ? { category: query.category } : {}),
            },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: {
                        opportunities: {
                            where: { status: database_1.InvestmentOpportunityStatus.PUBLISHED, deletedAt: null },
                        },
                    },
                },
            },
        });
    }

    /**
     * Public enquiry submission (Express Interest)
     */
    async submitEnquiry(payload) {
        const { data } = payload;

        let targetAssociationId = data.associationId;
        let opportunityTitle = '';

        if (data.opportunityId) {
            const opp = await this.prisma.investmentOpportunity.findUnique({
                where: { id: data.opportunityId },
                select: { id: true, title: true, associationId: true },
            });
            if (opp) {
                opportunityTitle = opp.title;
                if (!targetAssociationId && opp.associationId) {
                    targetAssociationId = opp.associationId;
                }
            }
        }

        const enquiryCode = `INV-2026-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

        try {
            const enquiry = await this.prisma.investmentEnquiry.create({
                data: {
                    enquiryCode,
                    opportunityId: data.opportunityId ?? null,
                    associationId: targetAssociationId ?? null,
                    fullName: data.fullName,
                    organization: data.organization ?? null,
                    designation: data.designation ?? null,
                    investorType: data.investorType ?? 'Individual / Angel',
                    email: data.email,
                    phone: data.phone,
                    country: data.country ?? 'India',
                    city: data.city ?? null,
                    investmentBudget: data.investmentBudget ?? null,
                    proposedTimeline: data.proposedTimeline ?? null,
                    message: data.message,
                    status: 'NEW',
                    histories: {
                        create: [
                            {
                                action: 'created',
                                fromStatus: null,
                                toStatus: 'NEW',
                                comment: `Expressed interest in ${opportunityTitle || 'Investment Opportunities'}`,
                            },
                        ],
                    },
                },
                include: {
                    opportunity: { select: { id: true, title: true, slug: true } },
                    association: { select: { id: true, name: true, code: true, email: true } },
                },
            });

            this.logger.log(`Investor enquiry [${enquiry.enquiryCode}] created by ${enquiry.email}`);
            return enquiry;
        } catch (error) {
            (0, shared_1.translatePrismaError)(error, 'investment_enquiry');
        }
    }

    // =========================================================================
    // Admin Opportunities Management & State-Machine Workflow
    // =========================================================================

    async findAll(query = {}) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            deletedAt: null,
            ...(query.status ? { status: query.status } : {}),
            ...(query.sector ? { sector: { equals: query.sector, mode: 'insensitive' } } : {}),
            ...(query.associationId ? { associationId: Number(query.associationId) } : {}),
            ...(query.isFeatured !== undefined ? { isFeatured: query.isFeatured === true || query.isFeatured === 'true' } : {}),
            ...(query.search
                ? {
                    OR: [
                        { title: { contains: query.search, mode: 'insensitive' } },
                        { summary: { contains: query.search, mode: 'insensitive' } },
                        { location: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.investmentOpportunity.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy ?? 'createdAt']: query.sortDir ?? 'desc' },
                include: {
                    association: { select: { id: true, name: true, code: true } },
                    createdBy: { select: { id: true, name: true, email: true } },
                    approvedBy: { select: { id: true, name: true } },
                    publishedBy: { select: { id: true, name: true } },
                    _count: { select: { enquiries: true } },
                },
            }),
            this.prisma.investmentOpportunity.count({ where }),
        ]);

        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }

    async stats() {
        const [counts, totalEnquiries] = await Promise.all([
            this.prisma.investmentOpportunity.groupBy({
                by: ['status'],
                where: { deletedAt: null },
                _count: { id: true },
            }),
            this.prisma.investmentEnquiry.count(),
        ]);

        const statusCounts = {
            DRAFT: 0,
            PENDING_APPROVAL: 0,
            APPROVED: 0,
            REJECTED: 0,
            PUBLISHED: 0,
            ARCHIVED: 0,
            TOTAL: 0,
            ENQUIRIES: totalEnquiries,
        };

        let total = 0;
        for (const row of counts) {
            statusCounts[row.status] = row._count.id;
            total += row._count.id;
        }
        statusCounts.TOTAL = total;

        return statusCounts;
    }

    async findOne(id) {
        const opportunity = await this.prisma.investmentOpportunity.findFirst({
            where: { id: Number(id), deletedAt: null },
            include: {
                association: true,
                createdBy: { select: { id: true, name: true, email: true } },
                updatedBy: { select: { id: true, name: true } },
                submittedBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
                rejectedBy: { select: { id: true, name: true } },
                publishedBy: { select: { id: true, name: true } },
                histories: {
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                _count: { select: { enquiries: true } },
            },
        });

        if (!opportunity) {
            throw shared_1.ServiceException.notFound(`No investment opportunity exists with id ${id}.`);
        }

        return opportunity;
    }

    /**
     * Create opportunity: Guaranteed to start in DRAFT status.
     */
    async create(payload) {
        const { data, actorId } = payload;
        const slugBase = data.slug?.trim() || data.title;
        const invRange = data.investmentRange || data.expectedInvestment || 'Open for Discussion';

        try {
            const opportunity = await this.prisma.investmentOpportunity.create({
                data: {
                    title: data.title,
                    slug: await (0, shared_1.uniqueSlug)(slugBase, (slug) => this.slugExists(slug)),
                    sector: data.sector,
                    category: data.category ?? null,
                    location: data.location,
                    district: data.district ?? null,
                    summary: data.summary ?? null,
                    description: (0, sanitize_html_1.default)(data.description, SANITIZE_OPTIONS),
                    investmentRange: invRange,
                    investmentMin: data.investmentMin !== undefined && data.investmentMin !== null ? Number(data.investmentMin) : null,
                    investmentMax: data.investmentMax !== undefined && data.investmentMax !== null ? Number(data.investmentMax) : null,
                    projectType: data.projectType ?? null,
                    expectedRoi: data.expectedRoi ?? null,
                    highlights: data.highlights ?? [],
                    incentives: data.incentives ?? null,
                    coverImageUrl: data.coverImageUrl ?? null,
                    galleryImages: data.galleryImages ?? [],
                    documents: data.documents ?? [],
                    associationId: data.associationId ? Number(data.associationId) : null,
                    contactEmail: data.contactEmail ?? null,
                    contactPhone: data.contactPhone ?? null,
                    isFeatured: data.isFeatured ?? false,
                    sortOrder: data.sortOrder ?? 0,
                    status: InvestmentOpportunityStatus.DRAFT, // Always starts as DRAFT
                    createdById: actorId,
                    updatedById: actorId,
                    histories: {
                        create: [
                            {
                                userId: actorId,
                                action: 'created',
                                newStatus: InvestmentOpportunityStatus.DRAFT,
                                comment: 'Opportunity created as Draft',
                            },
                        ],
                    },
                },
                include: {
                    association: true,
                },
            });

            this.logger.log(`Opportunity "${opportunity.title}" created as DRAFT by user #${actorId}`);
            return opportunity;
        } catch (error) {
            (0, shared_1.translatePrismaError)(error, 'investment_opportunity');
        }
    }

    async update(payload) {
        const { id, data, actorId } = payload;
        const existing = await this.prisma.investmentOpportunity.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: { id: true, status: true, title: true, slug: true },
        });

        if (!existing) {
            throw shared_1.ServiceException.notFound(`No opportunity exists with id ${id}.`);
        }

        if (existing.status === InvestmentOpportunityStatus.PUBLISHED) {
            throw shared_1.ServiceException.badRequest('A published opportunity cannot be edited directly. Archive it or return it to draft first.');
        }

        let nextSlug;
        if (data.slug !== undefined && data.slug.trim() && data.slug.trim() !== existing.slug) {
            nextSlug = await (0, shared_1.uniqueSlug)(data.slug.trim(), (slug) => this.slugExists(slug, id));
        } else if (data.slug === undefined && data.title && data.title !== existing.title) {
            nextSlug = await (0, shared_1.uniqueSlug)(data.title, (slug) => this.slugExists(slug, id));
        }

        try {
            const opportunity = await this.prisma.investmentOpportunity.update({
                where: { id: Number(id) },
                data: {
                    title: data.title,
                    slug: nextSlug,
                    sector: data.sector,
                    category: data.category,
                    location: data.location,
                    district: data.district,
                    summary: data.summary,
                    description: data.description ? (0, sanitize_html_1.default)(data.description, SANITIZE_OPTIONS) : undefined,
                    investmentRange: data.investmentRange,
                    investmentMin: data.investmentMin !== undefined && data.investmentMin !== null ? Number(data.investmentMin) : undefined,
                    investmentMax: data.investmentMax !== undefined && data.investmentMax !== null ? Number(data.investmentMax) : undefined,
                    projectType: data.projectType,
                    expectedRoi: data.expectedRoi,
                    highlights: data.highlights,
                    incentives: data.incentives,
                    coverImageUrl: data.coverImageUrl,
                    galleryImages: data.galleryImages,
                    documents: data.documents,
                    associationId: data.associationId !== undefined ? (data.associationId ? Number(data.associationId) : null) : undefined,
                    contactEmail: data.contactEmail,
                    contactPhone: data.contactPhone,
                    isFeatured: data.isFeatured,
                    sortOrder: data.sortOrder,
                    updatedById: actorId,
                    histories: {
                        create: [
                            {
                                userId: actorId,
                                action: 'updated',
                                comment: 'Opportunity details updated',
                            },
                        ],
                    },
                },
                include: {
                    association: true,
                },
            });

            return opportunity;
        } catch (error) {
            (0, shared_1.translatePrismaError)(error, 'investment_opportunity');
        }
    }

    async remove(payload) {
        const { id, actorId } = payload;
        const existing = await this.prisma.investmentOpportunity.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: { id: true },
        });

        if (!existing) {
            throw shared_1.ServiceException.notFound(`No opportunity exists with id ${id}.`);
        }

        await this.prisma.investmentOpportunity.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date(), updatedById: actorId },
        });

        return { id: Number(id), deleted: true };
    }

    /**
     * Workflow transition state machine
     */
    async workflow(payload) {
        const { id, action, comment, actorId } = payload;
        const transition = TRANSITIONS[action];

        if (!transition) {
            throw shared_1.ServiceException.badRequest(`Unknown workflow action: "${action}".`);
        }

        const opportunity = await this.prisma.investmentOpportunity.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: { id: true, status: true, title: true },
        });

        if (!opportunity) {
            throw shared_1.ServiceException.notFound(`No opportunity exists with id ${id}.`);
        }

        if (!transition.from.includes(opportunity.status)) {
            const allowed = transition.from.join(', ');
            throw shared_1.ServiceException.badRequest(
                `Cannot execute "${action}" on an opportunity in "${opportunity.status}" status (expected one of: ${allowed}).`,
            );
        }

        if (action === 'reject' && (!comment || !comment.trim())) {
            throw shared_1.ServiceException.badRequest('A rejection reason is required when rejecting an opportunity.');
        }

        const now = new Date();
        const updateData = {
            status: transition.to,
            updatedById: actorId,
        };

        if (action === 'submit_for_approval') {
            updateData.submittedAt = now;
            updateData.submittedById = actorId;
        } else if (action === 'approve') {
            updateData.approvedAt = now;
            updateData.approvedById = actorId;
            updateData.rejectedAt = null;
            updateData.rejectedById = null;
            updateData.rejectionReason = null;
        } else if (action === 'reject') {
            updateData.rejectedAt = now;
            updateData.rejectedById = actorId;
            updateData.rejectionReason = comment?.trim() ?? null;
        } else if (action === 'publish') {
            updateData.publishedAt = now;
            updateData.publishedById = actorId;
        }

        const [updated] = await this.prisma.$transaction([
            this.prisma.investmentOpportunity.update({
                where: { id: Number(id) },
                data: updateData,
                include: {
                    association: true,
                    createdBy: { select: { id: true, name: true } },
                    approvedBy: { select: { id: true, name: true } },
                    publishedBy: { select: { id: true, name: true } },
                    histories: {
                        orderBy: { createdAt: 'desc' },
                        include: { user: { select: { id: true, name: true } } },
                    },
                },
            }),
            this.prisma.investmentOpportunityHistory.create({
                data: {
                    opportunityId: Number(id),
                    userId: actorId,
                    action,
                    previousStatus: opportunity.status,
                    newStatus: transition.to,
                    comment: comment?.trim() || null,
                },
            }),
        ]);

        this.logger.log(`Opportunity #${id} transitioned ${opportunity.status} -> ${transition.to} via "${action}" by user #${actorId}`);
        return updated;
    }

    // =========================================================================
    // Industry Associations CRUD
    // =========================================================================

    async findAssociations(query = {}) {
        return this.prisma.industryAssociation.findMany({
            where: {
                deletedAt: null,
                ...(query.category ? { category: query.category } : {}),
                ...(query.search
                    ? {
                        OR: [
                            { name: { contains: query.search, mode: 'insensitive' } },
                            { code: { contains: query.search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: {
                        opportunities: { where: { deletedAt: null } },
                        enquiries: true,
                    },
                },
            },
        });
    }

    async createAssociation(payload) {
        const { data } = payload;
        const categoryVal = data.category || (Array.isArray(data.sectorsCovered) && data.sectorsCovered.length > 0 ? data.sectorsCovered[0] : 'Chamber of Commerce');
        return this.prisma.industryAssociation.create({
            data: {
                name: data.name,
                code: data.code.toUpperCase().trim(),
                category: categoryVal,
                description: data.description ?? null,
                contactPerson: data.contactPerson ?? null,
                email: data.email || null,
                phone: data.phone ?? null,
                website: data.website ?? null,
                address: data.address ?? null,
                city: data.city ?? null,
                state: data.state ?? 'West Bengal',
                sectorsCovered: data.sectorsCovered ?? [],
                logoUrl: data.logoUrl ?? null,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder ?? data.displayOrder ?? 0,
            },
        });
    }

    async updateAssociation(payload) {
        const { id, data } = payload;
        const categoryVal = data.category || (Array.isArray(data.sectorsCovered) && data.sectorsCovered.length > 0 ? data.sectorsCovered[0] : undefined);
        return this.prisma.industryAssociation.update({
            where: { id: Number(id) },
            data: {
                name: data.name !== undefined ? data.name : undefined,
                code: data.code ? data.code.toUpperCase().trim() : undefined,
                category: categoryVal,
                description: data.description !== undefined ? data.description : undefined,
                contactPerson: data.contactPerson !== undefined ? data.contactPerson : undefined,
                email: data.email !== undefined ? data.email : undefined,
                phone: data.phone !== undefined ? data.phone : undefined,
                website: data.website !== undefined ? data.website : undefined,
                address: data.address !== undefined ? data.address : undefined,
                city: data.city !== undefined ? data.city : undefined,
                state: data.state !== undefined ? data.state : undefined,
                sectorsCovered: data.sectorsCovered !== undefined ? data.sectorsCovered : undefined,
                logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
                isActive: data.isActive !== undefined ? data.isActive : undefined,
                sortOrder: data.sortOrder !== undefined ? data.sortOrder : data.displayOrder !== undefined ? data.displayOrder : undefined,
            },
        });
    }

    async removeAssociation(payload) {
        const { id } = payload;
        await this.prisma.industryAssociation.update({
            where: { id: Number(id) },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { id: Number(id), deleted: true };
    }

    // =========================================================================
    // Investment Enquiries Management
    // =========================================================================

    async findEnquiries(query = {}) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            ...(query.status ? { status: query.status } : {}),
            ...(query.opportunityId ? { opportunityId: Number(query.opportunityId) } : {}),
            ...(query.associationId ? { associationId: Number(query.associationId) } : {}),
            ...(query.search
                ? {
                    OR: [
                        { fullName: { contains: query.search, mode: 'insensitive' } },
                        { organization: { contains: query.search, mode: 'insensitive' } },
                        { email: { contains: query.search, mode: 'insensitive' } },
                        { enquiryCode: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.investmentEnquiry.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy ?? 'createdAt']: query.sortDir ?? 'desc' },
                include: {
                    opportunity: { select: { id: true, title: true, slug: true, sector: true } },
                    association: { select: { id: true, name: true, code: true } },
                    assignedTo: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.investmentEnquiry.count({ where }),
        ]);

        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }

    async findEnquiry(id) {
        const enquiry = await this.prisma.investmentEnquiry.findUnique({
            where: { id: Number(id) },
            include: {
                opportunity: true,
                association: true,
                assignedTo: { select: { id: true, name: true, email: true } },
                histories: {
                    orderBy: { createdAt: 'desc' },
                    include: { changedBy: { select: { id: true, name: true } } },
                },
            },
        });

        if (!enquiry) {
            throw shared_1.ServiceException.notFound(`No enquiry exists with id ${id}.`);
        }

        return enquiry;
    }

    async updateEnquiryStatus(payload) {
        const { id, status, adminRemarks, assignedToId, actorId } = payload;
        const existing = await this.prisma.investmentEnquiry.findUnique({
            where: { id: Number(id) },
            select: { id: true, status: true },
        });

        if (!existing) {
            throw shared_1.ServiceException.notFound(`No enquiry exists with id ${id}.`);
        }

        const [updated] = await this.prisma.$transaction([
            this.prisma.investmentEnquiry.update({
                where: { id: Number(id) },
                data: {
                    status: status ?? existing.status,
                    adminRemarks: adminRemarks !== undefined ? adminRemarks : undefined,
                    assignedToId: assignedToId !== undefined ? (assignedToId ? Number(assignedToId) : null) : undefined,
                },
                include: {
                    opportunity: true,
                    association: true,
                    assignedTo: true,
                    histories: {
                        orderBy: { createdAt: 'desc' },
                        include: { changedBy: { select: { id: true, name: true } } },
                    },
                },
            }),
            this.prisma.investmentEnquiryHistory.create({
                data: {
                    enquiryId: Number(id),
                    changedById: actorId,
                    action: 'status_updated',
                    fromStatus: existing.status,
                    toStatus: status ?? existing.status,
                    comment: adminRemarks || `Status changed to ${status}`,
                },
            }),
        ]);

        return updated;
    }
};

exports.InvestmentsService = InvestmentsService = InvestmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], InvestmentsService);
