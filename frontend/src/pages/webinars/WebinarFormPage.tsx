import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { WebinarBreadcrumb } from '@/components/webinars/WebinarBreadcrumb';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { adminWebinarService } from '@/services/eventsService';
import { useToast } from '@/hooks/useToast';
import type {
  LivePlatform,
  Webinar,
  WebinarFormValues,
  WebinarResource,
  WebinarResourceType,
  WebinarSpeaker,
  WebinarStatus,
} from '@/types/events';
import {
  emptySpeaker,
  fromDatetimeLocalValue,
  LIVE_PLATFORMS,
  resolveBannerUrl,
  slugifyTitle,
  toDatetimeLocalValue,
  WEBINAR_STATUSES,
} from '@/utils/webinarHelpers';

import '@/styles/webinars-admin.css';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESOURCE_TYPES: { value: WebinarResourceType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'slides', label: 'Slides' },
  { value: 'document', label: 'Doc' },
  { value: 'link', label: 'Link' },
];

function defaultScheduledStart(): string {
  return toDatetimeLocalValue(new Date(Date.now() + 86400000).toISOString());
}

function createDefaultForm(): WebinarFormValues {
  return {
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    bannerImage: '',
    speakers: [emptySpeaker()],
    scheduledStartTime: defaultScheduledStart(),
    scheduledEndTime: '',
    timezone: 'Asia/Kolkata',
    status: 'SCHEDULED',
    maxAttendees: null,
    requiresRegistration: true,
    isPublished: true,
    isFeatured: false,
    livePlatform: 'youtube_live',
    liveStreamUrl: '',
    liveEmbedCode: '',
    liveMeetingUrl: '',
    liveMeetingPasscode: '',
    replayVideoUrl: '',
    replayEmbedCode: '',
    replayDurationMinutes: null,
    resources: [],
  };
}

function mapWebinarToForm(webinar: Webinar): WebinarFormValues {
  return {
    title: webinar.title,
    slug: webinar.slug,
    subtitle: webinar.subtitle ?? '',
    description: webinar.description ?? '',
    bannerImage: webinar.bannerImage ?? '',
    speakers: webinar.speakers?.length ? webinar.speakers : [emptySpeaker()],
    scheduledStartTime: toDatetimeLocalValue(webinar.scheduledStartTime),
    scheduledEndTime: toDatetimeLocalValue(webinar.scheduledEndTime),
    timezone: webinar.timezone || 'Asia/Kolkata',
    status: webinar.status,
    maxAttendees: webinar.maxAttendees,
    requiresRegistration: webinar.requiresRegistration,
    isFeatured: webinar.isFeatured,
    isPublished: webinar.isPublished,
    livePlatform: webinar.livePlatform,
    liveStreamUrl: webinar.liveStreamUrl ?? '',
    liveEmbedCode: webinar.liveEmbedCode ?? '',
    liveMeetingUrl: webinar.liveMeetingUrl ?? '',
    liveMeetingPasscode: webinar.liveMeetingPasscode ?? '',
    replayVideoUrl: webinar.replayVideoUrl ?? '',
    replayEmbedCode: webinar.replayEmbedCode ?? '',
    replayDurationMinutes: webinar.replayDurationMinutes,
    resources: webinar.resources ?? [],
  };
}

function emptyResource(): WebinarResource {
  return { title: '', url: '', type: 'pdf' };
}

