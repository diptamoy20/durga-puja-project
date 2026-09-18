import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { MediaPreviewThumb } from '@/components/gallery/MediaPreviewThumb';
import {
  formatFileSize,
  formatMediaDate,
  formatMediaType,
  mediaStatusTone,
} from '@/utils/galleryHelpers';
import type { CommitteeMedia, MediaModerationStatus } from '@/types/gallery';

interface MediaTableProps {
  items: CommitteeMedia[];
  loading?: boolean;
  detailRoute: (id: number) => string;
  editRoute?: (id: number) => string;
  canEdit?: boolean;
  canModerate?: boolean;
  onPreview?: (item: CommitteeMedia) => void;
  onApprove?: (item: CommitteeMedia) => void;
  onReject?: (item: CommitteeMedia) => void;
  emptyMessage?: string;
}

export function MediaTable({
  items,
  loading = false,
  detailRoute,
  editRoute,
  canEdit = false,
  canModerate = false,
  onPreview,
  onApprove,
  onReject,
  emptyMessage = 'No media found matching current filters.',
}: MediaTableProps) {
  const colCount = 11;

  return (
    <div className="table-wrapper media-table-wrapper">
      <table className="table media-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Committee</th>
            <th>Category</th>
            <th>Venue</th>
            <th>File</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th className="table__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colCount} className="table__placeholder">
                Loading media…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="table__placeholder">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  <MediaPreviewThumb
                    item={item}
                    size="sm"
                    onClick={onPreview ? () => onPreview(item) : undefined}
                  />
                </td>
                <td>
                  <span className="table__primary">{item.title || item.originalFilename}</span>
                  {item.description && (
                    <span className="table__secondary media-table__description">{item.description}</span>
                  )}
                </td>
                <td>{formatMediaType(item.mediaType)}</td>
                <td>
                  <StatusBadge tone={mediaStatusTone(item.status)}>{item.status}</StatusBadge>
                </td>
                <td>{item.committee?.committeeName ?? '—'}</td>
                <td>
                  <span className="table__primary">{item.category?.name ?? '—'}</span>
                  {item.subcategory && (
                    <span className="table__secondary">{item.subcategory.name}</span>
                  )}
                </td>
                <td>{item.venueName || item.committee?.venueName || '—'}</td>
                <td>
                  <span className="media-table__filename" title={item.originalFilename}>
                    {item.originalFilename}
                  </span>
                </td>
                <td>{formatFileSize(item.fileSize)}</td>
                <td>
                  <span className="table__primary">{formatMediaDate(item.createdAt)}</span>
                  {item.uploadedBy && (
                    <span className="table__secondary">{item.uploadedBy.name}</span>
                  )}
                </td>
                <td className="table__actions">
                  <div className="media-table__actions">
                    {onPreview && (
                      <Button variant="secondary" size="sm" type="button" onClick={() => onPreview(item)}>
                        Preview
                      </Button>
                    )}
                    <Link to={detailRoute(item.id)} className="btn btn--secondary btn--sm">
                      View
                    </Link>
                    {canEdit && editRoute && (
                      <Link to={editRoute(item.id)} className="btn btn--secondary btn--sm">
                        Edit
                      </Link>
                    )}
                    {canModerate && item.status === 'PENDING' && onApprove && onReject && (
                      <>
                        <Button variant="primary" size="sm" type="button" onClick={() => onApprove(item)}>
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" type="button" onClick={() => onReject(item)}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export type { MediaModerationStatus };
