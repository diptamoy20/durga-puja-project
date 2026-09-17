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
import { adminAtlasService } from '@/services/atlasService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { AtlasStatus, PandalAtlas } from '@/types/atlas';

function statusTone(status: AtlasStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'SUBMITTED':
      return 'info';
    case 'REJECTED':
      return 'danger';
    case 'DRAFT':
    default:
      return 'default';
  }
}

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
    setBusy(true);
    try {
      const updated = await adminAtlasService.moderate(pandal.id, decision, remarks || undefined);
      setPandal(updated);
      toast.success(`Pandal status updated to ${updated.status}.`);
      setDecision(null);
      setRemarks('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !pandal) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Pandal not found.'}</Alert>
        <Link to={ROUTES.PANDAL_ATLAS} className="btn btn--secondary btn--md">
          Back to Pandals
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-300)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', marginBottom: 'var(--space-100)' }}>
            <Link to={ROUTES.PANDAL_ATLAS} className="btn btn--secondary btn--sm">
              ← Back
            </Link>
            <StatusBadge tone={statusTone(pandal.status)}>{pandal.status}</StatusBadge>
          </div>
          <h1 className="page__title">{pandal.name}</h1>
          <p className="page__subtitle">
            {pandal.location} · {pandal.committee?.committeeName ?? 'Puja Committee'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
          {canEdit && (
            <Link to={ROUTES.PANDAL_ATLAS_EDIT(pandal.id)} className="btn btn--secondary btn--md">
              Edit Pandal
            </Link>
          )}

          {canModerate && (
            <>
              {pandal.status === 'SUBMITTED' && (
                <Button variant="secondary" size="md" onClick={() => setDecision('start_review')}>
                  Start Review
                </Button>
              )}
              {pandal.status !== 'APPROVED' && (
                <Button variant="primary" size="md" onClick={() => setDecision('approve')}>
                  Approve (Show on Map)
                </Button>
              )}
              {pandal.status !== 'REJECTED' && (
                <Button variant="danger" size="md" onClick={() => setDecision('reject')}>
                  Reject
                </Button>
              )}
            </>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
        <Card title="Pandal Details">
          <dl className="detail-list">
            <div><dt>Committee</dt><dd>{pandal.committee?.committeeName ?? `#${pandal.pujaCommitteeId}`}</dd></div>
            <div><dt>Theme / Concept</dt><dd>{pandal.theme || '—'}</dd></div>
            <div><dt>Artisan / Sculptor</dt><dd>{pandal.artisan || '—'}</dd></div>
            <div><dt>Puja Type</dt><dd>{pandal.pujaType || '—'}</dd></div>
            <div><dt>Daily Footfall</dt><dd>{pandal.footfall || '—'}</dd></div>
            <div><dt>Visiting Hours</dt><dd>{pandal.timing}</dd></div>
          </dl>
        </Card>

        <Card title="Location & Map Coordinates">
          <dl className="detail-list">
            <div><dt>Address</dt><dd>{pandal.location}</dd></div>
            <div><dt>Latitude</dt><dd><code>{pandal.latitude}</code></dd></div>
            <div><dt>Longitude</dt><dd><code>{pandal.longitude}</code></dd></div>
            <div>
              <dt>OpenStreetMap / Google Maps</dt>
              <dd>
                <a
                  href={`https://www.google.com/maps?q=${pandal.latitude},${pandal.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--secondary btn--sm"
                >
                  View on Maps ↗
                </a>
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Features & Attractions" style={{ gridColumn: '1 / -1' }}>
          <h4>Special Attractions</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{pandal.specialFeatures}</p>

          {pandal.history && (
            <div style={{ marginTop: 'var(--space-300)' }}>
              <h4>Heritage & History</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{pandal.history}</p>
            </div>
          )}

          {(pandal.contactPhone || pandal.contactEmail || pandal.website) && (
            <div style={{ marginTop: 'var(--space-300)' }}>
              <h4>Visitor Contact</h4>
              <p>
                {pandal.contactPhone && <>Phone: <a href={`tel:${pandal.contactPhone}`}>{pandal.contactPhone}</a> · </>}
                {pandal.contactEmail && <>Email: <a href={`mailto:${pandal.contactEmail}`}>{pandal.contactEmail}</a> · </>}
                {pandal.website && <>Web: <a href={pandal.website} target="_blank" rel="noreferrer">{pandal.website}</a></>}
              </p>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={decision !== null}
        title={`Confirm Action: ${decision}`}
        message={
          <div>
            <p>Perform <strong>{decision}</strong> on pandal "{pandal.name}"?</p>
            <div style={{ marginTop: 'var(--space-200)' }}>
              <label className="field__label" htmlFor="atlasRemarks">
                Remarks / Reason (optional)
              </label>
              <textarea
                id="atlasRemarks"
                className="field__control"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
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
