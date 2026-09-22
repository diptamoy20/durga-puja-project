import type { FormEvent, ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import type { MediaModerationStatus, MediaType } from '@/types/gallery';
import type { Category, Subcategory } from '@/types/content';

interface MediaFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent) => void;
  status?: MediaModerationStatus;
  onStatusChange?: (status: MediaModerationStatus | undefined) => void;
  showStatusFilter?: boolean;
  mediaType?: MediaType;
  onMediaTypeChange?: (type: MediaType | undefined) => void;
  categoryId?: number;
  onCategoryChange?: (id: number | undefined) => void;
  subcategoryId?: number;
  onSubcategoryChange?: (id: number | undefined) => void;
  categories?: Category[];
  subcategories?: Subcategory[];
  extraFilters?: ReactNode;
}

export function MediaFiltersBar({
  search,
  onSearchChange,
  onSearchSubmit,
  status,
  onStatusChange,
  showStatusFilter = true,
  mediaType,
  onMediaTypeChange,
  categoryId,
  onCategoryChange,
  subcategoryId,
  onSubcategoryChange,
  categories = [],
  subcategories = [],
  extraFilters,
}: MediaFiltersBarProps) {
  const showSubcategory = Boolean(onSubcategoryChange && subcategories.length > 0);

  return (
    <form className="media-filters" onSubmit={onSearchSubmit}>
      <div className="media-filters__field media-filters__field--search">
        <label className="media-filters__label" htmlFor="media-search">
          Search
        </label>
        <div className="media-filters__search-group">
          <span className="media-filters__search-icon" aria-hidden="true">
            <i className="fas fa-search" />
          </span>
          <input
            id="media-search"
            type="search"
            className="field__control media-filters__search-input"
            placeholder="Search by title, filename, committee, venue…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {showStatusFilter && onStatusChange && (
        <div className="media-filters__field">
          <label className="media-filters__label" htmlFor="media-status">
            Status
          </label>
          <select
            id="media-status"
            className="field__control"
            value={status ?? ''}
            onChange={(e) =>
              onStatusChange((e.target.value as MediaModerationStatus) || undefined)
            }
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      )}

      {onMediaTypeChange && (
        <div className="media-filters__field">
          <label className="media-filters__label" htmlFor="media-type">
            Media Type
          </label>
          <select
            id="media-type"
            className="field__control"
            value={mediaType ?? ''}
            onChange={(e) => onMediaTypeChange((e.target.value as MediaType) || undefined)}
          >
            <option value="">All Media Types</option>
            <option value="PHOTO">Photos</option>
            <option value="VIDEO">Videos</option>
          </select>
        </div>
      )}

      {onCategoryChange && categories.length > 0 && (
        <div className="media-filters__field">
          <label className="media-filters__label" htmlFor="media-category">
            Category
          </label>
          <select
            id="media-category"
            className="field__control"
            value={categoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showSubcategory && (
        <div className="media-filters__field">
          <label className="media-filters__label" htmlFor="media-subcategory">
            Subcategory
          </label>
          <select
            id="media-subcategory"
            className="field__control"
            value={subcategoryId ?? ''}
            onChange={(e) =>
              onSubcategoryChange?.(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">All Subcategories</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {extraFilters}

      <div className="media-filters__actions">
        <Button type="submit" variant="primary" size="md">
          <i className="fas fa-filter" aria-hidden="true" /> Filter
        </Button>
      </div>
    </form>
  );
}
