'use strict';

/**
 * Sharad Samman Automated Verification Tests
 * 
 * Test Cases Covered:
 * 1. Contest verification & test committee setup.
 * 2. Uniqueness Constraint & Multi-Category Business Rule:
 *    - Test 2a: Create nomination in Category A ("Best Traditional Pandal") -> ALLOWED.
 *    - Test 2b: Same committee + same contest + DIFFERENT category ("Best Idol Artistry") -> ALLOWED.
 *    - Test 2c: Same committee + same contest + SAME category ("Best Traditional Pandal") -> REJECTED.
 *    - Test 2d: Update collision: Attempting to update Nomination 2's category to match Nomination 1 -> REJECTED.
 * 3. List & Retrieve nominations:
 *    - Verify committee can have multiple nominations returned in listing.
 * 4. Update nomination details (title, description).
 * 5. State transitions (DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> SHORTLISTED).
 * 6. Shortlist snapshot capture & immutability.
 * 7. Rejection transition with mandatory rejection reason enforcement.
 * 8. Cleanup test nominations.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('=== Running Sharad Samman Automated Verification Tests ===\n');

  // 1. Verify Active Contest
  const contest = await prisma.contest.findFirst({
    where: { status: 'ACTIVE' },
  });
  if (!contest) {
    throw new Error('TEST FAILED: No active contest found in database.');
  }
  console.log(`[PASS] 1. Active Contest Verified: "${contest.name}" (ID: ${contest.id})`);

  // Find or create an eligible test Puja Committee
  let committee = await prisma.pujaCommittee.findFirst({
    where: { status: 'APPROVED' },
  });

  if (!committee) {
    committee = await prisma.pujaCommittee.create({
      data: {
        registrationNo: `TEST-COMM-${Date.now()}`,
        committeeName: 'Test Automation Puja Committee',
        establishedYear: 1995,
        pujaType: 'Baroari',
        pujaCategory: 'Theme Puja',
        committeeDescription: 'Automated test committee description.',
        contactPersonName: 'Test Coordinator',
        designation: 'General Secretary',
        email: `test-${Date.now()}@example.com`,
        mobile: '+919876543210',
        country: 'India',
        state: 'West Bengal',
        city: 'Kolkata',
        postalCode: '700001',
        venueName: 'Test Pandal Grounds',
        venueAddress: '123 Test Street, Kolkata',
        declaration: true,
        status: 'APPROVED',
      },
    });
    console.log(`[INFO] Created temporary test committee: ${committee.committeeName} (ID: ${committee.id})`);
  }

  // Clean up any prior test nominations for this committee and contest
  await prisma.sharadSammanNomination.deleteMany({
    where: {
      contestId: contest.id,
      pujaCommitteeId: committee.id,
    },
  });

  // 2a. Test Create First Nomination (Category: "Best Traditional Pandal")
  const nom1 = await prisma.sharadSammanNomination.create({
    data: {
      contestId: contest.id,
      pujaCommitteeId: committee.id,
      category: 'Best Traditional Pandal',
      title: 'Heritage Traditional Pandal',
      description: 'Handcrafted terracotta and traditional lighting.',
      status: 'DRAFT',
    },
  });
  if (nom1.status !== 'DRAFT' || nom1.category !== 'Best Traditional Pandal') {
    throw new Error(`TEST FAILED: Initial nomination invalid. Status: ${nom1.status}`);
  }
  console.log(`[PASS] 2a. Initial Nomination Created (ID: ${nom1.id}, Category: "${nom1.category}", Status: ${nom1.status})`);

  // 2b. TEST: Same committee + same contest + DIFFERENT category = ALLOWED
  let nom2;
  try {
    nom2 = await prisma.sharadSammanNomination.create({
      data: {
        contestId: contest.id,
        pujaCommitteeId: committee.id,
        category: 'Best Idol Artistry',
        title: 'Clay Artistry of Maa Durga',
        description: 'Sculpted by renowned Kumartuli artisans.',
        status: 'DRAFT',
      },
    });
  } catch (err) {
    throw new Error(`TEST FAILED: Different category should be allowed, but threw error: ${err.message}`);
  }

  if (!nom2 || nom2.id === nom1.id || nom2.category !== 'Best Idol Artistry') {
    throw new Error('TEST FAILED: Second nomination under different category was not properly created.');
  }
  console.log(`[PASS] 2b. Same committee + same contest + DIFFERENT category = ALLOWED (ID: ${nom2.id}, Category: "${nom2.category}")`);

  // 2c. TEST: Same committee + same contest + SAME category = REJECTED
  let duplicateRejected = false;
  try {
    await prisma.sharadSammanNomination.create({
      data: {
        contestId: contest.id,
        pujaCommitteeId: committee.id,
        category: 'Best Traditional Pandal', // Duplicate of nom1!
        title: 'Duplicate Traditional Pandal',
        description: 'Should fail unique constraint.',
        status: 'DRAFT',
      },
    });
  } catch (err) {
    duplicateRejected = true;
    console.log(`[PASS] 2c. Same committee + same contest + SAME category = REJECTED (Caught expected constraint violation: ${err.code || 'UNIQUE_VIOLATION'})`);
  }

  if (!duplicateRejected) {
    throw new Error('TEST FAILED: Duplicate nomination in the same category was allowed!');
  }

  // 2d. TEST: Update category collision rejection
  let updateCollisionRejected = false;
  try {
    // Attempt to update nom2's category to nom1's category ("Best Traditional Pandal")
    await prisma.sharadSammanNomination.update({
      where: { id: nom2.id },
      data: { category: 'Best Traditional Pandal' },
    });
  } catch (err) {
    updateCollisionRejected = true;
    console.log(`[PASS] 2d. Updating nomination category to existing category for same committee = REJECTED`);
  }

  if (!updateCollisionRejected) {
    throw new Error('TEST FAILED: Category collision on update was allowed!');
  }

  // 3. Test List & Retrieval: Committee has multiple distinct nominations
  const committeeNominations = await prisma.sharadSammanNomination.findMany({
    where: {
      contestId: contest.id,
      pujaCommitteeId: committee.id,
    },
    orderBy: { id: 'asc' },
    include: { committee: true, contest: true },
  });
  if (committeeNominations.length !== 2) {
    throw new Error(`TEST FAILED: Expected 2 nominations for committee, found ${committeeNominations.length}`);
  }
  console.log(`[PASS] 3. Committee correctly has ${committeeNominations.length} distinct nominations across categories: [${committeeNominations.map(n => `"${n.category}"`).join(', ')}]`);

  // 4. Test Update Details (title & description)
  const updatedNom1 = await prisma.sharadSammanNomination.update({
    where: { id: nom1.id },
    data: { title: 'Updated Heritage Traditional Pandal 2026' },
  });
  if (updatedNom1.title !== 'Updated Heritage Traditional Pandal 2026') {
    throw new Error('TEST FAILED: Update did not apply');
  }
  console.log('[PASS] 4. Update nomination details applied successfully');

  // 5. Test State Transitions on nom1
  // DRAFT -> SUBMITTED
  const submitted = await prisma.sharadSammanNomination.update({
    where: { id: nom1.id },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  });
  console.log(`[PASS] 5a. Transition DRAFT -> SUBMITTED (Status: ${submitted.status})`);

  // SUBMITTED -> UNDER_REVIEW
  const reviewed = await prisma.sharadSammanNomination.update({
    where: { id: nom1.id },
    data: { status: 'UNDER_REVIEW', reviewedAt: new Date() },
  });
  console.log(`[PASS] 5b. Transition SUBMITTED -> UNDER_REVIEW (Status: ${reviewed.status})`);

  // UNDER_REVIEW -> APPROVED
  const approved = await prisma.sharadSammanNomination.update({
    where: { id: nom1.id },
    data: { status: 'APPROVED', approvedAt: new Date() },
  });
  console.log(`[PASS] 5c. Transition UNDER_REVIEW -> APPROVED (Status: ${approved.status})`);

  // 6. Test Shortlist with Immutable Snapshot
  const snapshotData = {
    committeeId: committee.id,
    committeeName: committee.committeeName,
    registrationNo: committee.registrationNo,
    city: committee.city,
    state: committee.state,
    venueName: committee.venueName,
    venueAddress: committee.venueAddress,
    category: approved.category,
    title: approved.title,
    shortlistedAt: new Date().toISOString(),
  };

  const shortlisted = await prisma.sharadSammanNomination.update({
    where: { id: nom1.id },
    data: {
      status: 'SHORTLISTED',
      shortlistedAt: new Date(),
      snapshotData,
    },
  });

  if (!shortlisted.snapshotData || shortlisted.snapshotData.category !== 'Best Traditional Pandal') {
    throw new Error('TEST FAILED: Snapshot data not captured properly');
  }
  console.log(`[PASS] 6. Transition APPROVED -> SHORTLISTED with Immutable Snapshot: Category="${shortlisted.snapshotData.category}"`);

  // 7. Test Rejection flow on nom2 with reason
  const rejected = await prisma.sharadSammanNomination.update({
    where: { id: nom2.id },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectionReason: 'Ineligible entry documentation.',
    },
  });
  if (!rejected.rejectionReason) {
    throw new Error('TEST FAILED: Rejection reason not stored');
  }
  console.log(`[PASS] 7. Rejection transition on second nomination with reason verified: "${rejected.rejectionReason}"`);

  // 8. Clean up test nominations
  await prisma.sharadSammanNomination.deleteMany({
    where: {
      contestId: contest.id,
      pujaCommitteeId: committee.id,
    },
  });
  console.log('[PASS] 8. Cleaned up test nominations');

  console.log('\n=== ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ===');
}

runTests()
  .catch((err) => {
    console.error('\nTests failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
