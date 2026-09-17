import {
  ATLAS_PATTERNS,
  CONTENT_PATTERNS,
  PERMISSIONS,
  REGISTRATION_PATTERNS,
  RequirePermissions,
  SERVICE_TOKENS,
} from '@dpgc/shared';
import { Controller, Get, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MicroserviceClient } from '../clients/microservice.client';
import { ResponseMessage } from '../interceptors/response.interceptor';
import { DashboardSummary, StatusCounts } from './dto/dashboard.dto';

/**
 * Read-only aggregate for the landing screen. The numbers live in four
 * different services, so the gateway fans out once here rather than making the
 * browser issue four requests and add them up itself.
 */
@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly client: MicroserviceClient) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  @ResponseMessage('Dashboard summary retrieved successfully')
  @ApiOperation({
    summary: 'Portal-wide counts for the dashboard',
    description:
      'Diaspora registrations, puja committees, pandals and articles, each counted by status. ' +
      'Sections whose service is unreachable are reported in `unavailable` and returned as zero ' +
      'rather than failing the whole response.',
  })
  @ApiResponse({ status: 200, description: 'The aggregated counts.' })
  @ApiResponse({ status: 403, description: 'Missing the view_dashboard permission.' })
  async summary(): Promise<DashboardSummary> {
    const sources = {
      diaspora: () =>
        this.client.send<StatusCounts>(
          SERVICE_TOKENS.REGISTRATION,
          REGISTRATION_PATTERNS.DIASPORA_STATS,
          {},
        ),
      committees: () =>
        this.client.send<StatusCounts>(
          SERVICE_TOKENS.REGISTRATION,
          REGISTRATION_PATTERNS.COMMITTEE_STATS,
          {},
        ),
      pandals: () =>
        this.client.send<StatusCounts>(SERVICE_TOKENS.ATLAS, ATLAS_PATTERNS.STATS, {}),
      articles: () =>
        this.client.send<StatusCounts>(SERVICE_TOKENS.CONTENT, CONTENT_PATTERNS.ARTICLE_STATS, {}),
    };

    type Section = keyof typeof sources;
    const sections = Object.keys(sources) as Section[];

    // Queried in parallel, and a single failure degrades one card instead of
    // blanking the dashboard.
    const settled = await Promise.allSettled(sections.map((section) => sources[section]()));

    const counts = {} as Record<Section, StatusCounts>;
    const unavailable: Section[] = [];

    sections.forEach((section, index) => {
      const result = settled[index];

      if (result.status === 'fulfilled') {
        counts[section] = result.value;
        return;
      }

      counts[section] = {};
      unavailable.push(section);

      this.logger.warn(
        `Dashboard section "${section}" unavailable: ${
          result.reason instanceof Error ? result.reason.message : String(result.reason)
        }`,
      );
    });

    return {
      diasporaMembers: counts.diaspora.total ?? 0,
      pujaCommittees: counts.committees.total ?? 0,
      pandals: counts.pandals.total ?? 0,
      // "Needs review" in the old portal meant committees sitting in either
      // pending or under_review.
      pendingApprovals: (counts.committees.pending ?? 0) + (counts.committees.under_review ?? 0),
      articles: {
        total: counts.articles.total ?? 0,
        draft: counts.articles.draft ?? 0,
        inReview: counts.articles.in_review ?? 0,
        approved: counts.articles.approved ?? 0,
        rejected: counts.articles.rejected ?? 0,
        scheduled: counts.articles.scheduled ?? 0,
        published: counts.articles.published ?? 0,
        archived: counts.articles.archived ?? 0,
      },
      unavailable,
    };
  }
}
