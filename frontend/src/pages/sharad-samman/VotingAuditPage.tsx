import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { votingService } from '@/services/votingService';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import type { FlaggedVotesResponse, FlaggedVoteItem } from '@/types/voting';
import '@/styles/sharad-samman-admin.css';

export function VotingAuditPage() {
  const toast = useToast();
  const [data, setData] = useState<FlaggedVotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Review & Detail Modal state
  const [selectedVote, setSelectedVote] = useState<FlaggedVoteItem | null>(null);
  const [reviewModalAction, setReviewModalAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [viewingDetailVote, setViewingDetailVote] = useState<FlaggedVoteItem | null>(null);

  // Voting window toggle state
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [togglingWindow, setTogglingWindow] = useState(false);
  const [publishingResults, setPublishingResults] = useState(false);

  useEffect(() => {
    loadVotes();
    loadContestStatus();
  }, [page, statusFilter]);

  const loadVotes = async () => {
    try {
      setLoading(true);
      const res = await votingService.admin.getFlaggedVotes({
        page,
        limit: 50,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load votes audit log:', err);
      toast.error('Unable to load voting audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const loadContestStatus = async () => {
    try {
      const res = await votingService.public.getContest();
      if (res.contest) {
        setIsVotingOpen(res.contest.isVotingOpen);
        setResultsPublished(res.contest.resultsPublished);
      }
    } catch (err) {
      console.error('Failed to load contest status:', err);
    }
  };

  const handleToggleVoting = async () => {
    try {
      setTogglingWindow(true);
      const newStatus = !isVotingOpen;
      await votingService.admin.toggleVotingWindow({
        contestId: 1,
        isVotingOpen: newStatus,
      });
      setIsVotingOpen(newStatus);
      toast.success(newStatus ? 'Public voting window opened.' : 'Public voting window closed.');
    } catch (err) {
      console.error('Failed to toggle voting window:', err);
      toast.error('Failed to update voting window status.');
    } finally {
      setTogglingWindow(false);
    }
  };

  const handlePublishResults = async () => {
    try {
      setPublishingResults(true);
      const newStatus = !resultsPublished;
      await votingService.admin.publishResults({
        contestId: 1,
        publish: newStatus,
      });
      setResultsPublished(newStatus);
      toast.success(newStatus ? 'Voting results officially published.' : 'Voting results unpublished.');
    } catch (err) {
      console.error('Failed to publish results:', err);
      toast.error('Failed to publish voting results.');
    } finally {
      setPublishingResults(false);
    }
  };

  const executeReviewAction = async () => {
    if (!selectedVote || !reviewModalAction) return;

    try {
      setActionLoading(selectedVote.id);
      await votingService.admin.reviewFlaggedVote(selectedVote.id, {
        action: reviewModalAction,
        reviewNotes: reviewNote.trim() || undefined,
      });
      toast.success(
        reviewModalAction === 'APPROVE'
          ? `Vote #${selectedVote.id} approved into official tally.`
          : `Vote #${selectedVote.id} rejected as fraudulent ballot.`
      );
      setSelectedVote(null);
      setReviewModalAction(null);
      setReviewNote('');
      await loadVotes();
    } catch (err) {
      console.error('Failed to review vote:', err);
      toast.error('Failed to update vote review status.');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = data?.stats || {
    totalVotes: 0,
    validVotes: 0,
    flaggedVotes: 0,
    rejectedVotes: 0,
  };

  // Filter votes locally by search term
  const filteredVotes = useMemo(() => {
    if (!data?.votes) return [];
    if (!searchTerm.trim()) return data.votes;

    const term = searchTerm.toLowerCase().trim();
    return data.votes.filter(
      (v) =>
        v.voterEmail?.toLowerCase().includes(term) ||
        v.voterName?.toLowerCase().includes(term) ||
        v.ipAddress?.toLowerCase().includes(term) ||
        v.nomination?.title?.toLowerCase().includes(term) ||
        v.nomination?.committee?.committeeName?.toLowerCase().includes(term)
    );
  }, [data?.votes, searchTerm]);

  return (
    <div className="page samman-page" id="voting-audit-page">
      {/* Level 1 Header */}
      <PageHeader
        title="Voting Audit & Anti-Fraud Controls"
        description="Inspect voter telemetry, verify ballot integrity, evaluate anomaly signals, and control public voting windows."
        breadcrumbs={[
          { label: 'Admin Portal', to: ROUTES.DASHBOARD },
          { label: 'Sharad Samman', to: ROUTES.SHARAD_SAMMAN_DASHBOARD },
          { label: 'Voting Audit & Controls' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Link
              to={ROUTES.SHARAD_SAMMAN_VOTING}
              className="btn btn--secondary btn--md"
            >
              <i className="fas fa-check-to-slot" aria-hidden="true" style={{ marginRight: '6px' }} />
              Voting Windows
            </Link>
            <Link
              to={ROUTES.PUBLIC_SHARAD_SAMMAN_RESULTS}
              target="_blank"
              className="btn btn--secondary btn--md"
            >
              <i className="fas fa-chart-line" aria-hidden="true" style={{ marginRight: '6px' }} />
              Live Podium
            </Link>
            <Link
              to={ROUTES.PUBLIC_SHARAD_SAMMAN_VOTE}
              target="_blank"
              className="btn btn--outline btn--md"
            >
              <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" style={{ marginRight: '6px' }} />
              Public Voting Portal
            </Link>
          </div>
        }
      />

      {/* Contest Window & Global Switch Control Banner */}
      <Card className="samman-contest-banner" style={{ margin: 0 }}>
        <div className="samman-contest-banner__info">
          <div className="samman-contest-banner__icon">
            <i className="fas fa-shield-halved" />
          </div>
          <div>
            <h2 className="samman-contest-banner__title" style={{ fontSize: '1.15rem' }}>
              Sharad Samman 2026 — Live Voting Session
            </h2>
            <div className="samman-contest-banner__meta" style={{ gap: 'var(--space-3)', marginTop: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: isVotingOpen ? 'var(--colour-success-tint)' : 'var(--colour-danger-tint)',
                  color: isVotingOpen ? 'var(--colour-success)' : 'var(--colour-danger)',
                  border: `1px solid ${isVotingOpen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              >
                <i className={`fas fa-broadcast-tower text-xs ${isVotingOpen ? 'fa-fade' : ''}`} />
                {isVotingOpen ? 'Voting Window: OPEN (Accepting Ballots)' : 'Voting Window: CLOSED (Suspended)'}
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: resultsPublished ? 'var(--colour-info-tint)' : 'var(--colour-warning-tint)',
                  color: resultsPublished ? 'var(--colour-info)' : 'var(--colour-warning)',
                  border: `1px solid ${resultsPublished ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                }}
              >
                <i className="fas fa-trophy text-xs" />
                {resultsPublished ? 'Official Podium: PUBLISHED' : 'Official Podium: LIVE DRAFT'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant={isVotingOpen ? 'danger' : 'success'}
            size="md"
            loading={togglingWindow}
            onClick={handleToggleVoting}
          >
            <i className={`fas ${isVotingOpen ? 'fa-lock' : 'fa-lock-open'}`} style={{ marginRight: '6px' }} />
            {isVotingOpen ? 'Close Public Voting' : 'Open Public Voting'}
          </Button>

          <Button
            variant={resultsPublished ? 'secondary' : 'primary'}
            size="md"
            loading={publishingResults}
            onClick={handlePublishResults}
          >
            <i className="fas fa-trophy" style={{ marginRight: '6px' }} />
            {resultsPublished ? 'Unpublish Results' : 'Finalize & Publish Results'}
          </Button>
        </div>
      </Card>

      {/* KPI Metric Stat Cards Grid */}
      <div className="samman-stat-grid">
        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => {
            setStatusFilter('ALL');
            setPage(1);
          }}
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--info">
            <i className="fas fa-check-to-slot" />
          </div>
          <div className="samman-stat-card__content">
            <p className="samman-stat-card__label">Total Ballots Cast</p>
            <h3 className="samman-stat-card__value">{stats.totalVotes}</h3>
          </div>
        </button>

        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'VALID' ? 'is-active' : ''}`}
          onClick={() => {
            setStatusFilter('VALID');
            setPage(1);
          }}
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--success">
            <i className="fas fa-circle-check" />
          </div>
          <div className="samman-stat-card__content">
            <p className="samman-stat-card__label">Valid (In Official Tally)</p>
            <h3 className="samman-stat-card__value" style={{ color: 'var(--colour-success)' }}>
              {stats.validVotes}
            </h3>
          </div>
        </button>

        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'FLAGGED' ? 'is-active' : ''}`}
          onClick={() => {
            setStatusFilter('FLAGGED');
            setPage(1);
          }}
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--warning">
            <i className="fas fa-triangle-exclamation" />
          </div>
          <div className="samman-stat-card__content">
            <p className="samman-stat-card__label">Flagged for Review</p>
            <h3 className="samman-stat-card__value" style={{ color: 'var(--colour-warning)' }}>
              {stats.flaggedVotes}
            </h3>
          </div>
        </button>

        <button
          type="button"
          className={`samman-stat-card ${statusFilter === 'REJECTED' ? 'is-active' : ''}`}
          onClick={() => {
            setStatusFilter('REJECTED');
            setPage(1);
          }}
        >
          <div className="samman-stat-card__icon samman-stat-card__icon--danger">
            <i className="fas fa-circle-xmark" />
          </div>
          <div className="samman-stat-card__content">
            <p className="samman-stat-card__label">Rejected Fraud Ballots</p>
            <h3 className="samman-stat-card__value" style={{ color: 'var(--colour-danger)' }}>
              {stats.rejectedVotes}
            </h3>
          </div>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="samman-filter-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {/* Status Tabs */}
          <div className="samman-status-tabs" role="tablist">
            {[
              { key: 'ALL', label: 'All Ballots', count: stats.totalVotes },
              { key: 'VALID', label: 'Valid Only', count: stats.validVotes },
              { key: 'FLAGGED', label: 'Flagged Queue', count: stats.flaggedVotes },
              { key: 'REJECTED', label: 'Rejected Fraud', count: stats.rejectedVotes },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`samman-status-tab ${statusFilter === tab.key ? 'samman-status-tab--active' : ''}`}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
              >
                <span>{tab.label}</span>
                <span className="samman-status-tab__badge">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search Box & Refresh Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="samman-search-wrapper" style={{ width: '280px' }}>
              <i className="fas fa-search samman-search-icon" />
              <input
                type="text"
                className="input samman-search-input"
                placeholder="Search voter, email, IP or candidate…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--colour-ink-soft)',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-times" />
                </button>
              )}
            </div>

            <Button
              variant="secondary"
              size="md"
              loading={loading}
              onClick={loadVotes}
              title="Refresh live telemetry"
            >
              <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} style={{ marginRight: '6px' }} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Audit Data Table */}
      <Card className="card--table" title={`Audit Ballots (${filteredVotes.length})`}>
        <div className="table-wrapper">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th scope="col" style={{ width: '24%' }}>Voter Identity</th>
                <th scope="col" style={{ width: '24%' }}>Candidate Pandal</th>
                <th scope="col" style={{ width: '14%' }}>Risk Assessment</th>
                <th scope="col" style={{ width: '20%' }}>Forensic Anomaly Signal</th>
                <th scope="col" style={{ width: '10%' }}>Status</th>
                <th scope="col" style={{ width: '8%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table__placeholder" style={{ padding: 'var(--space-8)' }}>
                    <Spinner label="Loading ballot telemetry logs…" />
                  </td>
                </tr>
              ) : filteredVotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table__placeholder" style={{ padding: 'var(--space-8)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <i className="fas fa-shield-halved" style={{ fontSize: '2rem', color: 'var(--colour-ink-faint)' }} />
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--colour-ink-soft)' }}>
                        No ballots found matching the current filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVotes.map((vote) => {
                  const riskLevel =
                    vote.riskScore >= 70 ? 'danger' : vote.riskScore >= 30 ? 'warning' : 'success';

                  return (
                    <tr key={vote.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Voter Identity */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--colour-canvas)',
                              border: '1px solid var(--colour-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: 'var(--colour-ink-soft)',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            <i className="fas fa-user-check" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--colour-ink)' }}>
                              {vote.voterName || 'Anonymous Voter'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)' }}>
                              {vote.voterEmail}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              {vote.ipAddress && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    background: 'var(--colour-canvas)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--colour-border)',
                                    color: 'var(--colour-ink-soft)',
                                  }}
                                >
                                  <i className="fas fa-network-wired" style={{ marginRight: '4px', opacity: 0.7 }} />
                                  {vote.ipAddress}
                                </span>
                              )}
                              {vote.voterCity && (
                                <span style={{ fontSize: '11px', color: 'var(--colour-ink-soft)' }}>
                                  • {vote.voterCity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Candidate Pandal */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--colour-ink)', lineHeight: 1.3 }}>
                          {vote.nomination?.title || vote.nomination?.committee?.committeeName || 'Unknown Candidate'}
                        </div>
                        {vote.nomination?.committee?.committeeName && (
                          <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', marginTop: '2px' }}>
                            <i className="fas fa-landmark" style={{ marginRight: '4px' }} />
                            {vote.nomination.committee.committeeName}
                          </div>
                        )}
                        {vote.nomination?.category && (
                          <div style={{ marginTop: '4px' }}>
                            <span className="samman-category-badge" style={{ fontSize: '11px', padding: '2px 8px' }}>
                              {vote.nomination.category}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Risk Score */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Badge variant={riskLevel}>{vote.riskScore} / 100</Badge>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: `var(--colour-${riskLevel})` }}>
                              {vote.riskScore >= 70 ? 'High' : vote.riskScore >= 30 ? 'Medium' : 'Clean'}
                            </span>
                          </div>
                          {/* Risk Progress Bar */}
                          <div
                            style={{
                              width: '100%',
                              height: '5px',
                              background: 'var(--colour-canvas)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              border: '1px solid var(--colour-border)',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(vote.riskScore, 100)}%`,
                                height: '100%',
                                background:
                                  vote.riskScore >= 70
                                    ? 'var(--colour-danger)'
                                    : vote.riskScore >= 30
                                    ? 'var(--colour-warning)'
                                    : 'var(--colour-success)',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Forensic Anomaly Signal */}
                      <td>
                        <div style={{ fontSize: '12.5px', color: 'var(--colour-ink)', lineHeight: 1.4 }}>
                          {vote.flagReason || (
                            <span style={{ color: 'var(--colour-ink-soft)', fontStyle: 'italic' }}>
                              Standard verified OTP submission
                            </span>
                          )}
                        </div>
                        {vote.reviewNotes && (
                          <div
                            style={{
                              marginTop: '6px',
                              padding: '4px 8px',
                              background: 'var(--colour-info-tint)',
                              borderRadius: '4px',
                              fontSize: '11.5px',
                              color: 'var(--colour-info)',
                            }}
                          >
                            <i className="fas fa-note-sticky" style={{ marginRight: '4px' }} />
                            Audit Note: {vote.reviewNotes}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={vote.status}>
                          {vote.status === 'VALID'
                            ? 'Valid'
                            : vote.status === 'FLAGGED'
                            ? 'Flagged'
                            : 'Rejected'}
                        </StatusBadge>
                      </td>

                      {/* Actions Column */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {vote.status === 'FLAGGED' ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                title="Approve vote into official tally"
                                onClick={() => {
                                  setSelectedVote(vote);
                                  setReviewModalAction('APPROVE');
                                  setReviewNote('');
                                }}
                              >
                                <i className="fas fa-check" />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                title="Reject vote as fraud"
                                onClick={() => {
                                  setSelectedVote(vote);
                                  setReviewModalAction('REJECT');
                                  setReviewNote('');
                                }}
                              >
                                <i className="fas fa-ban" />
                              </Button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="icon-button icon-button--secondary"
                              title="View full audit payload"
                              onClick={() => setViewingDetailVote(vote)}
                            >
                              <i className="fas fa-eye" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Confirmation Modal */}
      <Modal
        open={selectedVote !== null && reviewModalAction !== null}
        title={reviewModalAction === 'APPROVE' ? 'Approve Flagged Ballot' : 'Reject Fraudulent Ballot'}
        onClose={() => {
          setSelectedVote(null);
          setReviewModalAction(null);
        }}
      >
        {selectedVote && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--colour-ink)' }}>
              Are you sure you want to <strong>{reviewModalAction === 'APPROVE' ? 'APPROVE' : 'REJECT'}</strong> this ballot from{' '}
              <strong>{selectedVote.voterEmail}</strong>?
            </p>

            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--colour-canvas)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12.5px',
                border: '1px solid var(--colour-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div><strong>Voter:</strong> {selectedVote.voterName || 'Anonymous'} ({selectedVote.voterEmail})</div>
              <div><strong>Candidate:</strong> {selectedVote.nomination?.title}</div>
              <div><strong>Anomaly Flag:</strong> {selectedVote.flagReason || 'None'}</div>
              <div><strong>Risk Score:</strong> {selectedVote.riskScore} / 100</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Audit Review Notes (Optional):
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Enter justification for the audit log…"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedVote(null);
                  setReviewModalAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={reviewModalAction === 'APPROVE' ? 'success' : 'danger'}
                loading={actionLoading !== null}
                onClick={executeReviewAction}
              >
                {reviewModalAction === 'APPROVE' ? 'Approve into Tally' : 'Reject & Blacklist'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Forensic Detail Modal */}
      <Modal
        open={viewingDetailVote !== null}
        title={`Ballot Audit Details #${viewingDetailVote?.id ?? ''}`}
        onClose={() => setViewingDetailVote(null)}
      >
        {viewingDetailVote && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="samman-detail-row">
              <span className="samman-detail-row__label">Voter Email</span>
              <span className="samman-detail-row__value">{viewingDetailVote.voterEmail}</span>
            </div>
            <div className="samman-detail-row">
              <span className="samman-detail-row__label">Voter Name & Location</span>
              <span className="samman-detail-row__value">
                {viewingDetailVote.voterName || 'Anonymous'} • {viewingDetailVote.voterCity || 'N/A'}, {viewingDetailVote.voterCountry || 'N/A'}
              </span>
            </div>
            <div className="samman-detail-row">
              <span className="samman-detail-row__label">Origin IP Address</span>
              <span className="samman-detail-row__value">
                <code>{viewingDetailVote.ipAddress || '127.0.0.1'}</code>
              </span>
            </div>
            <div className="samman-detail-row">
              <span className="samman-detail-row__label">Device Fingerprint</span>
              <span className="samman-detail-row__value">
                <code>{viewingDetailVote.deviceFingerprint || 'fp_standard_browser_signature'}</code>
              </span>
            </div>
            <div className="samman-detail-row">
              <span className="samman-detail-row__label">Candidate Pandal</span>
              <span className="samman-detail-row__value">
                {viewingDetailVote.nomination?.title || 'N/A'} ({viewingDetailVote.nomination?.committee?.committeeName || 'N/A'})
              </span>
            </div>
            <div className="samman-detail-row">
              <span className="samman-detail-row__label">Risk Score & Anomaly Flag</span>
              <span className="samman-detail-row__value">
                <Badge variant={viewingDetailVote.riskScore >= 70 ? 'danger' : viewingDetailVote.riskScore >= 30 ? 'warning' : 'success'}>
                  {viewingDetailVote.riskScore} / 100
                </Badge>{' '}
                {viewingDetailVote.flagReason || 'None'}
              </span>
            </div>
            <div className="samman-detail-row">
              <span className="samman-detail-row__label">Timestamp (UTC)</span>
              <span className="samman-detail-row__value">
                {new Date(viewingDetailVote.createdAt).toLocaleString()}
              </span>
            </div>
            {viewingDetailVote.reviewNotes && (
              <div className="samman-detail-row">
                <span className="samman-detail-row__label">Admin Audit Notes</span>
                <span className="samman-detail-row__value" style={{ color: 'var(--colour-info)' }}>
                  {viewingDetailVote.reviewNotes}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
              <Button variant="secondary" onClick={() => setViewingDetailVote(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VotingAuditPage;
