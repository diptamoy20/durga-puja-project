import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { PodcastFormValues } from '@/types/podcast';
import { adminPodcastService } from '@/services/podcastService';
import { ROUTES } from '@/constants/routes';

export function PodcastFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<PodcastFormValues>({
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
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadEpisode(Number(id));
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
      const tagsArray = typeof formData.tags === 'string'
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
        Loading episode form...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 0 60px' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          <Link to={ROUTES.PODCASTS} style={{ color: 'var(--color-brand, #9b1c1c)', textDecoration: 'none' }}>
            ← Back to Podcasts
          </Link>
          <span>/</span>
          <span>{isEditMode ? 'Edit Episode' : 'Create Episode'}</span>
        </nav>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800 }}>
          {isEditMode ? `Edit: ${formData.title}` : '🎙️ Create New Podcast Episode'}
        </h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Publish cultural audio stories for &ldquo;Bishwo Jure Bangalir Aabeg&rdquo;.
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Basic Metadata Section */}
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          General Episode Information
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Episode Title *
          </label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleTextChange}
            placeholder="e.g. Echoes of Kumartuli: The Clay Sculptors of Durga"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Season Number *
            </label>
            <input
              type="number"
              required
              min="1"
              name="seasonNumber"
              value={formData.seasonNumber}
              onChange={handleTextChange}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Episode Number *
            </label>
            <input
              type="number"
              required
              min="1"
              name="episodeNumber"
              value={formData.episodeNumber}
              onChange={handleTextChange}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Episode Type
            </label>
            <select
              name="episodeType"
              value={formData.episodeType}
              onChange={handleTextChange}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            >
              <option value="full">Full Episode</option>
              <option value="trailer">Trailer / Teaser</option>
              <option value="bonus">Bonus Episode</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Primary Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleTextChange}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            >
              <option value="bn">বাংলা (Bengali)</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

        {/* Audio Asset Details */}
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '24px 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          Audio & Media Assets
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Audio Stream / MP3 URL *
          </label>
          <input
            type="url"
            required
            name="audioUrl"
            value={formData.audioUrl}
            onChange={handleTextChange}
            placeholder="https://storage.googleapis.com/durga-puja-podcasts/ep1.mp3"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Duration (Seconds) *
            </label>
            <input
              type="number"
              required
              min="1"
              name="audioDurationSeconds"
              value={formData.audioDurationSeconds}
              onChange={handleTextChange}
              placeholder="e.g. 1800 for 30 mins"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Cover Artwork URL
            </label>
            <input
              type="url"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleTextChange}
              placeholder="https://images.unsplash.com/photo-..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Guest & Host Info */}
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '24px 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          Guest & Host Details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Host Name
            </label>
            <input
              type="text"
              name="hostName"
              value={formData.hostName}
              onChange={handleTextChange}
              placeholder="e.g. Shreya Sen"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Guest Speaker Name
            </label>
            <input
              type="text"
              name="guestName"
              value={formData.guestName}
              onChange={handleTextChange}
              placeholder="e.g. Mintu Pal (Master Sculptor)"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Guest Biography / Background
          </label>
          <textarea
            name="guestBio"
            rows={2}
            value={formData.guestBio}
            onChange={handleTextChange}
            placeholder="Brief profile of the guest..."
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Content & Notes */}
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '24px 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          Show Notes & Transcripts
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Short Summary (Teaser for Cards & RSS Feed) *
          </label>
          <textarea
            name="summary"
            required
            rows={2}
            value={formData.summary}
            onChange={handleTextChange}
            placeholder="A compelling 1-2 sentence description of the episode..."
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Full Show Notes & Description *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleTextChange}
            placeholder="Comprehensive description of the topics discussed, timestamps, references..."
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Full Textual Transcript (For Accessibility & Search)
          </label>
          <textarea
            name="transcript"
            rows={5}
            value={formData.transcript}
            onChange={handleTextChange}
            placeholder="Complete episode verbatim audio transcript..."
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
            Topic Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags as string}
            onChange={handleTextChange}
            placeholder="Kumartuli, Artisans, Dhak, Heritage, Diaspora"
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Syndication Links */}
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '24px 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          External Syndication Links
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Spotify Episode URL
            </label>
            <input
              type="url"
              name="spotifyUrl"
              value={formData.spotifyUrl}
              onChange={handleTextChange}
              placeholder="https://open.spotify.com/episode/..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Apple Podcasts URL
            </label>
            <input
              type="url"
              name="applePodcastsUrl"
              value={formData.applePodcastsUrl}
              onChange={handleTextChange}
              placeholder="https://podcasts.apple.com/..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              YouTube Audio/Video URL
            </label>
            <input
              type="url"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleTextChange}
              placeholder="https://youtube.com/watch?v=..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Publishing Options */}
        <div
          style={{
            background: 'var(--color-bg)',
            padding: '16px',
            borderRadius: '10px',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '28px',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleCheckboxChange}
            />
            Publish Episode Immediately
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleCheckboxChange}
            />
            Mark as Featured Episode (Hero Banner)
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PODCASTS)}
            className="btn btn--secondary"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn--primary"
            style={{ background: 'var(--color-brand, #9b1c1c)' }}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Episode' : 'Publish Episode'}
          </button>
        </div>
      </form>
    </div>
  );
}
