import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { formatContestDate, formatNominationStatus, nominationStatusTone } from '@/constants/samman';
import { committeeSammanService } from '@/services/sammanService';
import { useToast } from '@/hooks/useToast';
import type { Contest, NominationListQuery, NominationStatus, SharadSammanNomination } from '@/types/samman';
import type { PaginationMeta } from '@/types';

import '@/styles/sharad-samman-admin.css';

const STATUS_FILTERS: Array<{ label: string; value: NominationStatus | '' }> = [
  { label: 'All Nominations', value: '' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
];

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function MyCommitteeNominationListPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = (searchParams.get('status') as NominationStatus) || '';
  const searchParam = searchParams.get('search') || '';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [nominations, setNominations] = useState<SharadSammanNomination[]>([]);
  const [activeContest, setActiveContest] = useState<Contest | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [draftToSubmit, setDraftToSubmit] = useState<SharadSammanNomination | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<NominationListQuery>({
    page: pageParam,
    perPage: 10,
    search: searchParam,
    status: statusParam,
    sortDir: 'desc',
  });

  const [searchInput, setSearchInput] = useState(searchParam);

  const fetchNominations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await committeeSammanService.list(query);
      const safeItems = Array.isArray(data?.items) ? data.items : [];
      setNominations(safeItems);
      setActiveContest(data?.activeContest ?? null);
      setPagination(data?.pagination ?? undefined);
    } catch (err: unknown) {
      setNominations([]);
      setError(err instanceof Error ? err.message : 'Failed to load your committee nominations.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchNominations();
  }, [fetchNominations]);

  const handleStatusFilterChange = (status: NominationStatus | '') => {
    setQuery((prev) => ({ ...prev, status, page: 1 }));
    const nextParams = new URLSearchParams(searchParams);
    if (status) {
      nextParams.set('status', status);
    } else {
      nextParams.delete('status');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, search: searchInput.trim(), page: 1 }));
    const nextParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      nextParams.set('search', searchInput.trim());
    } else {
      nextParams.delete('search');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSearchReset = () => {
    setSearchInput('');
    setQuery((prev) => ({ ...prev, search: '', status: '', page: 1 }));
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    nextParams.delete('status');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleConfirmSubmit = async () => {
    if (!draftToSubmit) return;

    setSubmittingId(draftToSubmit.id);
    try {
      await committeeSammanService.submit(draftToSubmit.id);
      toast.success(`Nomination for "${draftToSubmit.category}" submitted successfully for administrative review!`);
      setDraftToSubmit(null);
      await fetchNominations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit nomination.');
    } finally {
      setSubmittingId(null);
    }
  };

  const hasActiveFilters = Boolean(query.status || query.search);
  const isContestActive = activeContest?.status === 'ACTIVE';

  return (
    <div className="page samman-page">
      <PageHeader
        title="Sharad Samman — My Nominations"
        description="Manage your Puja Committee's award entries, track review status, and submit nominations across multiple categories."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Sharad Samman', to: ROUTES.MY_COMMITTEE_NOMINATIONS },
          { label: 'My Nominations' },
        ]}
        actions={
          isContestActive ? (
            <Link
              to={ROUTES.MY_COMMITTEE_NOMINATION_NEW}
              className="btn btn--primary btn--sm samman-header-action-btn"
            >
              <i className="fas fa-plus" aria-hidden="true" />
              <span>Submit New Nomination</span>
            </Link>
          ) : (
            <span className="badge badge--neutral" style={{ padding: '6px 12px', fontSize: '13px' }}>
              Submissions Closed
            </span>
          )
        }
      />

      {/* Guideline / Contest Info Banner */}
      <div className="samman-contest-banner">
        <div className="samman-contest-banner__info">
          <div className="samman-contest-banner__icon" aria-hidden="true">
            <i className="fas fa-trophy" />
          </div>
          <div>
            <h2 className="samman-contest-banner__title">
              {activeContest ? `${activeContest.name} (${activeContest.year})` : 'Active Sharad Samman Contest'}
            </h2>
            <div className="samman-contest-banner__meta">
              <span>
                <i className="far fa-calendar-alt" aria-hidden="true" style={{ marginRight: '4px' }} />
                Contest Year: <strong>{activeContest?.year ? String(activeContest.year) : '—'}</strong>
              </span>
              {activeContest?.endDate && formatContestDate(activeContest.endDate) && (
                <>
                  <span>&bull;</span>
                  <span style={{ color: 'var(--colour-brand)', fontWeight: 600 }}>
                    <i className="far fa-clock" aria-hidden="true" style={{ marginRight: '4px' }} />
                    Submission Deadline: {formatContestDate(activeContest.endDate)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '440px', fontSize: '12.5px', color: 'var(--colour-ink-soft)', lineHeight: 1.45 }}>
          <strong>Multi-Category Nomination Policy:</strong> Your Puja Committee may submit entries across multiple distinct award categories, with a limit of <strong>one nomination per category</strong>. Drafts can be edited anytime prior to submission.
        </div>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Button variant="secondary" size="sm" onClick={fetchNominations}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Search & Status Filters Card */}
      <div className="samman-filter-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Segmented Status Tabs */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--colour-ink-soft)', marginBottom: 'var(--space-2)' }}>
              Filter by Lifecycle Status
            </div>
            <div className="samman-status-tabs" role="tablist" aria-label="Filter nominations by status">
              {STATUS_FILTERS.map((filter) => {
                const isActive = (query.status ?? '') === filter.value;
                return (
                  <button
                    key={filter.value || 'all'}
                    type="button"
                    className={`samman-status-tab ${isActive ? 'samman-status-tab--active' : ''}`}
                    onClick={() => handleStatusFilterChange(filter.value)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }} className="samman-search-wrapper">
              <i className="fas fa-search samman-search-icon" aria-hidden="true" />
              <input
                type="search"
                className="field__control samman-search-input"
                placeholder="Search by nomination title, theme, or award category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" loading={loading && Boolean(searchInput)}>
                <i className="fas fa-search" aria-hidden="true" style={{ marginRight: '6px' }} />
                Search
              </Button>
              {hasActiveFilters && (
                <Button type="button" variant="secondary" onClick={handleSearchReset}>
                  Reset
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Nominations List View */}
      <Card>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <PageLoader label="Loading your nominations..." />
          </div>
        ) : nominations.length === 0 ? (
          hasActiveFilters ? (
            /* Empty Filter / Search Result State */
            <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
              <i
                className="fas fa-search"
                style={{ fontSize: '2.5rem', color: 'var(--colour-ink-faint)', marginBottom: 'var(--space-3)' }}
                aria-hidden="true"
              />
              <h3 style={{ margin: '0 0 var(--space-1)', fontSize: '1.1rem', fontWeight: 600 }}>
                No Matching Nominations
              </h3>
              <p style={{ margin: '0 auto var(--space-4)', maxWidth: '440px', fontSize: '13px', color: 'var(--colour-ink-soft)', lineHeight: 1.5 }}>
                No nominations match your active status or search query. Try selecting a different status tab or clearing the search terms.
              </p>
              <Button variant="secondary" onClick={handleSearchReset}>
                Clear Filters & Search
              </Button>
            </div>
          ) : (
            /* First-time Zero Nominations State */
            <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--colour-brand-tint)',
                  color: 'var(--colour-brand)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <i className="fas fa-trophy" aria-hidden="true" />
              </div>
              <h3 style={{ margin: '0 0 var(--space-1)', fontSize: '1.2rem', fontWeight: 700 }}>
                No Nominations Created Yet
              </h3>
              <p style={{ margin: '0 auto var(--space-5)', maxWidth: '480px', fontSize: '13.5px', color: 'var(--colour-ink-soft)', lineHeight: 1.5 }}>
                Your Puja Committee has not submitted any award nominations for {activeContest?.name || 'the active contest'} yet. Showcase your artistic pandal concept, theme, lighting, or idol craftsmanship to gain state-level recognition.
              </p>
              {isContestActive ? (
                <Link to={ROUTES.MY_COMMITTEE_NOMINATION_NEW} className="btn btn--primary">
                  <i className="fas fa-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
                  Submit Your First Nomination
                </Link>
              ) : (
                <span className="badge badge--neutral" style={{ padding: '6px 16px', fontSize: '14px' }}>
                  Contest is {activeContest?.status || 'Inactive'} &bull; Submissions Closed
                </span>
              )}
            </div>
          )
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '180px' }}>Category</th>
                    <th style={{ minWidth: '240px' }}>Theme / Title</th>
                    <th style={{ minWidth: '140px' }}>Contest</th>
                    <th style={{ minWidth: '120px' }}>Status</th>
                    <th style={{ minWidth: '130px' }}>Last Updated</th>
                    <th style={{ minWidth: '160px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nominations.map((nom) => {
                    const isDraft = nom.status === 'DRAFT';
                    const dateToDisplay = nom.submittedAt || nom.updatedAt || nom.createdAt;

                    return (
                      <tr key={nom.id}>
                        <td>
                          <span className="samman-category-badge">
                            <i className="fas fa-tag" style={{ fontSize: '10px' }} aria-hidden="true" />
                            {nom.category}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--colour-ink)', fontSize: '14px' }}>
                            {nom.title || 'Untitled Theme'}
                          </div>
                          {nom.description && (
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'var(--colour-ink-soft)',
                                marginTop: '3px',
                                maxWidth: '380px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={nom.description}
                            >
                              {nom.description}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '13px' }}>
                          <div style={{ fontWeight: 500 }}>{nom.contest?.name || 'Active Contest'}</div>
                          <span style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)' }}>
                            Year {nom.contest?.year}
                          </span>
                        </td>
                        <td>
                          <StatusBadge
                            status={nom.status}
                            label={formatNominationStatus(nom.status)}
                            tone={nominationStatusTone(nom.status)}
                          />
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--colour-ink-soft)' }}>
                          <div>{dateFormatter.format(new Date(dateToDisplay))}</div>
                          <span style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                            {isDraft ? 'Draft Saved' : 'Submitted'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 'var(--space-2)', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Link
                              to={ROUTES.MY_COMMITTEE_NOMINATION_DETAIL(nom.id)}
                              className="btn btn--secondary btn--sm"
                              title="View full nomination details"
                            >
                              <i className="fas fa-eye" aria-hidden="true" style={{ marginRight: '4px' }} />
                              View
                            </Link>

                            {isDraft && (
                              <>
                                <Link
                                  to={ROUTES.MY_COMMITTEE_NOMINATION_EDIT(nom.id)}
                                  className="btn btn--secondary btn--sm"
                                  title="Edit draft details"
                                >
                                  <i className="fas fa-edit" aria-hidden="true" style={{ marginRight: '4px' }} />
                                  Edit
                                </Link>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setDraftToSubmit(nom)}
                                  title="Submit nomination to reviewers"
                                >
                                  <i className="fas fa-paper-plane" aria-hidden="true" style={{ marginRight: '4px' }} />
                                  Submit
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination && pagination.lastPage > 1 && (
              <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--colour-border)' }}>
                <Pagination
                  pagination={pagination}
                  onPageChange={(page) => {
                    setQuery((prev) => ({ ...prev, page }));
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

      {/* Submit Confirmation Modal */}
      {draftToSubmit && (
        <Modal
          open={Boolean(draftToSubmit)}
          title="Submit Nomination?"
          onClose={() => {
            if (!submittingId) setDraftToSubmit(null);
          }}
          footer={
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => setDraftToSubmit(null)}
                disabled={Boolean(submittingId)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSubmit}
                loading={Boolean(submittingId)}
              >
                <i className="fas fa-paper-plane" aria-hidden="true" style={{ marginRight: '6px' }} />
                Confirm Submission
              </Button>
            </div>
          }
        >
          <div className="samman-confirm-modal">
            <div className="samman-confirm-modal__icon-wrap" aria-hidden="true">
              <i className="fas fa-circle-info" />
            </div>
            <div className="samman-confirm-modal__content">
              <p className="samman-confirm-modal__message">
                Are you ready to submit your nomination for{' '}
                <strong>&ldquo;{draftToSubmit.category}&rdquo;</strong>?
              </p>
              <div className="samman-confirm-modal__card">
                <div className="samman-confirm-modal__row">
                  <span className="samman-confirm-modal__label">Award Category:</span>
                  <span className="samman-confirm-modal__value samman-confirm-modal__value--highlight">
                    {draftToSubmit.category}
                  </span>
                </div>
                {draftToSubmit.title && (
                  <div className="samman-confirm-modal__row">
                    <span className="samman-confirm-modal__label">Theme / Title:</span>
                    <span className="samman-confirm-modal__value">{draftToSubmit.title}</span>
                  </div>
                )}
              </div>
              <p className="samman-confirm-modal__note">
                Once submitted, this nomination is locked for administrative review. You will no longer be able to edit the details.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MyCommitteeNominationListPage;
