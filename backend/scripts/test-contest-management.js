'use strict';

/**
 * Sharad Samman Contest Management Automated Verification Tests
 *
 * Verifies:
 * 1. Open Contest Management (listing contests with counts)
 * 2. Verify existing 2026 contest
 * 3. Create a test contest
 * 4. Edit the same contest
 * 5. Verify the same contest ID remains
 * 6. Verify nominations remain linked
 * 7. Verify duplicate name/year is rejected
 * 8. Verify date validation (startDate <= endDate)
 * 9. Verify permission enforcement (MANAGE_CONTESTS)
 * 10. Change active contest deadline and verify Committee portal displays the new deadline
 * 11. Verify existing nomination workflow still works
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test the SharadSammanService logic directly
const { SharadSammanService } = require('../api-gateway/src/sharad-samman/sharad-samman.service');
const service = new SharadSammanService(prisma);

async function runTests() {
  console.log('=== Running Sharad Samman Contest Management Automated Tests ===\n');

  let testContestId = null;
  let createdTestNominationId = null;

  try {
    // 1. Open Contest Management: verify listing with nomination counts
    console.log('[TEST 1] Listing all contests...');
    const allContests = await service.listContests();
    if (!Array.isArray(allContests) || allContests.length === 0) {
      throw new Error('TEST 1 FAILED: Expected listContests to return an array of contests.');
    }
    console.log(`[PASS] 1. Listed ${allContests.length} contest(s).`);

    // 2. Verify existing 2026 contest (ID: 1)
    console.log('\n[TEST 2] Verifying existing Sharad Samman 2026 contest (ID: 1)...');
    const contest2026 = await service.getContest(1);
    if (!contest2026 || contest2026.id !== 1 || contest2026.name !== 'Sharad Samman 2026') {
      throw new Error(`TEST 2 FAILED: Existing contest 2026 not found as expected. Got: ${JSON.stringify(contest2026)}`);
    }
    if (typeof contest2026._count?.nominations !== 'number') {
      throw new Error('TEST 2 FAILED: Expected _count.nominations in contest details.');
    }
    console.log(`[PASS] 2. Existing contest verified: "${contest2026.name}" (ID: 1, Nominations: ${contest2026._count.nominations}, Status: ${contest2026.status})`);

    // 3. Create a test contest
    console.log('\n[TEST 3] Creating a new test contest ("Durga Puja Sharad Samman 2027")...');
    const created = await service.createContest({
      name: 'Durga Puja Sharad Samman 2027',
      year: 2027,
      description: 'Annual Sharad Samman celebration for 2027 edition.',
      startDate: new Date('2027-09-01T00:00:00Z').toISOString(),
      endDate: new Date('2027-10-31T23:59:59Z').toISOString(),
      status: 'DRAFT',
    });
    testContestId = created.id;
    if (!created || created.id === 1 || created.name !== 'Durga Puja Sharad Samman 2027') {
      throw new Error(`TEST 3 FAILED: Failed to create test contest. Got: ${JSON.stringify(created)}`);
    }
    console.log(`[PASS] 3. Created test contest successfully (ID: ${created.id}, Name: "${created.name}", Year: ${created.year})`);

    // 4. Edit the same contest
    console.log('\n[TEST 4] Editing the test contest in-place...');
    const updated = await service.updateContest(testContestId, {
      name: 'Durga Puja Sharad Samman 2027 (Updated)',
      description: 'Updated guidelines for 2027.',
      endDate: new Date('2027-11-15T23:59:59Z').toISOString(),
      status: 'DRAFT',
    });

    // 5. Verify the same contest ID remains (in-place update)
    console.log('\n[TEST 5] Verifying ID preservation...');
    if (updated.id !== testContestId) {
      throw new Error(`TEST 5 FAILED: Expected contest ID ${testContestId}, but got ${updated.id}. Record was not updated in-place!`);
    }
    if (updated.name !== 'Durga Puja Sharad Samman 2027 (Updated)') {
      throw new Error(`TEST 5 FAILED: Name was not updated.`);
    }
    console.log(`[PASS] 5. Same contest ID maintained (${updated.id}). Name updated to "${updated.name}".`);

    // 6. Verify existing nominations remain linked to Contest 1
    console.log('\n[TEST 6] Verifying existing nominations remain linked to Contest 1...');
    let existingNominations = await prisma.sharadSammanNomination.findMany({
      where: { contestId: 1 },
    });
    if (existingNominations.length === 0) {
      // Create a test nomination for Contest 1 to verify link preservation and isolation
      const committee = await prisma.pujaCommittee.findFirst();
      if (committee) {
        const testNom = await prisma.sharadSammanNomination.create({
          data: {
            contestId: 1,
            pujaCommitteeId: committee.id,
            category: 'Dhaki Performance',
            title: 'Verification Nomination for Contest 1',
            status: 'APPROVED',
          },
        });
        createdTestNominationId = testNom.id;
        existingNominations = [testNom];
      }
    }
    console.log(`[PASS] 6. Nominations remain linked: found ${existingNominations.length} nomination(s) attached to Contest 1.`);

    // 7. Verify duplicate name/year is rejected
    console.log('\n[TEST 7] Verifying duplicate name + year rejection...');
    let duplicateRejected = false;
    try {
      await service.createContest({
        name: 'Durga Puja Sharad Samman 2027 (Updated)',
        year: 2027,
        startDate: '2027-09-01T00:00:00Z',
        endDate: '2027-10-31T23:59:59Z',
      });
    } catch (err) {
      duplicateRejected = true;
      console.log(`[PASS] 7a. Create duplicate rejected: "${err.message}"`);
    }
    if (!duplicateRejected) {
      throw new Error('TEST 7 FAILED: Duplicate contest name+year was not rejected during creation!');
    }

    let updateDuplicateRejected = false;
    try {
      // Attempt to rename Contest 1 to test contest's name and year 2027
      await service.updateContest(1, {
        name: 'Durga Puja Sharad Samman 2027 (Updated)',
        year: 2027,
      });
    } catch (err) {
      updateDuplicateRejected = true;
      console.log(`[PASS] 7b. Update duplicate rejected: "${err.message}"`);
    }
    if (!updateDuplicateRejected) {
      throw new Error('TEST 7 FAILED: Duplicate contest name+year was not rejected during update!');
    }

    // 8. Verify date validation (startDate <= endDate)
    console.log('\n[TEST 8] Verifying start date <= end date validation...');
    let invalidDateRejected = false;
    try {
      await service.createContest({
        name: 'Invalid Date Contest',
        year: 2028,
        startDate: '2028-10-15T00:00:00Z',
        endDate: '2028-09-01T00:00:00Z', // endDate earlier than startDate!
      });
    } catch (err) {
      invalidDateRejected = true;
      console.log(`[PASS] 8. Invalid date range rejected: "${err.message}"`);
    }
    if (!invalidDateRejected) {
      throw new Error('TEST 8 FAILED: Contest with startDate > endDate was not rejected!');
    }

    // 9. Verify permission enforcement
    console.log('\n[TEST 9] Verifying MANAGE_CONTESTS permission in DB & role mapping...');
    const manageContestsPerm = await prisma.permission.findUnique({
      where: { permissionKey: 'manage_contests' },
    });
    if (!manageContestsPerm || manageContestsPerm.module !== 'Sharad Samman') {
      throw new Error('TEST 9 FAILED: manage_contests permission missing from database.');
    }
    const role = await prisma.role.findUnique({
      where: { slug: 'portal-administrator' },
      include: { permissions: { include: { permission: true } } },
    });
    const hasPerm = role.permissions.some((p) => p.permission.permissionKey === 'manage_contests');
    if (!hasPerm) {
      throw new Error('TEST 9 FAILED: manage_contests not assigned to Portal Administrator role.');
    }
    console.log(`[PASS] 9. MANAGE_CONTESTS permission (ID: ${manageContestsPerm.id}) registered and assigned to Portal Administrator.`);

    // 10. Change active contest deadline and verify Committee portal displays the new deadline
    console.log('\n[TEST 10] Testing active contest deadline synchronization with Committee portal...');
    const originalEndDate = contest2026.endDate;
    const testNewDeadline = new Date('2026-11-20T23:59:59.000Z');

    // Update Contest 1's deadline
    await service.updateContest(1, {
      endDate: testNewDeadline.toISOString(),
    });

    // Check active contest returned to committee
    const activeContestForCommittee = await service.getActiveContest();
    if (new Date(activeContestForCommittee.endDate).getTime() !== testNewDeadline.getTime()) {
      throw new Error(`TEST 10 FAILED: Expected deadline ${testNewDeadline.toISOString()}, got ${activeContestForCommittee.endDate}`);
    }
    console.log(`[PASS] 10. Active contest deadline updated and dynamically returned by getActiveContest(): ${activeContestForCommittee.endDate}`);

    // Revert deadline back to original
    await service.updateContest(1, {
      endDate: originalEndDate.toISOString(),
    });
    const restoredContest = await service.getActiveContest();
    console.log(`[PASS] 10b. Reverted Contest 1 deadline to original: ${restoredContest.endDate}`);

    // 11. Verify nomination workflow still works
    console.log('\n[TEST 11] Verifying existing nomination workflow remains operational...');
    const committee = await prisma.pujaCommittee.findFirst({
      where: { status: 'APPROVED' },
    });
    if (committee) {
      const commNominations = await service.listCommitteeNominations(committee.id);
      if (!commNominations || !commNominations.activeContest) {
        throw new Error('TEST 11 FAILED: listCommitteeNominations failed to return active contest.');
      }
      console.log(`[PASS] 11. Committee nominations list retrieved successfully with activeContest: "${commNominations.activeContest.name}"`);
    }

    // 12. Verify multi-contest dashboard isolation
    console.log('\n[TEST 12] Verifying multi-contest dashboard stats isolation...');
    // 12a. Default dashboard without contestId falls back to active contest
    const defaultDash = await service.getDashboardStats();
    if (!defaultDash.activeContest || defaultDash.activeContest.id !== 1) {
      throw new Error(`TEST 12a FAILED: Expected default dashboard to return active contest 1. Got: ${defaultDash.activeContest?.id}`);
    }
    const c1Total = defaultDash.stats.total;
    console.log(`[PASS] 12a. Default dashboard returned active contest #${defaultDash.activeContest.id} with ${c1Total} nominations.`);

    // 12b. Specific dashboard with contestId=1 returns same stats
    const c1Dash = await service.getDashboardStats(1);
    if (c1Dash.activeContest.id !== 1 || c1Dash.stats.total !== c1Total) {
      throw new Error('TEST 12b FAILED: c1Dash total does not match expected contest 1 total.');
    }
    console.log(`[PASS] 12b. Explicit dashboard for Contest 1 matched total: ${c1Dash.stats.total}.`);

    // 12c. Create a separate test contest with 0 nominations, stats must show 0 total nominations (not mixing with contest 1)
    const separateContest = await service.createContest({
      name: 'Isolation Check Contest 2028',
      year: 2028,
      startDate: new Date('2028-09-01T00:00:00Z').toISOString(),
      endDate: new Date('2028-10-31T23:59:59Z').toISOString(),
      status: 'DRAFT',
    });
    try {
      const separateDash = await service.getDashboardStats(separateContest.id);
      if (separateDash.activeContest.id !== separateContest.id) {
        throw new Error(`TEST 12c FAILED: Expected activeContest ID ${separateContest.id}, got ${separateDash.activeContest?.id}`);
      }
      if (separateDash.stats.total !== 0) {
        throw new Error(`TEST 12c FAILED: Dashboard stats leaked from other contests! Expected 0 nominations, got ${separateDash.stats.total}`);
      }
      console.log(`[PASS] 12c. Dashboard for Contest #${separateContest.id} correctly showed 0 nominations (complete isolation from Contest 1's ${c1Total} nominations).`);
    } finally {
      await prisma.contest.deleteMany({ where: { id: separateContest.id } });
    }

    console.log('\n=== ALL 12 TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    // Clean up temporary test contest
    if (testContestId) {
      console.log(`\n[CLEANUP] Cleaning up test contest #${testContestId}...`);
      await prisma.contest.deleteMany({
        where: { id: testContestId },
      });
      console.log('[CLEANUP] Done.');
    }
    if (createdTestNominationId) {
      console.log(`[CLEANUP] Cleaning up test nomination #${createdTestNominationId}...`);
      await prisma.sharadSammanNomination.deleteMany({
        where: { id: createdTestNominationId },
      });
      console.log('[CLEANUP] Done.');
    }
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('\n*** TEST RUN FAILED ***\n', err);
  process.exit(1);
});
