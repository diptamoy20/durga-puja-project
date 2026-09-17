import { useEffect, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import type { Department, RoleSummary, UserListQuery, UserStatus } from '@/types';

interface UserFiltersProps {
  query: UserListQuery;
  roles: RoleSummary[];
  departments: Department[];
  onChange: (patch: Partial<UserListQuery>) => void;
  onReset: () => void;
}

const STATUS_LABELS: Array<{ value: UserStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING', label: 'Pending' },
  // Called "Blocked" in the previous portal.
  { value: 'SUSPENDED', label: 'Blocked' },
];

export function UserFilters({ query, roles, departments, onChange, onReset }: UserFiltersProps) {
  const [search, setSearch] = useState(query.search ?? '');
  const debouncedSearch = useDebounce(search);

  // Only push the debounced value up, so typing does not fire a request per
  // keystroke. The guard stops the effect echoing a value we already sent.
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
      className="user-filters"
      // Selects apply on change; submitting applies the typed search at once
      // rather than waiting out the debounce.
      onSubmit={(event) => {
        event.preventDefault();
        onChange({ search: search || undefined });
      }}
    >
      <div className="user-filters__field user-filters__field--search">
        <label className="field__label" htmlFor="user-search">
          Search
        </label>
        <input
          id="user-search"
          type="search"
          className="field__control"
          placeholder="Search by name, email, username..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="user-filters__field">
        <label className="field__label" htmlFor="user-status">
          Status
        </label>
        <select
          id="user-status"
          className="field__control"
          value={query.status ?? ''}
          onChange={(event) =>
            onChange({ status: (event.target.value || undefined) as UserStatus | undefined })
          }
        >
          <option value="">All Status</option>
          {STATUS_LABELS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="user-filters__field">
        <label className="field__label" htmlFor="user-role">
          Role
        </label>
        <select
          id="user-role"
          className="field__control"
          value={query.roleId ?? ''}
          onChange={(event) =>
            onChange({ roleId: event.target.value ? Number(event.target.value) : undefined })
          }
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className="user-filters__field">
        <label className="field__label" htmlFor="user-department">
          Department
        </label>
        <select
          id="user-department"
          className="field__control"
          value={query.departmentId ?? ''}
          onChange={(event) =>
            onChange({ departmentId: event.target.value ? Number(event.target.value) : undefined })
          }
        >
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div className="user-filters__actions">
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
