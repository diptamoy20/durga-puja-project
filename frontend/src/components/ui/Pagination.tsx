import type { PaginationMeta } from '@/types';

interface PaginationProps {
  pagination?: PaginationMeta;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}

/**
 * Builds a compact page list with ellipses, so 500 pages do not render 500
 * buttons: always the first and last page, plus a window around the current.
 */
function pageWindow(current: number, lastPage: number): Array<number | 'gap'> {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, lastPage, current]);

  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < lastPage) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | 'gap'> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('gap');
    result.push(page);
  });

  return result;
}

export function Pagination({ pagination, meta, onPageChange }: PaginationProps) {
  const current = pagination ?? meta;
  if (!current || current.total === 0) return null;

  const { page, perPage, total, lastPage, hasPreviousPage, hasNextPage } = current;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="pagination__summary">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
      </p>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
        >
          Previous
        </button>

        {pageWindow(page, lastPage).map((entry, index) =>
          entry === 'gap' ? (
            <span key={`gap-${index}`} className="pagination__gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              className={`pagination__button ${entry === page ? 'is-active' : ''}`}
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
