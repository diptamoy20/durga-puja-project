import { useEffect, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import type { PermissionListQuery, RecordStatus } from '@/types';

interface PermissionFiltersProps {
  query: PermissionListQuery;
  modules: string[];
  onChange: (patch: Partial<PermissionListQuery>) => void;
  onReset: () => void;
}

export function PermissionFilters({
  query,
  modules,
  onChange,
  onReset,
}: PermissionFiltersProps) {
  const [search, setSearch] = useState(query.search ?? '');
  const debouncedSearch = useDebounce(search);

  // Only the debounced value is pushed up, so typing does not fire a request
  // per keystroke. The guard stops the effect echoing a value we already sent.
  useEffect(() => {
    if (debouncedSearch !== (query.search ?? '')) {
      onChange({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, query.search, onChange]);

  const handleReset = () => {
    setSearch('');
    onReset();
  };

  return (
    <form
      className="permission-filters"
      // Selects apply on change; submitting applies the typed search at once
      // rather than waiting out the debounce.
      onSubmit={(event) => {
        event.preventDefault();
        onChange({ search: search || undefined });
      }}
    >
      <div className="permission-filters__field permission-filters__field--search">
        <label className="field__label" htmlFor="permission-search">
          Search
        </label>
        <input
          id="permission-search"
          type="search"
          className="field__control"
          placeholder="Name, key, module..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="permission-filters__field">
        <label className="field__label" htmlFor="permission-module">
          Module
        </label>
        <select
          id="permission-module"
          className="field__control"
          value={query.module ?? ''}
          onChange={(event) => onChange({ module: event.target.value || undefined })}
        >
          <option value="">All Modules</option>
          {modules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>
      </div>

      <div className="permission-filters__field">
        <label className="field__label" htmlFor="permission-status">
          Status
        </label>
        <select
          id="permission-status"
          className="field__control"
          value={query.status ?? ''}
          onChange={(event) =>
            onChange({ status: (event.target.value || undefined) as RecordStatus | undefined })
          }
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="permission-filters__field">
        <label className="field__label" htmlFor="permission-view">
          View
        </label>
        <select
          id="permission-view"
          className="field__control"
          value={query.trashed ? '1' : '0'}
          onChange={(event) => onChange({ trashed: event.target.value === '1' })}
        >
          <option value="0">Active Records</option>
          <option value="1">Trash</option>
        </select>
      </div>

      <div className="permission-filters__actions">
        <button type="submit" className="btn btn--primary btn--md">
          <span>Filter</span>
        </button>
        <button type="button" className="btn btn--secondary btn--md" onClick={handleReset}>
          <span>Reset</span>
        </button>
      </div>
    </form>
  );
}
