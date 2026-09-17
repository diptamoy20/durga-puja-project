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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
/**
 * The single Prisma client per service process.
 *
 * Lives at `backend/database/prisma.service.ts` per the required structure and
 * is re-exported from `src/index.ts` so services can import `@dpgc/database`.
 */
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'warn' },
                { emit: 'event', level: 'error' },
            ],
            errorFormat: 'minimal',
        });
    }
    async onModuleInit() {
        // Log slow queries only; logging every query drowns out real signal.
        this.$on('query', (event) => {
            if (event.duration >= 500) {
                this.logger.warn(`Slow query (${event.duration}ms): ${event.query}`);
            }
        });
        this.$on('error', (event) => {
            this.logger.error(event.message);
        });
        try {
            await this.$connect();
            this.logger.log('Connected to PostgreSQL');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Could not connect to PostgreSQL. Check DATABASE_URL in backend/.env. ${message}`);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    /** Readiness probe backing the gateway's /health endpoint. */
    async healthCheck() {
        const started = Date.now();
        await this.$queryRaw `SELECT 1`;
        return { ok: true, latencyMs: Date.now() - started };
    }
    /**
     * Closes the Prisma pool when Nest shuts down. Called from `main.ts` so a
     * Ctrl+C in development does not leave connections dangling.
     */
    async enableShutdownHooks(app) {
        process.on('beforeExit', () => {
            void app.close();
        });
    }
    /**
     * Deletes every row while preserving the schema. Test-only: it refuses to
     * run outside NODE_ENV=test so it can never be pointed at real data.
     */
    async truncateAll() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('truncateAll() is only available when NODE_ENV=test.');
        }
        const tables = await this.$queryRaw `
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%'
    `;
        if (tables.length === 0)
            return;
        const list = tables.map((row) => `"public"."${row.tablename}"`).join(', ');
        await this.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
