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
var AuditService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
/**
 * Centralised audit trail, replacing Laravel's AuditLogService.
 *
 * Writes are best-effort: a failure to record history must never roll back or
 * reject the business operation that triggered it.
 */
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async record(input) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: input.userId,
                    action: input.action,
                    module: input.module,
                    auditableType: input.auditableType ?? null,
                    auditableId: input.auditableId ?? null,
                    description: input.description ?? null,
                    oldValues: input.oldValues ?? database_1.Prisma.DbNull,
                    newValues: input.newValues ?? database_1.Prisma.DbNull,
                    ipAddress: input.ipAddress ?? null,
                    userAgent: input.userAgent ?? null,
                },
            });
        }
        catch (error) {
            this.logger.warn(`Failed to write audit log (${input.module}/${input.action}): ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = query.search
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
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object])
], AuditService);