function buildPayload(form: WebinarFormValues): WebinarFormValues {
  const speakers = (form.speakers ?? [])
    .filter((speaker) => speaker.name.trim())
    .map((speaker) => ({
      name: speaker.name.trim(),
      designation: speaker.designation?.trim() || undefined,
      organization: speaker.organization?.trim() || undefined,
      bio: speaker.bio?.trim() || undefined,
      linkedin: speaker.linkedin?.trim() || undefined,
    }));

  const resources = (form.resources ?? [])
    .filter((resource) => resource.title.trim() && resource.url.trim())
    .map((resource) => ({
      title: resource.title.trim(),
      url: resource.url.trim(),
      type: resource.type ?? 'link',
    }));

  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    subtitle: form.subtitle?.trim() || undefined,
    description: form.description?.trim() || undefined,
    bannerImage: form.bannerImage || undefined,
    speakers,
    scheduledStartTime: fromDatetimeLocalValue(form.scheduledStartTime),
    scheduledEndTime: form.scheduledEndTime
      ? fromDatetimeLocalValue(form.scheduledEndTime)
      : undefined,
    timezone: form.timezone?.trim() || 'Asia/Kolkata',
    status: form.status,
    maxAttendees: form.maxAttendees ?? null,
    requiresRegistration: form.requiresRegistration,
    isFeatured: form.isFeatured,
    isPublished: form.isPublished,
    livePlatform: form.livePlatform,
    liveStreamUrl: form.liveStreamUrl?.trim() || undefined,
    liveEmbedCode: form.liveEmbedCode?.trim() || undefined,
    liveMeetingUrl: form.liveMeetingUrl?.trim() || undefined,
    liveMeetingPasscode: form.liveMeetingPasscode?.trim() || undefined,
    replayVideoUrl: form.replayVideoUrl?.trim() || undefined,
    replayEmbedCode: form.replayEmbedCode?.trim() || undefined,
    replayDurationMinutes: form.replayDurationMinutes ?? null,
    resources: resources.length ? resources : undefined,
  };
}

type FieldErrors = Partial<Record<string, string>>;

