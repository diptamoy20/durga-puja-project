import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * The single Prisma client per service process.
 *
 * Lives at `backend/database/prisma.service.ts` per the required structure and
 * is re-exported from `src/index.ts` so services can import `@dpgc/database`.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

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

  async onModuleInit(): Promise<void> {
    // Log slow queries only; logging every query drowns out real signal.
    this.$on('query' as never, (event: Prisma.QueryEvent) => {
      if (event.duration >= 500) {
        this.logger.warn(`Slow query (${event.duration}ms): ${event.query}`);
      }
    });

    this.$on('error' as never, (event: Prisma.LogEvent) => {
      this.logger.error(event.message);
    });

    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Could not connect to PostgreSQL. Check DATABASE_URL in backend/.env. ${message}`,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /** Readiness probe backing the gateway's /health endpoint. */
  async healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
    const started = Date.now();
    await this.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - started };
  }

  /**
   * Closes the Prisma pool when Nest shuts down. Called from `main.ts` so a
   * Ctrl+C in development does not leave connections dangling.
   */
  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.on('beforeExit', () => {
      void app.close();
    });
  }

  /**
   * Deletes every row while preserving the schema. Test-only: it refuses to
   * run outside NODE_ENV=test so it can never be pointed at real data.
   */
  async truncateAll(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('truncateAll() is only available when NODE_ENV=test.');
    }

    const tables = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma%'
    `;

    if (tables.length === 0) return;

    const list = tables.map((row) => `"public"."${row.tablename}"`).join(', ');
    await this.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
  }
}
