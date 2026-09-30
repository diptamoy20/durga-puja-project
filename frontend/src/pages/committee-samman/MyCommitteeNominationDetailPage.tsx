import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';
import { formatContestDate, formatNominationStatus, nominationStatusTone } from '@/constants/samman';
import { committeeSammanService } from '@/services/sammanService';
import { useToast } from '@/hooks/useToast';
import type { SharadSammanNomination } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

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

export function MyCommitteeNominationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [nomination, setNomination] = useState<SharadSammanNomination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const loadNomination = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await committeeSammanService.get(Number(id));
      setNomination(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load nomination details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNomination();
  }, [id]);

  const handleConfirmSubmit = async () => {
    if (!nomination) return;

    setActionLoading(true);
    try {
      await committeeSammanService.submit(nomination.id);
      toast.success('Nomination submitted successfully for administrative review!');
      setSubmitModalOpen(false);
      await loadNomination();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit nomination.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!nomination) return;

    setActionLoading(true);
    try {
      await committeeSammanService.deleteDraft(nomination.id);
      toast.success('Draft nomination discarded.');
      setDeleteModalOpen(false);
      navigate(ROUTES.MY_COMMITTEE_NOMINATIONS);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete draft nomination.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading nomination details..." />;
  }

  if (!nomination || error) {
    return (
      <div className="page samman-page">
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error || 'Nomination not found or you do not have permission to view it.'}
        </Alert>
        <Link to={ROUTES.MY_COMMITTEE_NOMINATIONS} className="btn btn--secondary">
          &larr; Back to My Nominations
        </Link>
      </div>
    );
  }

  const isDraft = nomination.status === 'DRAFT';
  const isSubmitted = nomination.status === 'SUBMITTED';
  const isUnderReview = nomination.status === 'UNDER_REVIEW';
  const isApproved = nomination.status === 'APPROVED';
  const isRejected = nomination.status === 'REJECTED';
  const isShortlisted = nomination.status === 'SHORTLISTED';

  return (
    <div className="page samman-page">
      <PageHeader
        title={nomination.title || 'Sharad Samman Nomination'}
        description={`Nomination in category: ${nomination.category}`}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Sharad Samman', to: ROUTES.MY_COMMITTEE_NOMINATIONS },
          { label: 'My Nominations', to: ROUTES.MY_COMMITTEE_NOMINATIONS },
          { label: nomination.category },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link to={ROUTES.MY_COMMITTEE_NOMINATIONS} className="btn btn--secondary">
              &larr; Back to List
            </Link>
            {isDraft && (
              <>
                <Link
                  to={ROUTES.MY_COMMITTEE_NOMINATION_EDIT(nomination.id)}
                  className="btn btn--secondary"
                >
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Edit Draft
                </Link>
                <Button
                  variant="primary"
                  onClick={() => setSubmitModalOpen(true)}
                  loading={actionLoading}
                >
                  <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit Nomination
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Status Hero Callout */}
      {isDraft && (
        <Alert variant="warning" style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <strong>Draft Nomination:</strong> This entry is saved as a Draft and is currently not visible to the jury or admin reviewers.
              Review your details and submit when ready.
            </div>
            <Button size="sm" variant="primary" onClick={() => setSubmitModalOpen(true)} loading={actionLoading}>
              Submit Now
            </Button>
          </div>
        </Alert>
      )}

      {isSubmitted && (
        <Alert variant="info" style={{ marginBottom: 'var(--space-5)' }}>
          <i className="fa-solid fa-clock" aria-hidden="true" style={{ marginRight: 'var(--space-2)' }} />
          <strong>Nomination Submitted:</strong> Your entry has been received and is queued for administrative review. You will be notified as it progresses.
        </Alert>
      )}

      {isUnderReview && (
        <Alert variant="warning" style={{ marginBottom: 'var(--space-5)' }}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" style={{ marginRight: 'var(--space-2)' }} />
          <strong>Under Active Review:</strong> The Sharad Samman jury panel is currently evaluating your pandal concept and artistry documentation.
        </Alert>
      )}

      {isApproved && (
        <Alert variant="success" style={{ marginBottom: 'var(--space-5)' }}>
          <i className="fa-solid fa-circle-check" aria-hidden="true" style={{ marginRight: 'var(--space-2)' }} />
          <strong>Nomination Approved!</strong> Your nomination has successfully passed jury verification.
        </Alert>
      )}

      {isRejected && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>
            <i className="fa-solid fa-circle-xmark" aria-hidden="true" style={{ marginRight: 'var(--space-2)' }} />
            Nomination Rejected
          </div>
          <div>
            <strong>Reason provided by reviewers:</strong> {nomination.rejectionReason || 'No specific rejection reason noted.'}
          </div>
        </Alert>
      )}

      {isShortlisted && (
        <div
          className="samman-rule-callout"
          style={{
            marginBottom: 'var(--space-5)',
            borderColor: 'var(--color-primary-base)',
            background: 'rgba(217, 119, 6, 0.08)',
          }}
        >
          <i className="fa-solid fa-star" style={{ color: 'var(--color-primary-base)', fontSize: '1.5rem' }} aria-hidden="true" />
          <div>
            <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)' }}>
              Nomination Shortlisted for Final Sharad Samman Awards!
            </strong>
            <p style={{ margin: 'var(--space-1) 0 0', fontSize: '0.875rem' }}>
              Your pandal has been shortlisted as a candidate finalist. Official candidate snapshot data has been locked.
            </p>
          </div>
        </div>
      )}

      {/* Main Responsive Grid: Details & Sidebar */}
      <div className="samman-detail-grid">
        {/* Left Column: Concept & Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card title="Nomination Concept & Artistry">
            <div className="form-grid form-grid--2">
              <DetailRow label="Award Category">
                <span className="samman-category-badge">{nomination.category}</span>
              </DetailRow>

              <DetailRow label="Nomination Title / Theme" value={nomination.title || 'Untitled Theme'} />

              <DetailRow label="Contest">
                <span>
                  {nomination.contest?.name} (Contest Year: {nomination.contest?.year}
                  {formatContestDate(nomination.contest?.endDate) && (
                    <> · Last Date: {formatContestDate(nomination.contest?.endDate)}</>
                  )}
                  )
                </span>
              </DetailRow>

              <DetailRow label="Current Status">
                <StatusBadge
                  status={nomination.status}
                  label={formatNominationStatus(nomination.status)}
                  tone={nominationStatusTone(nomination.status)}
                />
              </DetailRow>
            </div>

            <div style={{ marginTop: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Artistic Concept Narrative & Description
              </div>
              <div
                style={{
                  background: 'var(--color-background-subtle)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: 'var(--color-text-emphasis)',
                }}
              >
                {nomination.description || 'No description provided.'}
              </div>
            </div>

            {nomination.reviewNotes && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                  Jury / Reviewer Feedback
                </div>
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-emphasis)',
                    fontSize: '0.875rem',
                  }}
                >
                  {nomination.reviewNotes}
                </div>
              </div>
            )}
          </Card>

          {/* Committee Information */}
          <Card title="Puja Committee Profile">
            <div className="form-grid form-grid--2">
              <DetailRow label="Committee Name" value={nomination.committee?.committeeName} />
              <DetailRow label="Registration No" value={nomination.committee?.registrationNo} />
              <DetailRow
                label="Location"
                value={
                  [nomination.committee?.city, nomination.committee?.state]
                    .filter(Boolean)
                    .join(', ') || '—'
                }
              />
              <DetailRow label="Venue / Pandal Ground" value={nomination.committee?.venueName} />
              <DetailRow label="Venue Address" value={nomination.committee?.venueAddress} />
            </div>
          </Card>
        </div>

        {/* Right Column: Timeline & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card title="Submission Timeline">
            <div className="samman-timeline" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary-base)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                  <i className="fa-solid fa-file-pen" aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Draft Created</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {dateFormatter.format(new Date(nomination.createdAt))}
                  </div>
                </div>
              </div>

              {nomination.submittedAt && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-info)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Submitted for Review</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {dateFormatter.format(new Date(nomination.submittedAt))}
                    </div>
                  </div>
                </div>
              )}

              {nomination.reviewedAt && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Reviewed by Jury</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {dateFormatter.format(new Date(nomination.reviewedAt))}
                    </div>
                  </div>
                </div>
              )}

              {nomination.approvedAt && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-circle-check" aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Approved</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {dateFormatter.format(new Date(nomination.approvedAt))}
                    </div>
                  </div>
                </div>
              )}

              {nomination.rejectedAt && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Rejected</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {dateFormatter.format(new Date(nomination.rejectedAt))}
                    </div>
                  </div>
                </div>
              )}

              {nomination.shortlistedAt && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-star" aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Shortlisted Finalist</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {dateFormatter.format(new Date(nomination.shortlistedAt))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Draft Actions Card */}
          {isDraft && (
            <Card title="Draft Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Button
                  variant="primary"
                  onClick={() => setSubmitModalOpen(true)}
                  loading={actionLoading}
                  style={{ width: '100%' }}
                >
                  <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit Nomination
                </Button>
                <Link
                  to={ROUTES.MY_COMMITTEE_NOMINATION_EDIT(nomination.id)}
                  className="btn btn--secondary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  <i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Edit Details
                </Link>
                <Button
                  variant="danger"
                  onClick={() => setDeleteModalOpen(true)}
                  loading={actionLoading}
                  style={{ width: '100%' }}
                >
                  <i className="fa-solid fa-trash" aria-hidden="true" /> Discard Draft
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Nomination"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSubmitModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSubmit}
              loading={actionLoading}
            >
              <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Confirm Submission
            </Button>
          </>
        }
      >
        <p>
          Are you ready to submit your nomination for{' '}
          <strong>&ldquo;{nomination.category}&rdquo;</strong>?
        </p>
        <p style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          After submission, this nomination is locked and queued for administrative review. You will no longer be able to edit the details.
        </p>
      </Modal>

      {/* Discard Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Discard Draft"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={actionLoading}
            >
              <i className="fa-solid fa-trash" aria-hidden="true" /> Discard Draft
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to discard this draft nomination for{' '}
          <strong>&ldquo;{nomination.category}&rdquo;</strong>?
        </p>
        <p style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          This action cannot be undone. All entered data for this draft will be permanently deleted.
        </p>
      </Modal>
    </div>
  );
}
