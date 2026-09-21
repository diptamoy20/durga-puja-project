import { mediaStreamUrl, mediaThumbnailUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia } from '@/types/gallery';

interface MediaPreviewThumbProps {
  item: Pick<CommitteeMedia, 'mediaType' | 'title' | 'originalFilename' | 'streamUrl' | 'storedPath' | 'thumbnailUrl' | 'thumbnailPath' | 'mimeType'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function MediaPreviewThumb({ item, size = 'md', className = '', onClick }: MediaPreviewThumbProps) {
  const thumbClass = `media-preview-thumb media-preview-thumb--${size} ${className}`.trim();
  const label = item.title || item.originalFilename;

  if (item.mediaType === 'PHOTO') {
    const src = mediaThumbnailUrl(item);
    return (
      <div className={thumbClass} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
        {src ? (
          <img src={src} alt={label} className="media-preview-thumb__image" loading="lazy" />
        ) : (
          <div className="media-preview-thumb__placeholder">No preview</div>
        )}
      </div>
    );
  }

  const videoSrc = mediaStreamUrl(item);
  return (
    <div className={thumbClass} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {videoSrc ? (
        <video
          src={videoSrc}
          className="media-preview-thumb__video"
          muted
          playsInline
          preload="metadata"
        />
      ) : null}
      <span className="media-preview-thumb__play" aria-hidden="true">
        <i className="fas fa-play" />
      </span>
    </div>
  );
}
