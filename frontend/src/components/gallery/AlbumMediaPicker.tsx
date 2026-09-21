import { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { MediaPreviewThumb } from '@/components/gallery/MediaPreviewThumb';
import { formatMediaType } from '@/utils/galleryHelpers';
import type { CommitteeMedia, MediaType } from '@/types/gallery';
import type { PaginationMeta } from '@/types';

type PickerFilter = 'ALL' | MediaType;

interface AlbumMediaPickerProps {
  open: boolean;
  onClose: () => void;
  onApply: (items: CommitteeMedia[]) => void;
  selectedIds: number[];
  initialSelected?: CommitteeMedia[];
  loadPage: (query: {
    page: number;
    perPage: number;
    mediaType?: MediaType;
    search?: string;
  }) => Promise<{ items: CommitteeMedia[]; pagination?: PaginationMeta }>;
  committeeRequired?: boolean;
  committeeSelected?: boolean;
}

export function AlbumMediaPicker({
  open,
  onClose,
  onApply,
  selectedIds,
  initialSelected = [],
  loadPage,
  committeeRequired = false,
  committeeSelected = true,
}: AlbumMediaPickerProps) {
  const [filter, setFilter] = useState<PickerFilter>('ALL');
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CommitteeMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [selection, setSelection] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<CommitteeMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelection(selectedIds);
      setSelectedItems(initialSelected);
      setPage(1);
      setDraftSearch('');
      setSearch('');
      setFilter('ALL');
    }
  }, [open, selectedIds, initialSelected]);

  const fetchItems = useCallback(async () => {
    if (committeeRequired && !committeeSelected) {
      setItems([]);
      setError('Select a puja committee before choosing media.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loadPage({
        page,
        perPage: 24,
        mediaType: filter === 'ALL' ? undefined : filter,
        search: search || undefined,
      });
      setItems(res.items);
      setPagination(res.pagination);
      setSelectedItems((prev) => {
        const map = new Map(prev.map((item) => [item.id, item]));
        res.items.forEach((item) => {
          if (selection.includes(item.id)) map.set(item.id, item);
        });
        return Array.from(map.values());
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load approved media.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [committeeRequired, committeeSelected, filter, loadPage, page, search, selection]);

  useEffect(() => {
    if (open) void fetchItems();
  }, [open, fetchItems]);

  const toggleItem = (item: CommitteeMedia, checked: boolean) => {
    setSelection((prev) =>
      checked ? [...new Set([...prev, item.id])] : prev.filter((id) => id !== item.id),
    );
    setSelectedItems((prev) => {
      if (checked) {
        const map = new Map(prev.map((entry) => [entry.id, entry]));
        map.set(item.id, item);
        return Array.from(map.values());
      }
      return prev.filter((entry) => entry.id !== item.id);
    });
  };

  const handleApply = () => {
    onApply(selectedItems.filter((item) => selection.includes(item.id)));
    onClose();
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(draftSearch.trim());
    setPage(1);
  };

  return (
    <Modal
      open={open}
      title="Select Album Media"
      onClose={onClose}
    >
      {committeeRequired && !committeeSelected && (
        <Alert tone="warning">Choose a puja committee in the album form before selecting media.</Alert>
      )}

      <div className="album-picker__toolbar">
        <div className="album-picker__tabs" role="tablist" aria-label="Media type filter">
          {(['ALL', 'PHOTO', 'VIDEO'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filter === tab}
              className={`album-picker__tab ${filter === tab ? 'is-active' : ''}`}
              onClick={() => {
                setFilter(tab);
                setPage(1);
              }}
            >
              {tab === 'ALL' ? 'All Media' : tab === 'PHOTO' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>

        <form className="album-picker__search" onSubmit={handleSearch}>
          <input
            className="field__control"
            placeholder="Search approved media…"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      <p className="album-picker__summary">
        {selection.length} item{selection.length === 1 ? '' : 's'} selected
      </p>

      {error && <Alert tone="danger">{error}</Alert>}

      {loading ? (
        <div className="album-picker__empty">Loading approved media…</div>
      ) : items.length === 0 ? (
        <div className="album-picker__empty">
          No approved media found for this committee. Upload and approve media first.
        </div>
      ) : (
        <div className="album-picker__grid">
          {items.map((item) => {
            const checked = selection.includes(item.id);
            return (
              <label
                key={item.id}
                className={`album-picker__card ${checked ? 'is-selected' : ''}`}
              >
                <input
                  type="checkbox"
                  className="album-picker__checkbox"
                  checked={checked}
                  onChange={(e) => toggleItem(item, e.target.checked)}
                />
                <MediaPreviewThumb item={item} size="md" />
                <div className="album-picker__meta">
                  <strong>{item.title || item.originalFilename}</strong>
                  <span>{formatMediaType(item.mediaType)}</span>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {pagination && pagination.lastPage > 1 && (
        <Pagination meta={pagination} onPageChange={setPage} />
      )}

      <div className="album-picker__footer">
        <Button type="button" variant="secondary" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="primary" size="md" onClick={handleApply}>
          Apply Selection ({selection.length})
        </Button>
      </div>
    </Modal>
  );
}
