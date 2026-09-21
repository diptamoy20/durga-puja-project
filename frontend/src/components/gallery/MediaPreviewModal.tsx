import { Modal } from '@/components/ui/Modal';
import { mediaStreamUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia } from '@/types/gallery';

interface MediaPreviewModalProps {
  item: CommitteeMedia | null;
  open: boolean;
  onClose: () => void;
}

export function MediaPreviewModal({ item, open, onClose }: MediaPreviewModalProps) {
  if (!item) return null;

  const label = item.title || item.originalFilename;
  const streamUrl = mediaStreamUrl(item);

  return (
    <Modal open={open} title={label} onClose={onClose}>
      <div className="media-preview-modal">
        {item.mediaType === 'PHOTO' ? (
          <img src={streamUrl} alt={label} className="media-preview-modal__media" />
        ) : (
          <video src={streamUrl} controls autoPlay className="media-preview-modal__media" />
        )}
        {item.description && <p className="media-preview-modal__description">{item.description}</p>}
      </div>
    </Modal>
  );
}
