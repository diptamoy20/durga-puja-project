-- CreateEnum
CREATE TYPE "AssociationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'INACTIVE');

-- CreateTable
CREATE TABLE "associations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "registration_no" VARCHAR(50) NOT NULL,
    "association_id" VARCHAR(30),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "established_year" SMALLINT,
    "contact_person_name" VARCHAR(200) NOT NULL,
    "designation" VARCHAR(100) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "mobile" VARCHAR(25) NOT NULL,
    "website" VARCHAR(500),
    "socialLinks" JSONB,
    "country" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "address" TEXT NOT NULL,
    "logo_image" VARCHAR(500),
    "cover_image" VARCHAR(500),
    "status" "AssociationStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejected_by" INTEGER,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "association_status_histories" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "previous_status" VARCHAR(30),
    "new_status" VARCHAR(30) NOT NULL,
    "reason" TEXT,
    "changed_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "association_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "associations_user_id_key" ON "associations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "associations_registration_no_key" ON "associations"("registration_no");

-- CreateIndex
CREATE UNIQUE INDEX "associations_association_id_key" ON "associations"("association_id");

-- CreateIndex
CREATE INDEX "associations_status_created_at_idx" ON "associations"("status", "created_at");

-- CreateIndex
CREATE INDEX "associations_city_idx" ON "associations"("city");

-- CreateIndex
CREATE INDEX "association_status_histories_association_id_created_at_idx" ON "association_status_histories"("association_id", "created_at");

-- AddForeignKey
ALTER TABLE "associations" ADD CONSTRAINT "associations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associations" ADD CONSTRAINT "associations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associations" ADD CONSTRAINT "associations_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associations" ADD CONSTRAINT "associations_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "association_status_histories" ADD CONSTRAINT "association_status_histories_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "association_status_histories" ADD CONSTRAINT "association_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;