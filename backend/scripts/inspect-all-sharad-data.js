'use strict';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('        SHARAD SAMMAN COMPLETE DATA INVENTORY       ');
  console.log('====================================================\n');

  // 1. Contests
  const contests = await prisma.contest.findMany({
    orderBy: { year: 'desc' },
  });
  console.log(`1. CONTEST EDITIONS (${contests.length}):`);
  console.log(JSON.stringify(contests, null, 2));

  // 2. Nominations
  const nominations = await prisma.sharadSammanNomination.findMany({
    include: {
      committee: true,
      _count: {
        select: { votes: true },
      },
    },
    orderBy: { id: 'asc' },
  });
  console.log(`\n2. NOMINATIONS (${nominations.length}):`);
  for (const nom of nominations) {
    console.log({
      id: nom.id,
      contestId: nom.contestId,
      category: nom.category,
      title: nom.title,
      committee: nom.committee?.committeeName,
      status: nom.status,
      totalVotes: nom._count?.votes || 0,
      submittedAt: nom.submittedAt,
    });
  }

  // 3. Vote Counts by Category / Nomination
  const votes = await prisma.sharadSammanVote.groupBy({
    by: ['nominationId', 'status'],
    _count: { id: true },
  });
  console.log('\n3. VOTE TALLY BY NOMINATION & STATUS:');
  console.log(JSON.stringify(votes, null, 2));

  // 4. Overall Vote Counts
  const overallVotes = await prisma.sharadSammanVote.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  console.log('\n4. OVERALL BALLOT STATS:');
  console.log(JSON.stringify(overallVotes, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
