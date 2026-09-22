import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
import { publicGalleryService } from '@/services/galleryService';
import { formatMediaType, mediaThumbnailUrl } from '@/utils/galleryHelpers';
import type { CommitteeMedia, MediaType, PublicGalleryFilterOptions } from '@/types/gallery';
import type { PaginationMeta } from '@/types';

import '@/styles/public-gallery.css';

export function PublicGalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [media, setMedia] = useState<CommitteeMedia[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [filterOptions, setFilterOptions] = useState<PublicGalleryFilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') ?? '';
  const pujaCommitteeId = searchParams.get('puja_committee_id');
  const pandal = searchParams.get('pandal') ?? '';
  const mediaType = (searchParams.get('media_type') as MediaType | '') || '';
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCommitteeId, setDraftCommitteeId] = useState(pujaCommitteeId ?? '');
  const [draftPandal, setDraftPandal] = useState(pandal);
  const [draftMediaType, setDraftMediaType] = useState<MediaType | ''>(mediaType);

  useEffect(() => {
    setDraftSearch(search);
    setDraftCommitteeId(pujaCommitteeId ?? '');
    setDraftPandal(pandal);
    setDraftMediaType(mediaType);
  }, [search, pujaCommitteeId, pandal, mediaType]);

  useEffect(() => {
    publicGalleryService.filterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const listQuery = useMemo(
    () => ({
      page,
      perPage: 12,
      search: search || undefined,
      pujaCommitteeId: pujaCommitteeId ? Number(pujaCommitteeId) : undefined,
      pandal: pandal || undefined,
      mediaType: mediaType || undefined,
    }),
    [page, search, pujaCommitteeId, pandal, mediaType],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await publicGalleryService.list(listQuery);
      setMedia(res.items);
      setPagination(res.pagination);
    } catch {
      setMedia([]);
      setPagination(undefined);
    } finally {
      setLoading(false);
    }
  }, [listQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (draftSearch.trim()) params.search = draftSearch.trim();
    if (draftCommitteeId) params.puja_committee_id = draftCommitteeId;
    if (draftPandal.trim()) params.pandal = draftPandal.trim();
    if (draftMediaType) params.media_type = draftMediaType;
    setSearchParams(params);
  };

  return (
    <div className="public-gallery">
      <div className="public-gallery__header">
        <div>
          <h1 className="public-gallery__title">Puja Gallery</h1>
          <p className="public-gallery__subtitle">
            Approved photos and videos from participating committees and pandals.
          </p>
        </div>
      </div>

      <div className="public-gallery__filter-card">
        <form className="public-gallery__filter-form" onSubmit={applyFilters}>
          <div className="public-gallery__filter-field">
            <label htmlFor="pgSearch">Search</label>
            <input
              id="pgSearch"
              type="search"
              className="field__control"
              placeholder="Title or description"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>
          <div className="public-gallery__filter-field">
            <label htmlFor="pgCommittee">Committee</label>
            <select
              id="pgCommittee"
              className="field__control"
              value={draftCommitteeId}
              onChange={(e) => setDraftCommitteeId(e.target.value)}
            >
              <option value="">All committees</option>
              {filterOptions?.committees.map((committee) => (
                <option key={committee.id} value={committee.id}>
                  {committee.committeeName}
                </option>
              ))}
            </select>
          </div>
          <div className="public-gallery__filter-field">
            <label htmlFor="pgPandal">Pandal</label>
            <input
              id="pgPandal"
              type="text"
              className="field__control"
              placeholder="Venue / pandal name"
              value={draftPandal}
              onChange={(e) => setDraftPandal(e.target.value)}
            />
          </div>
          <div className="public-gallery__filter-field public-gallery__filter-field--sm">
            <label htmlFor="pgType">Media type</label>
            <select
              id="pgType"
              className="field__control"
              value={draftMediaType}
              onChange={(e) => setDraftMediaType(e.target.value as MediaType | '')}
            >
              <option value="">All types</option>
              <option value="PHOTO">Photo</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div className="public-gallery__filter-actions">
            <button type="submit" className="btn btn--primary btn--md">
              Filter
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="public-gallery__empty">Loading gallery…</div>
      ) : media.length === 0 ? (
        <div className="public-gallery__empty">
          No approved media found for the selected filters.
        </div>
      ) : (
        <div className="public-gallery__grid">
          {media.map((item) => (
            <Link key={item.id} to={ROUTES.PUBLIC_GALLERY_DETAIL(item.id)} className="public-gallery-card">
              <div className="public-gallery-card__media">
                {item.mediaType === 'PHOTO' ? (
                  <img
                    src={mediaThumbnailUrl(item)}
                    alt={item.title || item.originalFilename}
                    className="public-gallery-card__thumb"
                  />
                ) : (
                  <div className="public-gallery-card__video-placeholder">
                    <span aria-hidden="true">▶</span>
                  </div>
                )}
              </div>
              <div className="public-gallery-card__body">
                <div className="public-gallery-card__title-row">
                  <h2 className="public-gallery-card__title">
                    {item.title || item.originalFilename}
                  </h2>
                  <span className="public-gallery-card__badge">{formatMediaType(item.mediaType)}</span>
                </div>
                <p className="public-gallery-card__meta">{item.committee?.committeeName ?? 'Committee'}</p>
                <p className="public-gallery-card__meta">{item.venueName ?? item.committee?.venueName ?? '—'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.lastPage > 1 && (
        <div className="public-gallery__pagination">
          <Pagination
            meta={pagination}
            onPageChange={(nextPage) => {
              const params = Object.fromEntries(searchParams.entries());
              params.page = String(nextPage);
              setSearchParams(params);
            }}
          />
        </div>
      )}
    </div>
  );
}
