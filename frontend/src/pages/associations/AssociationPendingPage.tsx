import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { RejectAssociationModal } from '@/components/associations/RejectAssociationModal';
import { ROUTES } from '@/constants/routes';
import { associationService, type AssociationDetail, type AssociationStatus } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';
import type { PaginationMeta } from '@/types';

import '@/styles/associations-admin.css';

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
  const [rejectTarget, setRejectTarget] = useState<{ id: number; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await associationService.adminList({
        page,
        perPage: 20,
        status: 'PENDING,UNDER_REVIEW',
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

  const handleStatusChange = async (id: number, newStatus: AssociationStatus, name: string) => {
    if (newStatus === 'REJECTED') {
      setRejectTarget({ id, name });
      return;
    }
    setSubmittingId(id);
    try {
      await associationService.changeStatus(id, newStatus);
      toastSuccess(`Association moved to ${newStatus.toLowerCase().replace('_', ' ')}.`);
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toastError(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setSubmittingId(rejectTarget.id);
    try {
      await associationService.changeStatus(rejectTarget.id, 'REJECTED', reason);
      toastSuccess('Association rejected.');
      setRejectTarget(null);
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
      <div className="associations-admin__header">
        <div>
          <h1>Pending Associations</h1>
          <p>
            Newly created and imported associations awaiting admin review. Move them to{' '}
            <strong>Under Review</strong>, then <strong>Approve</strong> to publish to the public directory.
          </p>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="associations-admin__state">
            <Spinner size="lg" label="Loading pending associations" />
            <p className="associations-admin__state-text">Loading pending associations…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="associations-admin__state">
            <div className="associations-admin__state-icon" aria-hidden="true">✅</div>
            <h2 className="associations-admin__state-title">Nothing awaiting review</h2>
            <p className="associations-admin__state-text">
              No pending or under-review associations right now. New entries created or imported will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="associations-admin__table-wrap">
              <table className="associations-admin__table">
                <thead>
                  <tr>
                    <th>Association</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((assoc) => (
                    <tr key={assoc.id}>
                      <td>
                        <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} className="associations-admin__name">
                          {assoc.name}
                        </Link>
                        <div className="associations-admin__mono">{assoc.registrationNo}</div>
                      </td>
                      <td style={{ fontSize: 'var(--font-sm)' }}>
                        {assoc.contactPersonName}<br />
                        {assoc.email}
                      </td>
                      <td style={{ fontSize: 'var(--font-sm)' }}>
                        {assoc.city}, {assoc.state}, {assoc.country}
                      </td>
                      <td className="associations-admin__muted">
                        {dateFormat.format(new Date(assoc.createdAt))}
                      </td>
                      <td>
                        <div className="associations-admin__actions">
                          <StatusBadge status={assoc.status} />
                          <Link to={ROUTES.ASSOCIATION_DETAIL(assoc.id)} className="btn btn--secondary btn--sm">Review</Link>
                          {TRANSITIONS[assoc.status].map((action) => (
                            <Button
                              key={action.status}
                              variant={action.variant}
                              size="sm"
                              disabled={submittingId === assoc.id}
                              onClick={() => handleStatusChange(assoc.id, action.status, assoc.name)}
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
              <div className="associations-admin__pagination">
                <Pagination meta={pagination} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </Card>

      <RejectAssociationModal
        open={rejectTarget !== null}
        associationName={rejectTarget?.name ?? ''}
        busy={submittingId === rejectTarget?.id}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}