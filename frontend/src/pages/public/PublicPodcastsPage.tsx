import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { AudioPlayer } from '@/components/podcast/AudioPlayer';
import { ReactionButtons } from '@/components/podcast/ReactionButtons';
import { SubscribeModal } from '@/components/podcast/SubscribeModal';
import { ROUTES } from '@/constants/routes';
import { publicPodcastService } from '@/services/podcastService';
import type { PodcastEpisode, PodcastFilterQuery } from '@/types/podcast';

import '@/styles/public-podcasts.css';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80';

function formatDuration(secs: number): string {
  const mins = Math.floor(secs / 60);
  return `${mins} min`;
}

export function PublicPodcastsPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [featured, setFeatured] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    void loadPodcasts();
  }, [selectedSeason, selectedLanguage, selectedTag]);

  const loadPodcasts = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: PodcastFilterQuery = {};
      if (selectedSeason !== undefined) query.season = selectedSeason;
      if (selectedLanguage !== 'all') query.language = selectedLanguage;
      if (selectedTag !== 'all') query.tag = selectedTag;
      if (search.trim()) query.search = search.trim();

      const [listRes, featRes] = await Promise.allSettled([
        publicPodcastService.list(query),
        publicPodcastService.getFeatured(),
      ]);

      if (listRes.status === 'fulfilled') {
        const items = listRes.value.items || [];
        setEpisodes(items);

        const tagsSet = new Set<string>();
        items.forEach((ep) => {
          if (Array.isArray(ep.tags)) {
            ep.tags.forEach((tag) => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet));
      }

      if (featRes.status === 'fulfilled' && featRes.value) {
        setFeatured(featRes.value);
      }
    } catch (err) {
      console.error('Failed to load podcasts:', err);
      setError('Unable to load podcasts at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loadPodcasts();
  };

  const playEpisode = (ep: PodcastEpisode) => {
    setActiveEpisode(ep);
  };

  return (
    <div className={`public-podcasts${activeEpisode ? ' public-podcasts--with-player' : ''}`}>
      <section className="public-podcasts__hero">
        <div className="public-podcasts__hero-watermark" aria-hidden="true">
          🎙️
        </div>
        <div className="public-podcasts__hero-inner">
          <div className="public-podcasts__eyebrow">
            <span aria-hidden="true">🌺</span> Dept. of Tourism, Govt. of West Bengal Presents
          </div>
          <h1 className="public-podcasts__title">Bishwo Jure Bangalir Aabeg</h1>
          <p className="public-podcasts__lead">
            The official audio chronicle of Bengal&apos;s UNESCO Intangible Cultural Heritage. Experience the dhak
            rhythms, kumartuli clay artisans, diaspora homecomings, Bonedi Bari heritage banquets, and timeless Durga
            Puja stories.
          </p>
          <div className="public-podcasts__hero-actions">
            <button
              type="button"
              className="public-podcasts__btn public-podcasts__btn--gold"
              onClick={() => setIsSubscribeModalOpen(true)}
            >
              <span aria-hidden="true">🔔</span> Subscribe for Alerts
            </button>
            <a
              href={publicPodcastService.getRssUrl()}
              target="_blank"
              rel="noreferrer"
              className="public-podcasts__btn public-podcasts__btn--ghost"
            >
              <span aria-hidden="true">📡</span> RSS Feed
            </a>
            <div className="public-podcasts__platforms">
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noreferrer"
                className="public-podcasts__platform-link public-podcasts__platform-link--spotify"
              >
                Spotify
              </a>
              <a
                href="https://podcasts.apple.com"
                target="_blank"
                rel="noreferrer"
                className="public-podcasts__platform-link public-podcasts__platform-link--apple"
              >
                Apple Podcasts
              </a>
            </div>
          </div>
        </div>
      </section>

      {featured && (
        <section className="public-podcasts__featured">
          {featured.coverImageUrl && (
            <div className="public-podcasts__featured-art">
              <img src={featured.coverImageUrl} alt={featured.title} />
              <button
                type="button"
                className="public-podcasts__play-overlay"
                onClick={() => playEpisode(featured)}
                title="Play Episode"
                aria-label={`Play ${featured.title}`}
              >
                ▶
              </button>
            </div>
          )}

          <div className="public-podcasts__featured-body">
            <div className="public-podcasts__featured-meta">
              <span className="public-podcasts__badge public-podcasts__badge--featured">⭐ Featured Episode</span>
              <span className="public-podcasts__meta-text">
                Season {featured.seasonNumber} • Episode {featured.episodeNumber} •{' '}
                {formatDuration(featured.audioDurationSeconds)}
              </span>
            </div>

            <h2 className="public-podcasts__featured-title">
              <Link to={ROUTES.PUBLIC_PODCAST_DETAIL(featured.slug)}>{featured.title}</Link>
            </h2>

            <p className="public-podcasts__summary">{featured.summary}</p>

            <div className="public-podcasts__featured-actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => playEpisode(featured)}>
                <span aria-hidden="true">▶</span> Listen Now ({formatDuration(featured.audioDurationSeconds)})
              </button>
              <Link to={ROUTES.PUBLIC_PODCAST_DETAIL(featured.slug)} className="public-podcasts__text-link">
                Show Notes & Transcript →
              </Link>
              <ReactionButtons episode={featured} size="sm" />
            </div>
          </div>
        </section>
      )}

      <div className="public-podcasts__toolbar">
        <div className="public-podcasts__toolbar-group">
          <button
            type="button"
            className={`public-podcasts__chip${selectedSeason === undefined ? ' is-active' : ''}`}
            onClick={() => setSelectedSeason(undefined)}
          >
            All Seasons
          </button>
          <button
            type="button"
            className={`public-podcasts__chip${selectedSeason === 1 ? ' is-active' : ''}`}
            onClick={() => setSelectedSeason(1)}
          >
            Season 1: Homecoming
          </button>
          <select
            className="public-podcasts__select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Filter by language"
          >
            <option value="all">🌐 All Languages</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        <form className="public-podcasts__search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="public-podcasts__search-input"
            placeholder="Search episodes, guests, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn--secondary btn--sm">
            Search
          </button>
        </form>
      </div>

      {allTags.length > 0 && (
        <div className="public-podcasts__tags">
          <span className="public-podcasts__tags-label">Topics:</span>
          <button
            type="button"
            className={`public-podcasts__tag public-podcasts__tag--all${selectedTag === 'all' ? ' is-active' : ''}`}
            onClick={() => setSelectedTag('all')}
          >
            All Topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`public-podcasts__tag${selectedTag === tag ? ' is-active' : ''}`}
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="public-podcasts__state">
          <div className="public-podcasts__state-icon" aria-hidden="true">
            🎙️
          </div>
          <div>Loading episodes...</div>
        </div>
      ) : error ? (
        <div className="public-podcasts__state public-podcasts__state--error">{error}</div>
      ) : episodes.length === 0 ? (
        <div className="public-podcasts__empty-card">
          <div className="public-podcasts__state-icon" aria-hidden="true">
            🎧
          </div>
          <h3>No Episodes Found</h3>
          <p>Try adjusting your search criteria or topic filters.</p>
        </div>
      ) : (
        <div className="public-podcasts__grid">
          {episodes.map((ep) => (
            <article key={ep.id} className="public-podcasts__card">
              <div className="public-podcasts__card-head">
                <div className="public-podcasts__card-art">
                  <img src={ep.coverImageUrl || FALLBACK_COVER} alt={ep.title} />
                  <button
                    type="button"
                    className="public-podcasts__play-overlay"
                    onClick={() => playEpisode(ep)}
                    title="Play Episode"
                    aria-label={`Play ${ep.title}`}
                  >
                    ▶
                  </button>
                </div>

                <div className="public-podcasts__card-intro">
                  <div className="public-podcasts__episode-label">
                    S{ep.seasonNumber} • EP{ep.episodeNumber}
                    {ep.language ? ` • ${ep.language.toUpperCase()}` : ''}
                  </div>
                  <h3 className="public-podcasts__card-title">
                    <Link to={ROUTES.PUBLIC_PODCAST_DETAIL(ep.slug)}>{ep.title}</Link>
                  </h3>
                  <div className="public-podcasts__card-guest">{ep.guestName || ep.hostName}</div>
                </div>
              </div>

              <p className="public-podcasts__card-summary">{ep.summary}</p>

              {Array.isArray(ep.tags) && ep.tags.length > 0 && (
                <div className="public-podcasts__card-tags">
                  {ep.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="public-podcasts__card-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="public-podcasts__card-footer">
                <button type="button" className="public-podcasts__listen-btn" onClick={() => playEpisode(ep)}>
                  <span aria-hidden="true">▶</span> {formatDuration(ep.audioDurationSeconds)}
                </button>
                <ReactionButtons episode={ep} size="sm" />
              </div>
            </article>
          ))}
        </div>
      )}

      {activeEpisode && (
        <AudioPlayer
          episode={activeEpisode}
          autoPlay
          isDocked
          onClose={() => setActiveEpisode(null)}
        />
      )}

      <SubscribeModal isOpen={isSubscribeModalOpen} onClose={() => setIsSubscribeModalOpen(false)} />
    </div>
  );
}
