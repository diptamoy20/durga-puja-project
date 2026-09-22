export type WebinarStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type RsvpStatus = 'REGISTERED' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';

export type LivePlatform =
  | 'youtube_live'
  | 'native_embed'
  | 'zoom'
  | 'vimeo'
  | 'google_meet'
  | 'custom_stream';

export type WebinarResourceType = 'pdf' | 'slides' | 'document' | 'link';

export interface WebinarSpeaker {
  name: string;
  designation?: string;
  organization?: string;
  bio?: string;
  linkedin?: string;
}

export interface WebinarResource {
  title: string;
  url: string;
  type?: WebinarResourceType;
}

export interface Webinar {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  bannerImage: string | null;
  speakers: WebinarSpeaker[] | null;
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  timezone: string;
  status: WebinarStatus;
  isPublished: boolean;
  isFeatured: boolean;
  maxAttendees: number | null;
  requiresRegistration: boolean;
  livePlatform: LivePlatform;
  liveStreamUrl: string | null;
  liveEmbedCode: string | null;
  liveMeetingUrl: string | null;
  liveMeetingPasscode: string | null;
  replayVideoUrl: string | null;
  replayEmbedCode: string | null;
  replayDurationMinutes: number | null;
  resources: WebinarResource[] | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: number; name: string } | null;
  _count?: { registrations: number };
}

export interface WebinarFormValues {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  bannerImage?: string;
  speakers?: WebinarSpeaker[];
  scheduledStartTime: string;
  scheduledEndTime?: string;
  timezone?: string;
  status?: WebinarStatus;
  maxAttendees?: number | null;
  requiresRegistration?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
  livePlatform?: LivePlatform;
  liveStreamUrl?: string;
  liveEmbedCode?: string;
  liveMeetingUrl?: string;
  liveMeetingPasscode?: string;
  replayVideoUrl?: string;
  replayEmbedCode?: string;
  replayDurationMinutes?: number | null;
  resources?: WebinarResource[];
}

export interface WebinarListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'scheduledStartTime' | 'status';
  sortDir?: 'asc' | 'desc';
  status?: WebinarStatus;
  livePlatform?: LivePlatform;
}

export interface WebinarListStats {
  scheduled: number;
  live: number;
  completed: number;
  totalRsvps: number;
}

export interface WebinarRegistration {
  id: number;
  webinarId: number;
  userId: number | null;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  cityCountry: string | null;
  registrationCode: string;
  status: RsvpStatus;
  notes: string | null;
  attendedAt: string | null;
  createdAt: string;
  user?: { id: number; name: string } | null;
}

export interface RsvpFormValues {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  cityCountry?: string;
}

export interface RsvpSuccessPayload {
  registrationCode: string;
  webinarTitle: string;
  scheduledStartTime: string;
  joinUrl?: string | null;
  passcode?: string | null;
}

export interface ReplayFormValues {
  replayVideoUrl?: string;
  replayEmbedCode?: string;
  replayDurationMinutes?: number | null;
}
