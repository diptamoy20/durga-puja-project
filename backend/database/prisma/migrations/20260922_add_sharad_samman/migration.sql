-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "NominationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SHORTLISTED');

-- CreateTable
CREATE TABLE "sharad_samman_contests" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "year" SMALLINT NOT NULL,
    "description" TEXT,
    "status" "ContestStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sharad_samman_contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sharad_samman_nominations" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "puja_committee_id" INTEGER NOT NULL,
    "category" VARCHAR(100),
    "title" VARCHAR(200),
    "description" TEXT,
    "status" "NominationStatus" NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "review_notes" TEXT,
    "snapshot_data" JSONB,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "rejected_at" TIMESTAMP(3),
    "rejected_by" INTEGER,
    "shortlisted_at" TIMESTAMP(3),
    "shortlisted_by" INTEGER,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sharad_samman_nominations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sharad_samman_contests_status_idx" ON "sharad_samman_contests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sharad_samman_contests_year_name_key" ON "sharad_samman_contests"("year", "name");

-- CreateIndex
CREATE INDEX "sharad_samman_nominations_status_idx" ON "sharad_samman_nominations"("status");

-- CreateIndex
CREATE INDEX "sharad_samman_nominations_contest_id_status_idx" ON "sharad_samman_nominations"("contest_id", "status");

-- CreateIndex
CREATE INDEX "sharad_samman_nominations_puja_committee_id_idx" ON "sharad_samman_nominations"("puja_committee_id");

-- CreateIndex
CREATE UNIQUE INDEX "sharad_samman_nominations_contest_id_puja_committee_id_key" ON "sharad_samman_nominations"("contest_id", "puja_committee_id");

-- AddForeignKey
ALTER TABLE "sharad_samman_nominations" ADD CONSTRAINT "sharad_samman_nominations_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "sharad_samman_contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_nominations" ADD CONSTRAINT "sharad_samman_nominations_puja_committee_id_fkey" FOREIGN KEY ("puja_committee_id") REFERENCES "puja_committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_nominations" ADD CONSTRAINT "sharad_samman_nominations_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_nominations" ADD CONSTRAINT "sharad_samman_nominations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_nominations" ADD CONSTRAINT "sharad_samman_nominations_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_nominations" ADD CONSTRAINT "sharad_samman_nominations_shortlisted_by_fkey" FOREIGN KEY ("shortlisted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharad_samman_nominations" ADD CONSTRAINT "sharad_samman_nominations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
