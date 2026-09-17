export type WebinarStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type RsvpStatus = 'REGISTERED' | 'CONFIRMED' | 'ATTENDED' | 'CANCELLED' | 'NO_SHOW';

export interface Webinar {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  scheduledAt: string;
  duration: string;
  meetingLink: string | null;
  speaker: string | null;
  speakerBio: string | null;
  bannerImage: string | null;
  maxAttendees: number | null;
  replayUrl: string | null;
  status: WebinarStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: number; name: string } | null;
  _count?: { registrations: number };
}

export interface WebinarFormValues {
  title: string;
  description?: string;
  scheduledAt: string;
  duration: string;
  meetingLink?: string;
  speaker?: string;
  speakerBio?: string;
  bannerImage?: string;
  maxAttendees?: number;
  replayUrl?: string;
}

export interface WebinarListQuery {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'scheduledAt' | 'status';
  sortDir?: 'asc' | 'desc';
  status?: WebinarStatus;
}

export interface WebinarRegistration {
  id: number;
  webinarId: number;
  userId: number | null;
  name: string;
  email: string;
  phone: string | null;
  status: RsvpStatus;
  notes: string | null;
  createdAt: string;
  user?: { id: number; name: string } | null;
}
