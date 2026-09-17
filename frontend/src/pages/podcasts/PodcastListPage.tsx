import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PodcastEpisode, PodcastStats } from '@/types/podcast';
import { adminPodcastService } from '@/services/podcastService';
import { ROUTES } from '@/constants/routes';

export function PodcastListPage() {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [stats, setStats] = useState<PodcastStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: { search?: string; isPublished?: boolean } = {};
      if (search.trim()) query.search = search.trim();
      if (statusFilter === 'published') query.isPublished = true;
      if (statusFilter === 'draft') query.isPublished = false;

      const [listRes, statsRes] = await Promise.allSettled([
        adminPodcastService.list(query),
        adminPodcastService.stats(),
      ]);

      if (listRes.status === 'fulfilled') {
        setEpisodes(listRes.value.items || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err) {
      console.error('Failed to load admin podcast list:', err);
      setError('Unable to load podcast episodes.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (episode: PodcastEpisode) => {
    try {
      const updated = await adminPodcastService.toggleStatus(episode.id, !episode.isPublished);
      setEpisodes((prev) =>
        prev.map((ep) => (ep.id === episode.id ? { ...ep, isPublished: updated.isPublished } : ep)),
      );
    } catch (err) {
      console.error('Failed to toggle podcast status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete episode "${title}"?`)) {
      return;
    }
    try {
      await adminPodcastService.remove(id);
      setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
    } catch (err) {
      console.error('Failed to remove episode:', err);
      alert('Failed to delete episode.');
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}m ${remainderSecs}s`;
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800 }}>
            🎙️ Podcast Management
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Manage & publish episodes for &ldquo;Bishwo Jure Bangalir Aabeg&rdquo; cultural podcast.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to={ROUTES.PUBLIC_PODCASTS}
            target="_blank"
            className="btn btn--secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>↗</span> View Public Hub
          </Link>
          <Link
            to={ROUTES.PODCAST_NEW}
            className="btn btn--primary"
            style={{
              background: 'var(--color-brand, #9b1c1c)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>+</span> Create Episode
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>TOTAL EPISODES</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px' }}>{stats.totalEpisodes}</div>
          </div>

          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>PUBLISHED</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#16a34a' }}>
              {stats.publishedEpisodes}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>TOTAL PLAYS</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#b91c1c' }}>
              {stats.totalPlays.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 600 }}>AUDIENCE REACTIONS</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#8b5cf6' }}>
              {stats.totalReactions.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}>SUBSCRIBERS</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#d97706' }}>
              {stats.totalSubscribers.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'published', 'draft'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: statusFilter === filter ? 'var(--color-brand, #9b1c1c)' : 'var(--color-bg)',
                color: statusFilter === filter ? '#fff' : 'var(--color-text)',
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadData();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            placeholder="Search episode title or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
              minWidth: '220px',
            }}
          />
          <button type="submit" className="btn btn--secondary btn--sm">
            Filter
          </button>
        </form>
      </div>

      {/* Episodes Table */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--color-text-muted)' }}>
            Loading podcast episodes...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#b91c1c' }}>{error}</div>
        ) : episodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--color-text-muted)' }}>
            No episodes found matching your filter.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>EPISODE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>SEASON / EP</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>DURATION</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>PLAYS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>REACTIONS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((ep) => (
                <tr
                  key={ep.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Episode Title & Thumbnail */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {ep.coverImageUrl && (
                        <img
                          src={ep.coverImageUrl}
                          alt={ep.title}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{ep.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {ep.guestName ? `Guest: ${ep.guestName}` : `Host: ${ep.hostName}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Season / Episode */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 600 }}>S{ep.seasonNumber} : E{ep.episodeNumber}</span>
                  </td>

                  {/* Duration */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                    {formatDuration(ep.audioDurationSeconds)}
                  </td>

                  {/* Plays */}
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {ep.playCount.toLocaleString()}
                  </td>

                  {/* Reactions */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      ❤️ {ep.loveCount} • 👏 {ep.clapCount} • 🎉 {ep.celebrateCount}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(ep)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        background: ep.isPublished ? '#dcfce7' : '#f1f5f9',
                        color: ep.isPublished ? '#15803d' : '#64748b',
                      }}
                      title="Click to toggle publish status"
                    >
                      {ep.isPublished ? '● Published' : '○ Draft'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link
                        to={ROUTES.PUBLIC_PODCAST_DETAIL(ep.slug)}
                        target="_blank"
                        className="btn btn--sm"
                        style={{
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          padding: '4px 8px',
                          fontSize: '12px',
                        }}
                        title="View Public Page"
                      >
                        👁️
                      </Link>

                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.PODCAST_EDIT(ep.id))}
                        className="btn btn--sm"
                        style={{
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          padding: '4px 8px',
                          fontSize: '12px',
                        }}
                        title="Edit Episode"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(ep.id, ep.title)}
                        className="btn btn--sm"
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          padding: '4px 8px',
                          fontSize: '12px',
                        }}
                        title="Delete Episode"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
