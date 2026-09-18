import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { PodcastEpisode } from '@/types/podcast';
import { publicPodcastService } from '@/services/podcastService';
import { AudioPlayer } from '@/components/podcast/AudioPlayer';
import { ReactionButtons } from '@/components/podcast/ReactionButtons';
import { ROUTES } from '@/constants/routes';

export function PodcastDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadEpisode(slug);
  }, [slug]);

  const loadEpisode = async (episodeSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicPodcastService.getBySlug(episodeSlug);
      setEpisode(data);
    } catch (err) {
      console.error('Failed to load episode details:', err);
      setError('Unable to load episode. It might have been moved or removed.');
    } finally {
      setLoading(false);
    }
  };

  const copyEpisodeLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <div style={{ fontSize: '36px', marginBottom: '14px' }}>🎙️</div>
        <div>Loading episode details...</div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: '#b91c1c' }}>Episode Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          {error || 'The requested podcast episode could not be retrieved.'}
        </p>
        <Link to={ROUTES.PUBLIC_PODCASTS} className="btn btn--primary">
          ← Back to All Episodes
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        <Link to={ROUTES.PUBLIC_PODCASTS} style={{ color: 'var(--color-brand, #9b1c1c)', textDecoration: 'none', fontWeight: 500 }}>
          Podcasts
        </Link>
        <span>/</span>
        <span>Season {episode.seasonNumber}</span>
        <span>/</span>
        <span style={{ color: 'var(--color-text)' }}>Episode {episode.episodeNumber}</span>
      </nav>

      {/* Episode Header */}
      <header style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span
            style={{
              background: 'var(--color-brand, #9b1c1c)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            Season {episode.seasonNumber} • Episode {episode.episodeNumber}
          </span>
          {episode.language && (
            <span
              style={{
                background: 'var(--color-bg, #f1f5f9)',
                color: 'var(--color-text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
              }}
            >
              Language: {episode.language}
            </span>
          )}
          {episode.publishedAt && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Released {new Date(episode.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            lineHeight: '1.25',
            margin: '0 0 16px 0',
            color: 'var(--color-text, #1e293b)',
          }}
        >
          {episode.title}
        </h1>

        <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'var(--color-text-muted)', margin: 0 }}>
          {episode.summary}
        </p>
      </header>

      {/* Embedded Audio Player */}
      <div style={{ marginBottom: '32px' }}>
        <AudioPlayer episode={episode} autoPlay={false} />
      </div>

      {/* Interactive Bar (Reactions, Share, Syndication) */}
      <div
        style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '36px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <ReactionButtons episode={episode} size="md" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={copyEpisodeLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: copiedLink ? '#10b981' : 'var(--color-bg)',
              color: copiedLink ? '#ffffff' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            {copiedLink ? 'Link Copied! ✓' : '🔗 Share Episode'}
          </button>

          {episode.spotifyUrl && (
            <a
              href={episode.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#1db954',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(29, 185, 84, 0.1)',
              }}
            >
              Spotify
            </a>
          )}

          {episode.applePodcastsUrl && (
            <a
              href={episode.applePodcastsUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--color-text)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              Apple Podcasts
            </a>
          )}
        </div>
      </div>

      {/* Main Content Grid (Show Notes + Guest Sidebar) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {/* Left: Show Notes & Details */}
        <div style={{ flex: '2' }}>
          <section
            style={{
              background: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '28px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              📝 Episode Show Notes
            </h2>
            <div
              style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: 'var(--color-text)',
                whiteSpace: 'pre-line',
              }}
            >
              {episode.description}
            </div>

            {/* Tags */}
            {Array.isArray(episode.tags) && episode.tags.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  KEY TOPICS & THEMES
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {episode.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        background: 'rgba(155, 28, 28, 0.08)',
                        color: 'var(--color-brand, #9b1c1c)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Collapsible Transcript */}
          {episode.transcript && (
            <section
              style={{
                background: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '16px',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📜</span>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                    Episode Transcript
                  </h3>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isTranscriptExpanded ? 'Collapse ▲' : 'Expand Transcript ▼'}
                </button>
              </div>

              {isTranscriptExpanded && (
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: 'var(--color-text)',
                    whiteSpace: 'pre-line',
                    background: 'var(--color-bg, #f8fafc)',
                    padding: '16px',
                    borderRadius: '8px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {episode.transcript}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right: Guest & Host Profile Card */}
        <div style={{ flex: '1', minWidth: '260px' }}>
          <div
            style={{
              background: 'var(--color-surface, #ffffff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '90px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-brand)', letterSpacing: '0.8px', marginBottom: '14px' }}>
              Featured Speaker
            </div>

            {episode.coverImageUrl && (
              <img
                src={episode.coverImageUrl}
                alt={episode.guestName || episode.title}
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
            )}

            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700 }}>
              {episode.guestName || 'Special Cultural Guest'}
            </h3>

            <div style={{ fontSize: '13px', color: 'var(--color-brand, #9b1c1c)', fontWeight: 600, marginBottom: '12px' }}>
              Host: {episode.hostName || 'Department of Tourism'}
            </div>

            {episode.guestBio && (
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-text-muted)', margin: '0 0 16px 0' }}>
                {episode.guestBio}
              </p>
            )}

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <Link
                to={ROUTES.PUBLIC_PODCASTS}
                className="btn btn--secondary"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}
              >
                ← Browse All Episodes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
