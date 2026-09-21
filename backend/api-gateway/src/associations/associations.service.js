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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationsService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const xlsx_1 = require("xlsx");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const associations_dto_1 = require("./dto/associations.dto");
const EXCEL_FIELD_ALIASES = {
    name: ['name', 'association name', 'associationname'],
    description: ['description'],
    establishedYear: ['establishedyear', 'established year', 'year', 'established'],
    contactPersonName: ['contactpersonname', 'contact person name', 'contact person', 'contactperson'],
    designation: ['designation'],
    email: ['email', 'contact email'],
    mobile: ['mobile', 'phone'],
    website: ['website'],
    socialLinks: ['sociallinks', 'social links'],
    country: ['country'],
    state: ['state', 'region', 'state / region'],
    city: ['city'],
    postalCode: ['postalcode', 'postal code', 'zip'],
    address: ['address', 'full address'],
    logoImage: ['logoimage', 'logo image'],
    coverImage: ['coverimage', 'cover image'],
};
const DIRECTORY_STATUS = database_1.AssociationStatus.APPROVED;
const LIST_SELECT = {
    id: true,
    registrationNo: true,
    associationId: true,
    name: true,
    establishedYear: true,
    description: true,
    country: true,
    state: true,
    city: true,
    postalCode: true,
    logoImage: true,
    coverImage: true,
    status: true,
    approvedById: true,
    approvedAt: true,
    createdAt: true,
    approvedBy: { select: { id: true, name: true } },
};
/**
 * Gateway-local directory for approved associations. Uses the
 * dedicated `Association` model (not PujaCommittee).
 */
