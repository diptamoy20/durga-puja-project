import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { publicWebinarService } from '@/services/eventsService';
import { useToast } from '@/hooks/useToast';
import type { Webinar } from '@/types/events';

export function PublicWebinarsPage() {
  const toast = useToast();

  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [replays, setReplays] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  // RSVP modal
  const [rsvpWebinar, setRsvpWebinar] = useState<Webinar | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      publicWebinarService.list().catch(() => []),
      publicWebinarService.replays().catch(() => []),
    ])
      .then(([wList, rList]) => {
        setWebinars(wList);
        setReplays(rList);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpWebinar || !name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await publicWebinarService.rsvp(rsvpWebinar.slug, { name, email, phone: phone || undefined });
      toast.success(`RSVP confirmed for "${rsvpWebinar.title}". Calendar details sent to your email.`);
      setRsvpWebinar(null);
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'RSVP submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-800)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-200)' }}>
          Webinars & Virtual Festivals
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Connect live with eminent scholars, idol sculptors, researchers, and global community leaders.
        </p>
      </div>

      <div style={{ marginBottom: 'var(--space-800)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-400)' }}>
          Upcoming Broadcasts & Panels
        </h2>

        {loading ? (
          <p>Loading events…</p>
        ) : webinars.length === 0 ? (
          <Card>
            <p style={{ textAlign: 'center', padding: 'var(--space-600)', color: 'var(--color-text-muted)', margin: 0 }}>
              No upcoming webinars scheduled at the moment. Please check back soon or browse replays below.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-400)' }}>
            {webinars.map((w) => (
              <Card key={w.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {w.bannerImage && (
                  <div style={{ height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-300)' }}>
                    <img src={w.bannerImage} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  {w.status === 'LIVE' && (
                    <span className="badge badge--danger" style={{ marginBottom: 'var(--space-200)' }}>
                      🔴 LIVE NOW
                    </span>
                  )}
                  <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, margin: '0 0 var(--space-200) 0' }}>
                    {w.title}
                  </h3>
                  {w.speaker && (
                    <p style={{ margin: '0 0 var(--space-200) 0', fontSize: 'var(--font-sm)', color: 'var(--color-primary)', fontWeight: 500 }}>
                      Speaker: {w.speaker}
                    </p>
                  )}
                  <p style={{ margin: '0 0 var(--space-300) 0', fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                    📅 {new Date(w.scheduledAt).toLocaleString()} ({w.duration})
                  </p>
                  {w.description && (
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      {w.description}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 'var(--space-400)', paddingTop: 'var(--space-300)', borderTop: '1px solid var(--color-border)' }}>
                  {w.status === 'LIVE' && w.meetingLink ? (
                    <a
                      href={w.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--danger btn--md"
                      style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                    >
                      Join Live Broadcast Now ↗
                    </a>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      style={{ width: '100%' }}
                      onClick={() => setRsvpWebinar(w)}
                    >
                      Reserve My Spot (RSVP)
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {replays.length > 0 && (
        <div>
          <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-400)' }}>
            Recorded Replays & Past Archives
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-400)' }}>
            {replays.map((r) => (
              <Card key={r.id}>
                <h4 style={{ margin: '0 0 var(--space-150) 0' }}>{r.title}</h4>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-300) 0' }}>
                  {r.speaker && `With ${r.speaker} · `} Recorded on {new Date(r.scheduledAt).toLocaleDateString()}
                </p>
                {r.replayUrl && (
                  <a
                    href={r.replayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--secondary btn--sm"
                    style={{ textDecoration: 'none' }}
                  >
                    ▶ Watch Replay ↗
                  </a>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={rsvpWebinar !== null}
        title={`Register for: ${rsvpWebinar?.title}`}
        onClose={() => setRsvpWebinar(null)}
      >
        <form onSubmit={handleRsvpSubmit}>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-400)' }}>
            Please enter your details to receive live broadcast reminders and link access.
          </p>

          <div className="field">
            <label className="field__label" htmlFor="rsvpName">Your Name *</label>
            <input
              id="rsvpName"
              type="text"
              required
              className="field__control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="rsvpEmail">Email Address *</label>
            <input
              id="rsvpEmail"
              type="email"
              required
              className="field__control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="rsvpPhone">Phone / WhatsApp (optional)</label>
            <input
              id="rsvpPhone"
              type="tel"
              className="field__control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
            <Button type="button" variant="secondary" size="md" onClick={() => setRsvpWebinar(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={submitting}>
              {submitting ? 'Confirming…' : 'Confirm RSVP'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
