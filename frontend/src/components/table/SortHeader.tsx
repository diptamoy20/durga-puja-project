interface SortHeaderProps {
  label: string;
  /** True when the table is currently sorted by this column. */
  active: boolean;
  direction?: 'asc' | 'desc';
  onSort: () => void;
}

/** A column heading that sorts the table, with a caret on the active column. */
export function SortHeader({ label, active, direction = 'asc', onSort }: SortHeaderProps) {
  return (
    <button
      type="button"
      className={`sort-link ${active ? 'is-active' : ''}`}
      onClick={onSort}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span>{label}</span>
      {active && (
        <i
          className={`fas fa-caret-${direction === 'asc' ? 'up' : 'down'}`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
