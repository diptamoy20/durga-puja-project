-- CreateEnum
CREATE TYPE "InvestmentOpportunityStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "industry_associations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "category" VARCHAR(100) DEFAULT 'Apex Chamber',
    "description" TEXT,
    "contact_person" VARCHAR(150),
    "email" VARCHAR(180),
    "phone" VARCHAR(50),
    "website" VARCHAR(500),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100) DEFAULT 'West Bengal',
    "sectors_covered" JSONB,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "industry_associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_opportunities" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "sector" VARCHAR(150) NOT NULL,
    "category" VARCHAR(150),
    "location" VARCHAR(255) NOT NULL,
    "district" VARCHAR(100),
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "investment_range" VARCHAR(100) NOT NULL,
    "investment_min" DECIMAL(15,2),
    "investment_max" DECIMAL(15,2),
    "project_type" VARCHAR(100),
    "expected_roi" VARCHAR(150),
    "highlights" JSONB,
    "incentives" TEXT,
    "cover_image_url" TEXT,
    "gallery_images" JSONB,
    "documents" JSONB,
    "association_id" INTEGER,
    "contact_email" VARCHAR(180),
    "contact_phone" VARCHAR(50),
    "status" "InvestmentOpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3),
    "submitted_by_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "approved_by_id" INTEGER,
    "rejected_at" TIMESTAMP(3),
    "rejected_by_id" INTEGER,
    "rejection_reason" TEXT,
    "published_at" TIMESTAMP(3),
    "published_by_id" INTEGER,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "investment_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_opportunity_histories" (
    "id" SERIAL NOT NULL,
    "opportunity_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(50) NOT NULL,
    "previous_status" VARCHAR(50),
    "new_status" VARCHAR(50),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_opportunity_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_enquiries" (
    "id" SERIAL NOT NULL,
    "enquiry_code" VARCHAR(50) NOT NULL,
    "opportunity_id" INTEGER,
    "association_id" INTEGER,
    "full_name" VARCHAR(150) NOT NULL,
    "organization" VARCHAR(200),
    "designation" VARCHAR(100),
    "investor_type" VARCHAR(100),
    "email" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'India',
    "city" VARCHAR(100),
    "investment_budget" VARCHAR(100),
    "proposed_timeline" VARCHAR(100),
    "message" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'NEW',
    "assigned_to_id" INTEGER,
    "admin_remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_enquiry_histories" (
    "id" SERIAL NOT NULL,
    "enquiry_id" INTEGER NOT NULL,
    "changed_by_id" INTEGER,
    "action" VARCHAR(50) NOT NULL,
    "from_status" VARCHAR(50),
    "to_status" VARCHAR(50),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_enquiry_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industry_associations_code_key" ON "industry_associations"("code");

-- CreateIndex
CREATE INDEX "industry_associations_is_active_sort_order_idx" ON "industry_associations"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "industry_associations_category_idx" ON "industry_associations"("category");

-- CreateIndex
CREATE UNIQUE INDEX "investment_opportunities_slug_key" ON "investment_opportunities"("slug");

-- CreateIndex
CREATE INDEX "investment_opportunities_status_published_at_idx" ON "investment_opportunities"("status", "published_at");

-- CreateIndex
CREATE INDEX "investment_opportunities_sector_status_idx" ON "investment_opportunities"("sector", "status");

-- CreateIndex
CREATE INDEX "investment_opportunities_location_idx" ON "investment_opportunities"("location");

-- CreateIndex
CREATE INDEX "investment_opportunities_is_featured_status_idx" ON "investment_opportunities"("is_featured", "status");

-- CreateIndex
CREATE INDEX "investment_opportunity_histories_opportunity_id_created_at_idx" ON "investment_opportunity_histories"("opportunity_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "investment_enquiries_enquiry_code_key" ON "investment_enquiries"("enquiry_code");

-- CreateIndex
CREATE INDEX "investment_enquiries_status_created_at_idx" ON "investment_enquiries"("status", "created_at");

-- CreateIndex
CREATE INDEX "investment_enquiries_email_idx" ON "investment_enquiries"("email");

-- CreateIndex
CREATE INDEX "investment_enquiries_opportunity_id_idx" ON "investment_enquiries"("opportunity_id");

-- CreateIndex
CREATE INDEX "investment_enquiries_association_id_idx" ON "investment_enquiries"("association_id");

-- CreateIndex
CREATE INDEX "investment_enquiry_histories_enquiry_id_created_at_idx" ON "investment_enquiry_histories"("enquiry_id", "created_at");

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "industry_associations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunities" ADD CONSTRAINT "investment_opportunities_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunity_histories" ADD CONSTRAINT "investment_opportunity_histories_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "investment_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_opportunity_histories" ADD CONSTRAINT "investment_opportunity_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_enquiries" ADD CONSTRAINT "investment_enquiries_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "investment_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_enquiries" ADD CONSTRAINT "investment_enquiries_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "industry_associations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_enquiries" ADD CONSTRAINT "investment_enquiries_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_enquiry_histories" ADD CONSTRAINT "investment_enquiry_histories_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "investment_enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_enquiry_histories" ADD CONSTRAINT "investment_enquiry_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
