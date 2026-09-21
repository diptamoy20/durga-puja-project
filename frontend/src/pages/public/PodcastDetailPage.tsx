import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AudioPlayer } from '@/components/podcast/AudioPlayer';
import { ReactionButtons } from '@/components/podcast/ReactionButtons';
import { ROUTES } from '@/constants/routes';
import { publicPodcastService } from '@/services/podcastService';
import type { PodcastEpisode } from '@/types/podcast';

import '@/styles/public-podcasts.css';

export function PodcastDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    void loadEpisode(slug);
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
      <div className="public-podcasts-detail">
        <div className="public-podcasts__state">
          <div className="public-podcasts__state-icon" aria-hidden="true">
            🎙️
          </div>
          <div>Loading episode details...</div>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="public-podcasts-detail">
        <div className="public-podcasts__state public-podcasts__state--error">
          <h2>Episode Not Found</h2>
          <p>{error || 'The requested podcast episode could not be retrieved.'}</p>
          <Link to={ROUTES.PUBLIC_PODCASTS} className="btn btn--primary btn--md">
            ← Back to All Episodes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-podcasts-detail">
      <nav className="public-podcasts-detail__breadcrumb" aria-label="Breadcrumb">
        <Link to={ROUTES.PUBLIC_PODCASTS}>Podcasts</Link>
        <span>/</span>
        <span>Season {episode.seasonNumber}</span>
        <span>/</span>
        <span>Episode {episode.episodeNumber}</span>
      </nav>

      <header className="public-podcasts-detail__header">
        <div className="public-podcasts-detail__badges">
          <span className="public-podcasts-detail__season-badge">
            Season {episode.seasonNumber} • Episode {episode.episodeNumber}
          </span>
          {episode.language && (
            <span className="public-podcasts-detail__lang-badge">Language: {episode.language}</span>
          )}
          {episode.publishedAt && (
            <span className="public-podcasts__meta-text">
              Released{' '}
              {new Date(episode.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        <h1 className="public-podcasts-detail__title">{episode.title}</h1>
        <p className="public-podcasts-detail__summary">{episode.summary}</p>
      </header>

      <div className="public-podcasts-detail__player-wrap">
        <AudioPlayer episode={episode} autoPlay={false} />
      </div>

      <div className="public-podcasts-detail__actions-bar">
        <ReactionButtons episode={episode} size="md" />

        <div className="public-podcasts-detail__share-group">
          <button
            type="button"
            className={`public-podcasts-detail__share-btn${copiedLink ? ' is-copied' : ''}`}
            onClick={copyEpisodeLink}
          >
            {copiedLink ? 'Link Copied! ✓' : '🔗 Share Episode'}
          </button>

          {episode.spotifyUrl && (
            <a
              href={episode.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="public-podcasts-detail__syndication-link public-podcasts-detail__syndication-link--spotify"
            >
              Spotify
            </a>
          )}

          {episode.applePodcastsUrl && (
            <a
              href={episode.applePodcastsUrl}
              target="_blank"
              rel="noreferrer"
              className="public-podcasts-detail__syndication-link public-podcasts-detail__syndication-link--apple"
            >
              Apple Podcasts
            </a>
          )}
        </div>
      </div>

      <div className="public-podcasts-detail__grid">
        <div>
          <section className="public-podcasts-detail__panel">
            <h2 className="public-podcasts-detail__panel-title">📝 Episode Show Notes</h2>
            <div className="public-podcasts-detail__notes">{episode.description}</div>

            {Array.isArray(episode.tags) && episode.tags.length > 0 && (
              <div className="public-podcasts-detail__topics">
                <div className="public-podcasts-detail__topics-label">KEY TOPICS & THEMES</div>
                <div className="public-podcasts-detail__topic-list">
                  {episode.tags.map((tag) => (
                    <span key={tag} className="public-podcasts-detail__topic">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {episode.transcript && (
            <section className="public-podcasts-detail__panel">
              <div
                className="public-podcasts-detail__transcript-toggle"
                onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsTranscriptExpanded(!isTranscriptExpanded);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="public-podcasts-detail__transcript-heading">
                  <span aria-hidden="true">📜</span>
                  <h3>Episode Transcript</h3>
                </div>
                <button type="button" className="public-podcasts-detail__transcript-btn">
                  {isTranscriptExpanded ? 'Collapse ▲' : 'Expand Transcript ▼'}
                </button>
              </div>

              {isTranscriptExpanded && (
                <div className="public-podcasts-detail__transcript-body">{episode.transcript}</div>
              )}
            </section>
          )}
        </div>

        <aside className="public-podcasts-detail__sidebar">
          <div className="public-podcasts-detail__panel">
            <div className="public-podcasts-detail__speaker-label">Featured Speaker</div>

            {episode.coverImageUrl && (
              <img
                src={episode.coverImageUrl}
                alt={episode.guestName || episode.title}
                className="public-podcasts-detail__speaker-image"
              />
            )}

            <h3 className="public-podcasts-detail__speaker-name">
              {episode.guestName || 'Special Cultural Guest'}
            </h3>

            <div className="public-podcasts-detail__speaker-host">
              Host: {episode.hostName || 'Department of Tourism'}
            </div>

            {episode.guestBio && (
              <p className="public-podcasts-detail__speaker-bio">{episode.guestBio}</p>
            )}

            <div className="public-podcasts-detail__sidebar-footer">
              <Link to={ROUTES.PUBLIC_PODCASTS} className="btn btn--secondary btn--md">
                ← Browse All Episodes
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
