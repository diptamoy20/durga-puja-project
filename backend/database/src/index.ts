export { PrismaService } from '../prisma.service';
export { PrismaModule } from './prisma.module';

// Re-export the generated types so services depend on @dpgc/database rather
// than reaching into @prisma/client directly.
export {
  AiModerationStatus,
  ArticleStatus,
  AtlasStatus,
  CommitteeStatus,
  DiasporaStatus,
  MediaModerationStatus,
  MediaType,
  NotificationChannel,
  NotificationStatus,
  Prisma,
  ProcessingStatus,
  RecordStatus,
  RsvpStatus,
  UserStatus,
  VirusScanStatus,
  WebinarStatus,
} from '@prisma/client';

export type {
  Album,
  AlbumMedia,
  Article,
  ArticleHistory,
  AuditLog,
  Category,
  CommitteeMedia,
  Department,
  DiasporaRegistration,
  DiasporaVerificationHistory,
  GuestSubscriber,
  Media,
  NotificationLog,
  PandalAtlas,
  PasswordResetToken,
  Permission,
  PujaCommittee,
  PujaCommitteeStatusHistory,
  PushSubscription,
  RefreshToken,
  Role,
  RolePermission,
  Subcategory,
  User,
  UserRole,
  Webinar,
  WebinarRegistration,
} from '@prisma/client';