let AssociationsService = class AssociationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** Sequential, year-scoped reference number matching the legacy format. */
    async nextRegistrationNo() {
        const year = new Date().getFullYear();
        const suffix = (0, node_crypto_1.randomBytes)(4).toString('hex').toUpperCase();
        return `DGC-A-${year}-${suffix}`;
    }
    toPublicAssociation(row, build) {
        const base = {
            id: row.id,
            registrationNo: row.registrationNo,
            associationId: row.associationId,
            name: row.name,
            establishedYear: row.establishedYear,
            description: row.description,
            country: row.country,
            state: row.state,
            city: row.city,
            postalCode: row.postalCode,
            logoImage: row.logoImage,
            coverImage: row.coverImage,
            status: row.status,
            verification: {
                verified: row.status === DIRECTORY_STATUS,
                verifiedAt: row.approvedAt,
                verifiedBy: row.approvedBy ? { id: row.approvedBy.id, name: row.approvedBy.name } : null,
            },
        };
        if (build?.withContact) {
            return {
                ...base,
                contactPersonName: row.contactPersonName,
                designation: row.designation,
                email: row.email,
                mobile: row.mobile,
                website: row.website,
                socialLinks: row.socialLinks,
                address: row.address,
            };
        }
        return base;
    }
    /** Public directory listing. Only APPROVED, non-deleted associations. */
    async publicList(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
            deletedAt: null,
            status: DIRECTORY_STATUS,
            ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
            ...(query.state ? { state: { equals: query.state, mode: 'insensitive' } } : {}),
            ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { associationId: { contains: query.search, mode: 'insensitive' } },
                        { registrationNo: { contains: query.search, mode: 'insensitive' } },
                        { city: { contains: query.search, mode: 'insensitive' } },
                        { country: { contains: query.search, mode: 'insensitive' } },
                        { state: { contains: query.search, mode: 'insensitive' } },
                        { description: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.association.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy ?? 'name']: 'asc' },
                select: LIST_SELECT,
            }),
            this.prisma.association.count({ where }),
        ]);
        return (0, shared_1.paginate)(rows.map((row) => this.toPublicAssociation(row)), page, perPage, total);
    }
    /** Distinct values for the public directory filters, derived from directory entries. */
    async filterOptions() {
        const where = { deletedAt: null, status: DIRECTORY_STATUS };
        const [countries, states, cities] = await this.prisma.$transaction([
            this.prisma.association.findMany({ where, distinct: ['country'], select: { country: true }, orderBy: { country: 'asc' } }),
            this.prisma.association.findMany({ where, distinct: ['state'], select: { state: true }, orderBy: { state: 'asc' } }),
            this.prisma.association.findMany({ where, distinct: ['city'], select: { city: true }, orderBy: { city: 'asc' } }),
        ]);
        const values = (rows, key) => rows.map((row) => row[key]).filter((value) => Boolean(value));
        return {
            countries: values(countries, 'country'),
            states: values(states, 'state'),
            cities: values(cities, 'city'),
        };
    }
    /** Single public association profile. Contact details are included here only. */
    async publicProfile(id) {
        const row = await this.prisma.association.findFirst({
            where: { id, deletedAt: null, status: DIRECTORY_STATUS },
            select: {
                ...LIST_SELECT,
                contactPersonName: true,
                designation: true,
                email: true,
                mobile: true,
                website: true,
                socialLinks: true,
                address: true,
            },
        });
        if (!row) {
            throw new common_1.NotFoundException('No association found in the public directory.');
        }
        return this.toPublicAssociation(row, { withContact: true });
    }
    /** Public: subscribe to updates for an APPROVED association. */
    async subscribe(id, body) {
        const row = await this.prisma.association.findFirst({
            where: { id, deletedAt: null, status: DIRECTORY_STATUS },
            select: { id: true },
        });
        if (!row) {
            throw new common_1.NotFoundException('No association found in the public directory.');
        }
        const email = String(body.email).trim().toLowerCase();
        await this.prisma.associationSubscriber.upsert({
            where: { associationId_email: { associationId: id, email } },
            update: { name: body.name?.trim() || null },
            create: { associationId: id, email, name: body.name?.trim() || null },
        });
        return { success: true, email };
    }
    /** Public: unsubscribe from updates for an association. */
    async unsubscribe(id, email) {
        const emailNormalized = String(email).trim().toLowerCase();
        await this.prisma.associationSubscriber.deleteMany({
            where: { associationId: id, email: emailNormalized },
        });
        return { success: true, email: emailNormalized };
    }
    /** Admin convenience: create a directory entry entry that enters the review workflow as PENDING. */
    async adminCreate(payload) {
        const data = {
            name: payload.name,
            description: payload.description,
            establishedYear: payload.establishedYear ?? null,
            contactPersonName: payload.contactPersonName,
            designation: payload.designation,
            email: String(payload.email).toLowerCase(),
            mobile: payload.mobile,
            website: payload.website ?? null,
            socialLinks: payload.socialLinks ?? null,
            country: payload.country,
            state: payload.state,
            city: payload.city,
            postalCode: payload.postalCode,
            address: payload.address,
            logoImage: payload.logoImage ?? null,
            coverImage: payload.coverImage ?? null,
            status: database_1.AssociationStatus.PENDING,
            registrationNo: await this.nextRegistrationNo(),
        };
        try {
            const created = await this.prisma.association.create({ data });
            return { id: created.id, registrationNo: created.registrationNo, status: created.status };
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'association');
        }
    }
    /** Admin: update an association */
    async adminUpdate(id, payload) {
        const data = {};
        const fields = [
            'name', 'description', 'establishedYear', 'contactPersonName', 'designation',
            'email', 'mobile', 'website', 'socialLinks', 'country', 'state', 'city',
            'postalCode', 'address', 'logoImage', 'coverImage'
        ];
        for (const field of fields) {
            if (payload[field] !== undefined && payload[field] !== '') {
                data[field] = field === 'email' ? String(payload[field]).toLowerCase() : payload[field];
            }
        }
        if (payload.establishedYear !== undefined && payload.establishedYear !== '') {
            data.establishedYear = Number(payload.establishedYear);
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const updated = await tx.association.update({
                    where: { id },
                    data,
                });
                if (Object.keys(data).length > 0 && updated.status === database_1.AssociationStatus.APPROVED) {
                    const subscribers = await tx.associationSubscriber.findMany({
                        where: { associationId: id },
                        select: { email: true, name: true },
                    });
                    if (subscribers.length > 0) {
                        await tx.notificationLog.createMany({
                            data: subscribers.map((subscriber) => ({
                                channel: 'EMAIL',
                                recipient: subscriber.email,
                                template: 'association_updated',
                                subject: `${updated.name} has been updated in the association directory`,
                                payload: {
                                    associationId: id,
                                    associationName: updated.name,
                                    registrationNo: updated.associationId,
                                    name: subscriber.name ?? null,
                                },
                            })),
                        });
                    }
                }
                return updated;
            });
        }
        catch (error) {
            (0, shared_1.translatePrismaError)(error, 'association');
        }
    }
    /** Admin: change status (review workflow) */
    async adminChangeStatus(id, status, reason, actorId) {
        const association = await this.prisma.association.findFirst({
            where: { id, deletedAt: null },
            select: { id: true, status: true, name: true, associationId: true },
        });
        if (!association) {
            throw new common_1.NotFoundException(`No association exists with id ${id}.`);
        }
        if (association.status === status) {
            throw new common_1.BadRequestException(`This association is already ${status}.`);
        }
        const allowedTransitions = {
            PENDING: ['UNDER_REVIEW', 'REJECTED'],
            UNDER_REVIEW: ['APPROVED', 'REJECTED'],
            APPROVED: ['INACTIVE', 'REJECTED'],
            REJECTED: ['PENDING'],
            INACTIVE: ['PENDING', 'APPROVED'],
        };
        if (!allowedTransitions[association.status]?.includes(status)) {
            throw new common_1.BadRequestException(`An association cannot move from ${association.status} to ${status}.`);
        }
        if (status === database_1.AssociationStatus.REJECTED && !reason?.trim()) {
            throw new common_1.BadRequestException('A reason is required when rejecting an association.');
        }
        const now = new Date();
        const updateData = {
            status,
            ...(status === database_1.AssociationStatus.UNDER_REVIEW && { reviewedById: actorId, reviewedAt: now }),
            ...(status === database_1.AssociationStatus.APPROVED && { approvedById: actorId, approvedAt: now }),
            ...(status === database_1.AssociationStatus.REJECTED && { rejectedById: actorId, rejectedAt: now, rejectionReason: reason }),
        };
        await this.prisma.$transaction(async (tx) => {
            await tx.association.update({
                where: { id },
                data: updateData,
            });
            await tx.associationStatusHistory.create({
                data: {
                    associationId: id,
                    previousStatus: association.status,
                    newStatus: status,
                    reason: reason ?? null,
                    changedById: actorId,
                },
            });
            if (status === database_1.AssociationStatus.APPROVED) {
                const subscribers = await tx.associationSubscriber.findMany({
                    where: { associationId: id },
                    select: { email: true, name: true },
                });
                if (subscribers.length > 0) {
                    await tx.notificationLog.createMany({
                        data: subscribers.map((subscriber) => ({
                            channel: 'EMAIL',
                            recipient: subscriber.email,
                            template: 'association_approved',
                            subject: `${association.name} is now verified in the association directory`,
                            payload: {
                                associationId: id,
                                associationName: association.name,
                                registrationNo: association.associationId,
                                name: subscriber.name ?? null,
                            },
                        })),
                    });
                }
            }
        });
        return { id, status };
    }
    /** Admin: list all associations with filters */
    async adminList(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const statuses = query.status
            ? String(query.status).split(',').map((s) => s.trim()).filter(Boolean)
            : [];
        const where = {
            deletedAt: null,
            ...(statuses.length ? { status: { in: statuses } } : {}),
            ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
            ...(query.state ? { state: { equals: query.state, mode: 'insensitive' } } : {}),
            ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { associationId: { contains: query.search, mode: 'insensitive' } },
                        { registrationNo: { contains: query.search, mode: 'insensitive' } },
                        { email: { contains: query.search, mode: 'insensitive' } },
                        { contactPersonName: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.association.findMany({
                where,
                skip,
                take,
                orderBy: { [query.sortBy ?? 'createdAt']: query.sortDir ?? 'desc' },
                select: {
                    id: true,
                    registrationNo: true,
                    associationId: true,
                    name: true,
                    establishedYear: true,
                    description: true,
                    country: true,
                    state: true,
                    city: true,
                    postalCode: true,
                    logoImage: true,
                    coverImage: true,
                    status: true,
                    contactPersonName: true,
                    designation: true,
                    email: true,
                    mobile: true,
                    website: true,
                    createdAt: true,
                    approvedAt: true,
                    rejectedAt: true,
                    approvedBy: { select: { id: true, name: true } },
                    rejectedBy: { select: { id: true, name: true } },
                },
            }),
            this.prisma.association.count({ where }),
        ]);
        return (0, shared_1.paginate)(rows, page, perPage, total);
    }
    /** Admin: get single association */
    async adminGet(id) {
        const row = await this.prisma.association.findFirst({
            where: { id, deletedAt: null },
            select: {
                id: true,
                registrationNo: true,
                associationId: true,
                name: true,
                description: true,
                establishedYear: true,
                contactPersonName: true,
                designation: true,
                email: true,
                mobile: true,
                website: true,
                socialLinks: true,
                country: true,
                state: true,
                city: true,
                postalCode: true,
                address: true,
                logoImage: true,
                coverImage: true,
                status: true,
                approvedById: true,
                approvedAt: true,
                rejectedById: true,
                rejectedAt: true,
                rejectionReason: true,
                reviewedById: true,
                reviewedAt: true,
                createdAt: true,
                updatedAt: true,
                approvedBy: { select: { id: true, name: true } },
                rejectedBy: { select: { id: true, name: true } },
                reviewedBy: { select: { id: true, name: true } },
                histories: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        previousStatus: true,
                        newStatus: true,
                        reason: true,
                        changedById: true,
                        createdAt: true,
                        changedBy: { select: { id: true, name: true } },
                    },
                },
            },
        });
        if (!row) {
            throw new common_1.NotFoundException(`No association exists with id ${id}.`);
        }
        return row;
    }
    /** Admin convenience: bulk-import directory entries (all created as PENDING). */
    async adminImport(items) {
        const succeeded = [];
        const failed = [];
        for (const row of items) {
            try {
                const created = await this.adminCreate(row);
                succeeded.push(created);
            }
            catch (error) {
                failed.push({
                    name: row.name,
                    email: row.email,
                    message: error instanceof Error ? error.message : 'Failed to create association.',
                });
            }
        }
        return {
            total: items.length,
            succeeded: succeeded.length,
            failed: failed.length,
            failures: failed,
        };
    }
    /** Admin: bulk-import directory entries from an uploaded Excel workbook. */
    async adminImportExcel(buffer) {
        const workbook = xlsx_1.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new common_1.BadRequestException('The uploaded workbook contains no sheets.');
        }
        const sourceRows = xlsx_1.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
        if (sourceRows.length === 0) {
            throw new common_1.BadRequestException('The spreadsheet has no association rows.');
        }
        if (sourceRows.length > 100) {
            throw new common_1.BadRequestException('Maximum 100 associations per batch.');
        }
        const items = [];
        const failures = [];
        for (const source of sourceRows) {
            const row = this.mapExcelRow(source);
            const name = String(row.name ?? '').trim();
            const email = String(row.email ?? '').trim();
            if (!name || !email) {
                failures.push({ name: name || '(unnamed)', email, message: 'Row is missing required columns (Association Name / Email).' });
                continue;
            }
            const dto = (0, class_transformer_1.plainToInstance)(associations_dto_1.CreateAssociationDto, row);
            const errors = await (0, class_validator_1.validate)(dto);
            if (errors.length > 0) {
                const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
                failures.push({ name, email, message: messages.join('; ') });
                continue;
            }
            items.push(dto);
        }
        const result = await this.adminImport(items);
        return {
            total: result.total + failures.length,
            succeeded: result.succeeded,
            failed: result.failed + failures.length,
            failures: [...result.failures, ...failures],
        };
    }
    /** Maps one spreadsheet row (keyed by header label) onto CreateAssociationDto fields. */
    mapExcelRow(source) {
        const normalize = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
        const fieldByHeader = new Map();
        for (const [field, headers] of Object.entries(EXCEL_FIELD_ALIASES)) {
            for (const header of headers) {
                fieldByHeader.set(normalize(header), field);
            }
        }
        const raw = {};
        for (const [header, value] of Object.entries(source)) {
            const field = fieldByHeader.get(normalize(header));
            if (field) {
                raw[field] = value;
            }
        }
        const mapped = {};
        for (const [field, value] of Object.entries(raw)) {
            if (field === 'establishedYear') {
                mapped[field] = String(value).trim() === '' ? undefined : Number(value);
            }
            else if (field === 'socialLinks') {
                const text = String(value).trim();
                if (text) {
                    try {
                        mapped[field] = JSON.parse(text);
                    }
                    catch {
                        mapped[field] = {};
                    }
                }
            }
            else {
                mapped[field] = String(value).trim();
            }
        }
        return mapped;
    }
};
exports.AssociationsService = AssociationsService;
exports.AssociationsService = AssociationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AssociationsService);