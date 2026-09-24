import { useEffect, useState, useId } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { sammanService } from '@/services/sammanService';
import { useAuth } from '@/hooks/useAuth';
import type {
  ConfigureVotingPayload,
  ExtendVotingPayload,
  VotingContestDetail,
  VotingStatus,
} from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function toInputDateTimeString(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getVotingStatusTone(status: VotingStatus): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'EXTENDED':
      return 'info';
    case 'SCHEDULED':
      return 'warning';
    case 'CLOSED':
      return 'danger';
    case 'NOT_CONFIGURED':
    default:
      return 'neutral';
  }
}

function getVotingStatusLabel(status: VotingStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Voting Live';
    case 'EXTENDED':
      return 'Voting Extended';
    case 'SCHEDULED':
      return 'Scheduled';
    case 'CLOSED':
      return 'Voting Closed';
    case 'NOT_CONFIGURED':
    default:
      return 'Not Configured';
  }
}

export function ContestVotingDetailPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_CONTESTS);

  const [contest, setContest] = useState<VotingContestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal States
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);

  // Form states
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [extendedUntilInput, setExtendedUntilInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Unique IDs for form inputs
  const startInputId = useId();
  const endInputId = useId();
  const extInputId = useId();

  const loadContest = async () => {
    if (!contestId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sammanService.getVotingContest(Number(contestId));
      setContest(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load contest voting details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContest();
  }, [contestId]);

  // Open Configure Modal
  const handleOpenConfigure = () => {
    if (!contest) return;
    setFormError(null);
    const defaultStart = contest.votingStartDate
      ? toInputDateTimeString(contest.votingStartDate)
      : toInputDateTimeString(new Date().toISOString());
    const defaultEnd = contest.votingEndDate
      ? toInputDateTimeString(contest.votingEndDate)
      : '';

    setStartDateInput(defaultStart);
    setEndDateInput(defaultEnd);
    setIsConfigureOpen(true);
  };

  // Handle Start Date change without automatically changing End Date unless it becomes invalid
  const handleStartDateChange = (newStart: string) => {
    setStartDateInput(newStart);
    setFormError(null);
    if (endDateInput && newStart) {
      const startTime = new Date(newStart).getTime();
      const endTime = new Date(endDateInput).getTime();
      if (!isNaN(startTime) && !isNaN(endTime) && endTime <= startTime) {
        setEndDateInput('');
      }
    }
  };

  // Open Extend Modal
  const handleOpenExtend = () => {
    if (!contest) return;
    setFormError(null);
    const effDate = contest.effectiveClosingDate ? new Date(contest.effectiveClosingDate) : new Date();
    // Default +3 days from current effective closing date
    const suggestedExt = new Date(effDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    setExtendedUntilInput(toInputDateTimeString(suggestedExt.toISOString()));
    setIsExtendOpen(true);
  };

  // Submit Configure
  const handleConfigureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contest || !contestId) return;

    if (!startDateInput || !endDateInput) {
      setFormError('Please provide both Voting Start Date and End Date.');
      return;
    }

    const start = new Date(startDateInput);
    const end = new Date(endDateInput);

    if (start >= end) {
      setFormError('Voting End Date & Time must be strictly after Voting Start Date & Time.');
      return;
    }

    setActionLoading(true);
    setFormError(null);
    try {
      const payload: ConfigureVotingPayload = {
        votingStartDate: start.toISOString(),
        votingEndDate: end.toISOString(),
      };
      const updated = await sammanService.configureVoting(Number(contestId), payload);
      setContest(updated);
      setIsConfigureOpen(false);
      setSuccessMessage('Voting window has been configured successfully.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to configure voting.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Extend
  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contest || !contestId) return;

    if (!extendedUntilInput) {
      setFormError('Please specify the new Extended Until date.');
      return;
    }

    const ext = new Date(extendedUntilInput);
    const eff = contest.effectiveClosingDate ? new Date(contest.effectiveClosingDate) : null;

    if (eff && ext <= eff) {
      setFormError(
        `Extension date must be strictly after the current effective closing date (${dateTimeFormatter.format(eff)}).`,
      );
      return;
    }

    setActionLoading(true);
    setFormError(null);
    try {
      const payload: ExtendVotingPayload = {
        votingExtendedUntil: ext.toISOString(),
      };
      const updated = await sammanService.extendVoting(Number(contestId), payload);
      setContest(updated);
      setIsExtendOpen(false);
      setSuccessMessage('Voting has been extended successfully.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to extend voting.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Close
  const handleCloseConfirm = async () => {
    if (!contest || !contestId) return;

    setActionLoading(true);
    setError(null);
    try {
      const updated = await sammanService.closeVoting(Number(contestId));
      setContest(updated);
      setIsCloseOpen(false);
      setSuccessMessage('Voting for this contest has been closed.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to close voting.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page samman-page" style={{ padding: 'var(--space-8)' }}>
        <PageLoader />
      </div>
    );
  }

  if (error && !contest) {
    return (
      <div className="page samman-page">
        <header className="page__header">
          <div className="page__titles">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link>
                </li>
                <li>
                  <Link to={ROUTES.SHARAD_SAMMAN_VOTING}>Voting Management</Link>
                </li>
                <li>
                  <span>Contest Not Found</span>
                </li>
              </ol>
            </nav>
            <h1 className="page__title">Contest Voting Management</h1>
          </div>
        </header>
        <Alert variant="error">{error}</Alert>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button variant="secondary" onClick={() => navigate(ROUTES.SHARAD_SAMMAN_VOTING)}>
            <i className="fas fa-arrow-left" aria-hidden="true" style={{ marginRight: '6px' }} />
            Back to Voting Management
          </Button>
        </div>
      </div>
    );
  }

  if (!contest) return null;

  const isClosed = contest.votingStatus === 'CLOSED';
  const isConfigured = Boolean(contest.votingStartDate && contest.votingEndDate);
  const now = new Date();
  const effectiveClosing = contest.effectiveClosingDate ? new Date(contest.effectiveClosingDate) : null;
  const isExpired = effectiveClosing ? now >= effectiveClosing : false;

  return (
    <div className="page samman-page" id="contest-voting-detail-page">
      {/* Level 2 Breadcrumb & Header */}
      <header className="page__header">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link>
              </li>
              <li>
                <Link to={ROUTES.SHARAD_SAMMAN_VOTING}>Voting Management</Link>
              </li>
              <li>
                <span>{contest.name} ({contest.year})</span>
              </li>
            </ol>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h1 className="page__title" style={{ margin: 0 }}>
              {contest.name}
            </h1>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--colour-ink-soft)' }}>
              Edition {contest.year}
            </span>
            <StatusBadge
              tone={getVotingStatusTone(contest.votingStatus)}
              label={getVotingStatusLabel(contest.votingStatus)}
            />
          </div>
          <p className="page__subtitle">
            Configure public voting schedule, extend deadlines, and monitor shortlisted candidate entries strictly for this contest.
          </p>
        </div>

        <div className="page__actions" style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_VOTING)}
          >
            <i className="fas fa-arrow-left" aria-hidden="true" style={{ marginRight: '6px' }} />
            All Sessions
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATIONS + `?contestId=${contest.id}&status=SHORTLISTED`)}
          >
            <i className="fas fa-list-check" aria-hidden="true" style={{ marginRight: '6px' }} />
            Shortlist Queue
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => window.open(`${ROUTES.PUBLIC_SHARAD_SAMMAN_VOTE}?contestId=${contest.id}`, '_blank')}
            style={{ color: 'var(--colour-brand)', borderColor: 'var(--colour-brand)' }}
            title="Open Public Voting Portal for this contest in new tab"
          >
            <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" style={{ marginRight: '6px' }} />
            Public Voting Portal
          </Button>
        </div>
      </header>

      {/* Notifications */}
      {successMessage && (
        <Alert
          variant="success"
          style={{ marginBottom: 'var(--space-4)' }}
          onDismiss={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </Alert>
      )}

      {/* Level 2 Contest Overview & Actions Hero Card */}
      <div className="voting-detail-hero" id="voting-detail-hero-card">
        <div className="voting-detail-hero__top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--colour-ink-soft)' }}>
                Contest Status:
              </span>
              <StatusBadge
                tone={contest.contestStatus === 'ACTIVE' ? 'success' : contest.contestStatus === 'CLOSED' ? 'neutral' : 'warning'}
                label={contest.contestStatus}
              />
            </div>
            {contest.description && (
              <p style={{ margin: '4px 0 0', color: 'var(--colour-ink-soft)', fontSize: '0.9rem', maxWidth: '650px' }}>
                {contest.description}
              </p>
            )}
          </div>

          {/* Action Buttons strictly scoped to contestId */}
          <div className="voting-detail-hero__actions">
            {canManage && (
              <>
                {!isClosed ? (
                  <>
                    <Button
                      variant={isConfigured ? 'secondary' : 'primary'}
                      size="md"
                      id="btn-configure-voting"
                      onClick={handleOpenConfigure}
                    >
                      <i className="fas fa-calendar-days" aria-hidden="true" style={{ marginRight: '6px' }} />
                      {isConfigured ? 'Reconfigure Window' : 'Configure / Start Voting'}
                    </Button>

                    {isConfigured && (
                      <Button
                        variant="secondary"
                        size="md"
                        id="btn-extend-voting"
                        onClick={handleOpenExtend}
                        style={{ color: '#0284c7', borderColor: '#bae6fd' }}
                      >
                        <i className="fas fa-calendar-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
                        Extend Voting
                      </Button>
                    )}

                    {isConfigured && (
                      <Button
                        variant="danger"
                        size="md"
                        id="btn-close-voting"
                        onClick={() => setIsCloseOpen(true)}
                      >
                        <i className="fas fa-lock" aria-hidden="true" style={{ marginRight: '6px' }} />
                        Close Voting
                      </Button>
                    )}
                  </>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--colour-danger)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <i className="fas fa-lock" />
                    Voting Session Closed (Locked)
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="voting-detail-timeline-grid">
          <div className="voting-timeline-item">
            <span className="voting-timeline-item__label">Voting Status</span>
            <span className="voting-timeline-item__value">
              <StatusBadge
                tone={getVotingStatusTone(contest.votingStatus)}
                label={getVotingStatusLabel(contest.votingStatus)}
              />
            </span>
            <span className="voting-timeline-item__sub">
              {isClosed ? 'Session concluded' : isExpired ? 'Window expired' : 'Realtime status'}
            </span>
          </div>

          <div className="voting-timeline-item">
            <span className="voting-timeline-item__label">Voting Start</span>
            <span className="voting-timeline-item__value">
              {contest.votingStartDate ? dateTimeFormatter.format(new Date(contest.votingStartDate)) : 'Not Configured'}
            </span>
            <span className="voting-timeline-item__sub">
              {contest.votingStartDate ? 'Commencement date/time' : 'Requires configuration'}
            </span>
          </div>

          <div className="voting-timeline-item">
            <span className="voting-timeline-item__label">Voting End (Original)</span>
            <span className="voting-timeline-item__value">
              {contest.votingEndDate ? dateTimeFormatter.format(new Date(contest.votingEndDate)) : 'Not Configured'}
            </span>
            <span className="voting-timeline-item__sub">Scheduled deadline</span>
          </div>

          <div className="voting-timeline-item">
            <span className="voting-timeline-item__label">Extended Until</span>
            <span
              className="voting-timeline-item__value"
              style={{ color: contest.votingExtendedUntil ? '#0284c7' : 'inherit' }}
            >
              {contest.votingExtendedUntil ? dateTimeFormatter.format(new Date(contest.votingExtendedUntil)) : 'None'}
            </span>
            <span className="voting-timeline-item__sub">
              {contest.votingExtendedUntil ? 'Active extension applied' : 'No extension granted'}
            </span>
          </div>

          <div className="voting-timeline-item" style={{ background: 'rgba(217, 70, 239, 0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
            <span className="voting-timeline-item__label" style={{ color: 'var(--colour-brand)' }}>
              Effective Closing Date
            </span>
            <span className="voting-timeline-item__value" style={{ color: 'var(--colour-brand)', fontWeight: 700 }}>
              {contest.effectiveClosingDate ? dateTimeFormatter.format(new Date(contest.effectiveClosingDate)) : '—'}
            </span>
            <span className="voting-timeline-item__sub">
              Extended Until ?? Voting End
            </span>
          </div>
        </div>
      </div>

      {/* Statistics & Shortlisted Candidates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-4)' }}>
        {/* Left Column: Shortlisted Candidate Breakdown & Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                Shortlisted Candidates for Public Voting
              </h2>
              <span
                style={{
                  fontWeight: 700,
                  background: 'var(--colour-info-tint)',
                  color: 'var(--colour-info)',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                }}
              >
                {contest.shortlistedCount} candidate{contest.shortlistedCount === 1 ? '' : 's'}
              </span>
            </div>

            {contest.shortlistedNominations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)', color: 'var(--colour-ink-soft)' }}>
                <i className="fas fa-star" style={{ fontSize: '1.8rem', color: '#e2e8f0', marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  No nominations have been shortlisted for this contest session yet.
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                  Review and shortlist entries in the nomination queue to prepare the public voting ballot.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" id="shortlisted-candidates-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Committee / Pandal</th>
                      <th>Award Category</th>
                      <th>City</th>
                      <th style={{ width: '130px' }}>Shortlisted On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contest.shortlistedNominations.map((cand, idx) => (
                      <tr key={cand.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {cand.committee.pandalImage ? (
                              <img
                                src={cand.committee.pandalImage}
                                alt={cand.committee.committeeName}
                                style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '4px',
                                  background: 'var(--colour-canvas)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--colour-ink-soft)',
                                  fontSize: '12px',
                                }}
                              >
                                <i className="fas fa-torii-gate" />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600 }}>{cand.committee.committeeName}</div>
                              {cand.title && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--colour-ink-soft)' }}>
                                  Theme: {cand.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge--neutral" style={{ fontSize: '0.75rem' }}>
                            {cand.category}
                          </span>
                        </td>
                        <td>{cand.committee.city}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--colour-ink-soft)' }}>
                          {cand.shortlistedAt ? dateTimeFormatter.format(new Date(cand.shortlistedAt)) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Category Breakdown & Voting Rule Enforcement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Category Breakdown Card */}
          <Card>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Category Breakdown
            </h2>
            {contest.categoryStats.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--colour-ink-soft)', margin: 0 }}>
                No category breakdown available.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contest.categoryStats.map((cat) => (
                  <div
                    key={cat.category}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--colour-canvas)',
                      border: '1px solid var(--colour-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{cat.category}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        background: 'rgba(0,0,0,0.06)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Voting Rules & Security Guardrails Card */}
          <Card>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Contest Voting Governance
            </h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: 'var(--space-4)',
                fontSize: '0.825rem',
                color: 'var(--colour-ink-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                lineHeight: 1.45,
              }}
            >
              <li>
                <strong>Strict Contest Isolation:</strong> Timeline changes, extensions, and closure strictly affect <em>{contest.name}</em> and cannot leak across editions.
              </li>
              <li>
                <strong>Effective Closing Date:</strong> Evaluated as <code>Extended Until ?? Voting End</code>. Voting requests outside this window will be rejected.
              </li>
              <li>
                <strong>Closed State Lock:</strong> When closed, the voting window is sealed permanently.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* =======================================================================
          MODAL: Configure / Start Voting
          ======================================================================= */}
      <Modal
        open={isConfigureOpen}
        title={`Configure Voting Window — ${contest.name}`}
        onClose={() => !actionLoading && setIsConfigureOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsConfigureOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              id="btn-submit-configure-voting"
              onClick={handleConfigureSubmit}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfigureSubmit}>
          {formError && (
            <Alert variant="error" style={{ marginBottom: 'var(--space-3)' }}>
              {formError}
            </Alert>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--colour-ink-soft)', marginBottom: 'var(--space-4)' }}>
            Specify the official start and end dates and times for public voting in this contest session.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="field" style={{ margin: 0 }}>
              <label
                htmlFor={startInputId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--colour-ink)',
                }}
              >
                <span>Voting Start Date &amp; Time</span>
                <span style={{ color: 'var(--colour-danger)', fontWeight: 700 }}>*</span>
              </label>
              <div className="datetime-control-wrap">
                <i className="fas fa-calendar-check datetime-control-icon" aria-hidden="true" />
                <input
                  id={startInputId}
                  type="datetime-local"
                  className="datetime-input"
                  value={startDateInput}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                />
              </div>
              <span
                style={{
                  display: 'block',
                  marginTop: '6px',
                  fontSize: '0.775rem',
                  color: 'var(--colour-ink-soft)',
                }}
              >
                Date and time when public ballot casting becomes active.
              </span>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label
                htmlFor={endInputId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--colour-ink)',
                }}
              >
                <span>Voting End Date &amp; Time</span>
                <span style={{ color: 'var(--colour-danger)', fontWeight: 700 }}>*</span>
              </label>
              <div className="datetime-control-wrap">
                <i className="fas fa-calendar-xmark datetime-control-icon" aria-hidden="true" />
                <input
                  id={endInputId}
                  type="datetime-local"
                  className="datetime-input"
                  value={endDateInput}
                  onChange={(e) => {
                    setEndDateInput(e.target.value);
                    setFormError(null);
                  }}
                  min={startDateInput || undefined}
                  required
                />
              </div>
              <span
                style={{
                  display: 'block',
                  marginTop: '6px',
                  fontSize: '0.775rem',
                  color: 'var(--colour-ink-soft)',
                }}
              >
                Official deadline after which voting automatically closes.
              </span>
            </div>

            {/* Helper Banner */}
            <div className="voting-modal-helper-banner">
              <i className="fas fa-circle-info" style={{ color: 'var(--colour-info)', fontSize: '13px' }} aria-hidden="true" />
              <span>Voting end must be after voting start.</span>
            </div>
          </div>
        </form>
      </Modal>

      {/* =======================================================================
          MODAL: Extend Voting
          ======================================================================= */}
      <Modal
        open={isExtendOpen}
        title={`Extend Voting — ${contest.name}`}
        onClose={() => !actionLoading && setIsExtendOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsExtendOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              id="btn-submit-extend-voting"
              onClick={handleExtendSubmit}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Confirm Extension'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleExtendSubmit}>
          {formError && (
            <Alert variant="error" style={{ marginBottom: 'var(--space-3)' }}>
              {formError}
            </Alert>
          )}

          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid #bae6fd',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: '#0369a1',
              marginBottom: 'var(--space-4)',
            }}
          >
            <strong>Current Effective Closing Date:</strong>{' '}
            {contest.effectiveClosingDate ? dateTimeFormatter.format(new Date(contest.effectiveClosingDate)) : '—'}
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label
              htmlFor={extInputId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '6px',
                color: 'var(--colour-ink)',
              }}
            >
              <span>New Extended Until Date &amp; Time</span>
              <span style={{ color: 'var(--colour-danger)', fontWeight: 700 }}>*</span>
            </label>
            <div className="datetime-control-wrap">
              <i className="fas fa-calendar-plus datetime-control-icon" aria-hidden="true" style={{ color: '#0284c7' }} />
              <input
                id={extInputId}
                type="datetime-local"
                className="datetime-input"
                value={extendedUntilInput}
                onChange={(e) => setExtendedUntilInput(e.target.value)}
                min={contest.effectiveClosingDate ? toInputDateTimeString(contest.effectiveClosingDate) : undefined}
                required
              />
            </div>
            <span
              style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '0.775rem',
                color: 'var(--colour-ink-soft)',
              }}
            >
              Must be later than the current effective closing date.
            </span>
          </div>
        </form>
      </Modal>

      {/* =======================================================================
          MODAL: Close Voting Confirmation
          ======================================================================= */}
      <Modal
        open={isCloseOpen}
        title={`Close Voting — ${contest.name}`}
        onClose={() => !actionLoading && setIsCloseOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCloseOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              id="btn-confirm-close-voting"
              onClick={handleCloseConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? 'Closing...' : 'Yes, Close Voting Permanently'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--colour-danger)' }}>
            <i className="fas fa-triangle-exclamation" style={{ fontSize: '1.6rem' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Are you sure you want to close voting?
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--colour-ink-soft)' }}>
                This will finalize voting for <strong>{contest.name} ({contest.year})</strong>. Once closed, the voting window cannot be modified or re-opened.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default ContestVotingDetailPage;
