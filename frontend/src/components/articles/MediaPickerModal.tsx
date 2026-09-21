import { useCallback, useEffect, useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { contentMediaService } from '@/services/contentService';
import { articleFileUrl } from '@/utils/articleHelpers';
import type { ContentMedia } from '@/types/content';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaPickerModal({ open, onClose, onSelect }: MediaPickerModalProps) {
  const [items, setItems] = useState<ContentMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContentMedia | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contentMediaService.list({ type: 'image', perPage: 48 });
      setItems(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load media library.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(null);
      void load();
    }
  }, [open, load]);

  const resolveUrl = (item: ContentMedia) =>
    item.url ?? articleFileUrl(item.filePath);

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(resolveUrl(selected));
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Pick from Media Library"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" disabled={!selected} onClick={handleConfirm}>
            Use Selected Image
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}

      {loading ? (
        <p className="text-muted">Loading media…</p>
      ) : items.length === 0 ? (
        <p className="text-muted">No images in the media library yet.</p>
      ) : (
        <div className="content-media-picker-grid">
          {items.map((item) => {
            const url = resolveUrl(item);
            return (
              <button
                key={item.id}
                type="button"
                className={`content-media-picker-item${selected?.id === item.id ? ' is-selected' : ''}`}
                onClick={() => setSelected(item)}
                title={item.title ?? item.originalName}
              >
                <img src={url} alt={item.altText ?? item.title ?? item.originalName} />
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
