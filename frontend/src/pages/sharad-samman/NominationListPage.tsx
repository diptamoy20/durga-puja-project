import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { canTransitionNomination, formatNominationStatus } from '@/constants/samman';
import { sammanService } from '@/services/sammanService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { PaginationMeta } from '@/types';
import type {
  Contest,
  NominationStatus,
  SharadSammanDashboardData,
  SharadSammanNomination,
} from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

const STATUS_TABS: Array<{ label: string; value: NominationStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export function NominationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { can, user } = useAuth();

  const statusParam = (searchParams.get('status') as NominationStatus) || '';
  const contestParam = searchParams.get('contestId') || '';
  const searchParam = searchParams.get('search') || '';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [items, setItems] = useState<SharadSammanNomination[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [statsData, setStatsData] = useState<SharadSammanDashboardData | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);

  const [search, setSearch] = useState(searchParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Status transition modal
  const [activeNomination, setActiveNomination] = useState<SharadSammanNomination | null>(null);
  const [targetStatus, setTargetStatus] = useState<NominationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const canManage = can(PERMISSIONS.MANAGE_NOMINATIONS);
  const canReview = can(PERMISSIONS.REVIEW_NOMINATIONS);
  const canShortlist = can(PERMISSIONS.SHORTLIST_NOMINATIONS) || user?.isSuperAdmin;

  // Load contest sessions once
  useEffect(() => {
    sammanService
      .getContests()
      .then(setContests)
      .catch(() => undefined);
  }, []);

  // Fetch nominations and dashboard stats
  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      sammanService.list({
        page: pageParam,
        perPage: 12,
        search: searchParam || undefined,
        status: statusParam || undefined,
        contestId: contestParam ? Number(contestParam) : undefined,
        sortDir: 'desc',
      }),
      sammanService.getDashboard(),
    ])
      .then(([listRes, dashRes]) => {
        setItems(listRes.items);
        setPagination(listRes.pagination);
        setStatsData(dashRes);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load nominations.');
      })
      .finally(() => setLoading(false));
  }, [pageParam, searchParam, statusParam, contestParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (search.trim()) {
      nextParams.set('search', search.trim());
    } else {
      nextParams.delete('search');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  // Handle Status Tab Click
  const handleStatusTab = (status: NominationStatus | '') => {
    const nextParams = new URLSearchParams(searchParams);
    if (status) {
      nextParams.set('status', status);
    } else {
      nextParams.delete('status');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  // Handle Contest Filter Change
  const handleContestChange = (contestIdStr: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (contestIdStr) {
      nextParams.set('contestId', contestIdStr);
    } else {
      nextParams.delete('contestId');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  // Status Change Workflow
  const openStatusModal = (nomination: SharadSammanNomination, nextStatus: NominationStatus) => {
    setActiveNomination(nomination);
    setTargetStatus(nextStatus);
    setRejectionReason('');
    setReviewNotes('');
  };

  const handleExecuteStatus = async () => {
    if (!activeNomination || !targetStatus) return;

    if (targetStatus === 'REJECTED' && !rejectionReason.trim()) {
      toast.warning('A rejection reason is mandatory.');
      return;
    }

    setBusy(true);
    try {
      await sammanService.changeStatus(activeNomination.id, {
        status: targetStatus,
        reason: rejectionReason.trim() || undefined,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      toast.success(
        `Nomination #${activeNomination.id} moved to ${formatNominationStatus(targetStatus)}.`,
      );
      setActiveNomination(null);
      setTargetStatus(null);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update nomination status.');
    } finally {
      setBusy(false);
    }
  };

  const stats = statsData?.stats;

  return (
    <div className="page samman-page">
      {/* Header */}
      <header className="page__header">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link></li>
              <li><span>Nominations</span></li>
            </ol>
          </nav>
          <h1 className="page__title">
            {statusParam ? `${formatNominationStatus(statusParam)} Nominations` : 'All Nominations'}
          </h1>
          <p className="page__subtitle">
            Directory of Durga Puja Committee award applications, categorized themes, and jury review workflow.
          </p>
        </div>

        <div className="page__actions" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {canManage && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_NEW)}
            >
              <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
              Add Nomination
            </Button>
          )}
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_DASHBOARD)}
          >
            <i className="fas fa-chart-pie" aria-hidden="true" style={{ marginRight: '6px' }} />
            Dashboard
          </Button>
        </div>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Top Status Tabs / Filter Cards */}
      <div className="samman-stat-grid">
        {STATUS_TABS.map((tab) => {
          const isActive = statusParam === tab.value;
          let count = stats?.total ?? 0;
          if (tab.value === 'DRAFT') count = stats?.draft ?? 0;
          else if (tab.value === 'SUBMITTED') count = stats?.submitted ?? 0;
          else if (tab.value === 'UNDER_REVIEW') count = stats?.underReview ?? 0;
          else if (tab.value === 'APPROVED') count = stats?.approved ?? 0;
          else if (tab.value === 'SHORTLISTED') count = stats?.shortlisted ?? 0;
          else if (tab.value === 'REJECTED') count = stats?.rejected ?? 0;

          return (
            <div
              key={tab.value || 'all'}
              className={`samman-stat-card ${isActive ? 'is-active' : ''}`}
              onClick={() => handleStatusTab(tab.value)}
              role="button"
              tabIndex={0}
            >
              <div className="samman-stat-card__content">
                <p className="samman-stat-card__label">{tab.label}</p>
                <p className="samman-stat-card__value">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar Card */}
      <div className="samman-filter-card">
        <form onSubmit={handleSearchSubmit} className="samman-filter-grid">
          {/* Search Box */}
          <div className="field" style={{ margin: 0 }}>
            <label className="field__label" htmlFor="nomination-search">
              Search Nominations
            </label>
            <div className="samman-search-wrapper">
              <i className="fas fa-search samman-search-icon" aria-hidden="true" />
              <input
                id="nomination-search"
                type="search"
                className="field__control samman-search-input"
                placeholder="Search committee, registration no., title, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Contest Dropdown */}
          <div className="field" style={{ margin: 0 }}>
            <label className="field__label" htmlFor="contest-filter">
              Contest Session
            </label>
            <select
              id="contest-filter"
              className="field__control"
              value={contestParam}
              onChange={(e) => handleContestChange(e.target.value)}
            >
              <option value="">All Contest Sessions</option>
              {contests.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="field" style={{ margin: 0 }}>
            <label className="field__label" htmlFor="status-filter">
              Status Filter
            </label>
            <select
              id="status-filter"
              className="field__control"
              value={statusParam}
              onChange={(e) => handleStatusTab(e.target.value as NominationStatus)}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Filter Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button type="submit" variant="secondary" size="md">
              <i className="fas fa-filter" aria-hidden="true" style={{ marginRight: '6px' }} />
              Filter
            </Button>
            {(searchParam || statusParam || contestParam) && (
              <Button type="button" variant="ghost" size="md" onClick={handleResetFilters}>
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Nominations Table Card */}
      <Card>
        {loading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <PageLoader label="Loading nominations..." />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', color: 'var(--colour-ink-faint)', marginBottom: 'var(--space-3)' }} />
            <h3 style={{ margin: '0 0 var(--space-1)', fontSize: '1rem', fontWeight: 600 }}>No Nominations Found</h3>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: '13px', color: 'var(--colour-ink-soft)' }}>
              No committee nomination records match the selected search terms or filters.
            </p>
            {(searchParam || statusParam || contestParam) ? (
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            ) : canManage ? (
              <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_NEW)}>
                <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
                Create New Nomination
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>ID</th>
                    <th>Puja Committee</th>
                    <th>Contest Session</th>
                    <th>Award Category</th>
                    <th>Presentation Title</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((nom) => {
                    const isShortlisted = nom.status === 'SHORTLISTED';
                    return (
                      <tr key={nom.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--colour-ink-soft)' }}>
                            #{nom.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--colour-ink)' }}>
                            {nom.committee?.committeeName || 'Unknown Committee'}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)' }}>
                            {nom.committee?.city} &bull; Reg: {nom.committee?.registrationNo}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge--default">
                            {nom.contest?.name || `Contest #${nom.contestId}`}
                          </span>
                        </td>
                        <td>
                          <span className="samman-category-badge">
                            <i className="fas fa-tag" style={{ fontSize: '10px' }} />
                            {nom.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--colour-ink)' }}>
                            {nom.title || 'Untitled Presentation'}
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={nom.status} />
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--colour-ink-soft)' }}>
                            {nom.submittedAt
                              ? new Date(nom.submittedAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Draft'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Details"
                              onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_DETAIL(nom.id))}
                            >
                              <i className="fas fa-eye" style={{ color: 'var(--colour-brand)' }} />
                            </Button>

                            {canManage && !isShortlisted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit Nomination"
                                onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_EDIT(nom.id))}
                              >
                                <i className="fas fa-edit" style={{ color: 'var(--colour-ink-soft)' }} />
                              </Button>
                            )}

                            {/* Quick status transition dropdown/triggers for reviewers */}
                            {canReview && canTransitionNomination(nom.status, 'UNDER_REVIEW') && (
                              <Button
                                variant="secondary"
                                size="sm"
                                title="Put Under Review"
                                onClick={() => openStatusModal(nom, 'UNDER_REVIEW')}
                              >
                                Review
                              </Button>
                            )}

                            {canReview && canTransitionNomination(nom.status, 'APPROVED') && (
                              <Button
                                variant="primary"
                                size="sm"
                                title="Approve Nomination"
                                onClick={() => openStatusModal(nom, 'APPROVED')}
                              >
                                Approve
                              </Button>
                            )}

                            {canShortlist && canTransitionNomination(nom.status, 'SHORTLISTED') && (
                              <Button
                                variant="primary"
                                size="sm"
                                title="Shortlist for Samman"
                                onClick={() => openStatusModal(nom, 'SHORTLISTED')}
                              >
                                Shortlist
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.lastPage > 1 && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--colour-border)' }}>
                <Pagination
                  meta={pagination}
                  onPageChange={(page) => {
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.set('page', String(page));
                    setSearchParams(nextParams);
                  }}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Status Transition Modal */}
      {activeNomination && targetStatus && (
        <Modal
          open={true}
          onClose={() => {
            if (!busy) {
              setActiveNomination(null);
              setTargetStatus(null);
            }
          }}
          title={`Confirm Status Transition: ${formatNominationStatus(targetStatus)}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--colour-ink)' }}>
              Are you sure you want to transition nomination <strong>#{activeNomination.id}</strong> ({activeNomination.committee?.committeeName} — <em>{activeNomination.category}</em>) to{' '}
              <strong style={{ color: 'var(--colour-brand)' }}>{formatNominationStatus(targetStatus)}</strong>?
            </p>

            {targetStatus === 'SHORTLISTED' && (
              <Alert variant="info" title="Immutable Candidate Snapshot">
                Shortlisting creates an immutable permanent snapshot of this candidate entry. Once shortlisted, standard edits to this nomination will be locked.
              </Alert>
            )}

            {targetStatus === 'REJECTED' && (
              <div className="field">
                <label className="field__label" htmlFor="modal-rejection-reason">
                  Rejection Reason <span className="field__required">*</span>
                </label>
                <textarea
                  id="modal-rejection-reason"
                  rows={3}
                  className="field__control"
                  placeholder="Explain why this nomination was rejected (e.g. documentation missing, safety requirements not met)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
                <p className="field__hint">This reason is permanently logged in the audit trail.</p>
              </div>
            )}

            <div className="field">
              <label className="field__label" htmlFor="modal-review-notes">
                Review Notes <span className="field__optional">(Optional)</span>
              </label>
              <textarea
                id="modal-review-notes"
                rows={2}
                className="field__control"
                placeholder="Internal evaluator or jury review notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setActiveNomination(null);
                  setTargetStatus(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={targetStatus === 'REJECTED' ? 'danger' : 'primary'}
                disabled={busy || (targetStatus === 'REJECTED' && !rejectionReason.trim())}
                onClick={handleExecuteStatus}
              >
                {busy ? 'Processing...' : `Confirm: ${formatNominationStatus(targetStatus)}`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default NominationListPage;
