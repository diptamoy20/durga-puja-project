import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminTourismService } from '@/services/tourismService';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { TourismEnquiry, TourismEnquiryStatus } from '@/types/tourism';

const WORKFLOW_STEPS: { status: TourismEnquiryStatus; label: string; icon: string }[] = [
  { status: 'NEW', label: 'New', icon: '📥' },
  { status: 'UNDER_REVIEW', label: 'Under Review', icon: '🔍' },
  { status: 'ASSIGNED', label: 'Assigned', icon: '👤' },
  { status: 'CONTACTED', label: 'Contacted', icon: '📞' },
  { status: 'ITINERARY_SENT', label: 'Itinerary Sent', icon: '📄' },
  { status: 'CLOSED', label: 'Closed', icon: '✅' },
];

export function TourismEnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [enquiry, setEnquiry] = useState<TourismEnquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status & Note actions
  const [newStatus, setNewStatus] = useState<TourismEnquiryStatus>('UNDER_REVIEW');
  const [statusComment, setStatusComment] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const [adminNote, setAdminNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (id) {
      loadEnquiry(Number(id));
    }
  }, [id]);

  const loadEnquiry = async (enqId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminTourismService.enquiries.get(enqId);
      setEnquiry(data);
      setNewStatus(data.status);
    } catch (err) {
      console.error('Failed to load enquiry:', err);
      setError('Unable to load enquiry details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (targetStatus?: TourismEnquiryStatus) => {
    if (!enquiry) return;
    const statusToApply = targetStatus || newStatus;
    setSubmittingStatus(true);
    try {
      await adminTourismService.enquiries.updateStatus(
        enquiry.id,
        statusToApply,
        statusComment || `Status advanced to ${statusToApply}`,
      );
      setStatusComment('');
      await loadEnquiry(enquiry.id);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry || !adminNote.trim()) return;
    setSubmittingNote(true);
    try {
      await adminTourismService.enquiries.addNote(enquiry.id, adminNote.trim());
      setAdminNote('');
      await loadEnquiry(enquiry.id);
    } catch (err) {
      console.error('Failed to add note:', err);
      alert('Failed to add remark note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const getStepIndex = (st: string) => {
    return WORKFLOW_STEPS.findIndex((s) => s.status === st);
  };

  const getStatusVariant = (st: string): 'danger' | 'warning' | 'info' | 'success' | 'neutral' => {
    switch (st) {
      case 'NEW':
        return 'danger';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'ASSIGNED':
      case 'CONTACTED':
      case 'ITINERARY_SENT':
        return 'info';
      case 'CLOSED':
        return 'success';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Enquiry Details"
          description="Loading trip planning details..."
          breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge', to: ROUTES.ADMIN_TOURISM_ENQUIRIES }, { label: 'Enquiry' }]}
        />
        <Card style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--colour-ink-soft)' }}>
          Loading enquiry details…
        </Card>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="page">
        <PageHeader
          title="Enquiry Not Found"
          breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge', to: ROUTES.ADMIN_TOURISM_ENQUIRIES }, { label: 'Enquiry' }]}
        />
        <Alert tone="danger">{error || 'Enquiry not found.'}</Alert>
        <Link to={ROUTES.ADMIN_TOURISM_ENQUIRIES} className="btn btn--outline btn--md mt-4">
          ← Back to Enquiries
        </Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(enquiry.status);

  return (
    <div className="page">
      <PageHeader
        title={`Enquiry ${enquiry.enquiryCode}`}
        description={`Submitted on ${new Date(enquiry.createdAt).toLocaleString()} • Preferred Language: ${enquiry.preferredLanguage?.toUpperCase() || 'EN'}`}
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Tourism Concierge', to: ROUTES.ADMIN_TOURISM_ENQUIRIES },
          { label: `Enquiry ${enquiry.enquiryCode}` },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" size="md" onClick={() => loadEnquiry(enquiry.id)}>
              ↻ Refresh
            </Button>
            <Link to={ROUTES.ADMIN_TOURISM_ENQUIRIES} className="btn btn--outline btn--md">
              ← Back to List
            </Link>
          </div>
        }
      />

      {/* 6-Stage Tender Workflow Stepper Card */}
      <Card className="mb-4">
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--colour-ink-soft)', fontWeight: 700 }}>
            Enquiry Lifecycle Workflow
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: '8px', paddingBottom: '4px' }}>
          {WORKFLOW_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div
                key={step.status}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: '120px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    background: isCurrent
                      ? 'var(--colour-brand)'
                      : isCompleted
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'var(--colour-canvas)',
                    color: isCurrent ? '#fff' : isCompleted ? '#166534' : 'var(--colour-ink-soft)',
                    fontWeight: isCurrent ? 700 : 600,
                    fontSize: '12px',
                    border: isCurrent ? 'none' : '1px solid var(--colour-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleUpdateStatus(step.status)}
                  title={`Click to transition directly to ${step.label}`}
                >
                  <span>{isCompleted ? '✓' : step.icon}</span>
                  <span>{step.label}</span>
                </div>
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      background: isCompleted ? '#22c55e' : 'var(--colour-border)',
                      margin: '0 4px',
                      minWidth: '12px',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Details Left, Workflow Action Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
        {/* Left Column: Traveler Profile & Requirements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Traveler Details */}
          <Card>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>
              👤 Traveler Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Full Name</span>
                <strong>{enquiry.fullName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Email</span>
                <a href={`mailto:${enquiry.email}`} style={{ color: 'var(--colour-brand)' }}>{enquiry.email}</a>
              </div>
              <div>
                <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Phone</span>
                <a href={`tel:${enquiry.phone}`} style={{ color: 'var(--colour-brand)' }}>{enquiry.phone}</a>
              </div>
              <div>
                <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Location / Origin</span>
                <strong>{enquiry.city ? `${enquiry.city}, ` : ''}{enquiry.country}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Party Size</span>
                <strong>{enquiry.numberOfTravellers} Traveler(s)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Current Status</span>
                <Badge variant={getStatusVariant(enquiry.status)}>{enquiry.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          </Card>

          {/* Pilgrimage & Logistics Requirements */}
          <Card>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>
              🌺 Pilgrimage Preferences & Requirements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div>
                <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Dates & Duration</span>
                <strong>
                  {enquiry.startDate ? new Date(enquiry.startDate).toLocaleDateString() : 'Flexible'}
                  {enquiry.endDate ? ` to ${new Date(enquiry.endDate).toLocaleDateString()}` : ''}
                  {enquiry.durationPreference ? ` (${enquiry.durationPreference})` : ''}
                </strong>
              </div>

              {enquiry.stayPreference && (
                <div>
                  <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Stay Preference</span>
                  <strong>{enquiry.stayPreference}</strong>
                </div>
              )}

              {enquiry.transportPreference && (
                <div>
                  <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px' }}>Transport Preference</span>
                  <strong>{enquiry.transportPreference}</strong>
                </div>
              )}

              {enquiry.interests && enquiry.interests.length > 0 && (
                <div>
                  <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                    Interests & Activities
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {enquiry.interests.map((item, i) => (
                      <Badge key={i} variant="info">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {enquiry.pujaPreferences && enquiry.pujaPreferences.length > 0 && (
                <div>
                  <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                    Puja-Specific Requests
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {enquiry.pujaPreferences.map((item, i) => (
                      <Badge key={i} variant="warning">
                        ✨ {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {enquiry.specialRequirements && (
                <div style={{ background: 'var(--colour-canvas)', padding: '12px', borderRadius: '8px', border: '1px solid var(--colour-border)' }}>
                  <span style={{ color: 'var(--colour-ink-soft)', display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                    Special Remarks / Accessibility Needs
                  </span>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--colour-ink)' }}>
                    "{enquiry.specialRequirements}"
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Workflow Audit Timeline */}
          <Card>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>
              📜 Lifecycle Audit History
            </h3>
            {enquiry.histories && enquiry.histories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {enquiry.histories.map((hist) => (
                  <div
                    key={hist.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      fontSize: '13px',
                      borderBottom: '1px solid var(--colour-border)',
                      paddingBottom: '10px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📌</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>
                        {hist.action}: {hist.fromStatus ? `${hist.fromStatus} → ` : ''}{hist.toStatus}
                      </div>
                      {hist.comment && (
                        <p style={{ margin: '2px 0 0', color: 'var(--colour-ink-soft)' }}>
                          {hist.comment}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--colour-ink-soft)' }}>
                      {new Date(hist.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--colour-ink-soft)', fontSize: '13px' }}>
                No audit entries recorded yet.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Actions & Internal Remarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Update Status Card */}
          <Card>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 700 }}>
              Workflow Action
            </h3>

            <div className="field mb-4">
              <label className="field__label">
                Change Stage
              </label>
              <select
                className="field__control"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TourismEnquiryStatus)}
              >
                <option value="NEW">New</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="CONTACTED">Contacted</option>
                <option value="ITINERARY_SENT">Itinerary Sent</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="field mb-4">
              <label className="field__label">
                Transition Comment
              </label>
              <textarea
                className="field__control"
                rows={3}
                placeholder="Details of the action taken..."
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              style={{ width: '100%' }}
              disabled={submittingStatus}
              onClick={() => handleUpdateStatus()}
            >
              {submittingStatus ? 'Saving...' : 'Apply Status Update'}
            </Button>
          </Card>

          {/* Internal Remarks / Notes */}
          <Card>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 700 }}>
              📝 Internal Admin Notes
            </h3>

            {enquiry.adminRemarks && (
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
                <strong>Existing Remarks:</strong>
                <p style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>{enquiry.adminRemarks}</p>
              </div>
            )}

            <form onSubmit={handleAddNote}>
              <div className="field mb-4">
                <textarea
                  className="field__control"
                  rows={3}
                  placeholder="Add confidential notes for team..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="md"
                style={{ width: '100%' }}
                disabled={submittingNote || !adminNote.trim()}
              >
                {submittingNote ? 'Adding...' : '+ Add Note'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
