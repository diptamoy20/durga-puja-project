export type PodcastEpisodeType = 'full' | 'trailer' | 'bonus';

export type PodcastLanguage = 'bn' | 'en' | 'hi';

export type PodcastReactionType = 'like' | 'love' | 'celebrate' | 'clap';

export interface PodcastEpisode {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description: string;
  audioUrl: string;
  audioDurationSeconds: number;
  audioFileSize?: number | null;
  audioMimeType?: string;
  coverImageUrl?: string | null;
  seasonNumber: number;
  episodeNumber: number;
  episodeType?: PodcastEpisodeType;
  language?: string;
  hostName?: string;
  guestName?: string | null;
  guestBio?: string | null;
  transcript?: string | null;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  playCount: number;
  likeCount: number;
  loveCount: number;
  celebrateCount: number;
  clapCount: number;
  spotifyUrl?: string | null;
  applePodcastsUrl?: string | null;
  youtubeUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  season?: number;
  language?: string;
  tag?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sort?: 'newest' | 'oldest' | 'popular';
}

export interface PodcastStats {
  totalEpisodes: number;
  publishedEpisodes: number;
  totalPlays: number;
  totalReactions: number;
  totalSubscribers: number;
  totalDurationSeconds: number;
}

export interface PodcastFormValues {
  title: string;
  slug?: string;
  summary: string;
  description: string;
  audioUrl: string;
  audioDurationSeconds: number;
  coverImageUrl?: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeType?: PodcastEpisodeType;
  language?: string;
  hostName?: string;
  guestName?: string;
  guestBio?: string;
  transcript?: string;
  tags?: string[] | string;
  isPublished?: boolean;
  isFeatured?: boolean;
  spotifyUrl?: string;
  applePodcastsUrl?: string;
  youtubeUrl?: string;
}

export interface PodcastSubscribeInput {
  email: string;
  name?: string;
  source?: string;
}
