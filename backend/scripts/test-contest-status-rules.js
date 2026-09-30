'use strict';

/**
 * Sharad Samman Contest Status Rules Automated Verification Tests
 *
 * Verifies:
 * 1. Only ACTIVE contests allow NEW nominations.
 * 2. DRAFT contest -> reject creation (Admin & Committee).
 * 3. CLOSED contest -> reject creation (Admin & Committee).
 * 4. ACTIVE contest -> allow creation (Admin & Committee).
 * 5. Existing nominations in CLOSED/DRAFT contests remain viewable and accessible.
 * 6. Existing nomination review workflow remains operational.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { SharadSammanService } = require('../api-gateway/src/sharad-samman/sharad-samman.service');
const service = new SharadSammanService(prisma);

async function runTests() {
  console.log('=== Running Sharad Samman Contest Status Rules Automated Tests ===\n');

  let activeContest = null;
  let draftContest = null;
  let closedContest = null;
  let committee = null;
  const createdNominationIds = [];

  try {
    // Setup test committee
    committee = await prisma.pujaCommittee.findFirst({
      where: { status: 'APPROVED' },
    });
    if (!committee) {
      throw new Error('Test setup failed: No approved Puja Committee found in database.');
    }
    console.log(`[SETUP] Using Puja Committee: "${committee.committeeName}" (ID: ${committee.id})`);

    // Setup Contests: ACTIVE, DRAFT, CLOSED
    activeContest = await service.createContest({
      name: 'Status Test Active Contest 2026',
      year: 2026,
      startDate: new Date('2026-09-01T00:00:00Z').toISOString(),
      endDate: new Date('2026-10-31T23:59:59Z').toISOString(),
      status: 'ACTIVE',
    });
    console.log(`[SETUP] Created ACTIVE test contest: #${activeContest.id}`);

    draftContest = await service.createContest({
      name: 'Status Test Draft Contest 2027',
      year: 2027,
      startDate: new Date('2027-09-01T00:00:00Z').toISOString(),
      endDate: new Date('2027-10-31T23:59:59Z').toISOString(),
      status: 'DRAFT',
    });
    console.log(`[SETUP] Created DRAFT test contest: #${draftContest.id}`);

    closedContest = await service.createContest({
      name: 'Status Test Closed Contest 2025',
      year: 2025,
      startDate: new Date('2025-09-01T00:00:00Z').toISOString(),
      endDate: new Date('2025-10-31T23:59:59Z').toISOString(),
      status: 'CLOSED',
    });
    console.log(`[SETUP] Created CLOSED test contest: #${closedContest.id}`);

    // --- TEST 1: DRAFT Contest Rejection ---
    console.log('\n--- TEST 1: Rejection on DRAFT Contest ---');
    // 1a. Admin creation on DRAFT contest
    let adminDraftRejected = false;
    try {
      await service.createNomination({
        contestId: draftContest.id,
        pujaCommitteeId: committee.id,
        category: 'Best Traditional Pandal',
        title: 'Draft Contest Test Entry',
      });
    } catch (err) {
      adminDraftRejected = true;
      console.log(`[PASS] 1a. Admin nomination on DRAFT contest rejected: "${err.message}"`);
    }
    if (!adminDraftRejected) {
      throw new Error('TEST 1a FAILED: Admin nomination creation was NOT rejected on DRAFT contest!');
    }

    // 1b. Committee creation on DRAFT contest
    let commDraftRejected = false;
    try {
      await service.createCommitteeNomination({
        contestId: draftContest.id,
        category: 'Best Traditional Pandal',
        title: 'Draft Contest Committee Entry',
      }, committee.id);
    } catch (err) {
      commDraftRejected = true;
      console.log(`[PASS] 1b. Committee nomination on DRAFT contest rejected: "${err.message}"`);
    }
    if (!commDraftRejected) {
      throw new Error('TEST 1b FAILED: Committee nomination creation was NOT rejected on DRAFT contest!');
    }

    // --- TEST 2: CLOSED Contest Rejection ---
    console.log('\n--- TEST 2: Rejection on CLOSED Contest ---');
    // 2a. Admin creation on CLOSED contest
    let adminClosedRejected = false;
    try {
      await service.createNomination({
        contestId: closedContest.id,
        pujaCommitteeId: committee.id,
        category: 'Best Traditional Pandal',
        title: 'Closed Contest Test Entry',
      });
    } catch (err) {
      adminClosedRejected = true;
      console.log(`[PASS] 2a. Admin nomination on CLOSED contest rejected: "${err.message}"`);
    }
    if (!adminClosedRejected) {
      throw new Error('TEST 2a FAILED: Admin nomination creation was NOT rejected on CLOSED contest!');
    }

    // 2b. Committee creation on CLOSED contest
    let commClosedRejected = false;
    try {
      await service.createCommitteeNomination({
        contestId: closedContest.id,
        category: 'Best Traditional Pandal',
        title: 'Closed Contest Committee Entry',
      }, committee.id);
    } catch (err) {
      commClosedRejected = true;
      console.log(`[PASS] 2b. Committee nomination on CLOSED contest rejected: "${err.message}"`);
    }
    if (!commClosedRejected) {
      throw new Error('TEST 2b FAILED: Committee nomination creation was NOT rejected on CLOSED contest!');
    }

    // --- TEST 3: ACTIVE Contest Creation Allowed ---
    console.log('\n--- TEST 3: Successful Creation on ACTIVE Contest ---');
    // 3a. Admin creation on ACTIVE contest
    const adminNom = await service.createNomination({
      contestId: activeContest.id,
      pujaCommitteeId: committee.id,
      category: 'Best Traditional Pandal',
      title: 'Active Contest Admin Entry',
    });
    createdNominationIds.push(adminNom.id);
    console.log(`[PASS] 3a. Admin nomination created successfully on ACTIVE contest: #${adminNom.id} (${adminNom.status})`);

    // 3b. Committee creation on ACTIVE contest (different category)
    const commNom = await service.createCommitteeNomination({
      contestId: activeContest.id,
      category: 'Best Idol Artistry',
      title: 'Active Contest Committee Entry',
      submitNow: true,
    }, committee.id);
    createdNominationIds.push(commNom.id);
    console.log(`[PASS] 3b. Committee nomination created successfully on ACTIVE contest: #${commNom.id} (${commNom.status})`);

    // --- TEST 4: Existing Nominations Remain Viewable and Unchanged ---
    console.log('\n--- TEST 4: Existing Nominations in Closed Contest Remain Viewable & Unchanged ---');
    // Direct DB insertion of a historical nomination in the CLOSED contest (simulating pre-existing entry)
    const historicalNom = await prisma.sharadSammanNomination.create({
      data: {
        contestId: closedContest.id,
        pujaCommitteeId: committee.id,
        category: 'Best Illumination & Lighting',
        title: 'Historical 2025 Illumination',
        description: 'Spectacular lighting display from previous year.',
        status: 'APPROVED',
      },
    });
    createdNominationIds.push(historicalNom.id);
    console.log(`[SETUP] Seeded historical nomination #${historicalNom.id} in CLOSED contest #${closedContest.id}`);

    // 4a. Admin views historical nomination
    const viewedByAdmin = await service.getNomination(historicalNom.id);
    if (!viewedByAdmin || viewedByAdmin.id !== historicalNom.id) {
      throw new Error('TEST 4a FAILED: Admin unable to retrieve nomination from closed contest.');
    }
    console.log(`[PASS] 4a. Admin successfully viewed nomination #${historicalNom.id} in CLOSED contest: "${viewedByAdmin.title}" (Status: ${viewedByAdmin.status})`);

    // 4b. Committee views historical nomination
    const viewedByComm = await service.getCommitteeNomination(historicalNom.id, committee.id);
    if (!viewedByComm || viewedByComm.id !== historicalNom.id) {
      throw new Error('TEST 4b FAILED: Committee unable to retrieve nomination from closed contest.');
    }
    console.log(`[PASS] 4b. Committee successfully viewed own nomination #${historicalNom.id} in CLOSED contest.`);

    // 4c. Listed in nominations list query
    const listResult = await service.listNominations({ contestId: closedContest.id });
    if (!listResult.items.some((item) => item.id === historicalNom.id)) {
      throw new Error('TEST 4c FAILED: Historical nomination not found in list query for closed contest.');
    }
    console.log(`[PASS] 4c. Nomination #${historicalNom.id} correctly returned in contest listing (${listResult.items.length} item(s)).`);

    // 4d. Existing nomination review workflow remains operational
    console.log('\n--- TEST 5: Review Workflow Remains Operational ---');
    // Admin begins review / changes status on existing active nomination
    const updatedStatus = await service.changeNominationStatus(
      commNom.id,
      'APPROVED',
      null,
      'Verified criteria met.'
    );
    if (updatedStatus.status !== 'APPROVED') {
      throw new Error(`TEST 5 FAILED: Status change failed. Expected APPROVED, got ${updatedStatus.status}`);
    }
    console.log(`[PASS] 5. Nomination #${commNom.id} successfully reviewed and moved to APPROVED.`);

    console.log('\n=== ALL CONTEST STATUS RULE TESTS PASSED WITH 100% SUCCESS! ===');
  } finally {
    // Cleanup created nominations
    if (createdNominationIds.length > 0) {
      console.log(`\n[CLEANUP] Cleaning up ${createdNominationIds.length} test nomination(s)...`);
      await prisma.sharadSammanNomination.deleteMany({
        where: { id: { in: createdNominationIds } },
      });
      console.log('[CLEANUP] Nominations cleaned up.');
    }

    // Cleanup test contests
    const testContestIds = [activeContest?.id, draftContest?.id, closedContest?.id].filter(Boolean);
    if (testContestIds.length > 0) {
      console.log(`[CLEANUP] Cleaning up ${testContestIds.length} test contest(s)...`);
      await prisma.contest.deleteMany({
        where: { id: { in: testContestIds } },
      });
      console.log('[CLEANUP] Contests cleaned up.');
    }

    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('\n*** TEST RUN FAILED ***\n', err);
  process.exit(1);
});
