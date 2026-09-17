import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { adminWebinarService } from '@/services/eventsService';
import { useToast } from '@/hooks/useToast';
import type { WebinarFormValues } from '@/types/events';

export function WebinarFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState<WebinarFormValues>({
    title: '',
    description: '',
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    duration: '60 minutes',
    meetingLink: '',
    speaker: '',
    speakerBio: '',
    bannerImage: '',
    maxAttendees: 500,
    replayUrl: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminWebinarService
      .get(Number(id))
      .then((w) => {
        setFormData({
          title: w.title,
          description: w.description ?? '',
          scheduledAt: new Date(w.scheduledAt).toISOString().slice(0, 16),
          duration: w.duration,
          meetingLink: w.meetingLink ?? '',
          speaker: w.speaker ?? '',
          speakerBio: w.speakerBio ?? '',
          bannerImage: w.bannerImage ?? '',
          maxAttendees: w.maxAttendees ?? undefined,
          replayUrl: w.replayUrl ?? '',
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load webinar.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxAttendees' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.scheduledAt || !formData.duration) {
      toast.warning('Please enter title, schedule time, and duration.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await adminWebinarService.update(Number(id), formData);
        toast.success('Webinar updated successfully.');
        navigate(ROUTES.WEBINARS_DETAIL(id));
      } else {
        const created = await adminWebinarService.create(formData);
        toast.success('Webinar scheduled successfully.');
        navigate(ROUTES.WEBINARS_DETAIL(created.id));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save webinar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="page__header">
        <div style={{ marginBottom: 'var(--space-100)' }}>
          <Link to={ROUTES.WEBINARS} className="btn btn--secondary btn--sm">
            ← Back to Webinars
          </Link>
        </div>
        <h1 className="page__title">{isEdit ? 'Edit Webinar' : 'Schedule Webinar'}</h1>
        <p className="page__subtitle">
          Configure webinar broadcast times, live meeting link, and guest speaker information.
        </p>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
          <Card title="Event Information">
            <div className="field">
              <label className="field__label" htmlFor="wTitle">Webinar Title *</label>
              <input
                id="wTitle"
                name="title"
                type="text"
                required
                className="field__control"
                placeholder="e.g. Global Durga Puja: Cultural Preservation"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="wSchedule">Scheduled At *</label>
                <input
                  id="wSchedule"
                  name="scheduledAt"
                  type="datetime-local"
                  required
                  className="field__control"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="wDuration">Duration *</label>
                <input
                  id="wDuration"
                  name="duration"
                  type="text"
                  required
                  className="field__control"
                  placeholder="e.g. 60 minutes"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="wLink">Meeting / Live Stream Link</label>
              <input
                id="wLink"
                name="meetingLink"
                type="url"
                className="field__control"
                placeholder="https://zoom.us/j/... or YouTube Live URL"
                value={formData.meetingLink ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="wMax">Maximum Attendees Limit</label>
              <input
                id="wMax"
                name="maxAttendees"
                type="number"
                min="10"
                className="field__control"
                value={formData.maxAttendees ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="wDesc">Description</label>
              <textarea
                id="wDesc"
                name="description"
                rows={4}
                className="field__control"
                placeholder="Overview of the agenda, topics, and interactive Q&A..."
                value={formData.description ?? ''}
                onChange={handleChange}
              />
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
            <Card title="Speaker Details">
              <div className="field">
                <label className="field__label" htmlFor="wSpeaker">Speaker / Host Name</label>
                <input
                  id="wSpeaker"
                  name="speaker"
                  type="text"
                  className="field__control"
                  placeholder="e.g. Prof. Debanjan Roy"
                  value={formData.speaker ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="wBio">Speaker Bio</label>
                <textarea
                  id="wBio"
                  name="speakerBio"
                  rows={3}
                  className="field__control"
                  placeholder="Distinguished researcher, historian, or cultural ambassador..."
                  value={formData.speakerBio ?? ''}
                  onChange={handleChange}
                />
              </div>
            </Card>

            <Card title="Media & Recordings">
              <div className="field">
                <label className="field__label" htmlFor="wBanner">Banner Image URL</label>
                <input
                  id="wBanner"
                  name="bannerImage"
                  type="url"
                  className="field__control"
                  placeholder="https://..."
                  value={formData.bannerImage ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="wReplay">Replay Recording URL</label>
                <input
                  id="wReplay"
                  name="replayUrl"
                  type="url"
                  className="field__control"
                  placeholder="https://youtube.com/watch?v=... (Available after broadcast)"
                  value={formData.replayUrl ?? ''}
                  onChange={handleChange}
                />
              </div>
            </Card>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
          <Link to={ROUTES.WEBINARS} className="btn btn--secondary btn--md">
            Cancel
          </Link>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Webinar' : 'Schedule Webinar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
