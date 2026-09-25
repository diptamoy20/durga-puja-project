'use strict';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Inspecting Sharad Samman Votes Table ---');
  const votes = await prisma.sharadSammanVote.findMany({
    include: {
      nomination: {
        include: {
          committee: true,
        },
      },
    },
    orderBy: { id: 'desc' },
  });

  console.log(`Found ${votes.length} votes:`);
  for (const v of votes) {
    console.log({
      id: v.id,
      voterEmail: v.voterEmail,
      voterName: v.voterName,
      status: v.status,
      riskScore: v.riskScore,
      flagReason: v.flagReason,
      nominationTitle: v.nomination?.title,
      committee: v.nomination?.pujaCommittee?.committeeName,
      createdAt: v.createdAt,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
