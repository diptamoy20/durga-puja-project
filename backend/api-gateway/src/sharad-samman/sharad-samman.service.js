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
    [database_1.NominationStatus.APPROVED]: [database_1.NominationStatus.SHORTLISTED],
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
     * Scoped strictly to the selected or active contest.
     */
    async getDashboardStats(contestId) {
        let selectedContest = null;

        if (contestId) {
            selectedContest = await this.prisma.contest.findUnique({
                where: { id: Number(contestId) },
            });
        }

        if (!selectedContest) {
            selectedContest = await this.prisma.contest.findFirst({
                where: { status: database_1.ContestStatus.ACTIVE },
                orderBy: { year: 'desc' },
            });
        }

        if (!selectedContest) {
            selectedContest = await this.prisma.contest.findFirst({
                orderBy: { year: 'desc' },
            });
        }

        const stats = {
            total: 0,
            draft: 0,
            submitted: 0,
            underReview: 0,
            approved: 0,
            rejected: 0,
            shortlisted: 0,
        };

        if (selectedContest) {
            const counts = await this.prisma.sharadSammanNomination.groupBy({
                by: ['status'],
                where: { contestId: selectedContest.id },
                _count: { id: true },
            });

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
        }

        return {
            stats,
            activeContest: selectedContest,
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

        if (contest.status !== database_1.ContestStatus.ACTIVE) {
            throw new common_1.BadRequestException(
                `Nominations can only be created for ACTIVE contests. Contest "${contest.name}" is currently ${contest.status}.`,
            );
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
            throw new common_1.ConflictException(
                `A nomination already exists for committee "${committee.committeeName}" in category "${category}" for contest "${contest.name}".`,
            );
        }

        const photos = Array.isArray(dto.photos) ? dto.photos.filter(Boolean) : [];
        const initialSnapshot = {
            ...(photos.length > 0 ? { photos } : {}),
            ...(dto.pandalImage ? { pandalImage: dto.pandalImage } : {}),
        };

        try {
            return await this.prisma.sharadSammanNomination.create({
                data: {
                    contestId: dto.contestId,
                    pujaCommitteeId: dto.pujaCommitteeId,
                    category,
                    title: dto.title?.trim() || null,
                    description: dto.description?.trim() || null,
                    snapshotData: Object.keys(initialSnapshot).length > 0 ? initialSnapshot : null,
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
                            pandalImage: true,
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
        } catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.ConflictException(
                    `A nomination already exists for committee "${committee.committeeName}" in category "${category}" for contest "${contest.name}".`,
                );
            }
            throw err;
        }
    }

    /**
     * Edit nomination details (category, title, description, photos)
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
                throw new common_1.ConflictException(
                    `A nomination already exists for this committee in category "${newCategory}" for this contest.`,
                );
            }
        }

        const currentSnap = (nomination.snapshotData && typeof nomination.snapshotData === 'object') ? { ...nomination.snapshotData } : {};
        if (dto.photos !== undefined) {
            currentSnap.photos = Array.isArray(dto.photos) ? dto.photos.filter(Boolean) : [];
        }
        if (dto.pandalImage !== undefined) {
            currentSnap.pandalImage = dto.pandalImage;
        }

        try {
            return await this.prisma.sharadSammanNomination.update({
                where: { id: Number(id) },
                data: {
                    category: newCategory,
                    title: dto.title !== undefined ? dto.title?.trim() || null : nomination.title,
                    description: dto.description !== undefined ? dto.description?.trim() || null : nomination.description,
                    snapshotData: Object.keys(currentSnap).length > 0 ? currentSnap : null,
                },
                include: {
                    committee: true,
                    contest: true,
                },
            });
        } catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.ConflictException(
                    `A nomination already exists for this committee in category "${newCategory}" for this contest.`,
                );
            }
            throw err;
        }
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
            const prevSnap = (nomination.snapshotData && typeof nomination.snapshotData === 'object') ? nomination.snapshotData : {};
            const snapPhotos = Array.isArray(prevSnap.photos) ? prevSnap.photos : [];
            const commPhotos = [prevSnap.pandalImage, comm.pandalImage].filter(Boolean);
            const allPhotos = Array.from(new Set([...commPhotos, ...snapPhotos])).filter(Boolean);

            data.snapshotData = {
                ...prevSnap,
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
                pandalImage: prevSnap.pandalImage || comm.pandalImage,
                photos: allPhotos,
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
     * Contest helper list with nomination counts
     */
    async listContests() {
        return this.prisma.contest.findMany({
            include: {
                _count: {
                    select: { nominations: true },
                },
            },
            orderBy: [{ year: 'desc' }, { name: 'asc' }],
        });
    }

    /**
     * Get single contest by ID with nomination count
     */
    async getContest(id) {
        const contest = await this.prisma.contest.findUnique({
            where: { id: Number(id) },
            include: {
                _count: {
                    select: { nominations: true },
                },
            },
        });

        if (!contest) {
            throw new common_1.NotFoundException(`Contest #${id} not found.`);
        }

        return contest;
    }

    /**
     * Create a new contest
     */
    async createContest(dto) {
        const name = (dto.name || '').trim();
        if (!name) {
            throw new common_1.BadRequestException('Contest Name is required.');
        }

        const year = Number(dto.year);
        if (!year || isNaN(year)) {
            throw new common_1.BadRequestException('Valid Contest Year is required.');
        }

        if (!dto.startDate || !dto.endDate) {
            throw new common_1.BadRequestException('Start Date and Last Date are required.');
        }

        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Invalid Start Date or Last Date format.');
        }

        if (startDate > endDate) {
            throw new common_1.BadRequestException('Start Date cannot be after Last Date.');
        }

        // Prevent duplicate Contest Name + Year using existing unique constraint
        const duplicate = await this.prisma.contest.findFirst({
            where: {
                year,
                name: { equals: name, mode: 'insensitive' },
            },
        });

        if (duplicate) {
            throw new common_1.BadRequestException(
                `A contest with name "${name}" and year ${year} already exists.`,
            );
        }

        return this.prisma.contest.create({
            data: {
                name,
                year,
                description: dto.description?.trim() || null,
                startDate,
                endDate,
                status: dto.status || database_1.ContestStatus.DRAFT,
            },
            include: {
                _count: {
                    select: { nominations: true },
                },
            },
        });
    }

    /**
     * Update an existing contest in-place
     */
    async updateContest(id, dto) {
        const contestId = Number(id);
        const existing = await this.prisma.contest.findUnique({
            where: { id: contestId },
        });

        if (!existing) {
            throw new common_1.NotFoundException(`Contest #${id} not found.`);
        }

        const targetName = dto.name !== undefined ? dto.name.trim() : existing.name;
        const targetYear = dto.year !== undefined ? Number(dto.year) : existing.year;

        if (!targetName) {
            throw new common_1.BadRequestException('Contest Name cannot be empty.');
        }

        if (!targetYear || isNaN(targetYear)) {
            throw new common_1.BadRequestException('Valid Contest Year is required.');
        }

        const startDate = dto.startDate !== undefined ? new Date(dto.startDate) : existing.startDate;
        const endDate = dto.endDate !== undefined ? new Date(dto.endDate) : existing.endDate;

        if (startDate && endDate) {
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new common_1.BadRequestException('Invalid Start Date or Last Date format.');
            }
            if (startDate > endDate) {
                throw new common_1.BadRequestException('Start Date cannot be after Last Date.');
            }
        }

        // Duplicate check if name or year is changing
        if (targetName !== existing.name || targetYear !== existing.year) {
            const duplicate = await this.prisma.contest.findFirst({
                where: {
                    id: { not: contestId },
                    year: targetYear,
                    name: { equals: targetName, mode: 'insensitive' },
                },
            });

            if (duplicate) {
                throw new common_1.BadRequestException(
                    `Another contest with name "${targetName}" and year ${targetYear} already exists.`,
                );
            }
        }

        const data = {
            updatedAt: new Date(),
        };

        if (dto.name !== undefined) data.name = targetName;
        if (dto.year !== undefined) data.year = targetYear;
        if (dto.description !== undefined) data.description = dto.description?.trim() || null;
        if (dto.startDate !== undefined) data.startDate = startDate;
        if (dto.endDate !== undefined) data.endDate = endDate;
        if (dto.status !== undefined) data.status = dto.status;

        return this.prisma.contest.update({
            where: { id: contestId },
            data,
            include: {
                _count: {
                    select: { nominations: true },
                },
            },
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

        if (contest.status !== database_1.ContestStatus.ACTIVE) {
            throw new common_1.BadRequestException(
                `Nominations can only be submitted for ACTIVE contests. Contest "${contest.name}" is currently ${contest.status}.`,
            );
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
            throw new common_1.ConflictException(
                'You have already submitted a nomination for this category in this contest.',
            );
        }

        const submitNow = Boolean(dto.submitNow);
        const status = submitNow ? database_1.NominationStatus.SUBMITTED : database_1.NominationStatus.DRAFT;

        const photos = Array.isArray(dto.photos) ? dto.photos.filter(Boolean) : [];
        const initialSnapshot = {
            ...(photos.length > 0 ? { photos } : {}),
            ...(dto.pandalImage ? { pandalImage: dto.pandalImage } : {}),
        };

        try {
            return await this.prisma.sharadSammanNomination.create({
                data: {
                    contestId,
                    pujaCommitteeId: commId,
                    category,
                    title: dto.title?.trim() || null,
                    description: dto.description?.trim() || null,
                    snapshotData: Object.keys(initialSnapshot).length > 0 ? initialSnapshot : null,
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
                            pandalImage: true,
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
        } catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.ConflictException(
                    'You have already submitted a nomination for this category in this contest.',
                );
            }
            throw err;
        }
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
                throw new common_1.ConflictException(
                    'You have already submitted a nomination for this category in this contest.',
                );
            }
        }

        const currentSnap = (nomination.snapshotData && typeof nomination.snapshotData === 'object') ? { ...nomination.snapshotData } : {};
        if (dto.photos !== undefined) {
            currentSnap.photos = Array.isArray(dto.photos) ? dto.photos.filter(Boolean) : [];
        }
        if (dto.pandalImage !== undefined) {
            currentSnap.pandalImage = dto.pandalImage;
        }

        const submitNow = Boolean(dto.submitNow);
        const data = {
            category: newCategory,
            title: dto.title !== undefined ? dto.title?.trim() || null : nomination.title,
            description: dto.description !== undefined ? dto.description?.trim() || null : nomination.description,
            snapshotData: Object.keys(currentSnap).length > 0 ? currentSnap : null,
            updatedAt: new Date(),
        };

        if (submitNow) {
            data.status = database_1.NominationStatus.SUBMITTED;
            data.submittedAt = new Date();
        }

        try {
            return await this.prisma.sharadSammanNomination.update({
                where: { id: Number(id) },
                data,
                include: {
                    committee: true,
                    contest: true,
                },
            });
        } catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.ConflictException(
                    'You have already submitted a nomination for this category in this contest.',
                );
            }
            throw err;
        }
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

    /**
     * Compute effective closing date for a contest
     */
    computeEffectiveClosingDate(contest) {
        return contest.votingExtendedUntil
            ? new Date(contest.votingExtendedUntil)
            : (contest.votingEndDate
                ? new Date(contest.votingEndDate)
                : (contest.endDate ? new Date(contest.endDate) : null));
    }

    /**
     * Determine dynamic voting status based on dates & manual closing
     */
    resolveVotingStatus(contest) {
        if (contest.votingStatus === database_1.VotingStatus.CLOSED || contest.status === database_1.ContestStatus.CLOSED) {
            return database_1.VotingStatus.CLOSED;
        }

        const effectiveStart = contest.votingStartDate
            ? new Date(contest.votingStartDate)
            : (contest.startDate ? new Date(contest.startDate) : null);

        const effectiveEnd = this.computeEffectiveClosingDate(contest);

        if (!effectiveStart && !effectiveEnd) {
            return contest.votingStatus || database_1.VotingStatus.NOT_CONFIGURED;
        }

        const now = new Date();

        if (effectiveEnd && now >= effectiveEnd) {
            return database_1.VotingStatus.CLOSED;
        }
        if (effectiveStart && now < effectiveStart) {
            return database_1.VotingStatus.SCHEDULED;
        }
        if (contest.votingExtendedUntil) {
            return database_1.VotingStatus.EXTENDED;
        }
        if (contest.votingStatus === database_1.VotingStatus.ACTIVE || contest.status === database_1.ContestStatus.ACTIVE) {
            return database_1.VotingStatus.ACTIVE;
        }
        return database_1.VotingStatus.ACTIVE;
    }

    /**
     * List all contests with their voting status, dates, and shortlisted candidate count
     */
    async listVotingContests() {
        const contests = await this.prisma.contest.findMany({
            include: {
                _count: {
                    select: {
                        nominations: {
                            where: { status: { in: [database_1.NominationStatus.SHORTLISTED, database_1.NominationStatus.APPROVED] } },
                        },
                    },
                },
            },
            orderBy: [{ year: 'desc' }, { name: 'asc' }],
        });

        return contests.map((c) => {
            const effectiveClosingDate = this.computeEffectiveClosingDate(c);
            const computedStatus = this.resolveVotingStatus(c);

            return {
                id: c.id,
                name: c.name,
                year: c.year,
                description: c.description,
                contestStatus: c.status,
                votingStatus: computedStatus,
                storedVotingStatus: c.votingStatus,
                votingStartDate: c.votingStartDate,
                votingEndDate: c.votingEndDate,
                votingExtendedUntil: c.votingExtendedUntil,
                effectiveClosingDate,
                shortlistedCount: c._count.nominations,
            };
        });
    }

    /**
     * Get voting details for a specific contest
     */
    async getVotingContest(contestId) {
        const id = Number(contestId);
        const contest = await this.prisma.contest.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        nominations: {
                            where: { status: { in: [database_1.NominationStatus.SHORTLISTED, database_1.NominationStatus.APPROVED] } },
                        },
                    },
                },
            },
        });

        if (!contest) {
            throw new common_1.NotFoundException(`Contest #${contestId} not found.`);
        }

        const effectiveClosingDate = this.computeEffectiveClosingDate(contest);
        const computedStatus = this.resolveVotingStatus(contest);

        // Get candidate breakdown by category
        const categoryCounts = await this.prisma.sharadSammanNomination.groupBy({
            by: ['category'],
            where: {
                contestId: id,
                status: { in: [database_1.NominationStatus.SHORTLISTED, database_1.NominationStatus.APPROVED] },
            },
            _count: { id: true },
        });

        // Get nominations preview
        const shortlistedNominations = await this.prisma.sharadSammanNomination.findMany({
            where: {
                contestId: id,
                status: { in: [database_1.NominationStatus.SHORTLISTED, database_1.NominationStatus.APPROVED] },
            },
            select: {
                id: true,
                category: true,
                title: true,
                committee: {
                    select: {
                        id: true,
                        committeeName: true,
                        city: true,
                        state: true,
                        venueName: true,
                        pandalImage: true,
                    },
                },
                shortlistedAt: true,
            },
            orderBy: [{ category: 'asc' }, { id: 'asc' }],
        });

        return {
            id: contest.id,
            name: contest.name,
            year: contest.year,
            description: contest.description,
            contestStatus: contest.status,
            votingStatus: computedStatus,
            storedVotingStatus: contest.votingStatus,
            votingStartDate: contest.votingStartDate,
            votingEndDate: contest.votingEndDate,
            votingExtendedUntil: contest.votingExtendedUntil,
            effectiveClosingDate,
            shortlistedCount: contest._count.nominations,
            categoryStats: categoryCounts.map((g) => ({
                category: g.category,
                count: g._count.id,
            })),
            shortlistedNominations,
            votingStatistics: {
                totalVotes: 0,
                uniqueVoters: 0,
            },
        };
    }

    /**
     * Configure or start voting for a specific contest
     */
    async configureVoting(contestId, dto) {
        const id = Number(contestId);
        const contest = await this.prisma.contest.findUnique({
            where: { id },
        });

        if (!contest) {
            throw new common_1.NotFoundException(`Contest #${contestId} not found.`);
        }

        if (contest.votingStatus === database_1.VotingStatus.CLOSED) {
            throw new common_1.BadRequestException('Voting for this contest is CLOSED and cannot be modified or reconfigured.');
        }

        if (!dto.votingStartDate || !dto.votingEndDate) {
            throw new common_1.BadRequestException('Both Voting Start Date and Voting End Date are required.');
        }

        const startDate = new Date(dto.votingStartDate);
        const endDate = new Date(dto.votingEndDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format for Voting Start Date or Voting End Date.');
        }

        if (startDate >= endDate) {
            throw new common_1.BadRequestException('Voting Start Date must be strictly before Voting End Date.');
        }

        const now = new Date();
        let targetStatus = database_1.VotingStatus.SCHEDULED;
        if (startDate <= now && now < endDate) {
            targetStatus = database_1.VotingStatus.ACTIVE;
        } else if (now >= endDate) {
            targetStatus = database_1.VotingStatus.CLOSED;
        }

        const updated = await this.prisma.contest.update({
            where: { id },
            data: {
                votingStartDate: startDate,
                votingEndDate: endDate,
                votingExtendedUntil: null, // Reset any previous extension on fresh configuration
                votingStatus: targetStatus,
                status: (targetStatus === database_1.VotingStatus.ACTIVE || targetStatus === database_1.VotingStatus.SCHEDULED) ? database_1.ContestStatus.ACTIVE : contest.status,
                updatedAt: new Date(),
            },
        });

        return this.getVotingContest(updated.id);
    }

    /**
     * Extend voting for a specific contest
     */
    async extendVoting(contestId, dto) {
        const id = Number(contestId);
        const contest = await this.prisma.contest.findUnique({
            where: { id },
        });

        if (!contest) {
            throw new common_1.NotFoundException(`Contest #${contestId} not found.`);
        }

        if (contest.votingStatus === database_1.VotingStatus.CLOSED) {
            throw new common_1.BadRequestException('Voting for this contest is CLOSED and cannot be extended.');
        }

        if (!contest.votingStartDate || !contest.votingEndDate) {
            throw new common_1.BadRequestException('Voting has not been configured yet for this contest. Please configure voting start and end dates first.');
        }

        if (!dto.votingExtendedUntil) {
            throw new common_1.BadRequestException('Extended Until Date is required.');
        }

        const extendedUntil = new Date(dto.votingExtendedUntil);
        if (isNaN(extendedUntil.getTime())) {
            throw new common_1.BadRequestException('Invalid date format for Extended Until Date.');
        }

        const currentEffectiveEnd = this.computeEffectiveClosingDate(contest);
        if (currentEffectiveEnd && extendedUntil <= currentEffectiveEnd) {
            throw new common_1.BadRequestException(
                `Extension date must be strictly after the current effective closing date (${currentEffectiveEnd.toISOString()}).`,
            );
        }

        const now = new Date();
        let targetStatus = database_1.VotingStatus.EXTENDED;
        if (now >= extendedUntil) {
            targetStatus = database_1.VotingStatus.CLOSED;
        }

        const updated = await this.prisma.contest.update({
            where: { id },
            data: {
                votingExtendedUntil: extendedUntil,
                votingStatus: targetStatus,
                updatedAt: new Date(),
            },
        });

        return this.getVotingContest(updated.id);
    }

    /**
     * Close voting explicitly for a specific contest
     */
    async closeVoting(contestId) {
        const id = Number(contestId);
        const contest = await this.prisma.contest.findUnique({
            where: { id },
        });

        if (!contest) {
            throw new common_1.NotFoundException(`Contest #${contestId} not found.`);
        }

        if (contest.votingStatus === database_1.VotingStatus.CLOSED) {
            throw new common_1.BadRequestException('Voting for this contest is already CLOSED and cannot be modified.');
        }

        const updated = await this.prisma.contest.update({
            where: { id },
            data: {
                votingStatus: database_1.VotingStatus.CLOSED,
                updatedAt: new Date(),
            },
        });

        return this.getVotingContest(updated.id);
    }
};
exports.SharadSammanService = SharadSammanService;
exports.SharadSammanService = SharadSammanService = SharadSammanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], SharadSammanService);
var _a;
