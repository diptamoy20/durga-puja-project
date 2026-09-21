import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ROUTES } from '@/constants/routes';
import { PERMISSIONS } from '@/constants/permissions';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { adminPodcastService } from '@/services/podcastService';
import type { PodcastEpisode, PodcastStats } from '@/types/podcast';

import '@/styles/podcasts-admin.css';

type StatusFilter = 'all' | 'published' | 'draft';

function formatDuration(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainderSecs = secs % 60;
  return `${mins}m ${remainderSecs}s`;
}

export function PodcastListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { can } = useAuth();

  const canCreate = can(PERMISSIONS.CREATE_PODCASTS, PERMISSIONS.CREATE_ARTICLES);
  const canEdit = can(PERMISSIONS.EDIT_PODCASTS, PERMISSIONS.EDIT_ARTICLES);
  const canDelete = can(PERMISSIONS.DELETE_PODCASTS, PERMISSIONS.DELETE_ARTICLES);

  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [stats, setStats] = useState<PodcastStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<PodcastEpisode | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  const loadData = async (searchTerm = search) => {
    setLoading(true);
    setError(null);
    try {
      const query: { search?: string; isPublished?: boolean } = {};
      if (searchTerm.trim()) query.search = searchTerm.trim();
      if (statusFilter === 'published') query.isPublished = true;
      if (statusFilter === 'draft') query.isPublished = false;

      const [listRes, statsRes] = await Promise.allSettled([
        adminPodcastService.list(query),
        adminPodcastService.stats(),
      ]);

      if (listRes.status === 'fulfilled') {
        setEpisodes(listRes.value.items || []);
      } else {
        setEpisodes([]);
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
      toast.success(updated.isPublished ? 'Episode published.' : 'Episode moved to draft.');
    } catch (err) {
      console.error('Failed to toggle podcast status:', err);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminPodcastService.remove(deleteTarget.id);
      setEpisodes((prev) => prev.filter((ep) => ep.id !== deleteTarget.id));
      toast.success('Episode deleted.');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to remove episode:', err);
      toast.error('Failed to delete episode.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <header className="podcast-list-header">
        <nav className="breadcrumbs podcast-breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
            </li>
            <li>
              <span aria-current="page">Podcasts</span>
            </li>
          </ol>
        </nav>

        <div className="podcast-list-header__top">
          <div className="podcast-list-header__intro">
            <h1 className="podcast-list-header__title">Podcast Management</h1>
            <p className="podcast-list-header__subtitle">
              Manage and publish episodes for &ldquo;Bishwo Jure Bangalir Aabeg&rdquo; cultural podcast.
            </p>
          </div>

          <div className="podcast-list-header__actions">
            <Link to={ROUTES.PUBLIC_PODCASTS} target="_blank" className="btn btn--outline-secondary btn--md">
              <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" /> View Public Hub
            </Link>
            {canCreate && (
              <Link to={ROUTES.PODCAST_NEW} className="btn btn--primary btn--md">
                <i className="fas fa-circle-plus" aria-hidden="true" /> Create Episode
              </Link>
            )}
          </div>
        </div>

        {stats && (
          <div className="podcast-admin__stats">
            <div className="podcast-stat-card">
              <div className="podcast-stat-card__icon podcast-stat-card__icon--neutral">
                <i className="fas fa-microphone" aria-hidden="true" />
              </div>
              <div className="podcast-stat-card__content">
                <div className="podcast-stat-card__label">Total Episodes</div>
                <div className="podcast-stat-card__value">{stats.totalEpisodes}</div>
              </div>
            </div>
            <div className="podcast-stat-card">
              <div className="podcast-stat-card__icon podcast-stat-card__icon--success">
                <i className="fas fa-circle-check" aria-hidden="true" />
              </div>
              <div className="podcast-stat-card__content">
                <div className="podcast-stat-card__label">Published</div>
                <div className="podcast-stat-card__value">{stats.publishedEpisodes}</div>
              </div>
            </div>
            <div className="podcast-stat-card">
              <div className="podcast-stat-card__icon podcast-stat-card__icon--danger">
                <i className="fas fa-headphones" aria-hidden="true" />
              </div>
              <div className="podcast-stat-card__content">
                <div className="podcast-stat-card__label">Total Plays</div>
                <div className="podcast-stat-card__value">{stats.totalPlays.toLocaleString()}</div>
              </div>
            </div>
            <div className="podcast-stat-card">
              <div className="podcast-stat-card__icon podcast-stat-card__icon--purple">
                <i className="fas fa-heart" aria-hidden="true" />
              </div>
              <div className="podcast-stat-card__content">
                <div className="podcast-stat-card__label">Audience Reactions</div>
                <div className="podcast-stat-card__value">{stats.totalReactions.toLocaleString()}</div>
              </div>
            </div>
            <div className="podcast-stat-card">
              <div className="podcast-stat-card__icon podcast-stat-card__icon--warning">
                <i className="fas fa-bell" aria-hidden="true" />
              </div>
              <div className="podcast-stat-card__content">
                <div className="podcast-stat-card__label">Subscribers</div>
                <div className="podcast-stat-card__value">{stats.totalSubscribers.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="podcast-filter-card">
        <div className="podcast-filters">
          <div className="podcast-filters__status-group" role="group" aria-label="Publication status">
            {(['all', 'published', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`podcast-filters__chip${statusFilter === filter ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <form
            className="podcast-filters__search-form"
            onSubmit={(e) => {
              e.preventDefault();
              void loadData(search);
            }}
          >
            <div className="podcast-filters__search-group">
              <span className="podcast-filters__search-icon" aria-hidden="true">
                <i className="fas fa-search" />
              </span>
              <input
                type="search"
                className="podcast-filters__search-input"
                placeholder="Search episode title or guest..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn--secondary btn--md">
              Filter
            </button>
          </form>
        </div>
      </div>

      <Card className="podcast-list-card" title="Episodes">
        <div className="table-wrapper podcast-table-wrapper">
          <table className="table podcast-table">
            <thead>
              <tr>
                <th className="podcast-table__col-art">Art</th>
                <th>Episode</th>
                <th>Season / Ep</th>
                <th>Duration</th>
                <th>Plays</th>
                <th>Reactions</th>
                <th>Status</th>
                <th className="table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="table__placeholder">
                    Loading podcast episodes…
                  </td>
                </tr>
              ) : episodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table__placeholder">
                    <div className="podcast-table__empty">
                      <div className="podcast-table__empty-icon" aria-hidden="true">
                        <i className="fas fa-podcast" />
                      </div>
                      <strong>No episodes found</strong>
                      <p>No episodes match your current filters.</p>
                      {canCreate && (
                        <Link to={ROUTES.PODCAST_NEW} className="btn btn--primary btn--sm">
                          <i className="fas fa-circle-plus" aria-hidden="true" /> Create Episode
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                episodes.map((ep) => (
                  <tr key={ep.id}>
                    <td>
                      {ep.coverImageUrl ? (
                        <img src={ep.coverImageUrl} alt="" className="podcast-table__art" />
                      ) : (
                        <div className="podcast-table__art-placeholder" aria-hidden="true">
                          <i className="fas fa-microphone" />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table__primary">{ep.title}</div>
                      <div className="table__secondary">
                        {ep.guestName ? `Guest: ${ep.guestName}` : `Host: ${ep.hostName}`}
                      </div>
                    </td>
                    <td className="text-nowrap">
                      <strong>
                        S{ep.seasonNumber} · E{ep.episodeNumber}
                      </strong>
                    </td>
                    <td className="text-nowrap">{formatDuration(ep.audioDurationSeconds)}</td>
                    <td>{ep.playCount.toLocaleString()}</td>
                    <td>
                      <span className="podcast-table__reactions">
                        ❤️ {ep.loveCount} · 👏 {ep.clapCount} · 🎉 {ep.celebrateCount}
                      </span>
                    </td>
                    <td>
                      {canEdit ? (
                        <button
                          type="button"
                          className={`podcast-status-toggle ${
                            ep.isPublished ? 'podcast-status-toggle--published' : 'podcast-status-toggle--draft'
                          }`}
                          onClick={() => void handleToggleStatus(ep)}
                          title="Click to toggle publish status"
                        >
                          {ep.isPublished ? 'Published' : 'Draft'}
                        </button>
                      ) : (
                        <span className={ep.isPublished ? 'badge badge--success' : 'badge badge--default'}>
                          {ep.isPublished ? 'Published' : 'Draft'}
                        </span>
                      )}
                    </td>
                    <td className="table__actions">
                      <div className="podcast-action-group">
                        <Link
                          to={ROUTES.PUBLIC_PODCAST_DETAIL(ep.slug)}
                          target="_blank"
                          className="podcast-action-btn"
                          title="View public page"
                          aria-label={`View public page for ${ep.title}`}
                        >
                          <i className="fas fa-eye" aria-hidden="true" />
                        </Link>
                        {canEdit && (
                          <button
                            type="button"
                            className="podcast-action-btn"
                            onClick={() => navigate(ROUTES.PODCAST_EDIT(ep.id))}
                            title="Edit episode"
                            aria-label={`Edit ${ep.title}`}
                          >
                            <i className="fas fa-pencil" aria-hidden="true" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="podcast-action-btn podcast-action-btn--danger"
                            onClick={() => setDeleteTarget(ep)}
                            title="Delete episode"
                            aria-label={`Delete ${ep.title}`}
                          >
                            <i className="fas fa-trash" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Episode"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Episode"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
