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
  return (
    <div className="filter-bar media-filters-bar">
      <form className="filter-bar__search" onSubmit={onSearchSubmit}>
        <input
          type="search"
          className="field__control"
          placeholder="Search by title, filename, committee, venue…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button type="submit" variant="secondary" size="md">
          Search
        </Button>
      </form>

      <div className="filter-bar__filters">
        {showStatusFilter && onStatusChange && (
          <select
            className="field__control"
            aria-label="Filter by status"
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
        )}

        {onMediaTypeChange && (
          <select
            className="field__control"
            aria-label="Filter by media type"
            value={mediaType ?? ''}
            onChange={(e) => onMediaTypeChange((e.target.value as MediaType) || undefined)}
          >
            <option value="">All Media Types</option>
            <option value="PHOTO">Photos</option>
            <option value="VIDEO">Videos</option>
          </select>
        )}

        {onCategoryChange && categories.length > 0 && (
          <select
            className="field__control"
            aria-label="Filter by category"
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
        )}

        {onSubcategoryChange && subcategories.length > 0 && (
          <select
            className="field__control"
            aria-label="Filter by subcategory"
            value={subcategoryId ?? ''}
            onChange={(e) =>
              onSubcategoryChange(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">All Subcategories</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        )}

        {extraFilters}
      </div>
    </div>
  );
}
