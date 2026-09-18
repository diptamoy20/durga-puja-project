import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
import { associationService, type AssociationDetail, type AssociationStatus } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';
import type { PaginationMeta } from '@/types';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const TRANSITIONS: Record<AssociationStatus, Array<{ status: AssociationStatus; label: string; variant: 'success' | 'danger' | 'secondary' }>> = {
  PENDING: [
    { status: 'UNDER_REVIEW', label: 'Start Review', variant: 'secondary' },
    { status: 'REJECTED', label: 'Reject', variant: 'danger' },
  ],
  UNDER_REVIEW: [
    { status: 'APPROVED', label: 'Approve', variant: 'success' },
    { status: 'REJECTED', label: 'Reject', variant: 'danger' },
  ],
  APPROVED: [{ status: 'INACTIVE', label: 'Deactivate', variant: 'secondary' }],
  REJECTED: [{ status: 'PENDING', label: 'Reopen', variant: 'secondary' }],
  INACTIVE: [{ status: 'APPROVED', label: 'Reactivate & Approve', variant: 'success' }],
};

export function AssociationPendingPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [items, setItems] = useState<AssociationDetail[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await associationService.adminList({
        page,
        perPage: 20,
        status: 'PENDING',
        sortBy: 'createdAt',
        sortDir: 'asc',
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load pending associations.';
      toastError(msg);
      setItems([]);
      setPagination(undefined);
    } finally {
      setLoading(false);
    }
  }, [page, toastError]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = async (id: number, newStatus: AssociationStatus) => {
    let reason: string | undefined;
    if (newStatus === 'REJECTED') {
      reason = window.prompt('Reason for rejection:') ?? undefined;
      if (!reason) return;
    }
    setSubmittingId(id);
    try {
      await associationService.changeStatus(id, newStatus, reason);
      toastSuccess(`Association moved to ${newStatus.toLowerCase().replace('_', ' ')}.`);
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toastError(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-400)' }}>
        <h1 style={{ margin: '0 0 var(--space-100)', fontSize: 'var(--font-xl)' }}>Pending Associations</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Newly created and imported associations awaiting admin review. Move them to{' '}
          <strong>Under Review</strong>, then <strong>Approve</strong> to publish to the public directory.
        </p>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-600)' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-600)', color: 'var(--color-text-muted)' }}>
            No pending associations. New entries created or imported will appear here.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Association</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Contact</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Location</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Created</th>
                    <th style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((assoc) => (
                    <tr key={assoc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-200) var(--space-300)' }}>
                        <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ fontWeight: 600 }}>{assoc.name}</div>
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>{assoc.registrationNo}</div>
                        </Link>
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-sm)' }}>
                        {assoc.contactPersonName}<br />
                        {assoc.email}
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-sm)' }}>
                        {assoc.city}, {assoc.state}, {assoc.country}
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                        {dateFormat.format(new Date(assoc.createdAt))}
                      </td>
                      <td style={{ padding: 'var(--space-200) var(--space-300)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap', alignItems: 'center' }}>
                          <StatusBadge status={assoc.status} />
                          <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} className="btn btn--secondary btn--sm">Review</Link>
                          {TRANSITIONS[assoc.status].map((action) => (
                            <Button
                              key={action.status}
                              variant={action.variant}
                              size="sm"
                              disabled={submittingId === assoc.id}
                              onClick={() => handleStatusChange(assoc.id, action.status)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.lastPage > 1 && (
              <Pagination meta={pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </Card>
    </div>
  );
}