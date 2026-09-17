import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/constants/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { adminWebinarService } from '@/services/eventsService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Webinar, WebinarStatus } from '@/types/events';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

function statusTone(status: WebinarStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'LIVE':
      return 'danger';
    case 'SCHEDULED':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    default:
      return 'default';
  }
}

export function WebinarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [targetStatus, setTargetStatus] = useState<WebinarStatus | null>(null);
  const [busy, setBusy] = useState(false);

  const canEdit = can(PERMISSIONS.EDIT_WEBINARS);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminWebinarService
      .get(Number(id))
      .then(setWebinar)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load webinar.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusToggle = async () => {
    if (!targetStatus || !webinar) return;
    setBusy(true);
    try {
      const updated = await adminWebinarService.toggleStatus(webinar.id, targetStatus);
      setWebinar(updated);
      toast.success(`Webinar status set to ${targetStatus}.`);
      setTargetStatus(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change status.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !webinar) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Webinar not found.'}</Alert>
        <Link to={ROUTES.WEBINARS} className="btn btn--secondary btn--md">
          Back to Webinars
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', marginBottom: 'var(--space-100)' }}>
            <Link to={ROUTES.WEBINARS} className="btn btn--secondary btn--sm">
              ← Back
            </Link>
            <StatusBadge tone={statusTone(webinar.status)}>
              {webinar.status === 'LIVE' ? '🔴 LIVE NOW' : webinar.status}
            </StatusBadge>
          </div>
          <h1 className="page__title">{webinar.title}</h1>
          <p className="page__subtitle">
            Scheduled for {dateTimeFormat.format(new Date(webinar.scheduledAt))} ({webinar.duration})
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
          <Link to={ROUTES.WEBINARS_RSVPS(webinar.id)} className="btn btn--secondary btn--md">
            Manage RSVPs ({webinar._count?.registrations ?? 0})
          </Link>

          {canEdit && (
            <Link to={ROUTES.WEBINARS_EDIT(webinar.id)} className="btn btn--secondary btn--md">
              Edit Webinar
            </Link>
          )}

          {webinar.status === 'SCHEDULED' && (
            <Button variant="danger" size="md" onClick={() => setTargetStatus('LIVE')}>
              Go Live
            </Button>
          )}

          {webinar.status === 'LIVE' && (
            <Button variant="primary" size="md" onClick={() => setTargetStatus('COMPLETED')}>
              Mark Completed
            </Button>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-400)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <Card title="Broadcast Details">
            {webinar.bannerImage && (
              <div style={{ marginBottom: 'var(--space-400)' }}>
                <img
                  src={webinar.bannerImage}
                  alt={webinar.title}
                  style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            )}

            {webinar.description && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {webinar.description}
              </div>
            )}

            {webinar.meetingLink && (
              <div style={{ marginTop: 'var(--space-400)', padding: 'var(--space-300)', background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-md)' }}>
                <strong>Live Meeting URL: </strong>
                <a href={webinar.meetingLink} target="_blank" rel="noreferrer">
                  {webinar.meetingLink} ↗
                </a>
              </div>
            )}

            {webinar.replayUrl && (
              <div style={{ marginTop: 'var(--space-300)', padding: 'var(--space-300)', background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-md)' }}>
                <strong>Recording / Replay: </strong>
                <a href={webinar.replayUrl} target="_blank" rel="noreferrer">
                  Watch Replay ↗
                </a>
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          {webinar.speaker && (
            <Card title="Speaker / Host">
              <h4>{webinar.speaker}</h4>
              {webinar.speakerBio && (
                <p style={{ marginTop: 'var(--space-200)', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                  {webinar.speakerBio}
                </p>
              )}
            </Card>
          )}

          <Card title="Registration Stats">
            <dl className="detail-list">
              <div><dt>Registered RSVPs</dt><dd><strong>{webinar._count?.registrations ?? 0}</strong></dd></div>
              <div><dt>Capacity</dt><dd>{webinar.maxAttendees ? `${webinar.maxAttendees} attendees` : 'Unlimited'}</dd></div>
              <div><dt>Scheduled Date</dt><dd>{dateTimeFormat.format(new Date(webinar.scheduledAt))}</dd></div>
              <div><dt>Duration</dt><dd>{webinar.duration}</dd></div>
              <div><dt>Created By</dt><dd>{webinar.createdBy?.name ?? '—'}</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={targetStatus !== null}
        title={`Change Status to ${targetStatus}`}
        message={`Are you sure you want to change this webinar status to "${targetStatus}"?`}
        confirmLabel="Confirm"
        busy={busy}
        onConfirm={handleStatusToggle}
        onCancel={() => setTargetStatus(null)}
      />
    </div>
  );
}
