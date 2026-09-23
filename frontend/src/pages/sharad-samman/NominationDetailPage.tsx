import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import {
  canTransitionNomination,
  formatNominationStatus,
} from '@/constants/samman';
import { sammanService } from '@/services/sammanService';
import { errorMessage } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { NominationStatus, SharadSammanNomination } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="samman-detail-row">
      <span className="samman-detail-row__label">{label}</span>
      <div className="samman-detail-row__value">{children || value || '—'}</div>
    </div>
  );
}

export function NominationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { can, user } = useAuth();

  const [nomination, setNomination] = useState<SharadSammanNomination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Transition Modal State
  const [targetStatus, setTargetStatus] = useState<NominationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const canManage = can(PERMISSIONS.MANAGE_NOMINATIONS);
  const canReview = can(PERMISSIONS.REVIEW_NOMINATIONS, PERMISSIONS.MANAGE_NOMINATIONS);
  const canShortlist = can(PERMISSIONS.SHORTLIST_NOMINATIONS) || user?.isSuperAdmin;

  const loadNomination = (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    setError(null);
    sammanService
      .get(Number(id))
      .then((data) => {
        setNomination(data);
        setReviewNotes(data.reviewNotes || '');
      })
      .catch((err: unknown) => {
        setError(errorMessage(err, 'Failed to load nomination.'));
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    loadNomination();
  }, [id]);

  if (loading) return <PageLoader label="Loading nomination details..." />;

  if (!nomination) {
    return (
      <div className="page samman-page">
        <Alert variant="error">{error || 'Nomination not found.'}</Alert>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button variant="secondary" onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATIONS)}>
            &larr; Back to Nominations
          </Button>
        </div>
      </div>
    );
  }

  const promptStatus = (status: NominationStatus) => {
    setTargetStatus(status);
    setRejectionReason(nomination.rejectionReason || '');
    setReviewNotes(nomination.reviewNotes || '');
  };

  const handleExecuteStatus = async () => {
    if (!targetStatus) return;

    if (targetStatus === 'REJECTED' && !rejectionReason.trim()) {
      toast.warning('A rejection reason is mandatory.');
      return;
    }

    setBusy(true);
    try {
      const updated = await sammanService.changeStatus(nomination.id, {
        status: targetStatus,
        reason: rejectionReason.trim() || undefined,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (updated) {
        setNomination((prev) => (prev ? { ...prev, ...updated } : updated));
      }

      toast.success(
        `Nomination #${nomination.id} updated to ${formatNominationStatus(targetStatus)}.`,
      );
      setTargetStatus(null);
      loadNomination(true);
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Status transition failed.'));
    } finally {
      setBusy(false);
    }
  };

  const isShortlisted = nomination.status === 'SHORTLISTED';
  const snapshot = nomination.snapshotData;

  return (
    <div className="page samman-page">
      {/* Page Header */}
      <header className="page__header">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link></li>
              <li><Link to={ROUTES.SHARAD_SAMMAN_NOMINATIONS}>Nominations</Link></li>
              <li><span>#{nomination.id}</span></li>
            </ol>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
            <h1 className="page__title">
              {nomination.committee?.committeeName || 'Puja Committee'}
            </h1>
            <StatusBadge status={nomination.status} />
            <span className="badge badge--default">#{nomination.id}</span>
          </div>
          <p className="page__subtitle">
            Award Category: <strong>{nomination.category}</strong> &bull; {nomination.contest?.name} ({nomination.contest?.year})
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="page__actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="md"
            disabled={busy}
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATIONS)}
          >
            &larr; Back
          </Button>

          {/* Edit (allowed when not shortlisted and not approved) */}
          {canManage && !isShortlisted && nomination.status !== 'APPROVED' && (
            <Button
              variant="secondary"
              size="md"
              disabled={busy}
              onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_EDIT(nomination.id))}
            >
              <i className="fas fa-edit" aria-hidden="true" style={{ marginRight: '6px' }} />
              Edit
            </Button>
          )}

          {/* Submit */}
          {canManage && canTransitionNomination(nomination.status, 'SUBMITTED') && (
            <Button variant="primary" size="md" disabled={busy} onClick={() => promptStatus('SUBMITTED')}>
              <i className="fas fa-paper-plane" aria-hidden="true" style={{ marginRight: '6px' }} />
              Submit
            </Button>
          )}

          {/* Start Review */}
          {canReview && canTransitionNomination(nomination.status, 'UNDER_REVIEW') && (
            <Button variant="secondary" size="md" disabled={busy} onClick={() => promptStatus('UNDER_REVIEW')}>
              <i className="fas fa-search" aria-hidden="true" style={{ marginRight: '6px' }} />
              Begin Review
            </Button>
          )}

          {/* Approve */}
          {canReview && canTransitionNomination(nomination.status, 'APPROVED') && (
            <Button variant="primary" size="md" disabled={busy} onClick={() => promptStatus('APPROVED')}>
              <i className="fas fa-check-circle" aria-hidden="true" style={{ marginRight: '6px' }} />
              Approve
            </Button>
          )}

          {/* Reject */}
          {canReview && canTransitionNomination(nomination.status, 'REJECTED') && (
            <Button variant="danger" size="md" disabled={busy} onClick={() => promptStatus('REJECTED')}>
              <i className="fas fa-times-circle" aria-hidden="true" style={{ marginRight: '6px' }} />
              Reject
            </Button>
          )}

          {/* Shortlist (Requires SHORTLIST_NOMINATIONS) */}
          {canShortlist && canTransitionNomination(nomination.status, 'SHORTLISTED') && (
            <Button variant="primary" size="md" disabled={busy} onClick={() => promptStatus('SHORTLISTED')}>
              <i className="fas fa-star" aria-hidden="true" style={{ marginRight: '6px' }} />
              Shortlist for Samman
            </Button>
          )}
        </div>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Shortlist Alert Banner */}
      {isShortlisted && (
        <Alert variant="info" title="Candidate Shortlisted & Profile Sealed">
          This entry has been shortlisted for public voting and jury review. An immutable candidate profile has been sealed to preserve audit integrity and prevent post-shortlist tampering.
        </Alert>
      )}

      {/* Rejection Alert Banner */}
      {nomination.status === 'REJECTED' && (
        <Alert variant="error" title="Nomination Rejected">
          <div>
            <strong>Reason for Rejection:</strong> {nomination.rejectionReason || 'No specific reason entered.'}
          </div>
          {nomination.rejectedBy && (
            <div style={{ marginTop: 'var(--space-1)', fontSize: '12px' }}>
              Logged by {nomination.rejectedBy.name} ({nomination.rejectedBy.email}) on{' '}
              {nomination.rejectedAt ? new Date(nomination.rejectedAt).toLocaleString() : 'N/A'}
            </div>
          )}
        </Alert>
      )}

      {/* 2-Column Responsive Grid */}
      <div className="samman-detail-grid">
        {/* Left Column: Concept & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Main Details Card */}
          <Card title="Nomination Concept & Entry">
            <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
              <div className="form-grid form-grid--2">
                <DetailRow label="Award Category">
                  <span className="samman-category-badge">
                    <i className="fas fa-tag" style={{ fontSize: '10px' }} />
                    {nomination.category}
                  </span>
                </DetailRow>

                <DetailRow label="Thematic Title" value={nomination.title || 'Untitled Presentation'} />

                <DetailRow label="Contest Session" value={`${nomination.contest?.name} (${nomination.contest?.year})`} />

                <DetailRow label="Current Lifecycle Status">
                  <StatusBadge status={nomination.status} />
                </DetailRow>
              </div>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <DetailRow label="Concept & Theme Narrative">
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {nomination.description || 'No detailed concept note provided for this nomination.'}
                  </p>
                </DetailRow>
              </div>

              {nomination.reviewNotes && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <DetailRow label="Internal Evaluator / Review Notes">
                    <div style={{ background: 'var(--colour-canvas)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--colour-border)' }}>
                      {nomination.reviewNotes}
                    </div>
                  </DetailRow>
                </div>
              )}
            </div>
          </Card>

          {/* Immutable Candidate Snapshot Card */}
          {snapshot && (
            <Card title="Frozen Candidate Snapshot">
              <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                <div className="samman-snapshot-box">
                  <div className="samman-snapshot-header">
                    <div className="samman-snapshot-title">
                      <i className="fas fa-lock" aria-hidden="true" /> Sealed Candidate Record
                    </div>
                    <span className="samman-snapshot-meta">
                      Captured: {new Date(snapshot.shortlistedAt || '').toLocaleString()}
                    </span>
                  </div>

                  <div className="form-grid form-grid--2">
                    <DetailRow label="Committee Name" value={snapshot.committeeName} />
                    <DetailRow label="Registration No." value={snapshot.registrationNo} />
                    <DetailRow label="Award Category" value={snapshot.category} />
                    <DetailRow label="Venue / Pandal" value={`${snapshot.venueName || 'N/A'}, ${snapshot.city}`} />
                    <DetailRow label="Theme Title" value={snapshot.title || snapshot.category} />
                    <DetailRow
                      label="Shortlisted By"
                      value={snapshot.shortlistedBy?.name ? `${snapshot.shortlistedBy.name} (${snapshot.shortlistedBy.email})` : 'Authorized Admin'}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Audit Lifecycle Timeline */}
          <Card title="Lifecycle Audit Trail">
            <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
              <ol className="samman-timeline">
                {/* 1. Created */}
                <li className="samman-timeline__item samman-timeline__item--active">
                  <div className="samman-timeline__marker">
                    <i className="fas fa-plus" />
                  </div>
                  <div className="samman-timeline__content">
                    <div className="samman-timeline__title">
                      <span>Nomination Created as Draft</span>
                    </div>
                    <span className="samman-timeline__date">
                      {new Date(nomination.createdAt).toLocaleString()}
                      {nomination.createdBy && ` by ${nomination.createdBy.name}`}
                    </span>
                  </div>
                </li>

                {/* 2. Submitted */}
                {nomination.submittedAt && (
                  <li className="samman-timeline__item samman-timeline__item--active">
                    <div className="samman-timeline__marker">
                      <i className="fas fa-paper-plane" />
                    </div>
                    <div className="samman-timeline__content">
                      <div className="samman-timeline__title">
                        <span>Submitted for Review</span>
                      </div>
                      <span className="samman-timeline__date">
                        {new Date(nomination.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </li>
                )}

                {/* 3. Under Review */}
                {nomination.reviewedAt && (
                  <li className="samman-timeline__item samman-timeline__item--active">
                    <div className="samman-timeline__marker">
                      <i className="fas fa-search" />
                    </div>
                    <div className="samman-timeline__content">
                      <div className="samman-timeline__title">
                        <span>Review Commenced</span>
                      </div>
                      <span className="samman-timeline__date">
                        {new Date(nomination.reviewedAt).toLocaleString()}
                        {nomination.reviewedBy && ` by ${nomination.reviewedBy.name}`}
                      </span>
                    </div>
                  </li>
                )}

                {/* 4. Approved */}
                {nomination.approvedAt && (
                  <li className="samman-timeline__item samman-timeline__item--success">
                    <div className="samman-timeline__marker">
                      <i className="fas fa-check" />
                    </div>
                    <div className="samman-timeline__content">
                      <div className="samman-timeline__title">
                        <span style={{ color: 'var(--colour-success)' }}>Approved by Reviewer</span>
                      </div>
                      <span className="samman-timeline__date">
                        {new Date(nomination.approvedAt).toLocaleString()}
                        {nomination.approvedBy && ` by ${nomination.approvedBy.name}`}
                      </span>
                    </div>
                  </li>
                )}

                {/* 5. Shortlisted */}
                {nomination.shortlistedAt && (
                  <li className="samman-timeline__item samman-timeline__item--active">
                    <div className="samman-timeline__marker">
                      <i className="fas fa-star" />
                    </div>
                    <div className="samman-timeline__content">
                      <div className="samman-timeline__title">
                        <span style={{ color: 'var(--colour-info)' }}>Shortlisted for Sharad Samman</span>
                      </div>
                      <span className="samman-timeline__date">
                        {new Date(nomination.shortlistedAt).toLocaleString()}
                        {nomination.shortlistedBy && ` by ${nomination.shortlistedBy.name}`}
                      </span>
                    </div>
                  </li>
                )}

                {/* 6. Rejected */}
                {nomination.rejectedAt && (
                  <li className="samman-timeline__item samman-timeline__item--danger">
                    <div className="samman-timeline__marker">
                      <i className="fas fa-times" />
                    </div>
                    <div className="samman-timeline__content">
                      <div className="samman-timeline__title">
                        <span style={{ color: 'var(--colour-danger)' }}>Rejected</span>
                      </div>
                      <span className="samman-timeline__date">
                        {new Date(nomination.rejectedAt).toLocaleString()}
                        {nomination.rejectedBy && ` by ${nomination.rejectedBy.name}`}
                      </span>
                      {nomination.rejectionReason && (
                        <div className="samman-timeline__notes">
                          <strong>Reason:</strong> {nomination.rejectionReason}
                        </div>
                      )}
                    </div>
                  </li>
                )}
              </ol>
            </div>
          </Card>
        </div>

        {/* Right Column: Committee Info & Contest */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Committee Card */}
          <Card
            title="Puja Committee Profile"
            actions={
              nomination.committee ? (
                <Link
                  to={ROUTES.COMMITTEE_DETAIL(nomination.committee.id)}
                  className="btn btn--secondary btn--sm"
                >
                  View Profile &rarr;
                </Link>
              ) : undefined
            }
          >
            <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
              {nomination.committee ? (
                <>
                  <DetailRow label="Committee Name" value={nomination.committee.committeeName} />
                  <DetailRow label="Registration Number" value={nomination.committee.registrationNo} />
                  <DetailRow label="Location" value={`${nomination.committee.city}, ${nomination.committee.state}`} />
                  <DetailRow label="Venue / Pandal" value={nomination.committee.venueName || 'N/A'} />
                  <DetailRow label="Venue Address" value={nomination.committee.venueAddress || 'N/A'} />
                  <DetailRow label="Established Year" value={nomination.committee.establishedYear || 'N/A'} />
                  <DetailRow label="Puja Category" value={nomination.committee.pujaCategory || 'N/A'} />
                  <DetailRow label="Puja Type" value={nomination.committee.pujaType || 'N/A'} />
                  <DetailRow label="Contact Person" value={nomination.committee.contactPersonName || 'N/A'} />
                  <DetailRow label="Email" value={nomination.committee.email || 'N/A'} />
                  <DetailRow label="Mobile" value={nomination.committee.mobile || 'N/A'} />
                </>
              ) : (
                <p style={{ color: 'var(--colour-ink-soft)', fontSize: '13px', margin: 0 }}>
                  Committee details unavailable.
                </p>
              )}
            </div>
          </Card>

          {/* Contest Card */}
          <Card title="Contest Session">
            <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
              <DetailRow label="Session Title" value={nomination.contest?.name || `#${nomination.contestId}`} />
              <DetailRow label="Competition Year" value={nomination.contest?.year} />
              <DetailRow label="Contest Status">
                <span className="badge badge--success">{nomination.contest?.status || 'ACTIVE'}</span>
              </DetailRow>
              {nomination.contest?.description && (
                <DetailRow label="Session Overview" value={nomination.contest.description} />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Status Transition Modal */}
      {targetStatus && (
        <Modal
          open={true}
          onClose={() => {
            if (!busy) setTargetStatus(null);
          }}
          title={`Confirm Status Transition: ${formatNominationStatus(targetStatus)}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--colour-ink)' }}>
              Transition nomination <strong>#{nomination.id}</strong> to{' '}
              <strong style={{ color: 'var(--colour-brand)' }}>{formatNominationStatus(targetStatus)}</strong>?
            </p>

            {targetStatus === 'APPROVED' && (
              <Alert variant="info" title="Direct Nomination Approval">
                Approving this nomination directly validates the candidate entry, qualifying it for jury evaluation and shortlisting.
              </Alert>
            )}

            {targetStatus === 'SHORTLISTED' && (
              <Alert variant="info" title="Permanent Snapshot Will Be Captured">
                Shortlisting freezes the candidate entry. An immutable audit record of committee details and presentation concepts is sealed into the database.
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
                  placeholder="State the exact justification for rejecting this nomination..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
                <p className="field__hint">A specific rejection reason is mandatory and recorded in the audit trail.</p>
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
                placeholder="Optional evaluator remarks or jury notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => setTargetStatus(null)}
              >
                Cancel
              </Button>
              <Button
                variant={targetStatus === 'REJECTED' ? 'danger' : 'primary'}
                disabled={busy || (targetStatus === 'REJECTED' && !rejectionReason.trim())}
                loading={busy}
                onClick={handleExecuteStatus}
              >
                {busy ? 'Updating...' : `Confirm: ${formatNominationStatus(targetStatus)}`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default NominationDetailPage;
