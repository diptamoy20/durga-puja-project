"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebinarStatus = exports.VirusScanStatus = exports.UserStatus = exports.RsvpStatus = exports.RecordStatus = exports.ProcessingStatus = exports.Prisma = exports.NotificationStatus = exports.NotificationChannel = exports.MediaType = exports.MediaModerationStatus = exports.DiasporaStatus = exports.CommitteeStatus = exports.AssociationStatus = exports.AtlasStatus = exports.ArticleStatus = exports.AiModerationStatus = exports.ContestStatus = exports.VotingStatus = exports.NominationStatus = exports.PrismaModule = exports.PrismaService = void 0;
var prisma_service_1 = require("../prisma.service");
Object.defineProperty(exports, "PrismaService", { enumerable: true, get: function () { return prisma_service_1.PrismaService; } });
var prisma_module_1 = require("./prisma.module");
Object.defineProperty(exports, "PrismaModule", { enumerable: true, get: function () { return prisma_module_1.PrismaModule; } });
// Re-export the generated types so services depend on @dpgc/database rather
// than reaching into @prisma/client directly.
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "AiModerationStatus", { enumerable: true, get: function () { return client_1.AiModerationStatus; } });
Object.defineProperty(exports, "ArticleStatus", { enumerable: true, get: function () { return client_1.ArticleStatus; } });
Object.defineProperty(exports, "AtlasStatus", { enumerable: true, get: function () { return client_1.AtlasStatus; } });
Object.defineProperty(exports, "CommitteeStatus", { enumerable: true, get: function () { return client_1.CommitteeStatus; } });
Object.defineProperty(exports, "DiasporaStatus", { enumerable: true, get: function () { return client_1.DiasporaStatus; } });
Object.defineProperty(exports, "AssociationStatus", { enumerable: true, get: function () { return client_1.AssociationStatus; } });
Object.defineProperty(exports, "MediaModerationStatus", { enumerable: true, get: function () { return client_1.MediaModerationStatus; } });
Object.defineProperty(exports, "MediaType", { enumerable: true, get: function () { return client_1.MediaType; } });
Object.defineProperty(exports, "NotificationChannel", { enumerable: true, get: function () { return client_1.NotificationChannel; } });
Object.defineProperty(exports, "NotificationStatus", { enumerable: true, get: function () { return client_1.NotificationStatus; } });
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_1.Prisma; } });
Object.defineProperty(exports, "ProcessingStatus", { enumerable: true, get: function () { return client_1.ProcessingStatus; } });
Object.defineProperty(exports, "RecordStatus", { enumerable: true, get: function () { return client_1.RecordStatus; } });
Object.defineProperty(exports, "RsvpStatus", { enumerable: true, get: function () { return client_1.RsvpStatus; } });
Object.defineProperty(exports, "UserStatus", { enumerable: true, get: function () { return client_1.UserStatus; } });
Object.defineProperty(exports, "VirusScanStatus", { enumerable: true, get: function () { return client_1.VirusScanStatus; } });
Object.defineProperty(exports, "WebinarStatus", { enumerable: true, get: function () { return client_1.WebinarStatus; } });
Object.defineProperty(exports, "ContestStatus", { enumerable: true, get: function () { return client_1.ContestStatus; } });
Object.defineProperty(exports, "VotingStatus", { enumerable: true, get: function () { return client_1.VotingStatus; } });
Object.defineProperty(exports, "NominationStatus", { enumerable: true, get: function () { return client_1.NominationStatus; } });

