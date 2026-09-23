import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { associationService, type PublicAssociation, type AssociationFilterOptions } from '@/services/associationService';
import type { PaginationMeta } from '@/types';

import '@/styles/public-associations.css';

export function PublicAssociationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [associations, setAssociations] = useState<PublicAssociation[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [filterOptions, setFilterOptions] = useState<AssociationFilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('search') ?? '';
  const country = searchParams.get('country') ?? '';
  const state = searchParams.get('state') ?? '';
  const city = searchParams.get('city') ?? '';
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCountry, setDraftCountry] = useState(country);
  const [draftState, setDraftState] = useState(state);
  const [draftCity, setDraftCity] = useState(city);

  useEffect(() => {
    setDraftSearch(search);
    setDraftCountry(country);
    setDraftState(state);
    setDraftCity(city);
  }, [search, country, state, city]);

  useEffect(() => {
    associationService.filterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const listQuery = useMemo(
    () => ({
      page,
      perPage: 12,
      search: search || undefined,
      country: country || undefined,
      state: state || undefined,
      city: city || undefined,
    }),
    [page, search, country, state, city],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await associationService.list(listQuery);
      setAssociations(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the association directory.');
      setAssociations([]);
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
    if (draftCountry) params.country = draftCountry;
    if (draftState) params.state = draftState;
    if (draftCity) params.city = draftCity;
    setSearchParams(params);
  };

  const resetFilters = () => setSearchParams({});

  const hasActiveFilters = Boolean(search || country || state || city);

  return (
    <div className="public-associations">
      <div className="public-associations__header">
        <div>
          <h1 className="public-associations__title">Association Directory</h1>
          <p className="public-associations__subtitle">
            Approved Bengali associations and community organizations worldwide.
          </p>
        </div>
        {!loading && !error && associations.length > 0 && (
          <span className="public-associations__count">
            {associations.length} {associations.length === 1 ? 'association' : 'associations'}
          </span>
        )}
      </div>

      <div className="public-associations__filter-card">
        <form className="public-associations__filter-form" onSubmit={applyFilters}>
          <div className="public-associations__filter-field">
            <label htmlFor="paSearch">Search</label>
            <input
              id="paSearch"
              type="search"
              className="field__control"
              placeholder="Association name, city, country…"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>
          <div className="public-associations__filter-field">
            <label htmlFor="paCountry">Country</label>
            <select
              id="paCountry"
              className="field__control"
              value={draftCountry}
              onChange={(e) => setDraftCountry(e.target.value)}
            >
              <option value="">All countries</option>
              {filterOptions?.countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="public-associations__filter-field">
            <label htmlFor="paState">State / Region</label>
            <select
              id="paState"
              className="field__control"
              value={draftState}
              onChange={(e) => setDraftState(e.target.value)}
            >
              <option value="">All states</option>
              {filterOptions?.states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="public-associations__filter-field">
            <label htmlFor="paCity">City</label>
            <select
              id="paCity"
              className="field__control"
              value={draftCity}
              onChange={(e) => setDraftCity(e.target.value)}
            >
              <option value="">All cities</option>
              {filterOptions?.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="public-associations__filter-actions">
            <button type="submit" className="btn btn--primary btn--md">
              Filter
            </button>
            {hasActiveFilters && (
              <button type="button" className="btn btn--secondary btn--md" onClick={resetFilters}>
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="public-associations__state">
          <Spinner size="lg" label="Loading associations" />
          <p className="public-associations__state-text">Loading associations…</p>
        </div>
      ) : error ? (
        <div className="public-associations__state">
          <div className="public-associations__state-icon" aria-hidden="true">⚠️</div>
          <h2 className="public-associations__state-title">Could not load the directory</h2>
          <p className="public-associations__state-text">{error}</p>
          <div className="public-associations__state-actions">
            <button type="button" className="btn btn--primary btn--md" onClick={() => void load()}>
              Try again
            </button>
          </div>
        </div>
      ) : associations.length === 0 ? (
        <div className="public-associations__state">
          <div className="public-associations__state-icon" aria-hidden="true">🏢</div>
          <h2 className="public-associations__state-title">No associations found</h2>
          <p className="public-associations__state-text">
            {hasActiveFilters
              ? 'No approved associations match the selected filters. Try adjusting your search.'
              : 'No approved associations have been published yet. Please check back soon.'}
          </p>
          {hasActiveFilters && (
            <div className="public-associations__state-actions">
              <button type="button" className="btn btn--secondary btn--md" onClick={resetFilters}>
                Clear all filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="public-associations__grid">
            {associations.map((assoc) => (
              <Link key={assoc.id} to={ROUTES.PUBLIC_ASSOCIATION_DETAIL(assoc.id)} className="public-association-card">
                  <div className="public-association-card__media">
                    {assoc.logoImage ? (
                      <img
                        src={associationService.fileUrl(assoc.logoImage)}
                        alt={`${assoc.name} logo`}
                        className="public-association-card__thumb"
                      />
                    ) : (
                      <div className="public-association-card__placeholder" aria-hidden="true">🏢</div>
                    )}
                  </div>
                  <div className="public-association-card__body">
                    <div className="public-association-card__title-row">
                      <h2 className="public-association-card__title">{assoc.name}</h2>
                      {assoc.verification.verified ? (
                        <span className="public-association-card__badge">
                          <span aria-hidden="true">✓</span> Verified
                        </span>
                      ) : (
                        <span className="public-association-card__badge public-association-card__badge--pending">Pending</span>
                      )}
                    </div>
                    <p className="public-association-card__location">
                      <span aria-hidden="true">📍</span>
                      {[assoc.city, assoc.state, assoc.country].filter(Boolean).join(', ')}
                    </p>
                    {assoc.description && (
                      <p className="public-association-card__desc">
                        {assoc.description.length > 200 ? `${assoc.description.substring(0, 200)}…` : assoc.description}
                      </p>
                    )}
                    <div className="public-association-card__footer">
                      <span>
                        {assoc.establishedYear ? <strong>Est. {assoc.establishedYear}</strong> : 'Community association'}
                      </span>
                      <span className="public-association-card__cta">View details →</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          {pagination && pagination.lastPage > 1 && (
            <Pagination
              meta={pagination}
              onPageChange={(nextPage) => {
                const params = Object.fromEntries(searchParams.entries());
                params.page = String(nextPage);
                setSearchParams(params);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}