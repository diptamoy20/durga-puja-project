'use strict';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Adding Sample Flagged & Audit Ballots ---');

  const nomination = await prisma.sharadSammanNomination.findFirst({
    where: { status: 'SHORTLISTED' },
  }) || await prisma.sharadSammanNomination.findFirst();

  if (!nomination) {
    console.log('No nomination found to attach sample votes');
    return;
  }

  // Check if sample flagged votes already exist
  const existingFlagged = await prisma.sharadSammanVote.findFirst({
    where: { voterEmail: 'bot_detector_test1@flagged-domain.net' },
  });

  if (!existingFlagged) {
    // 1. Flagged Vote - High Velocity Burst from proxy IP
    await prisma.sharadSammanVote.create({
      data: {
        contestId: nomination.contestId,
        nominationId: nomination.id,
        voterEmail: 'bot_detector_test1@flagged-domain.net',
        voterName: 'Auto Clicker Probe',
        voterCity: 'Frankfurt',
        voterCountry: 'Germany',
        ipAddress: '185.220.101.5',
        deviceFingerprint: 'fp_proxy_vpn_anom_9921',
        riskScore: 78,
        flagReason: 'High-frequency burst (>15 attempts/min) from known data-center proxy IP',
        status: 'FLAGGED',
      },
    });
    console.log('✓ Created sample FLAGGED vote (High risk score: 78)');

    // 2. Flagged Vote - Disposable temporary email provider
    await prisma.sharadSammanVote.create({
      data: {
        contestId: nomination.contestId,
        nominationId: nomination.id,
        voterEmail: 'disposable_user_99@tempmail.in',
        voterName: 'Temp User 99',
        voterCity: 'Kolkata',
        voterCountry: 'India',
        ipAddress: '103.119.24.12',
        deviceFingerprint: 'fp_headless_chrome_002',
        riskScore: 55,
        flagReason: 'Disposable temporary email domain & missing WebGL hardware signature',
        status: 'FLAGGED',
      },
    });
    console.log('✓ Created sample FLAGGED vote (Medium risk score: 55)');

    // 3. Rejected Fraud Vote
    await prisma.sharadSammanVote.create({
      data: {
        contestId: nomination.contestId,
        nominationId: nomination.id,
        voterEmail: 'script_spammer@blacklisted-botnet.org',
        voterName: 'Automated Bot Script',
        voterCity: 'Unknown',
        voterCountry: 'Russia',
        ipAddress: '194.26.29.112',
        deviceFingerprint: 'fp_botnet_script_88',
        riskScore: 95,
        flagReason: 'Automated replay attack with synthesized CAPTCHA bypass',
        reviewNotes: 'Confirmed coordinated spam cluster. Blocked and blacklisted IP range.',
        status: 'REJECTED',
        reviewedAt: new Date(),
      },
    });
    console.log('✓ Created sample REJECTED fraud vote (Risk score: 95)');
  } else {
    console.log('Sample audit votes already present.');
  }

  const stats = await prisma.sharadSammanVote.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  console.log('Current Vote Status Tallies:', stats);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
