import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { PodcastEpisode, PodcastFilterQuery } from '@/types/podcast';
import { publicPodcastService } from '@/services/podcastService';
import { AudioPlayer } from '@/components/podcast/AudioPlayer';
import { ReactionButtons } from '@/components/podcast/ReactionButtons';
import { SubscribeModal } from '@/components/podcast/SubscribeModal';
import { ROUTES } from '@/constants/routes';

export function PublicPodcastsPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [featured, setFeatured] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Player state
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  // Available tags extracted from loaded episodes
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadPodcasts();
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

        // Gather unique tags
        const tagsSet = new Set<string>();
        items.forEach((ep) => {
          if (Array.isArray(ep.tags)) {
            ep.tags.forEach((t) => tagsSet.add(t));
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
    loadPodcasts();
  };

  const playEpisode = (ep: PodcastEpisode) => {
    setActiveEpisode(ep);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
  };

  return (
    <div style={{ paddingBottom: activeEpisode ? '120px' : '40px' }}>
      {/* Hero Banner */}
      <section
        style={{
          background: 'radial-gradient(ellipse at center, #781010 0%, #450a0a 70%, #1c0505 100%)',
          borderRadius: '20px',
          padding: '48px 36px',
          color: '#ffffff',
          marginBottom: '36px',
          boxShadow: '0 10px 30px rgba(120, 16, 16, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            fontSize: '180px',
            opacity: 0.07,
            userSelect: 'none',
          }}
        >
          🎙️
        </div>

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fcd34d',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
            }}
          >
            <span>🌺</span> Dept. of Tourism, Govt. of West Bengal Presents
          </div>

          <h1
            style={{
              fontSize: '38px',
              fontWeight: 800,
              lineHeight: 1.2,
              margin: '0 0 14px 0',
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              background: 'linear-gradient(135deg, #ffffff 40%, #fed7aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bishwo Jure Bangalir Aabeg
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#fed7aa',
              margin: '0 0 24px 0',
              maxWidth: '680px',
            }}
          >
            The official audio chronicle of Bengal&apos;s UNESCO Intangible Cultural Heritage. Experience the dhak rhythms,
            kumartuli clay artisans, diaspora homecomings, Bonedi Bari heritage banquets, and timeless Durga Puja stories.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsSubscribeModalOpen(true)}
              style={{
                background: '#f59e0b',
                color: '#451a03',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              }}
            >
              <span>🔔</span> Subscribe for Alerts
            </button>

            <a
              href="http://localhost:5050/api/v1/podcasts/rss"
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📡</span> RSS Feed
            </a>

            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#1db954',
                  background: 'rgba(29, 185, 84, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Spotify
              </a>
              <a
                href="https://podcasts.apple.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#f8fafc',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Apple Podcasts
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Episode Spotlight */}
      {featured && (
        <section
          style={{
            background: 'var(--color-surface, #ffffff)',
            border: '2px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '36px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {featured.coverImageUrl && (
            <div style={{ position: 'relative', flex: '0 0 160px', width: '160px', height: '160px' }}>
              <img
                src={featured.coverImageUrl}
                alt={featured.title}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              />
              <button
                type="button"
                onClick={() => playEpisode(featured)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  margin: 'auto',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(155, 28, 28, 0.9)',
                  border: '2px solid #fff',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                title="Play Episode"
              >
                ▶
              </button>
            </div>
          )}

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                }}
              >
                ⭐ Featured Episode
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Season {featured.seasonNumber} • Episode {featured.episodeNumber} • {formatDuration(featured.audioDurationSeconds)}
              </span>
            </div>

            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 700 }}>
              <Link
                to={ROUTES.PUBLIC_PODCAST_DETAIL(featured.slug)}
                style={{ textDecoration: 'none', color: 'var(--color-text, #1e293b)' }}
              >
                {featured.title}
              </Link>
            </h2>

            <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              {featured.summary}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => playEpisode(featured)}
                className="btn btn--primary btn--sm"
                style={{
                  background: 'var(--color-brand, #9b1c1c)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>▶</span> Listen Now ({formatDuration(featured.audioDurationSeconds)})
              </button>

              <Link
                to={ROUTES.PUBLIC_PODCAST_DETAIL(featured.slug)}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-brand, #9b1c1c)',
                  textDecoration: 'none',
                }}
              >
                Show Notes & Transcript →
              </Link>

              <div style={{ marginLeft: 'auto' }}>
                <ReactionButtons episode={featured} size="sm" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter & Search Bar */}
      <div
        style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Season & Language tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedSeason(undefined)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: selectedSeason === undefined ? 'var(--color-brand, #9b1c1c)' : 'var(--color-bg, #f1f5f9)',
              color: selectedSeason === undefined ? '#ffffff' : 'var(--color-text, #475569)',
            }}
          >
            All Seasons
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeason(1)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: selectedSeason === 1 ? 'var(--color-brand, #9b1c1c)' : 'var(--color-bg, #f1f5f9)',
              color: selectedSeason === 1 ? '#ffffff' : 'var(--color-text, #475569)',
            }}
          >
            Season 1: Homecoming
          </button>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '13px',
              background: 'var(--color-surface, #ffffff)',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            <option value="all">🌐 All Languages</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search episodes, guests, topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #cbd5e1)',
              fontSize: '13px',
              flex: 1,
            }}
          />
          <button
            type="submit"
            className="btn btn--secondary btn--sm"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Tag cloud pills */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Topics:</span>
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            style={{
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              background: selectedTag === 'all' ? '#1e293b' : 'transparent',
              color: selectedTag === 'all' ? '#ffffff' : 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            All Topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
              style={{
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid var(--color-border)',
                background: selectedTag === tag ? '#9b1c1c' : 'transparent',
                color: selectedTag === tag ? '#ffffff' : 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Episodes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎙️</div>
          <div>Loading episodes...</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#b91c1c' }}>{error}</div>
      ) : episodes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--color-surface)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎧</div>
          <h3 style={{ margin: '0 0 6px 0' }}>No Episodes Found</h3>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Try adjusting your search criteria or topic filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {episodes.map((ep) => (
            <div
              key={ep.id}
              style={{
                background: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                  <img
                    src={ep.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                    alt={ep.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => playEpisode(ep)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      margin: 'auto',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(155, 28, 28, 0.92)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                    title="Play Episode"
                  >
                    ▶
                  </button>
                </div>

                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-brand, #9b1c1c)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      marginBottom: '2px',
                    }}
                  >
                    S{ep.seasonNumber} • EP{ep.episodeNumber} {ep.language ? `• ${ep.language.toUpperCase()}` : ''}
                  </div>
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    <Link
                      to={ROUTES.PUBLIC_PODCAST_DETAIL(ep.slug)}
                      style={{ textDecoration: 'none', color: 'var(--color-text, #1e293b)' }}
                    >
                      {ep.title}
                    </Link>
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {ep.guestName ? `${ep.guestName}` : ep.hostName}
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted, #64748b)',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {ep.summary}
              </p>

              {/* Tags */}
              {Array.isArray(ep.tags) && ep.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {ep.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '10px',
                        background: 'var(--color-bg, #f1f5f9)',
                        color: 'var(--color-text-muted)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Episode Footer Controls */}
              <div
                style={{
                  borderTop: '1px solid var(--color-border, #e2e8f0)',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() => playEpisode(ep)}
                  className="btn btn--sm"
                  style={{
                    background: 'var(--color-bg, #f1f5f9)',
                    color: 'var(--color-text, #1e293b)',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>▶</span> {formatDuration(ep.audioDurationSeconds)}
                </button>

                <ReactionButtons episode={ep} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Docked Audio Player */}
      {activeEpisode && (
        <AudioPlayer
          episode={activeEpisode}
          autoPlay={true}
          isDocked={true}
          onClose={() => setActiveEpisode(null)}
        />
      )}

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />
    </div>
  );
}