export function WebinarFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const slugEdited = useRef(isEdit);

  const [formData, setFormData] = useState<WebinarFormValues>(createDefaultForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminWebinarService
      .get(Number(id))
      .then((webinar) => {
        setFormData(mapWebinarToForm(webinar));
        slugEdited.current = true;
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load webinar.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateField = <K extends keyof WebinarFormValues>(key: K, value: WebinarFormValues[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: slugEdited.current ? prev.slug : slugifyTitle(value),
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.title;
      if (!slugEdited.current) delete next.slug;
      return next;
    });
  };

  const handleSlugChange = (value: string) => {
    slugEdited.current = true;
    updateField('slug', value);
  };

  const handleSpeakerChange = (index: number, key: keyof WebinarSpeaker, value: string) => {
    setFormData((prev) => {
      const speakers = [...(prev.speakers ?? [])];
      speakers[index] = { ...speakers[index], [key]: value };
      return { ...prev, speakers };
    });
    if (key === 'name') {
      setFieldErrors((prev) => {
        if (!prev.speakers) return prev;
        const next = { ...prev };
        delete next.speakers;
        return next;
      });
    }
  };

  const addSpeaker = () => {
    setFormData((prev) => ({
      ...prev,
      speakers: [...(prev.speakers ?? []), emptySpeaker()],
    }));
  };

  const removeSpeaker = (index: number) => {
    setFormData((prev) => {
      const speakers = [...(prev.speakers ?? [])];
      if (speakers.length <= 1) return prev;
      speakers.splice(index, 1);
      return { ...prev, speakers };
    });
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      resources: [...(prev.resources ?? []), emptyResource()],
    }));
  };

  const removeResource = (index: number) => {
    setFormData((prev) => {
      const resources = [...(prev.resources ?? [])];
      resources.splice(index, 1);
      return { ...prev, resources };
    });
  };

  const handleResourceChange = (
    index: number,
    key: keyof WebinarResource,
    value: string,
  ) => {
    setFormData((prev) => {
      const resources = [...(prev.resources ?? [])];
      resources[index] = { ...resources[index], [key]: value };
      return { ...prev, resources };
    });
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    setError(null);
    try {
      const result = await adminWebinarService.uploadBanner(file);
      updateField('bannerImage', result.bannerImage);
      toast.success('Banner uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload banner.');
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Webinar title is required.';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'URL slug is required.';
    } else if (!SLUG_PATTERN.test(formData.slug.trim())) {
      errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only.';
    }

    if (!formData.scheduledStartTime) {
      errors.scheduledStartTime = 'Start time is required.';
    }

    if (!formData.livePlatform) {
      errors.livePlatform = 'Live platform is required.';
    }

    const namedSpeakers = (formData.speakers ?? []).filter((speaker) => speaker.name.trim());
    if (namedSpeakers.length === 0) {
      errors.speakers = 'At least one speaker with a name is required.';
    }

    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      const start = new Date(formData.scheduledStartTime).getTime();
      const end = new Date(formData.scheduledEndTime).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
        errors.scheduledEndTime = 'End time must be after start time.';
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.warning('Please fix the highlighted fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(formData);
      if (isEdit && id) {
        await adminWebinarService.update(Number(id), payload);
        toast.success('Webinar updated successfully.');
        navigate(ROUTES.WEBINARS_DETAIL(id));
      } else {
        const created = await adminWebinarService.create(payload);
        toast.success('Webinar scheduled successfully.');
        navigate(ROUTES.WEBINARS_DETAIL(created.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save webinar.');
    } finally {
      setSaving(false);
    }
  };

  const bannerPreview = resolveBannerUrl(formData.bannerImage);
  const speakers = formData.speakers ?? [];
  const resources = formData.resources ?? [];

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="webinar-form-header">
        <WebinarBreadcrumb
          items={[
            { label: 'Webinars', to: ROUTES.WEBINARS },
            { label: isEdit ? 'Edit Webinar' : 'Schedule Webinar' },
          ]}
        />
        <div className="webinar-form-header__intro">
          <h1 className="webinar-form-header__title">
            {isEdit ? 'Edit Webinar' : 'Schedule Webinar'}
          </h1>
          <p className="webinar-form-header__subtitle">
            Configure webinar details, speakers, live stream, replay, and lifecycle settings.
          </p>
        </div>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="webinar-form-grid">
          <div>
            <section className="webinar-widget-card">
              <div className="webinar-widget-card__header">
                <h2 className="webinar-widget-card__title">
                  <i className="fas fa-circle-info" aria-hidden="true" /> Webinar Overview
                </h2>
              </div>
              <div className="webinar-widget-card__body">
                <div className={`field ${fieldErrors.title ? 'webinar-field--error' : ''}`}>
                  <label className="field__label" htmlFor="webinar-title">
                    Webinar Title <span className="field__required">*</span>
                  </label>
                  <input
                    id="webinar-title"
                    type="text"
                    className="field__control"
                    placeholder="e.g. Global Durga Puja Heritage & Sustainable Tourism"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                  {fieldErrors.title && (
                    <div className="webinar-field-error">{fieldErrors.title}</div>
                  )}
                </div>

                <div className={`field ${fieldErrors.slug ? 'webinar-field--error' : ''}`}>
                  <label className="field__label" htmlFor="webinar-slug">
                    URL Slug <span className="field__required">*</span>
                  </label>
                  <input
                    id="webinar-slug"
                    type="text"
                    className="field__control"
                    placeholder="global-durga-puja-heritage"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                  {fieldErrors.slug && (
                    <div className="webinar-field-error">{fieldErrors.slug}</div>
                  )}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="webinar-subtitle">
                    Subtitle / Short Summary
                  </label>
                  <textarea
                    id="webinar-subtitle"
                    rows={2}
                    className="field__control"
                    placeholder="Brief summary of the webinar session..."
                    value={formData.subtitle ?? ''}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="webinar-description">
                    Detailed Agenda & Description
                  </label>
                  <textarea
                    id="webinar-description"
                    rows={8}
                    className="field__control"
                    placeholder="Enter session agenda, key highlights, and topics..."
                    value={formData.description ?? ''}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="webinar-banner">
                    Banner / Poster Image
                  </label>
                  <input
                    id="webinar-banner"
                    type="file"
                    className="field__control"
                    accept=".jpg,.jpeg,.png,.webp"
                    disabled={uploadingBanner}
                    onChange={handleBannerChange}
                  />
                  <p className="webinar-field-hint">Recommended size: 1200×630px (Max 4MB)</p>
                  {uploadingBanner && <p className="webinar-field-hint">Uploading banner…</p>}
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="webinar-banner-preview"
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="webinar-widget-card">
              <div className="webinar-widget-card__header">
                <h2 className="webinar-widget-card__title">
                  <i className="fas fa-users" aria-hidden="true" /> Speakers &amp; Panelists
                </h2>
                <Button type="button" variant="secondary" size="sm" onClick={addSpeaker}>
                  + Add Speaker
                </Button>
              </div>
              <div className="webinar-widget-card__body">
                {fieldErrors.speakers && (
                  <Alert tone="warning">{fieldErrors.speakers}</Alert>
                )}
                {speakers.map((speaker, index) => (
                  <div key={index} className="webinar-repeater-item">
                    {speakers.length > 1 && (
                      <button
                        type="button"
                        className="webinar-repeater-item__remove"
                        title="Remove speaker"
                        onClick={() => removeSpeaker(index)}
                        aria-label="Remove speaker"
                      >
                        ×
                      </button>
                    )}
                    <div className="webinar-repeater-grid">
                      <div className="field">
                        <label className="field__label">Full Name *</label>
                        <input
                          type="text"
                          className="field__control"
                          placeholder="Speaker Name"
                          value={speaker.name}
                          onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label className="field__label">Designation</label>
                        <input
                          type="text"
                          className="field__control"
                          placeholder="e.g. Heritage Expert"
                          value={speaker.designation ?? ''}
                          onChange={(e) =>
                            handleSpeakerChange(index, 'designation', e.target.value)
                          }
                        />
                      </div>
                      <div className="field">
                        <label className="field__label">Organization</label>
                        <input
                          type="text"
                          className="field__control"
                          placeholder="e.g. UNESCO / Puja Committee"
                          value={speaker.organization ?? ''}
                          onChange={(e) =>
                            handleSpeakerChange(index, 'organization', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="webinar-field-grid webinar-field-grid--spaced-top">
                      <div className="field">
                        <label className="field__label">Short Bio</label>
                        <input
                          type="text"
                          className="field__control"
                          placeholder="Brief introduction"
                          value={speaker.bio ?? ''}
                          onChange={(e) => handleSpeakerChange(index, 'bio', e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label className="field__label">LinkedIn / Profile URL</label>
                        <input
                          type="url"
                          className="field__control"
                          placeholder="https://linkedin.com/in/..."
                          value={speaker.linkedin ?? ''}
                          onChange={(e) => handleSpeakerChange(index, 'linkedin', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="webinar-widget-card">
              <div className="webinar-widget-card__header">
                <h2 className="webinar-widget-card__title">
                  <i className="fas fa-tower-broadcast" aria-hidden="true" /> Live Stream &amp; Platform Configuration
                </h2>
              </div>
              <div className="webinar-widget-card__body">
                <div className="webinar-field-grid">
                  <div className={`field ${fieldErrors.livePlatform ? 'webinar-field--error' : ''}`}>
                    <label className="field__label" htmlFor="live-platform">
                      Live Platform <span className="field__required">*</span>
                    </label>
                    <select
                      id="live-platform"
                      className="field__control"
                      value={formData.livePlatform ?? 'youtube_live'}
                      onChange={(e) =>
                        updateField('livePlatform', e.target.value as LivePlatform)
                      }
                    >
                      {(Object.entries(LIVE_PLATFORMS) as [LivePlatform, string][]).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                    {fieldErrors.livePlatform && (
                      <div className="webinar-field-error">{fieldErrors.livePlatform}</div>
                    )}
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="live-stream-url">
                      Stream / Watch URL
                    </label>
                    <input
                      id="live-stream-url"
                      type="text"
                      className="field__control"
                      placeholder="e.g. https://www.youtube.com/watch?v=XXXX"
                      value={formData.liveStreamUrl ?? ''}
                      onChange={(e) => updateField('liveStreamUrl', e.target.value)}
                    />
                    <p className="webinar-field-hint">
                      Direct YouTube Live link, Vimeo URL, or HLS stream
                    </p>
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="live-embed-code">
                    Custom Live Embed Iframe (Optional)
                  </label>
                  <textarea
                    id="live-embed-code"
                    rows={2}
                    className="field__control field__control--mono"
                    placeholder='<iframe src="..." width="100%" height="450" frameborder="0"></iframe>'
                    value={formData.liveEmbedCode ?? ''}
                    onChange={(e) => updateField('liveEmbedCode', e.target.value)}
                  />
                </div>

                <div className="webinar-field-grid">
                  <div className="field">
                    <label className="field__label" htmlFor="live-meeting-url">
                      Meeting Join URL (Zoom / Meet)
                    </label>
                    <input
                      id="live-meeting-url"
                      type="url"
                      className="field__control"
                      placeholder="https://zoom.us/j/123456789"
                      value={formData.liveMeetingUrl ?? ''}
                      onChange={(e) => updateField('liveMeetingUrl', e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="live-meeting-passcode">
                      Meeting Passcode
                    </label>
                    <input
                      id="live-meeting-passcode"
                      type="text"
                      className="field__control"
                      placeholder="e.g. GS2026"
                      value={formData.liveMeetingPasscode ?? ''}
                      onChange={(e) => updateField('liveMeetingPasscode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="webinar-widget-card">
              <div className="webinar-widget-card__header">
                <h2 className="webinar-widget-card__title">
                  <i className="fas fa-circle-play" aria-hidden="true" /> Replay &amp; Recording
                </h2>
              </div>
              <div className="webinar-widget-card__body">
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
                      value={formData.replayVideoUrl ?? ''}
                      onChange={(e) => updateField('replayVideoUrl', e.target.value)}
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
                      value={formData.replayDurationMinutes ?? ''}
                      onChange={(e) =>
                        updateField(
                          'replayDurationMinutes',
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
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
                    className="field__control field__control--mono"
                    placeholder='<iframe src="..." width="100%" height="450"></iframe>'
                    value={formData.replayEmbedCode ?? ''}
                    onChange={(e) => updateField('replayEmbedCode', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="webinar-widget-card">
              <div className="webinar-widget-card__header">
                <h2 className="webinar-widget-card__title">
                  <i className="fas fa-file-pdf" aria-hidden="true" /> Handouts &amp; Slide Decks
                </h2>
                <Button type="button" variant="secondary" size="sm" onClick={addResource}>
                  + Add Resource
                </Button>
              </div>
              <div className="webinar-widget-card__body">
                {resources.length === 0 ? (
                  <p className="webinar-field-hint webinar-field-hint--flush">
                    No downloadable resources attached. Click &quot;Add Resource&quot; to include
                    slides or handouts.
                  </p>
                ) : (
                  resources.map((resource, index) => (
                    <div key={index} className="webinar-repeater-item">
                      <button
                        type="button"
                        className="webinar-repeater-item__remove"
                        title="Remove resource"
                        onClick={() => removeResource(index)}
                        aria-label="Remove resource"
                      >
                        ×
                      </button>
                      <div className="webinar-repeater-grid">
                        <div className="field">
                          <label className="field__label">Resource Title</label>
                          <input
                            type="text"
                            className="field__control"
                            placeholder="e.g. Session Slides PDF"
                            value={resource.title}
                            onChange={(e) =>
                              handleResourceChange(index, 'title', e.target.value)
                            }
                          />
                        </div>
                        <div className="field">
                          <label className="field__label">Link / File URL</label>
                          <input
                            type="url"
                            className="field__control"
                            placeholder="https://..."
                            value={resource.url}
                            onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                          />
                        </div>
                        <div className="field">
                          <label className="field__label">Type</label>
                          <select
                            className="field__control"
                            value={resource.type ?? 'pdf'}
                            onChange={(e) =>
                              handleResourceChange(index, 'type', e.target.value)
                            }
                          >
                            {RESOURCE_TYPES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside>
            <section className="webinar-widget-card webinar-widget-card--sticky">
              <div className="webinar-widget-card__header">
                <h2 className="webinar-widget-card__title">
                  <i className="fas fa-gear" aria-hidden="true" /> Lifecycle Status
                </h2>
              </div>
              <div className="webinar-widget-card__body">
                <div className="field">
                  <label className="field__label" htmlFor="webinar-status">
                    Current State <span className="field__required">*</span>
                  </label>
                  <select
                    id="webinar-status"
                    className="field__control"
                    value={formData.status ?? 'SCHEDULED'}
                    onChange={(e) => updateField('status', e.target.value as WebinarStatus)}
                  >
                    {(Object.entries(WEBINAR_STATUSES) as [WebinarStatus, string][]).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div
                  className={`field ${fieldErrors.scheduledStartTime ? 'webinar-field--error' : ''}`}
                >
                  <label className="field__label" htmlFor="scheduled-start">
                    Start Time <span className="field__required">*</span>
                  </label>
                  <input
                    id="scheduled-start"
                    type="datetime-local"
                    className="field__control"
                    value={formData.scheduledStartTime}
                    onChange={(e) => updateField('scheduledStartTime', e.target.value)}
                  />
                  {fieldErrors.scheduledStartTime && (
                    <div className="webinar-field-error">{fieldErrors.scheduledStartTime}</div>
                  )}
                </div>

                <div
                  className={`field ${fieldErrors.scheduledEndTime ? 'webinar-field--error' : ''}`}
                >
                  <label className="field__label" htmlFor="scheduled-end">
                    End Time
                  </label>
                  <input
                    id="scheduled-end"
                    type="datetime-local"
                    className="field__control"
                    value={formData.scheduledEndTime ?? ''}
                    onChange={(e) => updateField('scheduledEndTime', e.target.value)}
                  />
                  {fieldErrors.scheduledEndTime && (
                    <div className="webinar-field-error">{fieldErrors.scheduledEndTime}</div>
                  )}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="webinar-timezone">
                    Timezone
                  </label>
                  <input
                    id="webinar-timezone"
                    type="text"
                    className="field__control"
                    value={formData.timezone ?? 'Asia/Kolkata'}
                    onChange={(e) => updateField('timezone', e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="max-attendees">
                    Max Attendees Limit
                  </label>
                  <input
                    id="max-attendees"
                    type="number"
                    min={1}
                    className="field__control"
                    placeholder="Leave blank for unlimited"
                    value={formData.maxAttendees ?? ''}
                    onChange={(e) =>
                      updateField(
                        'maxAttendees',
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </div>

                <hr className="webinar-form-divider" />

                <div className="webinar-switch-row">
                  <label className="field__label" htmlFor="requires-registration">
                    Require RSVP / Registration
                  </label>
                  <input
                    id="requires-registration"
                    type="checkbox"
                    checked={formData.requiresRegistration ?? true}
                    onChange={(e) => updateField('requiresRegistration', e.target.checked)}
                  />
                </div>

                <div className="webinar-switch-row">
                  <label className="field__label" htmlFor="is-published">
                    Publicly Visible
                  </label>
                  <input
                    id="is-published"
                    type="checkbox"
                    checked={formData.isPublished ?? true}
                    onChange={(e) => updateField('isPublished', e.target.checked)}
                  />
                </div>

                <div className="webinar-switch-row">
                  <label className="field__label" htmlFor="is-featured">
                    Featured Webinar
                  </label>
                  <input
                    id="is-featured"
                    type="checkbox"
                    checked={formData.isFeatured ?? false}
                    onChange={(e) => updateField('isFeatured', e.target.checked)}
                  />
                </div>

                <div className="webinar-form-actions">
                  <Button type="submit" variant="primary" size="md" disabled={saving || uploadingBanner}>
                    <i className="fas fa-save" aria-hidden="true" />{' '}
                    {saving ? 'Saving…' : isEdit ? 'Update Webinar' : 'Schedule Webinar'}
                  </Button>
                  <Link to={ROUTES.WEBINARS} className="btn btn--secondary btn--md">
                    Cancel
                  </Link>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}
