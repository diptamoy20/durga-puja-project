import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { adminPodcastService } from '@/services/podcastService';
import type { PodcastFormValues } from '@/types/podcast';

import '@/styles/podcasts-admin.css';

const DEFAULT_FORM: PodcastFormValues = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  audioUrl: '',
  audioDurationSeconds: 1200,
  coverImageUrl: '',
  seasonNumber: 1,
  episodeNumber: 1,
  episodeType: 'full',
  language: 'bn',
  hostName: 'Department of Tourism',
  guestName: '',
  guestBio: '',
  transcript: '',
  tags: '',
  isPublished: true,
  isFeatured: false,
  spotifyUrl: '',
  applePodcastsUrl: '',
  youtubeUrl: '',
};

export function PodcastFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<PodcastFormValues>(DEFAULT_FORM);

  useEffect(() => {
    if (isEditMode && id) {
      void loadEpisode(Number(id));
    }
  }, [id, isEditMode]);

  const loadEpisode = async (episodeId: number) => {
    setLoading(true);
    try {
      const ep = await adminPodcastService.get(episodeId);
      setFormData({
        title: ep.title,
        slug: ep.slug,
        summary: ep.summary || '',
        description: ep.description || '',
        audioUrl: ep.audioUrl,
        audioDurationSeconds: ep.audioDurationSeconds,
        coverImageUrl: ep.coverImageUrl || '',
        seasonNumber: ep.seasonNumber,
        episodeNumber: ep.episodeNumber,
        episodeType: ep.episodeType || 'full',
        language: ep.language || 'bn',
        hostName: ep.hostName || 'Department of Tourism',
        guestName: ep.guestName || '',
        guestBio: ep.guestBio || '',
        transcript: ep.transcript || '',
        tags: Array.isArray(ep.tags) ? ep.tags.join(', ') : '',
        isPublished: ep.isPublished,
        isFeatured: ep.isFeatured,
        spotifyUrl: ep.spotifyUrl || '',
        applePodcastsUrl: ep.applePodcastsUrl || '',
        youtubeUrl: ep.youtubeUrl || '',
      });
    } catch (err) {
      console.error('Failed to load episode for edit:', err);
      setErrorMessage('Could not load episode details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const tagsArray =
        typeof formData.tags === 'string'
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : formData.tags || [];

      const payload: PodcastFormValues = {
        ...formData,
        seasonNumber: Number(formData.seasonNumber),
        episodeNumber: Number(formData.episodeNumber),
        audioDurationSeconds: Number(formData.audioDurationSeconds),
        tags: tagsArray,
      };

      if (isEditMode && id) {
        await adminPodcastService.update(Number(id), payload);
      } else {
        await adminPodcastService.create(payload);
      }

      navigate(ROUTES.PODCASTS);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Failed to save podcast episode:', err);
      setErrorMessage(error?.response?.data?.message || 'Failed to save episode. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading episode form" />;

  return (
    <div className="page">
      <header className="podcast-form-header">
        <nav className="breadcrumbs podcast-breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
            </li>
            <li>
              <Link to={ROUTES.PODCASTS}>Podcasts</Link>
            </li>
            <li>
              <span aria-current="page">{isEditMode ? 'Edit Episode' : 'Create Episode'}</span>
            </li>
          </ol>
        </nav>

        <h1 className="podcast-form-header__title">
          {isEditMode ? `Edit: ${formData.title || 'Episode'}` : 'Create New Podcast Episode'}
        </h1>
        <p className="podcast-form-header__subtitle">
          Publish cultural audio stories for &ldquo;Bishwo Jure Bangalir Aabeg&rdquo;.
        </p>
      </header>

      {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}

      <form onSubmit={handleSubmit} className="podcast-form-grid">
        <section className="podcast-widget-card">
          <div className="podcast-widget-card__header">
            <h2 className="podcast-widget-card__title">
              <i className="fas fa-circle-info" aria-hidden="true" /> General Episode Information
            </h2>
          </div>
          <div className="podcast-widget-card__body">
            <div className="field">
              <label className="field__label" htmlFor="podcastTitle">
                Episode Title <span className="field__required">*</span>
              </label>
              <input
                id="podcastTitle"
                type="text"
                required
                name="title"
                className="field__control"
                value={formData.title}
                onChange={handleTextChange}
                placeholder="e.g. Echoes of Kumartuli: The Clay Sculptors of Durga"
              />
            </div>

            <div className="podcast-form__grid-4">
              <div className="field">
                <label className="field__label" htmlFor="seasonNumber">
                  Season Number <span className="field__required">*</span>
                </label>
                <input
                  id="seasonNumber"
                  type="number"
                  required
                  min={1}
                  name="seasonNumber"
                  className="field__control"
                  value={formData.seasonNumber}
                  onChange={handleTextChange}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="episodeNumber">
                  Episode Number <span className="field__required">*</span>
                </label>
                <input
                  id="episodeNumber"
                  type="number"
                  required
                  min={1}
                  name="episodeNumber"
                  className="field__control"
                  value={formData.episodeNumber}
                  onChange={handleTextChange}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="episodeType">
                  Episode Type
                </label>
                <select
                  id="episodeType"
                  name="episodeType"
                  className="field__control"
                  value={formData.episodeType}
                  onChange={handleTextChange}
                >
                  <option value="full">Full Episode</option>
                  <option value="trailer">Trailer / Teaser</option>
                  <option value="bonus">Bonus Episode</option>
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="language">
                  Primary Language
                </label>
                <select
                  id="language"
                  name="language"
                  className="field__control"
                  value={formData.language}
                  onChange={handleTextChange}
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="podcast-widget-card">
          <div className="podcast-widget-card__header">
            <h2 className="podcast-widget-card__title">
              <i className="fas fa-headphones" aria-hidden="true" /> Audio &amp; Media Assets
            </h2>
          </div>
          <div className="podcast-widget-card__body">
            <div className="field">
              <label className="field__label" htmlFor="audioUrl">
                Audio Stream / MP3 URL <span className="field__required">*</span>
              </label>
              <input
                id="audioUrl"
                type="url"
                required
                name="audioUrl"
                className="field__control"
                value={formData.audioUrl}
                onChange={handleTextChange}
                placeholder="https://storage.googleapis.com/durga-puja-podcasts/ep1.mp3"
              />
            </div>

            <div className="podcast-form__grid-2">
              <div className="field">
                <label className="field__label" htmlFor="audioDurationSeconds">
                  Duration (Seconds) <span className="field__required">*</span>
                </label>
                <input
                  id="audioDurationSeconds"
                  type="number"
                  required
                  min={1}
                  name="audioDurationSeconds"
                  className="field__control"
                  value={formData.audioDurationSeconds}
                  onChange={handleTextChange}
                  placeholder="e.g. 1800 for 30 mins"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="coverImageUrl">
                  Cover Artwork URL
                </label>
                <input
                  id="coverImageUrl"
                  type="url"
                  name="coverImageUrl"
                  className="field__control"
                  value={formData.coverImageUrl}
                  onChange={handleTextChange}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="podcast-widget-card">
          <div className="podcast-widget-card__header">
            <h2 className="podcast-widget-card__title">
              <i className="fas fa-user-group" aria-hidden="true" /> Guest &amp; Host Details
            </h2>
          </div>
          <div className="podcast-widget-card__body">
            <div className="podcast-form__grid-2">
              <div className="field">
                <label className="field__label" htmlFor="hostName">
                  Host Name
                </label>
                <input
                  id="hostName"
                  type="text"
                  name="hostName"
                  className="field__control"
                  value={formData.hostName}
                  onChange={handleTextChange}
                  placeholder="e.g. Shreya Sen"
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="guestName">
                  Guest Speaker Name
                </label>
                <input
                  id="guestName"
                  type="text"
                  name="guestName"
                  className="field__control"
                  value={formData.guestName}
                  onChange={handleTextChange}
                  placeholder="e.g. Mintu Pal (Master Sculptor)"
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="guestBio">
                Guest Biography / Background
              </label>
              <textarea
                id="guestBio"
                name="guestBio"
                rows={2}
                className="field__control"
                value={formData.guestBio}
                onChange={handleTextChange}
                placeholder="Brief profile of the guest..."
              />
            </div>
          </div>
        </section>

        <section className="podcast-widget-card">
          <div className="podcast-widget-card__header">
            <h2 className="podcast-widget-card__title">
              <i className="fas fa-file-lines" aria-hidden="true" /> Show Notes &amp; Transcripts
            </h2>
          </div>
          <div className="podcast-widget-card__body">
            <div className="field">
              <label className="field__label" htmlFor="summary">
                Short Summary (Teaser for Cards &amp; RSS Feed) <span className="field__required">*</span>
              </label>
              <textarea
                id="summary"
                name="summary"
                required
                rows={2}
                className="field__control"
                value={formData.summary}
                onChange={handleTextChange}
                placeholder="A compelling 1-2 sentence description of the episode..."
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="description">
                Full Show Notes &amp; Description <span className="field__required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="field__control"
                value={formData.description}
                onChange={handleTextChange}
                placeholder="Comprehensive description of the topics discussed, timestamps, references..."
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="transcript">
                Full Textual Transcript
              </label>
              <textarea
                id="transcript"
                name="transcript"
                rows={5}
                className="field__control"
                value={formData.transcript}
                onChange={handleTextChange}
                placeholder="Complete episode verbatim audio transcript..."
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="tags">
                Topic Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                className="field__control"
                value={formData.tags as string}
                onChange={handleTextChange}
                placeholder="Kumartuli, Artisans, Dhak, Heritage, Diaspora"
              />
            </div>
          </div>
        </section>

        <section className="podcast-widget-card">
          <div className="podcast-widget-card__header">
            <h2 className="podcast-widget-card__title">
              <i className="fas fa-share-nodes" aria-hidden="true" /> External Syndication Links
            </h2>
          </div>
          <div className="podcast-widget-card__body">
            <div className="podcast-form__grid-3">
              <div className="field">
                <label className="field__label" htmlFor="spotifyUrl">
                  Spotify Episode URL
                </label>
                <input
                  id="spotifyUrl"
                  type="url"
                  name="spotifyUrl"
                  className="field__control"
                  value={formData.spotifyUrl}
                  onChange={handleTextChange}
                  placeholder="https://open.spotify.com/episode/..."
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="applePodcastsUrl">
                  Apple Podcasts URL
                </label>
                <input
                  id="applePodcastsUrl"
                  type="url"
                  name="applePodcastsUrl"
                  className="field__control"
                  value={formData.applePodcastsUrl}
                  onChange={handleTextChange}
                  placeholder="https://podcasts.apple.com/..."
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="youtubeUrl">
                  YouTube Audio/Video URL
                </label>
                <input
                  id="youtubeUrl"
                  type="url"
                  name="youtubeUrl"
                  className="field__control"
                  value={formData.youtubeUrl}
                  onChange={handleTextChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="podcast-widget-card">
          <div className="podcast-widget-card__header">
            <h2 className="podcast-widget-card__title">
              <i className="fas fa-sliders" aria-hidden="true" /> Publishing Options
            </h2>
          </div>
          <div className="podcast-widget-card__body">
            <div className="podcast-form__options">
              <label className="podcast-form__option">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleCheckboxChange}
                />
                Publish Episode Immediately
              </label>
              <label className="podcast-form__option">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleCheckboxChange}
                />
                Mark as Featured Episode (Hero Banner)
              </label>
            </div>

            <div className="podcast-form-footer">
              <button type="button" onClick={() => navigate(ROUTES.PODCASTS)} className="btn btn--secondary btn--md">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn--primary btn--md">
                {submitting ? 'Saving...' : isEditMode ? 'Update Episode' : 'Publish Episode'}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
