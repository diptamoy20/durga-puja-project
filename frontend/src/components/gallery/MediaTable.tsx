import { Link } from 'react-router-dom';

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
  const showModeration = canModerate && onApprove && onReject;

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
            <th className="table__actions media-table__actions-col">Actions</th>
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
                <td className="media-table__committee">{item.committee?.committeeName ?? '—'}</td>
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
                    <div className="media-action-group">
                      {onPreview && (
                        <button
                          type="button"
                          className="media-action-btn"
                          title="Preview"
                          onClick={() => onPreview(item)}
                        >
                          <i className="fas fa-eye" aria-hidden="true" />
                        </button>
                      )}
                      <Link
                        to={detailRoute(item.id)}
                        className="media-action-btn"
                        title="View details"
                      >
                        <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
                      </Link>
                      {canEdit && editRoute && (
                        <Link to={editRoute(item.id)} className="media-action-btn" title="Edit">
                          <i className="fas fa-pencil" aria-hidden="true" />
                        </Link>
                      )}
                    </div>

                    {showModeration && item.status === 'PENDING' && (
                      <div className="media-action-group media-action-group--moderation">
                        <button
                          type="button"
                          className="media-action-btn media-action-btn--success"
                          title="Approve"
                          onClick={() => onApprove(item)}
                        >
                          <i className="fas fa-check" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="media-action-btn media-action-btn--danger"
                          title="Reject"
                          onClick={() => onReject(item)}
                        >
                          <i className="fas fa-xmark" aria-hidden="true" />
                        </button>
                      </div>
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
