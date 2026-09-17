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
var EventsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const node_crypto_1 = require("node:crypto");
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
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
};
let EventsService = EventsService_1 = class EventsService {
    prisma;
    logger = new common_1.Logger(EventsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    slugExists = async (slug) => {
        const found = await this.prisma.webinar.findUnique({ where: { slug }, select: { id: true } });
        return found !== null;
    };
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
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
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    /** Published, upcoming and live webinars for the public site. */
    async publicList() {
        return this.prisma.webinar.findMany({
            where: {
                deletedAt: null,
                isPublished: true,
                status: { in: [database_1.WebinarStatus.SCHEDULED, database_1.WebinarStatus.LIVE] },
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
                status: database_1.WebinarStatus.COMPLETED,
                OR: [{ replayVideoUrl: { not: null } }, { replayEmbedCode: { not: null } }],
            },
            select: PUBLIC_SELECT,
            orderBy: { scheduledStartTime: 'desc' },
        });
    }
    async findOne(id) {
        const webinar = await this.prisma.webinar.findFirst({
            where: { id, deletedAt: null },
            include: { _count: { select: { registrations: true } } },
        });
        if (!webinar)
            throw shared_1.ServiceException.notFound(`No webinar exists with id ${id}.`);
        return webinar;
    }
    async findBySlug(slug) {
        const webinar = await this.prisma.webinar.findFirst({
            where: { slug, deletedAt: null, isPublished: true },
            select: PUBLIC_SELECT,
        });
        if (!webinar)
            throw shared_1.ServiceException.notFound('That webinar is not available.');
        return webinar;
    }
    async create(payload) {
        const { data, actorId } = payload;
        const start = new Date(data.scheduledStartTime);
        const end = data.scheduledEndTime ? new Date(data.scheduledEndTime) : null;
        if (end && end <= start) {
            throw shared_1.ServiceException.badRequest('The end time must be after the start time.');
        }
        try {
            const webinar = await this.prisma.webinar.create({
                data: {
                    title: data.title,
                    slug: await (0, shared_1.uniqueSlug)(data.title, this.slugExists),
                    subtitle: data.subtitle ?? null,
                    description: data.description ?? null,
                    bannerImage: data.bannerImage ?? null,
                    speakers: data.speakers ?? database_1.Prisma.DbNull,
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
                    resources: data.resources ?? database_1.Prisma.DbNull,
                    status: database_1.WebinarStatus.SCHEDULED,
                    createdById: actorId,
                    updatedById: actorId,
                },
            });
            return webinar;
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'webinar');
        }
    }
    async update(payload) {
        const { id, data, actorId } = payload;
        const existing = await this.findOne(id);
        const start = data.scheduledStartTime
            ? new Date(data.scheduledStartTime)
            : existing.scheduledStartTime;
        const end = data.scheduledEndTime ? new Date(data.scheduledEndTime) : existing.scheduledEndTime;
        if (end && end <= start) {
            throw shared_1.ServiceException.badRequest('The end time must be after the start time.');
        }
        try {
            return await this.prisma.webinar.update({
                where: { id },
                data: {
                    title: data.title,
                    slug: data.title && data.title !== existing.title
                        ? await (0, shared_1.uniqueSlug)(data.title, this.slugExists)
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
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'webinar');
        }
    }
    async toggleStatus(payload) {
        const { id, status, actorId } = payload;
        await this.findOne(id);
        return this.prisma.webinar.update({
            where: { id },
            data: { status, updatedById: actorId },
        });
    }
    async remove(payload) {
        await this.findOne(payload.id);
        await this.prisma.webinar.update({
            where: { id: payload.id },
            data: { deletedAt: new Date(), updatedById: payload.actorId },
        });
        return { id: payload.id, deleted: true };
    }
    // -------------------------------------------------------------------------
    // RSVPs
    // -------------------------------------------------------------------------
    /**
     * Registers an attendee, enforcing the capacity limit and one RSVP per
     * email per webinar. Returns the join details, which are withheld from the
     * public webinar payload until someone has registered.
     */
    async createRsvp(data) {
        let webinarId = data.webinarId;
        if (!webinarId && data.slug) {
            const bySlug = await this.prisma.webinar.findFirst({
                where: { slug: data.slug, deletedAt: null, isPublished: true },
                select: { id: true },
            });
            if (!bySlug) {
                throw shared_1.ServiceException.notFound('That webinar is not available.');
            }
            webinarId = bySlug.id;
        }
        if (!webinarId) {
            throw shared_1.ServiceException.badRequest('A webinar id or slug is required.');
        }
        const webinar = await this.prisma.webinar.findFirst({
            where: { id: webinarId, deletedAt: null, isPublished: true },
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
        if (!webinar)
            throw shared_1.ServiceException.notFound('That webinar is not available.');
        if (webinar.status === database_1.WebinarStatus.CANCELLED) {
            throw shared_1.ServiceException.badRequest('This webinar has been cancelled.');
        }
        if (webinar.status === database_1.WebinarStatus.COMPLETED) {
            throw shared_1.ServiceException.badRequest('This webinar has already taken place.');
        }
        const existing = await this.prisma.webinarRegistration.findUnique({
            where: { webinarId_email: { webinarId, email: data.email } },
            select: { id: true, registrationCode: true },
        });
        if (existing) {
            throw shared_1.ServiceException.conflict('You are already registered for this webinar.', {
                registrationCode: existing.registrationCode,
            });
        }
        if (webinar.maxAttendees !== null && webinar._count.registrations >= webinar.maxAttendees) {
            throw shared_1.ServiceException.conflict('This webinar has reached its attendee limit.');
        }
        try {
            const registration = await this.prisma.webinarRegistration.create({
                data: {
                    webinarId,
                    userId: data.userId ?? null,
                    name: data.name,
                    email: data.email,
                    phone: data.phone ?? null,
                    organization: data.organization ?? null,
                    cityCountry: data.cityCountry ?? null,
                    registrationCode: `WR-${(0, node_crypto_1.randomBytes)(4).toString('hex').toUpperCase()}`,
                    status: database_1.RsvpStatus.REGISTERED,
                },
            });
            this.logger.log(`RSVP ${registration.registrationCode} for webinar #${webinarId}`);
            return {
                registrationCode: registration.registrationCode,
                webinarTitle: webinar.title,
                scheduledStartTime: webinar.scheduledStartTime,
                joinUrl: webinar.liveMeetingUrl ?? webinar.liveStreamUrl,
                passcode: webinar.liveMeetingPasscode,
            };
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'registration');
        }
    }
    async findAllRsvps(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
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
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    async updateRsvpStatus(payload) {
        const { id, status, notes } = payload;
        const existing = await this.prisma.webinarRegistration.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing)
            throw shared_1.ServiceException.notFound(`No registration exists with id ${id}.`);
        return this.prisma.webinarRegistration.update({
            where: { id },
            data: {
                status,
                notes: notes ?? undefined,
                attendedAt: status === database_1.RsvpStatus.ATTENDED ? new Date() : undefined,
            },
        });
    }
    /**
     * Stores a browser web-push subscription.
     *
     * Upserts on the endpoint so a returning browser refreshes its keys instead
     * of accumulating duplicate rows.
     */
    async subscribeToPush(payload) {
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
    async refreshLiveStatuses() {
        const now = new Date();
        const [live, completed] = await this.prisma.$transaction([
            this.prisma.webinar.updateMany({
                where: {
                    deletedAt: null,
                    status: database_1.WebinarStatus.SCHEDULED,
                    scheduledStartTime: { lte: now },
                },
                data: { status: database_1.WebinarStatus.LIVE },
            }),
            this.prisma.webinar.updateMany({
                where: {
                    deletedAt: null,
                    status: database_1.WebinarStatus.LIVE,
                    scheduledEndTime: { not: null, lte: now },
                },
                data: { status: database_1.WebinarStatus.COMPLETED },
            }),
        ]);
        return { live: live.count, completed: completed.count };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], EventsService);
