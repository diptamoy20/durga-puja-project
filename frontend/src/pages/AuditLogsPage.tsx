import { useCallback, useEffect, useState } from 'react';

import { Alert, EmptyState } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { auditService } from '@/services/auditService';
import { errorMessage } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { userMgmtBreadcrumbs } from '@/utils/userManagementHelpers';
import type { AuditLog, AuditLogQuery, PaginationMeta } from '@/types';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState<AuditLogQuery>({ page: 1, perPage: 25, sortDir: 'desc' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  // Search resets to page 1, since page 4 of a new result set is usually empty.
  useEffect(() => {
    setQuery((current) => ({ ...current, search: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  const load = useCallback(async (current: AuditLogQuery) => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditService.list(current);
      setLogs(result.items);
      setPagination(result.pagination);
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to load the audit log.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(query);
  }, [load, query]);

  return (
    <>
      <PageHeader
        title="User Activity Log"
        description="Every administrative action, newest first."
        breadcrumbs={userMgmtBreadcrumbs({ label: 'User Activity Log' })}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <div className="filters">
          <div className="filters__field filters__field--grow">
            <label className="sr-only" htmlFor="audit-search">
              Search audit logs
            </label>
            <input
              id="audit-search"
              type="search"
              className="field__control"
              placeholder="Search by action, module or description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <Spinner label="Loading audit log" />
        ) : logs.length === 0 ? (
          <EmptyState title="Nothing recorded yet" description="Actions will appear here as they happen." />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Who</th>
                  <th scope="col">Action</th>
                  <th scope="col">Module</th>
                  <th scope="col">Details</th>
                  <th scope="col">IP</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>

                    <td>
                      <span className="table__primary">{log.user?.name ?? 'System'}</span>
                      {log.user && <span className="table__secondary">{log.user.email}</span>}
                    </td>

                    <td>{log.action.replace(/[._]/g, ' ')}</td>
                    <td>{log.module}</td>
                    <td>{log.description ?? '—'}</td>
                    <td>{log.ipAddress ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
          />
        )}
      </Card>
    </>
  );
}

export default AuditLogsPage;
