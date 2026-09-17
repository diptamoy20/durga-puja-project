import { ApiProperty } from '@nestjs/swagger';

/** Counts keyed by lower-cased status, as returned by the domain services. */
export type StatusCounts = Partial<Record<string, number>>;

export class ArticleCountsDto {
  @ApiProperty({ example: 128 })
  total!: number;

  @ApiProperty({ example: 31 })
  draft!: number;

  @ApiProperty({ example: 7, description: 'Pending review and in review combined.' })
  inReview!: number;

  @ApiProperty({ example: 12 })
  approved!: number;

  @ApiProperty({ example: 3 })
  rejected!: number;

  @ApiProperty({ example: 5 })
  scheduled!: number;

  @ApiProperty({ example: 66 })
  published!: number;

  @ApiProperty({ example: 4, description: 'Called "unpublished" in the previous portal.' })
  archived!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ example: 2431 })
  diasporaMembers!: number;

  @ApiProperty({ example: 512 })
  pujaCommittees!: number;

  @ApiProperty({ example: 1028 })
  pandals!: number;

  @ApiProperty({ example: 34, description: 'Committees pending or under review.' })
  pendingApprovals!: number;

  @ApiProperty({ type: ArticleCountsDto })
  articles!: ArticleCountsDto;

  @ApiProperty({
    example: [],
    description: 'Sections whose service could not be reached; their counts are zero.',
    isArray: true,
    type: String,
  })
  unavailable!: string[];
}

export interface DashboardSummary {
  diasporaMembers: number;
  pujaCommittees: number;
  pandals: number;
  pendingApprovals: number;
  articles: {
    total: number;
    draft: number;
    inReview: number;
    approved: number;
    rejected: number;
    scheduled: number;
    published: number;
    archived: number;
  };
  unavailable: string[];
}
