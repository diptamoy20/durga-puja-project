import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { StaticMap } from '@/components/atlas/StaticMap';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/constants/permissions';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { adminAtlasService } from '@/services/atlasService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { atlasFileUrl, atlasStatusTone, formatAtlasStatus, formatDateTime } from '@/utils/atlasHelpers';
import type { PandalAtlas } from '@/types/atlas';

export function PandalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [pandal, setPandal] = useState<PandalAtlas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<'start_review' | 'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  const canEdit = can(PERMISSIONS.EDIT_PANDAL_ATLAS);
  const canModerate = can(PERMISSIONS.MODERATE_PANDAL_ATLAS);
  const canSubmit = canEdit;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminAtlasService
      .get(Number(id))
      .then(setPandal)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pandal.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleModerate = async () => {
    if (!decision || !pandal) return;
    if (decision === 'reject' && !remarks.trim()) {
      toast.warning('Remarks are required when rejecting an entry.');
      return;
    }
    setBusy(true);
    try {
      const updated = await adminAtlasService.moderate(pandal.id, decision, remarks || undefined);
      setPandal(updated);
      toast.success(`Pandal status updated to ${formatAtlasStatus(updated.status)}.`);
      setDecision(null);
      setRemarks('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async () => {
    if (!pandal) return;
    setBusy(true);
    try {
      const updated = await adminAtlasService.submit(pandal.id);
      setPandal(updated);
      toast.success('Pandal submitted for moderation review.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Submit failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !pandal) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Pandal not found.'}</Alert>
        <Link to={ROUTES.PANDAL_ATLAS} className="btn btn--secondary btn--md">Back to Pandals</Link>
      </div>
    );
  }

  const photoUrls = pandal.photoUrls?.length
    ? pandal.photoUrls
    : (Array.isArray(pandal.photos) ? pandal.photos : []).map(atlasFileUrl);

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <Link to={ROUTES.PANDAL_ATLAS} className="btn btn--secondary btn--sm">← Directory</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', marginTop: 'var(--space-100)' }}>
            <h1 className="page__title">{pandal.name}</h1>
            <StatusBadge tone={atlasStatusTone(pandal.status)}>{formatAtlasStatus(pandal.status)}</StatusBadge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
          {pandal.status === 'APPROVED' && (
            <Link to={ROUTES.PUBLIC_ATLAS_DETAIL(pandal.id)} target="_blank" className="btn btn--secondary btn--md">
              Public Page ↗
            </Link>
          )}
          {canEdit && (
            <Link to={ROUTES.PANDAL_ATLAS_EDIT(pandal.id)} className="btn btn--secondary btn--md">Edit Entry</Link>
          )}
        </div>
      </header>

      {pandal.status === 'DRAFT' && (
        <Alert tone="default">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
            <span><strong>Draft Entry:</strong> Not visible on the public map until submitted and approved.</span>
            {canSubmit && (
              <Button variant="primary" size="sm" disabled={busy} onClick={handleSubmit}>Submit for Moderation</Button>
            )}
          </div>
        </Alert>
      )}

      {pandal.status === 'SUBMITTED' && canModerate && (
        <Alert tone="info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
            <span><strong>Submitted for Moderation:</strong> Waiting for administrator review.</span>
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => setDecision('start_review')}>
              Mark as Under Review
            </Button>
          </div>
        </Alert>
      )}

      {pandal.status === 'UNDER_REVIEW' && (
        <Alert tone="warning">
          <strong>Under Review:</strong> Being reviewed by {pandal.reviewedBy?.name ?? 'Moderation Team'}
          {pandal.reviewedAt ? ` since ${formatDateTime(pandal.reviewedAt)}` : ''}.
        </Alert>
      )}

      {pandal.status === 'APPROVED' && (
        <Alert tone="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
            <span>
              <strong>Approved & Live in Map Database.</strong>
              {pandal.approvedBy && <> Approved by {pandal.approvedBy.name} on {formatDateTime(pandal.approvedAt)}.</>}
            </span>
            <Link to={ROUTES.PUBLIC_ATLAS} target="_blank" className="btn btn--primary btn--sm">View on Public Map</Link>
          </div>
        </Alert>
      )}

      {pandal.status === 'REJECTED' && (
        <Alert tone="danger">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
            <div>
              <strong>Entry Rejected.</strong> {pandal.rejectionRemarks ?? 'Please revise and resubmit.'}
              {pandal.reviewedBy && (
                <div style={{ fontSize: 'var(--font-xs)', marginTop: 'var(--space-100)' }}>
                  Reviewed by {pandal.reviewedBy.name} on {formatDateTime(pandal.reviewedAt)}
                </div>
              )}
            </div>
            {canEdit && (
              <Link to={ROUTES.PANDAL_ATLAS_EDIT(pandal.id)} className="btn btn--danger btn--sm">Edit & Resubmit</Link>
            )}
          </div>
        </Alert>
      )}

      {canModerate && pandal.status !== 'APPROVED' && pandal.status !== 'REJECTED' && (
        <Card title="Admin Moderation Controls" style={{ border: '2px solid var(--color-primary)', marginBottom: 'var(--space-400)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
            <p style={{ margin: 0 }}>Approve to publish into the Map Database or reject with remarks.</p>
            <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
              <Button variant="primary" size="md" onClick={() => setDecision('approve')}>Approve Entry</Button>
              <Button variant="danger" size="md" onClick={() => setDecision('reject')}>Reject with Remarks</Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 'var(--space-400)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <Card title="Pandal Overview">
            <dl className="detail-list">
              <div><dt>Location</dt><dd>{pandal.location}</dd></div>
              <div><dt>Visiting Hours</dt><dd>{pandal.timing}</dd></div>
              <div><dt>Coordinates</dt><dd><code>{pandal.latitude.toFixed(7)}, {pandal.longitude.toFixed(7)}</code></dd></div>
              <div><dt>Committee</dt><dd>{pandal.committee?.committeeName ?? `#${pandal.pujaCommitteeId}`}</dd></div>
              <div><dt>Data Provider</dt><dd>{pandal.user?.name ?? 'System Admin'} ({pandal.user?.email ?? '—'})</dd></div>
              <div><dt>Created At</dt><dd>{formatDateTime(pandal.createdAt)}</dd></div>
            </dl>
          </Card>

          <Card title="Ritual Schedule">
            {pandal.ritualSchedule ? (
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.7 }}>{pandal.ritualSchedule}</pre>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                No specific ritual schedule provided for this pandal.
              </p>
            )}
          </Card>

          <Card title={`Photo Gallery (${photoUrls.length})`}>
            {photoUrls.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-200)' }}>
                {photoUrls.map((url, idx) => (
                  <a key={`${url}-${idx}`} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt={`${pandal.name} photo ${idx + 1}`}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>No photos uploaded.</p>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <Card title="Location Pin">
            <StaticMap
              latitude={pandal.latitude}
              longitude={pandal.longitude}
              label={`<b>${pandal.name}</b><br/>${pandal.location}`}
            />
            <div style={{ marginTop: 'var(--space-200)' }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.latitude},${pandal.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn--secondary btn--sm"
              >
                Google Maps ↗
              </a>
            </div>
          </Card>

          <Card title="Digital Experience Links">
            <h4>Livestream</h4>
            {pandal.hasLivestream && pandal.livestreamUrl ? (
              <div style={{ marginBottom: 'var(--space-300)' }}>
                <p style={{ wordBreak: 'break-all', fontSize: 'var(--font-xs)' }}>{pandal.livestreamUrl}</p>
                <a href={pandal.livestreamUrl} target="_blank" rel="noreferrer" className="btn btn--danger btn--sm">
                  Watch Live Stream
                </a>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No livestream link provided.</p>
            )}

            <h4>Virtual Tour / 360°</h4>
            {pandal.hasVirtualTour ? (
              <div>
                <p style={{ wordBreak: 'break-all', fontSize: 'var(--font-xs)' }}>
                  {pandal.fullVirtualTourUrl ?? pandal.virtualTourUrl}
                </p>
                <a
                  href={pandal.fullVirtualTourUrl ?? pandal.virtualTourUrl ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--secondary btn--sm"
                >
                  Launch Virtual Tour
                </a>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No virtual tour link provided.</p>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={decision !== null}
        title={`Confirm Action: ${decision?.replace('_', ' ')}`}
        message={
          <div>
            <p>Perform <strong>{decision}</strong> on pandal &quot;{pandal.name}&quot;?</p>
            {decision === 'reject' && (
              <div style={{ marginTop: 'var(--space-200)' }}>
                <label className="field__label" htmlFor="atlasRemarks">Reason for Rejection *</label>
                <textarea
                  id="atlasRemarks"
                  className="field__control"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide clear feedback for the author..."
                />
              </div>
            )}
            {decision !== 'reject' && (
              <div style={{ marginTop: 'var(--space-200)' }}>
                <label className="field__label" htmlFor="atlasRemarksOptional">Remarks (optional)</label>
                <textarea
                  id="atlasRemarksOptional"
                  className="field__control"
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            )}
          </div>
        }
        confirmLabel={decision === 'approve' ? 'Approve' : decision === 'reject' ? 'Reject' : 'Confirm'}
        destructive={decision === 'reject'}
        busy={busy}
        onConfirm={handleModerate}
        onCancel={() => {
          setDecision(null);
          setRemarks('');
        }}
      />
    </div>
  );
}
