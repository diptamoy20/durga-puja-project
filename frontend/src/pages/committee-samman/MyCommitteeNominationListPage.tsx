import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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

  const [nominations, setNominations] = useState<SharadSammanNomination[]>([]);
  const [activeContest, setActiveContest] = useState<Contest | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<NominationListQuery>({
    page: 1,
    perPage: 10,
    search: '',
    status: statusParam,
    sortDir: 'desc',
  });

  const [searchInput, setSearchInput] = useState('');

  const fetchNominations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await committeeSammanService.list(query);
      setNominations(data.items);
      setActiveContest(data.activeContest || null);
      setPagination(data.pagination);
    } catch (err: unknown) {
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
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, search: searchInput.trim(), page: 1 }));
  };

  const handleSearchReset = () => {
    setSearchInput('');
    setQuery((prev) => ({ ...prev, search: '', page: 1 }));
  };

  const handleSubmitDraft = async (nomination: SharadSammanNomination) => {
    if (!window.confirm(`Are you sure you want to submit your nomination for "${nomination.category}"? Once submitted, it will be queued for administrative review.`)) {
      return;
    }

    setSubmittingId(nomination.id);
    try {
      await committeeSammanService.submit(nomination.id);
      toast.success(`Nomination for "${nomination.category}" submitted successfully!`);
      await fetchNominations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit nomination.');
    } finally {
      setSubmittingId(null);
    }
  };

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
          <Link to={ROUTES.MY_COMMITTEE_NOMINATION_NEW} className="btn btn--primary">
            <i className="fa-solid fa-circle-plus" aria-hidden="true" /> Submit New Nomination
          </Link>
        }
      />

      {/* Multi-Category Rule Banner */}
      <div className="samman-rule-callout" style={{ marginBottom: 'var(--space-5)' }}>
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
        <div>
          <strong>Award Nomination Guidelines:</strong> Your Puja Committee may submit nominations across multiple categories{' '}
          {activeContest ? (
            <>
              in &quot;{activeContest.name}&quot; (Contest Year: {activeContest.year}
              {formatContestDate(activeContest.endDate) && (
                <> · Last Date: {formatContestDate(activeContest.endDate)}</>
              )}
              )
            </>
          ) : (
            'in the active contest'
          )}{' '}
          (e.g. Traditional Pandal, Idol Artistry, Illumination). However, each award category allows{' '}
          <strong>exactly one nomination per committee</strong>. Drafts can be edited anytime prior to submission.
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

      {/* Search & Filter Toolbar */}
      <Card className="samman-filter-card" style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status Tabs */}
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

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="Search by theme title or award category..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: '100%', paddingLeft: 'var(--space-8)' }}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
                aria-hidden="true"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
            {query.search && (
              <Button type="button" variant="secondary" onClick={handleSearchReset}>
                Reset
              </Button>
            )}
          </form>
        </div>
      </Card>

      {/* Nominations List View */}
      {loading ? (
        <PageLoader label="Loading your nominations..." />
      ) : nominations.length === 0 ? (
        <Card>
          <div className="samman-empty-state" style={{ padding: 'var(--space-10) var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: 'var(--color-primary-base)', marginBottom: 'var(--space-3)' }}>
              <i className="fa-solid fa-trophy" aria-hidden="true" />
            </div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>No Nominations Found</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto var(--space-4)' }}>
              {query.status || query.search
                ? 'No nominations match your active filters. Try clearing the search or status filter.'
                : 'Your Puja Committee has not submitted any nominations yet. Showcase your artistic pandal theme, lighting, or idol artistry in the active Sharad Samman contest.'}
            </p>
            {query.status || query.search ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchInput('');
                  setQuery({ page: 1, perPage: 10, search: '', status: '', sortDir: 'desc' });
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to={ROUTES.MY_COMMITTEE_NOMINATION_NEW} className="btn btn--primary">
                <i className="fa-solid fa-circle-plus" aria-hidden="true" /> Submit Your First Nomination
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="table-responsive" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)' }}>Theme / Title</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)' }}>Contest</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)' }}>Date</th>
                  <th style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nominations.map((nom) => {
                  const isDraft = nom.status === 'DRAFT';
                  const dateToDisplay = nom.submittedAt || nom.createdAt;

                  return (
                    <tr key={nom.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span className="samman-category-badge">{nom.category}</span>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-emphasis)' }}>
                          {nom.title || 'Untitled Theme'}
                        </div>
                        {nom.description && (
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--color-text-muted)',
                              marginTop: '2px',
                              maxWidth: '320px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {nom.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-4)', fontSize: '0.875rem' }}>
                        <div>{nom.contest?.name || 'Active Contest'}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          Year {nom.contest?.year}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <StatusBadge
                          status={nom.status}
                          label={formatNominationStatus(nom.status)}
                          tone={nominationStatusTone(nom.status)}
                        />
                      </td>
                      <td style={{ padding: 'var(--space-4)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        <div>{dateFormatter.format(new Date(dateToDisplay))}</div>
                        <span style={{ fontSize: '0.75rem' }}>
                          {isDraft ? 'Draft Created' : 'Submitted'}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-2)', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Link
                            to={ROUTES.MY_COMMITTEE_NOMINATION_DETAIL(nom.id)}
                            className="btn btn--secondary btn--sm"
                            title="View details"
                          >
                            View
                          </Link>

                          {isDraft && (
                            <>
                              <Link
                                to={ROUTES.MY_COMMITTEE_NOMINATION_EDIT(nom.id)}
                                className="btn btn--secondary btn--sm"
                                title="Edit draft"
                              >
                                <i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Edit
                              </Link>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSubmitDraft(nom)}
                                loading={submittingId === nom.id}
                                title="Submit nomination to reviewers"
                              >
                                <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit
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
            <div style={{ marginTop: 'var(--space-5)' }}>
              <Pagination
                pagination={pagination}
                onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
