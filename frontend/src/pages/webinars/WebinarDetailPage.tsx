import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { WebinarBreadcrumb } from '@/components/webinars/WebinarBreadcrumb';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { adminWebinarService } from '@/services/eventsService';
import type { ReplayFormValues, Webinar, WebinarStatus } from '@/types/events';
import {
  formatScheduleRange,
  hasReplay,
  LIVE_PLATFORMS,
  resolveBannerUrl,
  resolveLiveEmbedUrl,
  resolveReplayEmbedUrl,
  statusTone,
  WEBINAR_STATUSES,
} from '@/utils/webinarHelpers';

import '@/styles/webinars-admin.css';

function speakerInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function statusConfirmMessage(status: WebinarStatus, title: string): string {
  switch (status) {
    case 'LIVE':
      return `Start broadcasting "${title}"? Attendees will see the live room on the public site.`;
    case 'COMPLETED':
      return `Mark "${title}" as completed? The session will move to replays once recording is configured.`;
    case 'CANCELLED':
      return `Cancel "${title}"? Registered attendees will no longer see it as an upcoming event.`;
    case 'SCHEDULED':
      return `Revert "${title}" to scheduled? It will appear as an upcoming webinar again.`;
    default:
      return `Change the status of "${title}" to ${status}?`;
  }
}

