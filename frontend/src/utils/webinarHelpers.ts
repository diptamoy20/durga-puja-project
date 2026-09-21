import type { LivePlatform, Webinar, WebinarSpeaker, WebinarStatus } from '@/types/events';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5050/api/v1';

export const LIVE_PLATFORMS: Record<LivePlatform, string> = {
  youtube_live: 'YouTube Live',
  native_embed: 'Native Embed / HLS',
  zoom: 'Zoom Meeting',
  vimeo: 'Vimeo Live',
  google_meet: 'Google Meet',
  custom_stream: 'Custom Stream URL',
};

export const WEBINAR_STATUSES: Record<WebinarStatus, string> = {
  SCHEDULED: 'Scheduled',
  LIVE: 'Live Now',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  if (!value) return '';
  return new Date(value).toISOString();
}

export function resolveBannerUrl(bannerImage: string | null | undefined): string | null {
  if (!bannerImage) return null;
  if (/^https?:\/\//i.test(bannerImage)) return bannerImage;
  const path = bannerImage.replace(/^\/+/, '');
  if (path.startsWith('webinar-banners/')) {
    return `${API_BASE}/webinars/files/${path}`;
  }
  return bannerImage;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

export function resolveLiveEmbedUrl(webinar: Pick<Webinar, 'livePlatform' | 'liveStreamUrl'>): string | null {
  const url = webinar.liveStreamUrl?.trim();
  if (!url) return null;
  if (webinar.livePlatform === 'youtube_live' || webinar.livePlatform === 'native_embed') {
    const id = extractYouTubeId(url);
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  if (webinar.livePlatform === 'vimeo') {
    const id = extractVimeoId(url);
    if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  if (/^https?:\/\//i.test(url) && (url.includes('/embed/') || url.includes('player.'))) {
    return url;
  }
  return null;
}

export function resolveReplayEmbedUrl(webinar: Pick<Webinar, 'replayVideoUrl'>): string | null {
  const url = webinar.replayVideoUrl?.trim();
  if (!url) return null;
  const yt = extractYouTubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?rel=0`;
  const vimeo = extractVimeoId(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`;
  if (/^https?:\/\//i.test(url) && (url.includes('/embed/') || url.includes('player.'))) {
    return url;
  }
  return null;
}

export function hasReplay(webinar: Pick<Webinar, 'replayVideoUrl' | 'replayEmbedCode'>): boolean {
  return Boolean(webinar.replayVideoUrl?.trim() || webinar.replayEmbedCode?.trim());
}

export function formatScheduleRange(webinar: Pick<Webinar, 'scheduledStartTime' | 'scheduledEndTime' | 'timezone'>): string {
  const start = new Date(webinar.scheduledStartTime);
  const dateFmt = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  let text = `${dateFmt.format(start)} (${webinar.timezone || 'Asia/Kolkata'})`;
  if (webinar.scheduledEndTime) {
    const end = new Date(webinar.scheduledEndTime);
    const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    text += ` – ${timeFmt.format(end)}`;
  }
  return text;
}

export function formatDurationMinutes(minutes: number | null | undefined): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function speakerSummary(speakers: WebinarSpeaker[] | null | undefined): string {
  if (!speakers?.length) return '—';
  const names = speakers.map((s) => s.name).filter(Boolean);
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')}…`;
}

export function emptySpeaker(): WebinarSpeaker {
  return { name: '', designation: '', organization: '', bio: '', linkedin: '' };
}

export function buildCalendarIcs(webinar: Pick<Webinar, 'title' | 'subtitle' | 'description' | 'scheduledStartTime' | 'scheduledEndTime' | 'timezone' | 'slug'>): string {
  const start = new Date(webinar.scheduledStartTime);
  const end = webinar.scheduledEndTime ? new Date(webinar.scheduledEndTime) : new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Durga Puja Global Summit//Webinars//EN',
    'BEGIN:VEVENT',
    `UID:webinar-${webinar.slug}@durgapujaglobalconnect.in`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${webinar.title}`,
    `DESCRIPTION:${(webinar.subtitle || webinar.description || '').replace(/\n/g, '\\n')}`,
    `URL:${window.location.origin}/public/webinars/${webinar.slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadCalendarIcs(webinar: Pick<Webinar, 'title' | 'subtitle' | 'description' | 'scheduledStartTime' | 'scheduledEndTime' | 'timezone' | 'slug'>): void {
  const blob = new Blob([buildCalendarIcs(webinar)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${webinar.slug}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function statusTone(status: WebinarStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'LIVE':
      return 'danger';
    case 'SCHEDULED':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    default:
      return 'default';
  }
}
