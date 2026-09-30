'use strict';

/**
 * Automated Verification Test Suite for Committee Sharad Samman Portal
 *
 * Verifies all 7 core requirements:
 * 1. Committee can create a Draft nomination.
 * 2. Committee can edit its own Draft nomination.
 * 3. Committee can submit nomination (transitions DRAFT -> SUBMITTED).
 * 4. Submitted nomination appears in the Admin nomination review list.
 * 5. Committee cannot access or modify another committee's nomination (ownership protection).
 * 6. Same committee + same contest + DIFFERENT category = ALLOWED.
 * 7. Same committee + same contest + SAME category = REJECTED (uniqueness constraint).
 * 8. Committee cannot edit a nomination once submitted (locked for review).
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Instantiate SharadSammanService to test exact service logic
const { SharadSammanService } = require('../api-gateway/src/sharad-samman/sharad-samman.service');
const service = new SharadSammanService(prisma);

async function runTests() {
  console.log('=== Running Committee Sharad Samman Automated Verification Tests ===\n');

  // 1. Verify Active Contest
  const contest = await service.getActiveContest();
  if (!contest || contest.status !== 'ACTIVE') {
    throw new Error('TEST FAILED: Active contest not found.');
  }
  console.log(`[PASS] 1. Active Contest Verified: "${contest.name}" (ID: ${contest.id})`);

  // 2. Setup Two Distinct Test Puja Committees
  const existingApproved = await prisma.pujaCommittee.findMany({
    where: { status: 'APPROVED' },
    take: 2,
  });

  let committeeA = existingApproved[0];
  let committeeB = existingApproved[1];

  if (!committeeA) {
    committeeA = await prisma.pujaCommittee.create({
      data: {
        registrationNo: `TEST-COMM-A-${Date.now()}`,
        committeeName: 'Salt Lake FD Block Puja Committee',
        establishedYear: 1985,
        pujaType: 'Baroari',
        pujaCategory: 'Theme Puja',
        committeeDescription: 'Famous Salt Lake FD Block Durga Puja committee.',
        contactPersonName: 'Committee Secretary A',
        designation: 'General Secretary',
        email: `fd-block-${Date.now()}@example.com`,
        mobile: '+919830000001',
        country: 'India',
        state: 'West Bengal',
        city: 'Kolkata',
        postalCode: '700091',
        venueName: 'FD Park Ground',
        venueAddress: 'FD Block, Sector III, Salt Lake',
        address: 'FD Block, Sector III, Salt Lake, Kolkata 700091',
        registrationCertificate: 'certificates/test-a.pdf',
        addressProof: 'proofs/test-a.pdf',
        pandalImage: 'pandals/test-a.jpg',
        declaration: true,
        status: 'APPROVED',
      },
    });
  }

  if (!committeeB) {
    committeeB = await prisma.pujaCommittee.create({
      data: {
        registrationNo: `TEST-COMM-B-${Date.now()}`,
        committeeName: 'Ballygunge Cultural Association',
        establishedYear: 1951,
        pujaType: 'Baroari',
        pujaCategory: 'Traditional Puja',
        committeeDescription: 'Historic Ballygunge Cultural Durga Puja celebration.',
        contactPersonName: 'Committee Secretary B',
        designation: 'President',
        email: `bca-${Date.now()}@example.com`,
        mobile: '+919830000002',
        country: 'India',
        state: 'West Bengal',
        city: 'Kolkata',
        postalCode: '700019',
        venueName: 'Ballygunge Cultural Ground',
        venueAddress: '57 Jatin Das Road, Kolkata',
        address: '57 Jatin Das Road, Ballygunge, Kolkata 700019',
        registrationCertificate: 'certificates/test-b.pdf',
        addressProof: 'proofs/test-b.pdf',
        pandalImage: 'pandals/test-b.jpg',
        declaration: true,
        status: 'APPROVED',
      },
    });
  }

  // Clean up prior test nominations for both committees
  await prisma.sharadSammanNomination.deleteMany({
    where: {
      pujaCommitteeId: { in: [committeeA.id, committeeB.id] },
    },
  });

  // =========================================================================
  // Test 1: Committee Can Create Draft
  // =========================================================================
  const draftNom = await service.createCommitteeNomination(
    {
      category: 'Best Traditional Pandal',
      title: 'Terracotta Temple Heritage',
      description: 'Hand-molded terracotta facade depicting rural folk traditions.',
      submitNow: false,
    },
    committeeA.id,
    1, // actorId
  );

  if (draftNom.status !== 'DRAFT') {
    throw new Error(`TEST FAILED: Expected status DRAFT, got ${draftNom.status}`);
  }
  if (draftNom.pujaCommitteeId !== committeeA.id) {
    throw new Error('TEST FAILED: Nomination was not scoped to committee A.');
  }
  console.log(`[PASS] 2. Committee A Created Draft: ID=${draftNom.id}, Category="${draftNom.category}", Status=${draftNom.status}`);

  // =========================================================================
  // Test 2: Committee Can Edit Its Own Draft
  // =========================================================================
  const updatedDraft = await service.updateCommitteeNomination(
    draftNom.id,
    {
      title: 'Terracotta Temple Heritage of Bishnupur (Updated)',
      description: 'Enhanced concept notes detailing 50 artisans from Bankura.',
    },
    committeeA.id,
  );

  if (!updatedDraft.title.includes('(Updated)')) {
    throw new Error('TEST FAILED: Draft title was not updated.');
  }
  console.log(`[PASS] 3. Committee A Successfully Edited Draft: Title="${updatedDraft.title}"`);

  // =========================================================================
  // Test 3: Committee Can Submit Draft
  // =========================================================================
  const submittedNom = await service.submitCommitteeNomination(draftNom.id, committeeA.id);

  if (submittedNom.status !== 'SUBMITTED' || !submittedNom.submittedAt) {
    throw new Error(`TEST FAILED: Expected SUBMITTED with submittedAt timestamp, got ${submittedNom.status}`);
  }
  console.log(`[PASS] 4. Committee A Submitted Nomination: Status=${submittedNom.status}, SubmittedAt=${submittedNom.submittedAt.toISOString()}`);

  // =========================================================================
  // Test 4: Submitted Nomination Appears in Admin List
  // =========================================================================
  const adminList = await service.listNominations({
    contestId: contest.id,
    status: 'SUBMITTED',
  });

  const foundInAdmin = adminList.items.find((n) => n.id === submittedNom.id);
  if (!foundInAdmin) {
    throw new Error('TEST FAILED: Submitted committee nomination did not appear in Admin nomination list.');
  }
  console.log(`[PASS] 5. Submitted Nomination Verified in Admin Review Queue: Committee="${foundInAdmin.committee.committeeName}", Category="${foundInAdmin.category}"`);

  // =========================================================================
  // Test 5: Once Submitted, Committee Cannot Edit (Locked for Review)
  // =========================================================================
  let editAfterSubmitBlocked = false;
  try {
    await service.updateCommitteeNomination(
      submittedNom.id,
      { title: 'Attempted Post-Submit Modification' },
      committeeA.id,
    );
  } catch (err) {
    editAfterSubmitBlocked = true;
    console.log(`[PASS] 6. Post-Submit Edit Blocked as Expected: "${err.message}"`);
  }
  if (!editAfterSubmitBlocked) {
    throw new Error('TEST FAILED: Committee was able to edit an already submitted nomination!');
  }

  // =========================================================================
  // Test 6: Committee Cannot Access Another Committee's Nomination
  // =========================================================================
  let crossAccessBlocked = false;
  try {
    // Committee B attempts to access Committee A's nomination
    await service.getCommitteeNomination(submittedNom.id, committeeB.id);
  } catch (err) {
    crossAccessBlocked = true;
    console.log(`[PASS] 7. Cross-Committee Access Prevented: Caught ${err.name} - "${err.message}"`);
  }
  if (!crossAccessBlocked) {
    throw new Error('TEST FAILED: Committee B was able to view Committee A\'s nomination!');
  }

  // =========================================================================
  // Test 7: Multi-Category Rule (Different Category Allowed for Same Committee)
  // =========================================================================
  const secondNom = await service.createCommitteeNomination(
    {
      category: 'Best Idol Artistry',
      title: 'Sculpted Clay Form of Goddess Durga',
      description: 'Sculpted using holy Ganges silt with traditional ek-chala layout.',
      submitNow: false,
    },
    committeeA.id,
    1,
  );

  if (!secondNom || secondNom.id === submittedNom.id || secondNom.category !== 'Best Idol Artistry') {
    throw new Error('TEST FAILED: Multi-category nomination failed.');
  }
  console.log(`[PASS] 8. Multi-Category Rule Allowed: Committee A now has 2nd entry in category "${secondNom.category}" (ID: ${secondNom.id})`);

  // Verify Committee A list returns both nominations
  const committeeAList = await service.listCommitteeNominations(committeeA.id);
  if (committeeAList.items.length !== 2) {
    throw new Error(`TEST FAILED: Expected 2 nominations for Committee A, found ${committeeAList.items.length}`);
  }
  console.log(`[PASS] 9. Committee List Scoping: Committee A sees exactly 2 nominations: [${committeeAList.items.map(i => `"${i.category}"`).join(', ')}]`);

  // =========================================================================
  // Test 8: Uniqueness Constraint (Same Category for Same Committee Rejected)
  // =========================================================================
  let duplicateRejected = false;
  try {
    // Attempt duplicate in "Best Idol Artistry" for Committee A
    await service.createCommitteeNomination(
      {
        category: 'Best Idol Artistry',
        title: 'Duplicate Idol Entry',
        description: 'Should be rejected by validation and constraint.',
        submitNow: false,
      },
      committeeA.id,
      1,
    );
  } catch (err) {
    duplicateRejected = true;
    console.log(`[PASS] 10. Duplicate Category Nomination Rejected as Expected: "${err.message}"`);
  }
  if (!duplicateRejected) {
    throw new Error('TEST FAILED: Duplicate nomination in same category was permitted!');
  }

  // =========================================================================
  // Test 9: Committee B CAN submit in "Best Idol Artistry" (Per-Committee rule)
  // =========================================================================
  const committeeBNom = await service.createCommitteeNomination(
    {
      category: 'Best Idol Artistry',
      title: 'Traditional Sabarna Roy Choudhury Artistry',
      description: 'Historical family idol craftsmanship.',
      submitNow: true,
    },
    committeeB.id,
    1,
  );
  if (!committeeBNom || committeeBNom.status !== 'SUBMITTED') {
    throw new Error('TEST FAILED: Committee B nomination failed.');
  }
  console.log(`[PASS] 11. Different Committee (Committee B) in Same Category Allowed: Category="${committeeBNom.category}", Status=${committeeBNom.status}`);

  // Clean up test nominations
  await prisma.sharadSammanNomination.deleteMany({
    where: {
      pujaCommitteeId: { in: [committeeA.id, committeeB.id] },
    },
  });
  console.log('[PASS] 12. Cleanup: Temporary test nominations safely removed.');

  console.log('\n=== ALL 12 COMMITTEE SHARAD SAMMAN TESTS PASSED WITH 100% SUCCESS! ===');
}

runTests()
  .catch((err) => {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
