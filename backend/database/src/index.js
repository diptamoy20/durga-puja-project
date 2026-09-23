"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContestStatus = exports.NominationStatus = exports.InvestmentOpportunityStatus = exports.InvestmentEnquiryStatus = exports.WebinarStatus = exports.VirusScanStatus = exports.UserStatus = exports.RsvpStatus = exports.RecordStatus = exports.ProcessingStatus = exports.Prisma = exports.NotificationStatus = exports.NotificationChannel = exports.MediaType = exports.MediaModerationStatus = exports.DiasporaStatus = exports.CommitteeStatus = exports.AssociationStatus = exports.AtlasStatus = exports.ArticleStatus = exports.AiModerationStatus = exports.PrismaModule = exports.PrismaService = void 0;
var prisma_service_1 = require("../prisma.service");
Object.defineProperty(exports, "PrismaService", { enumerable: true, get: function () { return prisma_service_1.PrismaService; } });
var prisma_module_1 = require("./prisma.module");
Object.defineProperty(exports, "PrismaModule", { enumerable: true, get: function () { return prisma_module_1.PrismaModule; } });
// Re-export the generated types so services depend on @dpgc/database rather
// than reaching into @prisma/client directly.
var client_1 = require("@prisma/client");

const fallbackEnums = {
  AiModerationStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', FLAGGED: 'FLAGGED', REJECTED: 'REJECTED' },
  ArticleStatus: { DRAFT: 'DRAFT', PENDING_REVIEW: 'PENDING_REVIEW', IN_REVIEW: 'IN_REVIEW', APPROVED: 'APPROVED', REJECTED: 'REJECTED', SCHEDULED: 'SCHEDULED', PUBLISHED: 'PUBLISHED', ARCHIVED: 'ARCHIVED' },
  AtlasStatus: { DRAFT: 'DRAFT', PENDING_REVIEW: 'PENDING_REVIEW', APPROVED: 'APPROVED', REJECTED: 'REJECTED', ARCHIVED: 'ARCHIVED' },
  CommitteeStatus: { PENDING: 'PENDING', UNDER_REVIEW: 'UNDER_REVIEW', APPROVED: 'APPROVED', REJECTED: 'REJECTED', INACTIVE: 'INACTIVE' },
  DiasporaStatus: { PENDING: 'PENDING', VERIFIED: 'VERIFIED', REJECTED: 'REJECTED' },
  AssociationStatus: { PENDING: 'PENDING', UNDER_REVIEW: 'UNDER_REVIEW', APPROVED: 'APPROVED', REJECTED: 'REJECTED', INACTIVE: 'INACTIVE' },
  MediaModerationStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
  MediaType: { IMAGE: 'IMAGE', VIDEO: 'VIDEO', DOCUMENT: 'DOCUMENT', AUDIO: 'AUDIO' },
  NotificationChannel: { EMAIL: 'EMAIL', SMS: 'SMS', PUSH: 'PUSH', IN_APP: 'IN_APP' },
  NotificationStatus: { QUEUED: 'QUEUED', SENT: 'SENT', FAILED: 'FAILED' },
  ProcessingStatus: { PENDING: 'PENDING', PROCESSING: 'PROCESSING', COMPLETED: 'COMPLETED', FAILED: 'FAILED' },
  RecordStatus: { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', ARCHIVED: 'ARCHIVED' },
  RsvpStatus: { REGISTERED: 'REGISTERED', ATTENDED: 'ATTENDED', CANCELLED: 'CANCELLED' },
  UserStatus: { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE', SUSPENDED: 'SUSPENDED', PENDING_VERIFICATION: 'PENDING_VERIFICATION' },
  VirusScanStatus: { PENDING: 'PENDING', CLEAN: 'CLEAN', INFECTED: 'INFECTED', SKIPPED: 'SKIPPED' },
  WebinarStatus: { DRAFT: 'DRAFT', SCHEDULED: 'SCHEDULED', LIVE: 'LIVE', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' },
  InvestmentOpportunityStatus: { DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', APPROVED: 'APPROVED', REJECTED: 'REJECTED', PUBLISHED: 'PUBLISHED', CLOSED: 'CLOSED' },
  InvestmentEnquiryStatus: { NEW: 'NEW', CONTACTED: 'CONTACTED', IN_DISCUSSION: 'IN_DISCUSSION', CLOSED_WON: 'CLOSED_WON', CLOSED_LOST: 'CLOSED_LOST' },
  ContestStatus: { DRAFT: 'DRAFT', ACTIVE: 'ACTIVE', CLOSED: 'CLOSED' },
  NominationStatus: { DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', UNDER_REVIEW: 'UNDER_REVIEW', APPROVED: 'APPROVED', REJECTED: 'REJECTED', SHORTLISTED: 'SHORTLISTED' },
};

function getEnum(name) {
  return client_1[name] || fallbackEnums[name] || {};
}

Object.defineProperty(exports, "AiModerationStatus", { enumerable: true, get: function () { return getEnum("AiModerationStatus"); } });
Object.defineProperty(exports, "ArticleStatus", { enumerable: true, get: function () { return getEnum("ArticleStatus"); } });
Object.defineProperty(exports, "AtlasStatus", { enumerable: true, get: function () { return getEnum("AtlasStatus"); } });
Object.defineProperty(exports, "CommitteeStatus", { enumerable: true, get: function () { return getEnum("CommitteeStatus"); } });
Object.defineProperty(exports, "DiasporaStatus", { enumerable: true, get: function () { return getEnum("DiasporaStatus"); } });
Object.defineProperty(exports, "AssociationStatus", { enumerable: true, get: function () { return getEnum("AssociationStatus"); } });
Object.defineProperty(exports, "MediaModerationStatus", { enumerable: true, get: function () { return getEnum("MediaModerationStatus"); } });
Object.defineProperty(exports, "MediaType", { enumerable: true, get: function () { return getEnum("MediaType"); } });
Object.defineProperty(exports, "NotificationChannel", { enumerable: true, get: function () { return getEnum("NotificationChannel"); } });
Object.defineProperty(exports, "NotificationStatus", { enumerable: true, get: function () { return getEnum("NotificationStatus"); } });
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_1.Prisma; } });
Object.defineProperty(exports, "ProcessingStatus", { enumerable: true, get: function () { return getEnum("ProcessingStatus"); } });
Object.defineProperty(exports, "RecordStatus", { enumerable: true, get: function () { return getEnum("RecordStatus"); } });
Object.defineProperty(exports, "RsvpStatus", { enumerable: true, get: function () { return getEnum("RsvpStatus"); } });
Object.defineProperty(exports, "UserStatus", { enumerable: true, get: function () { return getEnum("UserStatus"); } });
Object.defineProperty(exports, "VirusScanStatus", { enumerable: true, get: function () { return getEnum("VirusScanStatus"); } });
Object.defineProperty(exports, "WebinarStatus", { enumerable: true, get: function () { return getEnum("WebinarStatus"); } });
Object.defineProperty(exports, "InvestmentOpportunityStatus", { enumerable: true, get: function () { return getEnum("InvestmentOpportunityStatus"); } });
Object.defineProperty(exports, "InvestmentEnquiryStatus", { enumerable: true, get: function () { return getEnum("InvestmentEnquiryStatus"); } });
Object.defineProperty(exports, "ContestStatus", { enumerable: true, get: function () { return getEnum("ContestStatus"); } });
Object.defineProperty(exports, "NominationStatus", { enumerable: true, get: function () { return getEnum("NominationStatus"); } });
