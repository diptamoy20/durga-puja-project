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
var SharadSammanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharadSammanService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@dpgc/database");

const ALLOWED_TRANSITIONS = {
    [database_1.NominationStatus.DRAFT]: [database_1.NominationStatus.SUBMITTED],
    [database_1.NominationStatus.SUBMITTED]: [database_1.NominationStatus.UNDER_REVIEW, database_1.NominationStatus.APPROVED, database_1.NominationStatus.REJECTED],
    [database_1.NominationStatus.UNDER_REVIEW]: [database_1.NominationStatus.APPROVED, database_1.NominationStatus.REJECTED],
    [database_1.NominationStatus.APPROVED]: [],
    [database_1.NominationStatus.REJECTED]: [database_1.NominationStatus.UNDER_REVIEW, database_1.NominationStatus.APPROVED],
    [database_1.NominationStatus.SHORTLISTED]: [],
};

let SharadSammanService = SharadSammanService_1 = class SharadSammanService {
    prisma;
    logger = new common_1.Logger(SharadSammanService_1.name);

    constructor(prisma) {
        this.prisma = prisma;
    }

    /**
     * Dashboard stats: aggregates total, draft, submitted, underReview, approved, rejected, shortlisted
     */
    async getDashboardStats() {
        const [counts, activeContest] = await Promise.all([
            this.prisma.sharadSammanNomination.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            this.prisma.contest.findFirst({
                where: { status: database_1.ContestStatus.ACTIVE },
                orderBy: { year: 'desc' },
            }),
        ]);

        const stats = {
            total: 0,
            draft: 0,
            submitted: 0,
            underReview: 0,
            approved: 0,
            rejected: 0,
            shortlisted: 0,
        };

        for (const item of counts) {
            const count = item._count.id;
            stats.total += count;
            switch (item.status) {
                case database_1.NominationStatus.DRAFT:
                    stats.draft = count;
                    break;
                case database_1.NominationStatus.SUBMITTED:
                    stats.submitted = count;
                    break;
                case database_1.NominationStatus.UNDER_REVIEW:
                    stats.underReview = count;
                    break;
                case database_1.NominationStatus.APPROVED:
                    stats.approved = count;
                    break;
                case database_1.NominationStatus.REJECTED:
                    stats.rejected = count;
                    break;
                case database_1.NominationStatus.SHORTLISTED:
                    stats.shortlisted = count;
                    break;
            }
        }

        return {
            stats,
            activeContest,
        };
    }

    /**
     * Paginated list of nominations with search and status filters
     */
    async listNominations(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 15));
        const skip = (page - 1) * perPage;
        const sortDir = query.sortDir?.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const where = {};

        if (query.status) {
            where.status = query.status;
        }

        if (query.contestId) {
            where.contestId = Number(query.contestId);
        }

        if (query.pujaCommitteeId) {
            where.pujaCommitteeId = Number(query.pujaCommitteeId);
        }

        if (query.search && query.search.trim()) {
            const term = query.search.trim();
            where.OR = [
                { title: { contains: term, mode: 'insensitive' } },
                { category: { contains: term, mode: 'insensitive' } },
                {
                    committee: {
                        OR: [
                            { committeeName: { contains: term, mode: 'insensitive' } },
                            { registrationNo: { contains: term, mode: 'insensitive' } },
                            { city: { contains: term, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.sharadSammanNomination.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: sortDir },
                include: {
                    committee: {
                        select: {
                            id: true,
                            committeeName: true,
                            registrationNo: true,
                            city: true,
                            state: true,
                            venueName: true,
                            status: true,
                            pandalImage: true,
                        },
                    },
                    contest: {
                        select: {
                            id: true,
                            name: true,
                            year: true,
                            status: true,
                        },
                    },
                    reviewedBy: { select: { id: true, name: true, email: true } },
                    approvedBy: { select: { id: true, name: true, email: true } },
                    shortlistedBy: { select: { id: true, name: true, email: true } },
                    rejectedBy: { select: { id: true, name: true, email: true } },
                    createdBy: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.sharadSammanNomination.count({ where }),
        ]);

        const lastPage = Math.max(1, Math.ceil(total / perPage));

        return {
            items,
            pagination: {
                page,
                perPage,
                total,
                lastPage,
                hasPreviousPage: page > 1,
                hasNextPage: page < lastPage,
            },
        };
    }

    /**
     * Get single nomination by ID
     */
    async getNomination(id) {
        const nomination = await this.prisma.sharadSammanNomination.findUnique({
            where: { id: Number(id) },
            include: {
                committee: true,
                contest: true,
                reviewedBy: { select: { id: true, name: true, email: true } },
                approvedBy: { select: { id: true, name: true, email: true } },
                shortlistedBy: { select: { id: true, name: true, email: true } },
                rejectedBy: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });

        if (!nomination) {
            throw new common_1.NotFoundException(`Nomination #${id} not found.`);
        }

        return nomination;
    }

    /**
     * Create nomination on behalf of a committee (always initialized as DRAFT)
     */
    async createNomination(dto, actorId) {
        const [contest, committee] = await Promise.all([
            this.prisma.contest.findUnique({ where: { id: dto.contestId } }),
            this.prisma.pujaCommittee.findUnique({ where: { id: dto.pujaCommitteeId } }),
        ]);

        if (!contest) {
            throw new common_1.NotFoundException(`Contest #${dto.contestId} not found.`);
        }

        if (!committee) {
            throw new common_1.NotFoundException(`Puja Committee #${dto.pujaCommitteeId} not found.`);
        }

        const category = (dto.category || '').trim();
        if (!category) {
            throw new common_1.BadRequestException('Nomination award category is required.');
        }

        const existing = await this.prisma.sharadSammanNomination.findUnique({
            where: {
                contestId_pujaCommitteeId_category: {
                    contestId: dto.contestId,
                    pujaCommitteeId: dto.pujaCommitteeId,
                    category,
                },
            },
        });

        if (existing) {
            throw new common_1.BadRequestException(
                `A nomination already exists for committee "${committee.committeeName}" in category "${category}" for contest "${contest.name}".`,
            );
        }

        return this.prisma.sharadSammanNomination.create({
            data: {
                contestId: dto.contestId,
                pujaCommitteeId: dto.pujaCommitteeId,
                category,
                title: dto.title?.trim() || null,
                description: dto.description?.trim() || null,
                status: database_1.NominationStatus.DRAFT,
                createdById: actorId ?? null,
            },
            include: {
                committee: {
                    select: {
                        id: true,
                        committeeName: true,
                        registrationNo: true,
                        city: true,
                        state: true,
                    },
                },
                contest: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                    },
                },
            },
        });
    }

    /**
     * Edit nomination details (category, title, description)
     * Rejects changes to snapshotData and prevents editing of shortlisted nominations.
     */
    async updateNomination(id, dto) {
        const nomination = await this.prisma.sharadSammanNomination.findUnique({
            where: { id: Number(id) },
        });

        if (!nomination) {
            throw new common_1.NotFoundException(`Nomination #${id} not found.`);
        }

        if (nomination.status === database_1.NominationStatus.SHORTLISTED) {
            throw new common_1.BadRequestException(
                'Shortlisted nominations cannot be modified directly. Demote status to make changes.',
            );
        }

        let newCategory = nomination.category;
        if (dto.category !== undefined) {
            const trimmed = (dto.category || '').trim();
            if (!trimmed) {
                throw new common_1.BadRequestException('Nomination category cannot be empty.');
            }
            newCategory = trimmed;
        }

        if (newCategory !== nomination.category) {
            const existing = await this.prisma.sharadSammanNomination.findUnique({
                where: {
                    contestId_pujaCommitteeId_category: {
                        contestId: nomination.contestId,
                        pujaCommitteeId: nomination.pujaCommitteeId,
                        category: newCategory,
                    },
                },
            });

            if (existing && existing.id !== nomination.id) {
                throw new common_1.BadRequestException(
                    `A nomination already exists for this committee in category "${newCategory}" for this contest.`,
                );
            }
        }

        return this.prisma.sharadSammanNomination.update({
            where: { id: Number(id) },
            data: {
                category: newCategory,
                title: dto.title !== undefined ? dto.title?.trim() || null : nomination.title,
                description: dto.description !== undefined ? dto.description?.trim() || null : nomination.description,
            },
            include: {
                committee: true,
                contest: true,
            },
        });
    }

    /**
     * Transition nomination status with validation, rejection reason enforcement,
     * and immutable candidate snapshot capture on SHORTLISTED transition.
     */
    async changeNominationStatus(id, newStatus, reason, reviewNotes, actor) {
        const nomination = await this.prisma.sharadSammanNomination.findUnique({
            where: { id: Number(id) },
            include: { committee: true, contest: true },
        });

        if (!nomination) {
            throw new common_1.NotFoundException(`Nomination #${id} not found.`);
        }

        if (nomination.status === newStatus) {
            return nomination;
        }

        const validTargets = ALLOWED_TRANSITIONS[nomination.status] || [];
        if (!validTargets.includes(newStatus)) {
            throw new common_1.BadRequestException(
                `Invalid state transition: Cannot move nomination from "${nomination.status}" to "${newStatus}". Allowed targets: ${validTargets.join(', ')}`,
            );
        }

        if (newStatus === database_1.NominationStatus.REJECTED && (!reason || !reason.trim())) {
            throw new common_1.BadRequestException('A rejection reason is required when rejecting a nomination.');
        }

        const data = {
            status: newStatus,
            updatedAt: new Date(),
        };

        if (reviewNotes !== undefined && reviewNotes !== null) {
            data.reviewNotes = reviewNotes.trim();
        }

        if (newStatus === database_1.NominationStatus.SUBMITTED) {
            data.submittedAt = new Date();
        } else if (newStatus === database_1.NominationStatus.UNDER_REVIEW) {
            data.reviewedAt = new Date();
            data.reviewedById = actor?.id ?? null;
        } else if (newStatus === database_1.NominationStatus.APPROVED) {
            data.approvedAt = new Date();
            data.approvedById = actor?.id ?? null;
        } else if (newStatus === database_1.NominationStatus.REJECTED) {
            data.rejectedAt = new Date();
            data.rejectedById = actor?.id ?? null;
            data.rejectionReason = reason.trim();
        } else if (newStatus === database_1.NominationStatus.SHORTLISTED) {
            data.shortlistedAt = new Date();
            data.shortlistedById = actor?.id ?? null;

            // Generate immutable snapshot of committee and candidate data
            const comm = nomination.committee;
            data.snapshotData = {
                committeeId: comm.id,
                committeeName: comm.committeeName,
                registrationNo: comm.registrationNo,
                establishedYear: comm.establishedYear,
                pujaType: comm.pujaType,
                pujaCategory: comm.pujaCategory,
                city: comm.city,
                state: comm.state,
                country: comm.country,
                venueName: comm.venueName,
                venueAddress: comm.venueAddress,
                pandalImage: comm.pandalImage,
                category: nomination.category || comm.pujaCategory,
                title: nomination.title || comm.committeeName,
                description: nomination.description || comm.committeeDescription,
                shortlistedAt: new Date().toISOString(),
                shortlistedBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : null,
            };
        }

        return this.prisma.sharadSammanNomination.update({
            where: { id: Number(id) },
            data,
            include: {
                committee: true,
                contest: true,
                reviewedBy: { select: { id: true, name: true, email: true } },
                approvedBy: { select: { id: true, name: true, email: true } },
                shortlistedBy: { select: { id: true, name: true, email: true } },
                rejectedBy: { select: { id: true, name: true, email: true } },
            },
        });
    }

    /**
     * Contest helper list
     */
    async listContests() {
        return this.prisma.contest.findMany({
            orderBy: [{ year: 'desc' }, { name: 'asc' }],
        });
    }

    /**
     * Search puja committees for nomination creation
     */
    async searchCommittees(search) {
        const term = (search || '').trim();
        const where = {
            status: database_1.CommitteeStatus.APPROVED,
        };

        if (term) {
            where.OR = [
                { committeeName: { contains: term, mode: 'insensitive' } },
                { registrationNo: { contains: term, mode: 'insensitive' } },
                { city: { contains: term, mode: 'insensitive' } },
            ];
        }

        return this.prisma.pujaCommittee.findMany({
            where,
            take: 20,
            select: {
                id: true,
                committeeName: true,
                registrationNo: true,
                city: true,
                state: true,
                pujaCategory: true,
            },
            orderBy: { committeeName: 'asc' },
        });
    }

    /**
     * Get current active contest
     */
    async getActiveContest() {
        const active = await this.prisma.contest.findFirst({
            where: { status: database_1.ContestStatus.ACTIVE },
            orderBy: { year: 'desc' },
        });
        if (!active) {
            throw new common_1.NotFoundException('No active Sharad Samman contest found.');
        }
        return active;
    }

    /**
     * List nominations for a specific committee
     */
    async listCommitteeNominations(committeeId, query = {}) {
        const commId = Number(committeeId);
        const page = Math.max(1, Number(query.page) || 1);
        const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 15));
        const skip = (page - 1) * perPage;
        const sortDir = query.sortDir?.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const where = {
            pujaCommitteeId: commId,
        };

        if (query.status) {
            where.status = query.status;
        }

        if (query.search && query.search.trim()) {
            const term = query.search.trim();
            where.OR = [
                { title: { contains: term, mode: 'insensitive' } },
                { category: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
            ];
        }

        const [items, total, activeContest] = await Promise.all([
            this.prisma.sharadSammanNomination.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: sortDir },
                include: {
                    committee: {
                        select: {
                            id: true,
                            committeeName: true,
                            registrationNo: true,
                            city: true,
                            state: true,
                            venueName: true,
                            status: true,
                            pandalImage: true,
                        },
                    },
                    contest: {
                        select: {
                            id: true,
                            name: true,
                            year: true,
                            status: true,
                            endDate: true,
                        },
                    },
                },
            }),
            this.prisma.sharadSammanNomination.count({ where }),
            this.prisma.contest.findFirst({
                where: { status: database_1.ContestStatus.ACTIVE },
                orderBy: { year: 'desc' },
            }),
        ]);

        const lastPage = Math.max(1, Math.ceil(total / perPage));

        return {
            items,
            activeContest,
            pagination: {
                page,
                perPage,
                total,
                lastPage,
                hasPreviousPage: page > 1,
                hasNextPage: page < lastPage,
            },
        };
    }

    /**
     * Get nomination by ID scoped to committee ownership
     */
    async getCommitteeNomination(id, committeeId) {
        const nomination = await this.prisma.sharadSammanNomination.findUnique({
            where: { id: Number(id) },
            include: {
                committee: true,
                contest: true,
                reviewedBy: { select: { id: true, name: true, email: true } },
                approvedBy: { select: { id: true, name: true, email: true } },
                shortlistedBy: { select: { id: true, name: true, email: true } },
                rejectedBy: { select: { id: true, name: true, email: true } },
            },
        });

        if (!nomination) {
            throw new common_1.NotFoundException(`Nomination #${id} not found.`);
        }

        if (nomination.pujaCommitteeId !== Number(committeeId)) {
            throw new common_1.ForbiddenException('You can only access nominations belonging to your committee.');
        }

        return nomination;
    }

    /**
     * Create nomination directly by committee user
     */
    async createCommitteeNomination(dto, committeeId, actorId) {
        const commId = Number(committeeId);
        let contestId = dto.contestId ? Number(dto.contestId) : null;

        if (!contestId) {
            const activeContest = await this.getActiveContest();
            contestId = activeContest.id;
        }

        const [contest, committee] = await Promise.all([
            this.prisma.contest.findUnique({ where: { id: contestId } }),
            this.prisma.pujaCommittee.findUnique({ where: { id: commId } }),
        ]);

        if (!contest) {
            throw new common_1.NotFoundException(`Contest #${contestId} not found.`);
        }

        if (!committee) {
            throw new common_1.NotFoundException(`Puja Committee #${commId} not found.`);
        }

        const category = (dto.category || '').trim();
        if (!category) {
            throw new common_1.BadRequestException('Nomination award category is required.');
        }

        // Enforce uniqueness: one nomination per category per contest for this committee
        const existing = await this.prisma.sharadSammanNomination.findUnique({
            where: {
                contestId_pujaCommitteeId_category: {
                    contestId,
                    pujaCommitteeId: commId,
                    category,
                },
            },
        });

        if (existing) {
            throw new common_1.BadRequestException(
                `Your committee already has a nomination in category "${category}" for contest "${contest.name}".`,
            );
        }

        const submitNow = Boolean(dto.submitNow);
        const status = submitNow ? database_1.NominationStatus.SUBMITTED : database_1.NominationStatus.DRAFT;

        return this.prisma.sharadSammanNomination.create({
            data: {
                contestId,
                pujaCommitteeId: commId,
                category,
                title: dto.title?.trim() || null,
                description: dto.description?.trim() || null,
                status,
                submittedAt: submitNow ? new Date() : null,
                createdById: actorId ?? null,
            },
            include: {
                committee: {
                    select: {
                        id: true,
                        committeeName: true,
                        registrationNo: true,
                        city: true,
                        state: true,
                    },
                },
                contest: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                    },
                },
            },
        });
    }

    /**
     * Edit draft nomination by committee user
     */
    async updateCommitteeNomination(id, dto, committeeId) {
        const nomination = await this.getCommitteeNomination(id, committeeId);

        if (nomination.status !== database_1.NominationStatus.DRAFT) {
            throw new common_1.BadRequestException(
                `Only draft nominations can be edited. This nomination is currently in "${nomination.status}" status.`,
            );
        }

        let newCategory = nomination.category;
        if (dto.category !== undefined) {
            const trimmed = (dto.category || '').trim();
            if (!trimmed) {
                throw new common_1.BadRequestException('Nomination category cannot be empty.');
            }
            newCategory = trimmed;
        }

        if (newCategory !== nomination.category) {
            const existing = await this.prisma.sharadSammanNomination.findUnique({
                where: {
                    contestId_pujaCommitteeId_category: {
                        contestId: nomination.contestId,
                        pujaCommitteeId: nomination.pujaCommitteeId,
                        category: newCategory,
                    },
                },
            });

            if (existing && existing.id !== nomination.id) {
                throw new common_1.BadRequestException(
                    `Your committee already has a nomination in category "${newCategory}" for this contest.`,
                );
            }
        }

        const submitNow = Boolean(dto.submitNow);
        const data = {
            category: newCategory,
            title: dto.title !== undefined ? dto.title?.trim() || null : nomination.title,
            description: dto.description !== undefined ? dto.description?.trim() || null : nomination.description,
            updatedAt: new Date(),
        };

        if (submitNow) {
            data.status = database_1.NominationStatus.SUBMITTED;
            data.submittedAt = new Date();
        }

        return this.prisma.sharadSammanNomination.update({
            where: { id: Number(id) },
            data,
            include: {
                committee: true,
                contest: true,
            },
        });
    }

    /**
     * Submit draft nomination to admin review queue
     */
    async submitCommitteeNomination(id, committeeId) {
        const nomination = await this.getCommitteeNomination(id, committeeId);

        if (nomination.status !== database_1.NominationStatus.DRAFT) {
            throw new common_1.BadRequestException(
                `Only draft nominations can be submitted. Current status: ${nomination.status}`,
            );
        }

        if (!nomination.category) {
            throw new common_1.BadRequestException('Award category is required before submitting.');
        }

        return this.prisma.sharadSammanNomination.update({
            where: { id: Number(id) },
            data: {
                status: database_1.NominationStatus.SUBMITTED,
                submittedAt: new Date(),
                updatedAt: new Date(),
            },
            include: {
                committee: true,
                contest: true,
            },
        });
    }

    /**
     * Delete draft nomination
     */
    async deleteCommitteeDraft(id, committeeId) {
        const nomination = await this.getCommitteeNomination(id, committeeId);

        if (nomination.status !== database_1.NominationStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft nominations can be discarded.');
        }

        await this.prisma.sharadSammanNomination.delete({
            where: { id: Number(id) },
        });

        return { success: true, message: 'Draft nomination deleted successfully.' };
    }
};
exports.SharadSammanService = SharadSammanService;
exports.SharadSammanService = SharadSammanService = SharadSammanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], SharadSammanService);
var _a;
