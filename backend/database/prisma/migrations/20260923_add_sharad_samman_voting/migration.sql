-- CreateEnum
CREATE TYPE "VoteStatus" AS ENUM ('VALID', 'FLAGGED', 'REJECTED');

-- AlterTable
ALTER TABLE "sharad_samman_contests"
  ADD COLUMN "is_voting_open" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "voting_start_date" TIMESTAMP(3),
  ADD COLUMN "voting_end_date" TIMESTAMP(3),
  ADD COLUMN "results_published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "results_published_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "sharad_samman_votes" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "nomination_id" INTEGER NOT NULL,
    "voter_email" VARCHAR(180) NOT NULL,
    "voter_name" VARCHAR(150),
    "voter_phone" VARCHAR(50),
    "voter_country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "voter_city" VARCHAR(100),
    "status" "VoteStatus" NOT NULL DEFAULT 'VALID',
    "risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "flag_reason" TEXT,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "device_fingerprint" VARCHAR(128),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sharad_samman_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_otps" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "otp_code" VARCHAR(10) NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voting_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sharad_samman_votes_contest_id_status_idx" ON "sharad_samman_votes"("contest_id", "status");

-- CreateIndex
CREATE INDEX "sharad_samman_votes_nomination_id_status_idx" ON "sharad_samman_votes"("nomination_id", "status");

-- CreateIndex
CREATE INDEX "sharad_samman_votes_ip_address_created_at_idx" ON "sharad_samman_votes"("ip_address", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sharad_samman_votes_contest_id_voter_email_key" ON "sharad_samman_votes"("contest_id", "voter_email");

-- CreateIndex
CREATE INDEX "voting_otps_email_contest_id_is_used_idx" ON "voting_otps"("email", "contest_id", "is_used");

-- CreateIndex
CREATE INDEX "voting_otps_expires_at_idx" ON "voting_otps"("expires_at");

-- AddForeignKey
ALTER TABLE "sharad_samman_votes" ADD CONSTRAINT "sharad_samman_votes_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "sharad_samman_contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_votes" ADD CONSTRAINT "sharad_samman_votes_nomination_id_fkey" FOREIGN KEY ("nomination_id") REFERENCES "sharad_samman_nominations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_votes" ADD CONSTRAINT "sharad_samman_votes_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
