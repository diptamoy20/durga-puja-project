-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VotingStatus') THEN
    CREATE TYPE "VotingStatus" AS ENUM ('NOT_CONFIGURED', 'SCHEDULED', 'ACTIVE', 'EXTENDED', 'CLOSED');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "sharad_samman_contests"
  ADD COLUMN IF NOT EXISTS "voting_status" "VotingStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
  ADD COLUMN IF NOT EXISTS "voting_start_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "voting_end_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "voting_extended_until" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sharad_samman_contests_voting_status_idx" ON "sharad_samman_contests"("voting_status");