function StreamPreview({ webinar }: { webinar: Webinar }) {
  const embedUrl = resolveLiveEmbedUrl(webinar);
  const embedCode = webinar.liveEmbedCode?.trim();

  if (embedUrl) {
    return (
      <div className="webinar-embed-box">
        <iframe
          src={embedUrl}
          title={`${webinar.title} live preview`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (embedCode) {
    return (
      <div
        className="webinar-embed-box"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  return (
    <div className="webinar-embed-placeholder">
      <div>
        <div className="webinar-embed-placeholder__icon" aria-hidden="true">
          <i className="fas fa-video-slash" />
        </div>
        <strong>No live stream configured</strong>
        <p style={{ margin: 'var(--space-200) 0 0', opacity: 0.75, fontSize: 'var(--font-sm)' }}>
          Add a stream URL or embed code in Edit Webinar to preview the broadcast here.
        </p>
      </div>
    </div>
  );
}

function ReplayPreview({ webinar }: { webinar: Webinar }) {
  const embedUrl = resolveReplayEmbedUrl(webinar);
  const embedCode = webinar.replayEmbedCode?.trim();

  if (embedUrl) {
    return (
      <div className="webinar-embed-box">
        <iframe
          src={embedUrl}
          title={`${webinar.title} replay preview`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (embedCode) {
    return (
      <div
        className="webinar-embed-box"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  return (
    <div className="webinar-embed-placeholder" style={{ aspectRatio: '16 / 9', minHeight: 0 }}>
      <div>
        <div style={{ fontSize: '1.75rem', marginBottom: 'var(--space-150)' }} aria-hidden="true">
          ▶
        </div>
        <span>No replay uploaded yet</span>
      </div>
    </div>
  );
}

export function WebinarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAuth();

  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [targetStatus, setTargetStatus] = useState<WebinarStatus | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const [replayForm, setReplayForm] = useState<ReplayFormValues>({
    replayVideoUrl: '',
    replayEmbedCode: '',
    replayDurationMinutes: null,
  });
  const [replaySaving, setReplaySaving] = useState(false);

  const canEdit = can(PERMISSIONS.EDIT_WEBINARS);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminWebinarService
      .get(Number(id))
      .then((data) => {
        setWebinar(data);
        setReplayForm({
          replayVideoUrl: data.replayVideoUrl ?? '',
          replayEmbedCode: data.replayEmbedCode ?? '',
          replayDurationMinutes: data.replayDurationMinutes,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load webinar.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusToggle = async () => {
    if (!targetStatus || !webinar) return;
    setStatusBusy(true);
    try {
      const updated = await adminWebinarService.toggleStatus(webinar.id, targetStatus);
      setWebinar(updated);
      toast.success(`Webinar status set to ${WEBINAR_STATUSES[targetStatus]}.`);
      setTargetStatus(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change status.');
    } finally {
      setStatusBusy(false);
    }
  };

  const handleReplaySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!webinar || !canEdit) return;
    setReplaySaving(true);
    try {
      const updated = await adminWebinarService.updateReplay(webinar.id, {
        replayVideoUrl: replayForm.replayVideoUrl?.trim() || undefined,
        replayEmbedCode: replayForm.replayEmbedCode?.trim() || undefined,
        replayDurationMinutes: replayForm.replayDurationMinutes ?? null,
      });
      setWebinar(updated);
      setReplayForm({
        replayVideoUrl: updated.replayVideoUrl ?? '',
        replayEmbedCode: updated.replayEmbedCode ?? '',
        replayDurationMinutes: updated.replayDurationMinutes,
      });
      toast.success('Replay settings saved.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update replay.');
    } finally {
      setReplaySaving(false);
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

  const rsvpCount = webinar._count?.registrations ?? 0;
  const publicPageUrl = ROUTES.PUBLIC_WEBINAR_DETAIL(webinar.slug);
  const liveRoomUrl = ROUTES.PUBLIC_WEBINAR_LIVE(webinar.slug);
  const speakers = webinar.speakers?.filter((speaker) => speaker.name.trim()) ?? [];
  const showMeetingUrl = Boolean(webinar.liveMeetingUrl?.trim());
  const showPasscode = Boolean(webinar.liveMeetingPasscode?.trim());
  const bannerUrl = resolveBannerUrl(webinar.bannerImage);

  return (
    <div className="page">
      <WebinarBreadcrumb
        items={[
          { label: 'Webinars', to: ROUTES.WEBINARS },
          { label: webinar.title.length > 40 ? `${webinar.title.slice(0, 40)}…` : webinar.title },
        ]}
      />

      <header className="webinar-admin__header">
        <div>
          <div className="webinar-admin__header-meta">
            <span className={webinar.status === 'LIVE' ? 'webinar-live-pulse' : undefined}>
              <StatusBadge tone={statusTone(webinar.status)}>
                {webinar.status === 'LIVE' ? WEBINAR_STATUSES.LIVE : WEBINAR_STATUSES[webinar.status]}
              </StatusBadge>
            </span>
            {webinar.isFeatured && (
              <span className="webinar-featured-badge">
                <i className="fas fa-star" aria-hidden="true" /> Featured
              </span>
            )}
          </div>
          <h1 className="page__title">{webinar.title}</h1>
          {webinar.subtitle && (
            <p className="page__subtitle" style={{ marginBottom: 'var(--space-100)' }}>
              {webinar.subtitle}
            </p>
          )}
          <p className="page__subtitle">{formatScheduleRange(webinar)}</p>
        </div>

        <div className="webinar-admin__header-actions">
          <Link
            to={publicPageUrl}
            className="btn btn--secondary btn--md"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" /> Public Page
          </Link>

          {webinar.status === 'LIVE' && (
            <Link
              to={liveRoomUrl}
              className="btn btn--danger btn--md"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fas fa-tower-broadcast" aria-hidden="true" /> Open Live Room
            </Link>
          )}

          <Link to={ROUTES.WEBINARS_RSVPS(webinar.id)} className="btn btn--secondary btn--md">
            <i className="fas fa-users" aria-hidden="true" /> Manage RSVPs ({rsvpCount})
          </Link>

          {canEdit && (
            <Link to={ROUTES.WEBINARS_EDIT(webinar.id)} className="btn btn--primary btn--md">
              <i className="fas fa-pencil" aria-hidden="true" /> Edit
            </Link>
          )}
        </div>
      </header>

      <div className="webinar-control-grid">
        <div>
          <section className="webinar-widget-card">
            <div className="webinar-widget-card__header">
              <h2 className="webinar-widget-card__title">
                <i className="fas fa-tower-broadcast" aria-hidden="true" /> Stream Preview &amp; Control
              </h2>
              <span className="badge badge--muted">{LIVE_PLATFORMS[webinar.livePlatform]}</span>
            </div>
            <div className="webinar-widget-card__body">
              <StreamPreview webinar={webinar} />

              {(showMeetingUrl || showPasscode) && (
                <div className="webinar-field-grid">
                  {showMeetingUrl && (
                    <div className="webinar-meta-box">
                      <div className="webinar-meta-box__label">Meeting URL</div>
                      <a href={webinar.liveMeetingUrl!} target="_blank" rel="noreferrer">
                        {webinar.liveMeetingUrl} ↗
                      </a>
                    </div>
                  )}
                  {showPasscode && (
                    <div className="webinar-meta-box">
                      <div className="webinar-meta-box__label">Passcode</div>
                      <code>{webinar.liveMeetingPasscode}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="webinar-widget-card">
            <div className="webinar-widget-card__header">
              <h2 className="webinar-widget-card__title">Replay &amp; Recording</h2>
              {hasReplay(webinar) && <span className="badge badge--success">Replay ready</span>}
            </div>
            <div className="webinar-widget-card__body">
              <ReplayPreview webinar={webinar} />

              <form onSubmit={handleReplaySubmit}>
                <div className="webinar-field-grid">
                  <div className="field">
                    <label className="field__label" htmlFor="replay-video-url">
                      Replay Video URL
                    </label>
                    <input
                      id="replay-video-url"
                      type="text"
                      className="field__control"
                      placeholder="https://www.youtube.com/watch?v=... or Vimeo URL"
                      value={replayForm.replayVideoUrl ?? ''}
                      onChange={(e) =>
                        setReplayForm((prev) => ({ ...prev, replayVideoUrl: e.target.value }))
                      }
                      disabled={!canEdit || replaySaving}
                    />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="replay-duration">
                      Duration (Minutes)
                    </label>
                    <input
                      id="replay-duration"
                      type="number"
                      min={1}
                      className="field__control"
                      placeholder="e.g. 75"
                      value={replayForm.replayDurationMinutes ?? ''}
                      onChange={(e) =>
                        setReplayForm((prev) => ({
                          ...prev,
                          replayDurationMinutes: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      disabled={!canEdit || replaySaving}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="replay-embed-code">
                    Custom Replay Embed Iframe (Optional)
                  </label>
                  <textarea
                    id="replay-embed-code"
                    rows={2}
                    className="field__control"
                    style={{ fontFamily: 'monospace' }}
                    placeholder='<iframe src="..." width="100%" height="450"></iframe>'
                    value={replayForm.replayEmbedCode ?? ''}
                    onChange={(e) =>
                      setReplayForm((prev) => ({ ...prev, replayEmbedCode: e.target.value }))
                    }
                    disabled={!canEdit || replaySaving}
                  />
                </div>

                {canEdit && (
                  <div className="webinar-actions-inline" style={{ marginTop: 'var(--space-300)' }}>
                    <Button type="submit" variant="primary" size="md" loading={replaySaving}>
                      Save Replay
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </section>

          <section className="webinar-widget-card">
            <div className="webinar-widget-card__header">
              <h2 className="webinar-widget-card__title">Speakers &amp; Panelists</h2>
              <span className="badge badge--muted">{speakers.length}</span>
            </div>
            <div className="webinar-widget-card__body">
              {speakers.length === 0 ? (
                <p className="webinar-field-hint" style={{ margin: 0 }}>
                  No speakers assigned to this webinar.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 'var(--space-300)',
                  }}
                >
                  {speakers.map((speaker, index) => (
                    <article key={`${speaker.name}-${index}`} className="webinar-speaker-card">
                      <div className="webinar-speaker-card__head">
                        <div className="webinar-speaker-card__avatar" aria-hidden="true">
                          {speakerInitial(speaker.name)}
                        </div>
                        <div>
                          <strong>{speaker.name}</strong>
                          {(speaker.designation || speaker.organization) && (
                            <div
                              style={{
                                fontSize: 'var(--font-sm)',
                                color: 'var(--color-text-secondary)',
                                marginTop: 'var(--space-50)',
                              }}
                            >
                              {[speaker.designation, speaker.organization].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </div>
                      </div>
                      {speaker.bio && (
                        <p
                          style={{
                            margin: 'var(--space-200) 0 0',
                            fontSize: 'var(--font-sm)',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {speaker.bio}
                        </p>
                      )}
                      {speaker.linkedin && (
                        <a
                          href={speaker.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-block', marginTop: 'var(--space-200)', fontSize: 'var(--font-sm)' }}
                        >
                          LinkedIn ↗
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside>
          {canEdit && (
            <section className="webinar-widget-card webinar-widget-card--sticky">
              <div className="webinar-widget-card__header">
                <h2 className="webinar-widget-card__title">Lifecycle Actions</h2>
              </div>
              <div className="webinar-widget-card__body">
                <div className="webinar-lifecycle-actions">
                  {webinar.status === 'SCHEDULED' && (
                    <Button variant="danger" size="md" fullWidth onClick={() => setTargetStatus('LIVE')}>
                      Go LIVE
                    </Button>
                  )}

                  {webinar.status === 'LIVE' && (
                    <Button variant="success" size="md" fullWidth onClick={() => setTargetStatus('COMPLETED')}>
                      Mark Completed
                    </Button>
                  )}

                  {(webinar.status === 'SCHEDULED' || webinar.status === 'LIVE') && (
                    <Button variant="secondary" size="md" fullWidth onClick={() => setTargetStatus('CANCELLED')}>
                      Cancel Webinar
                    </Button>
                  )}

                  {(webinar.status === 'COMPLETED' || webinar.status === 'CANCELLED') && (
                    <Button variant="secondary" size="md" fullWidth onClick={() => setTargetStatus('SCHEDULED')}>
                      Revert to Scheduled
                    </Button>
                  )}

                  {webinar.status === 'LIVE' && (
                    <Button variant="ghost" size="md" fullWidth onClick={() => setTargetStatus('SCHEDULED')}>
                      Revert to Scheduled
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="webinar-widget-card">
            <div className="webinar-widget-card__header">
              <h2 className="webinar-widget-card__title">Quick Info</h2>
            </div>
            <div className="webinar-widget-card__body">
              <dl className="detail-list">
                <div>
                  <dt>Published</dt>
                  <dd>{webinar.isPublished ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt>Featured</dt>
                  <dd>{webinar.isFeatured ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt>Requires Registration</dt>
                  <dd>{webinar.requiresRegistration ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt>RSVPs</dt>
                  <dd>
                    <Link to={ROUTES.WEBINARS_RSVPS(webinar.id)}>
                      {rsvpCount} registered
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>Capacity</dt>
                  <dd>{webinar.maxAttendees ? `${webinar.maxAttendees} attendees` : 'Unlimited'}</dd>
                </div>
                <div>
                  <dt>Platform</dt>
                  <dd>{LIVE_PLATFORMS[webinar.livePlatform]}</dd>
                </div>
                <div>
                  <dt>Public Page</dt>
                  <dd>
                    <Link to={publicPageUrl} target="_blank" rel="noreferrer">
                      View ↗
                    </Link>
                  </dd>
                </div>
                {webinar.status === 'LIVE' && (
                  <div>
                    <dt>Live Room</dt>
                    <dd>
                      <Link to={liveRoomUrl} target="_blank" rel="noreferrer">
                        Open ↗
                      </Link>
                    </dd>
                  </div>
                )}
                {webinar.createdBy && (
                  <div>
                    <dt>Created By</dt>
                    <dd>{webinar.createdBy.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          <section className="webinar-widget-card">
            <div className="webinar-widget-card__header">
              <h2 className="webinar-widget-card__title">Description &amp; Agenda</h2>
            </div>
            <div className="webinar-widget-card__body">
              {bannerUrl && (
                <img
                  src={bannerUrl}
                  alt={webinar.title}
                  className="webinar-banner-preview"
                  style={{ maxHeight: 180, width: '100%', marginBottom: 'var(--space-300)' }}
                />
              )}

              {webinar.description ? (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{webinar.description}</div>
              ) : (
                <p className="webinar-field-hint" style={{ margin: 0 }}>
                  No description provided.
                </p>
              )}

              {webinar.resources && webinar.resources.length > 0 && (
                <div style={{ marginTop: 'var(--space-400)' }}>
                  <div className="webinar-meta-box__label" style={{ marginBottom: 'var(--space-200)' }}>
                    Handouts &amp; Resources
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-400)' }}>
                    {webinar.resources.map((resource, index) => (
                      <li key={`${resource.title}-${index}`} style={{ marginBottom: 'var(--space-100)' }}>
                        <a href={resource.url} target="_blank" rel="noreferrer">
                          {resource.title}
                        </a>
                        {resource.type && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-xs)' }}>
                            {' '}
                            ({resource.type})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={targetStatus !== null}
        title={
          targetStatus === 'LIVE'
            ? 'Go LIVE'
            : targetStatus === 'COMPLETED'
              ? 'Mark Completed'
              : targetStatus === 'CANCELLED'
                ? 'Cancel Webinar'
                : targetStatus === 'SCHEDULED'
                  ? 'Revert to Scheduled'
                  : `Change Status to ${targetStatus}`
        }
        message={targetStatus ? statusConfirmMessage(targetStatus, webinar.title) : ''}
        confirmLabel={
          targetStatus === 'LIVE'
            ? 'Go LIVE'
            : targetStatus === 'COMPLETED'
              ? 'Mark Completed'
              : targetStatus === 'CANCELLED'
                ? 'Cancel Webinar'
                : 'Confirm'
        }
        destructive={targetStatus === 'CANCELLED'}
        busy={statusBusy}
        onConfirm={handleStatusToggle}
        onCancel={() => setTargetStatus(null)}
      />
    </div>
  );
}
