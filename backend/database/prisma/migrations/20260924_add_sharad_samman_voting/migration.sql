-- CreateEnum
CREATE TYPE "VotingStatus" AS ENUM ('NOT_CONFIGURED', 'SCHEDULED', 'ACTIVE', 'EXTENDED', 'CLOSED');

-- AlterTable
ALTER TABLE "sharad_samman_contests"
  ADD COLUMN "voting_status" "VotingStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  ADD COLUMN "voting_start_date" TIMESTAMP(3),
  ADD COLUMN "voting_end_date" TIMESTAMP(3),
  ADD COLUMN "voting_extended_until" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "sharad_samman_contests_voting_status_idx" ON "sharad_samman_contests"("voting_status");
