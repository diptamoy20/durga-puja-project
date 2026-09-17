-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DiasporaStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommitteeStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "VirusScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AiModerationStatus" AS ENUM ('PENDING', 'PASSED', 'FLAGGED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "AtlasStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WebinarStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'ATTENDED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "name" VARCHAR(200),
    "employee_id" VARCHAR(50),
    "username" VARCHAR(100),
    "email" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(25),
    "department_id" INTEGER,
    "country" VARCHAR(100),
    "state" VARCHAR(100),
    "city" VARCHAR(100),
    "address" TEXT,
    "profile_image" VARCHAR(500),
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "password" VARCHAR(255) NOT NULL,
    "initial_password" TEXT,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "permission_name" VARCHAR(150) NOT NULL,
    "permission_key" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "auditable_type" VARCHAR(150),
    "auditable_id" INTEGER,
    "description" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "user_agent" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diaspora_registrations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "registration_no" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "dob" DATE NOT NULL,
    "gender" VARCHAR(30) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "mobile" VARCHAR(25) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "passport_no" VARCHAR(100),
    "nationality" VARCHAR(100) NOT NULL,
    "address1" VARCHAR(255) NOT NULL,
    "address2" VARCHAR(255),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "district_origin" VARCHAR(100) NOT NULL,
    "village" VARCHAR(100),
    "relationship_with_bengal" VARCHAR(100) NOT NULL,
    "languages" VARCHAR(255),
    "interests" JSONB,
    "volunteer" BOOLEAN NOT NULL DEFAULT false,
    "receive_updates" BOOLEAN NOT NULL DEFAULT false,
    "terms_accepted" BOOLEAN NOT NULL,
    "status" "DiasporaStatus" NOT NULL DEFAULT 'PENDING',
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "rejected_by" INTEGER,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diaspora_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diaspora_verification_histories" (
    "id" SERIAL NOT NULL,
    "diaspora_registration_id" INTEGER NOT NULL,
    "previous_status" VARCHAR(30),
    "new_status" VARCHAR(30) NOT NULL,
    "action" VARCHAR(30) NOT NULL,
    "reason" TEXT,
    "changed_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diaspora_verification_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puja_committees" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "registration_no" VARCHAR(50) NOT NULL,
    "committee_id" VARCHAR(30),
    "committee_name" VARCHAR(200) NOT NULL,
    "established_year" SMALLINT NOT NULL,
    "puja_type" VARCHAR(60) NOT NULL,
    "puja_category" VARCHAR(100) NOT NULL,
    "committee_description" TEXT NOT NULL,
    "contact_person_name" VARCHAR(200) NOT NULL,
    "designation" VARCHAR(100) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "mobile" VARCHAR(25) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "venue_name" VARCHAR(180) NOT NULL,
    "venue_address" VARCHAR(255) NOT NULL,
    "landmark" VARCHAR(255),
    "address" TEXT NOT NULL,
    "registration_certificate" VARCHAR(500) NOT NULL,
    "address_proof" VARCHAR(500) NOT NULL,
    "pandal_image" VARCHAR(500) NOT NULL,
    "declaration" BOOLEAN NOT NULL,
    "status" "CommitteeStatus" NOT NULL DEFAULT 'PENDING',
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

    CONSTRAINT "puja_committees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puja_committee_status_histories" (
    "id" SERIAL NOT NULL,
    "puja_committee_id" INTEGER NOT NULL,
    "previous_status" VARCHAR(30),
    "new_status" VARCHAR(30) NOT NULL,
    "reason" TEXT,
    "changed_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puja_committee_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "subcategory_id" INTEGER NOT NULL,
    "title" VARCHAR(220) NOT NULL,
    "slug" VARCHAR(240) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featured_image" VARCHAR(500),
    "author_id" INTEGER,
    "seo_title" VARCHAR(255),
    "seo_description" TEXT,
    "seo_keywords" VARCHAR(500),
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "allow_comments" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "submitted_for_review_by" INTEGER,
    "submitted_for_review_at" TIMESTAMP(3),
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "review_comment" TEXT,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejected_by" INTEGER,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_histories" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(50) NOT NULL,
    "previous_status" VARCHAR(30),
    "new_status" VARCHAR(30),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(20) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "alt_text" VARCHAR(255),
    "title" VARCHAR(255),
    "uploaded_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_media" (
    "id" SERIAL NOT NULL,
    "puja_committee_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "subcategory_id" INTEGER,
    "uploaded_by" INTEGER NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "venue_name" VARCHAR(255),
    "original_filename" VARCHAR(255) NOT NULL,
    "stored_path" VARCHAR(500) NOT NULL,
    "thumbnail_path" VARCHAR(500),
    "mime_type" VARCHAR(120) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "status" "MediaModerationStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "moderated_by" INTEGER,
    "moderated_at" TIMESTAMP(3),
    "virus_scan_status" "VirusScanStatus" NOT NULL DEFAULT 'PENDING',
    "virus_scan_result" JSONB,
    "ai_moderation_status" "AiModerationStatus" NOT NULL DEFAULT 'PENDING',
    "ai_moderation_result" JSONB,
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "processing_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "committee_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "subcategory_id" INTEGER,
    "puja_committee_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album_media" (
    "id" SERIAL NOT NULL,
    "album_id" INTEGER NOT NULL,
    "committee_media_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pandal_atlas" (
    "id" SERIAL NOT NULL,
    "puja_committee_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "photos" JSONB,
    "timing" VARCHAR(255) NOT NULL,
    "ritual_schedule" TEXT,
    "livestream_url" VARCHAR(500),
    "virtual_tour_url" VARCHAR(500),
    "status" "AtlasStatus" NOT NULL DEFAULT 'DRAFT',
    "rejection_remarks" TEXT,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pandal_atlas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webinars" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "banner_image" VARCHAR(500),
    "speakers" JSONB,
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3),
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    "status" "WebinarStatus" NOT NULL DEFAULT 'SCHEDULED',
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "max_attendees" INTEGER,
    "requires_registration" BOOLEAN NOT NULL DEFAULT true,
    "live_platform" VARCHAR(50) NOT NULL DEFAULT 'youtube_live',
    "live_stream_url" TEXT,
    "live_embed_code" TEXT,
    "live_meeting_url" VARCHAR(500),
    "live_meeting_passcode" VARCHAR(100),
    "replay_video_url" TEXT,
    "replay_embed_code" TEXT,
    "replay_duration_minutes" INTEGER,
    "resources" JSONB,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "webinars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webinar_registrations" (
    "id" SERIAL NOT NULL,
    "webinar_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(50),
    "organization" VARCHAR(200),
    "city_country" VARCHAR(150),
    "registration_code" VARCHAR(50) NOT NULL,
    "status" "RsvpStatus" NOT NULL DEFAULT 'REGISTERED',
    "attended_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webinar_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_subscribers" (
    "id" SERIAL NOT NULL,
    "session_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" SERIAL NOT NULL,
    "subscribable_type" VARCHAR(100) NOT NULL,
    "subscribable_id" INTEGER NOT NULL,
    "endpoint" VARCHAR(1000) NOT NULL,
    "public_key" VARCHAR(255),
    "auth_token" VARCHAR(255),
    "content_encoding" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" SERIAL NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "user_id" INTEGER,
    "template" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(255),
    "payload" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_department_id_idx" ON "users"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "roles_status_idx" ON "roles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_key_key" ON "permissions"("permission_key");

-- CreateIndex
CREATE INDEX "permissions_module_status_idx" ON "permissions"("module", "status");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "audit_logs_module_action_idx" ON "audit_logs"("module", "action");

-- CreateIndex
CREATE INDEX "audit_logs_auditable_type_auditable_id_idx" ON "audit_logs"("auditable_type", "auditable_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_revoked_at_idx" ON "refresh_tokens"("user_id", "revoked_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_status_idx" ON "categories"("status");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "subcategories_status_idx" ON "subcategories"("status");

-- CreateIndex
CREATE INDEX "subcategories_name_idx" ON "subcategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_category_id_slug_key" ON "subcategories"("category_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "diaspora_registrations_user_id_key" ON "diaspora_registrations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "diaspora_registrations_registration_no_key" ON "diaspora_registrations"("registration_no");

-- CreateIndex
CREATE UNIQUE INDEX "diaspora_registrations_email_key" ON "diaspora_registrations"("email");

-- CreateIndex
CREATE INDEX "diaspora_registrations_status_created_at_idx" ON "diaspora_registrations"("status", "created_at");

-- CreateIndex
CREATE INDEX "diaspora_registrations_country_idx" ON "diaspora_registrations"("country");

-- CreateIndex
CREATE INDEX "diaspora_verification_histories_diaspora_registration_id_cr_idx" ON "diaspora_verification_histories"("diaspora_registration_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "puja_committees_user_id_key" ON "puja_committees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "puja_committees_registration_no_key" ON "puja_committees"("registration_no");

-- CreateIndex
CREATE UNIQUE INDEX "puja_committees_committee_id_key" ON "puja_committees"("committee_id");

-- CreateIndex
CREATE INDEX "puja_committees_status_created_at_idx" ON "puja_committees"("status", "created_at");

-- CreateIndex
CREATE INDEX "puja_committees_city_idx" ON "puja_committees"("city");

-- CreateIndex
CREATE INDEX "puja_committee_status_histories_puja_committee_id_created_a_idx" ON "puja_committee_status_histories"("puja_committee_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_scheduled_at_idx" ON "articles"("scheduled_at");

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "articles_subcategory_id_status_idx" ON "articles"("subcategory_id", "status");

-- CreateIndex
CREATE INDEX "article_histories_article_id_created_at_idx" ON "article_histories"("article_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_file_path_key" ON "media"("file_path");

-- CreateIndex
CREATE INDEX "media_file_type_idx" ON "media"("file_type");

-- CreateIndex
CREATE INDEX "committee_media_status_media_type_idx" ON "committee_media"("status", "media_type");

-- CreateIndex
CREATE INDEX "committee_media_puja_committee_id_status_idx" ON "committee_media"("puja_committee_id", "status");

-- CreateIndex
CREATE INDEX "committee_media_venue_name_idx" ON "committee_media"("venue_name");

-- CreateIndex
CREATE INDEX "committee_media_created_at_idx" ON "committee_media"("created_at");

-- CreateIndex
CREATE INDEX "committee_media_category_id_subcategory_id_idx" ON "committee_media"("category_id", "subcategory_id");

-- CreateIndex
CREATE INDEX "albums_puja_committee_id_status_idx" ON "albums"("puja_committee_id", "status");

-- CreateIndex
CREATE INDEX "albums_category_id_subcategory_id_idx" ON "albums"("category_id", "subcategory_id");

-- CreateIndex
CREATE INDEX "albums_is_public_idx" ON "albums"("is_public");

-- CreateIndex
CREATE INDEX "album_media_committee_media_id_idx" ON "album_media"("committee_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "album_media_album_id_committee_media_id_key" ON "album_media"("album_id", "committee_media_id");

-- CreateIndex
CREATE INDEX "pandal_atlas_status_idx" ON "pandal_atlas"("status");

-- CreateIndex
CREATE INDEX "pandal_atlas_approved_at_idx" ON "pandal_atlas"("approved_at");

-- CreateIndex
CREATE INDEX "pandal_atlas_puja_committee_id_idx" ON "pandal_atlas"("puja_committee_id");

-- CreateIndex
CREATE INDEX "pandal_atlas_latitude_longitude_idx" ON "pandal_atlas"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "webinars_slug_key" ON "webinars"("slug");

-- CreateIndex
CREATE INDEX "webinars_status_idx" ON "webinars"("status");

-- CreateIndex
CREATE INDEX "webinars_is_published_scheduled_start_time_idx" ON "webinars"("is_published", "scheduled_start_time");

-- CreateIndex
CREATE UNIQUE INDEX "webinar_registrations_registration_code_key" ON "webinar_registrations"("registration_code");

-- CreateIndex
CREATE INDEX "webinar_registrations_status_idx" ON "webinar_registrations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "webinar_registrations_webinar_id_email_key" ON "webinar_registrations"("webinar_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "guest_subscribers_session_id_key" ON "guest_subscribers"("session_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_subscribable_type_subscribable_id_idx" ON "push_subscriptions"("subscribable_type", "subscribable_id");

-- CreateIndex
CREATE INDEX "notification_logs_status_created_at_idx" ON "notification_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "notification_logs_recipient_idx" ON "notification_logs"("recipient");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaspora_registrations" ADD CONSTRAINT "diaspora_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaspora_registrations" ADD CONSTRAINT "diaspora_registrations_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaspora_registrations" ADD CONSTRAINT "diaspora_registrations_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaspora_verification_histories" ADD CONSTRAINT "diaspora_verification_histories_diaspora_registration_id_fkey" FOREIGN KEY ("diaspora_registration_id") REFERENCES "diaspora_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diaspora_verification_histories" ADD CONSTRAINT "diaspora_verification_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puja_committees" ADD CONSTRAINT "puja_committees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puja_committees" ADD CONSTRAINT "puja_committees_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puja_committees" ADD CONSTRAINT "puja_committees_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puja_committees" ADD CONSTRAINT "puja_committees_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puja_committee_status_histories" ADD CONSTRAINT "puja_committee_status_histories_puja_committee_id_fkey" FOREIGN KEY ("puja_committee_id") REFERENCES "puja_committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puja_committee_status_histories" ADD CONSTRAINT "puja_committee_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_submitted_for_review_by_fkey" FOREIGN KEY ("submitted_for_review_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_histories" ADD CONSTRAINT "article_histories_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_histories" ADD CONSTRAINT "article_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_media" ADD CONSTRAINT "committee_media_puja_committee_id_fkey" FOREIGN KEY ("puja_committee_id") REFERENCES "puja_committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_media" ADD CONSTRAINT "committee_media_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_media" ADD CONSTRAINT "committee_media_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_media" ADD CONSTRAINT "committee_media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_media" ADD CONSTRAINT "committee_media_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_puja_committee_id_fkey" FOREIGN KEY ("puja_committee_id") REFERENCES "puja_committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_media" ADD CONSTRAINT "album_media_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_media" ADD CONSTRAINT "album_media_committee_media_id_fkey" FOREIGN KEY ("committee_media_id") REFERENCES "committee_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pandal_atlas" ADD CONSTRAINT "pandal_atlas_puja_committee_id_fkey" FOREIGN KEY ("puja_committee_id") REFERENCES "puja_committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pandal_atlas" ADD CONSTRAINT "pandal_atlas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pandal_atlas" ADD CONSTRAINT "pandal_atlas_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pandal_atlas" ADD CONSTRAINT "pandal_atlas_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pandal_atlas" ADD CONSTRAINT "pandal_atlas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pandal_atlas" ADD CONSTRAINT "pandal_atlas_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinars" ADD CONSTRAINT "webinars_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinars" ADD CONSTRAINT "webinars_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinar_registrations" ADD CONSTRAINT "webinar_registrations_webinar_id_fkey" FOREIGN KEY ("webinar_id") REFERENCES "webinars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinar_registrations" ADD CONSTRAINT "webinar_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

