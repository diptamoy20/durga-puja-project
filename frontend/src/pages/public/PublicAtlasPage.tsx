import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { publicAtlasService } from '@/services/atlasService';
import type { PandalAtlas } from '@/types/atlas';

export function PublicAtlasPage() {
  const [pandals, setPandals] = useState<PandalAtlas[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPandal, setSelectedPandal] = useState<PandalAtlas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAtlasService
      .list()
      .then((items) => {
        setPandals(items);
        if (items.length > 0) setSelectedPandal(items[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = pandals.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      (p.theme && p.theme.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-600)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-100)' }}>
          Durga Puja Pandal Atlas
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Discover iconic puja pandals, themes, artisan heritage, and locations across the city and districts.
        </p>
      </div>

      <div style={{ marginBottom: 'var(--space-400)' }}>
        <input
          type="search"
          className="field__control"
          placeholder="Search by pandal name, neighborhood, or theme..."
          style={{ maxWidth: '480px', margin: '0 auto', display: 'block' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
        <Card title={`Pandals (${filtered.length})`}>
          <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: 'var(--space-400)' }}>Loading atlas data…</p>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 'var(--space-400)', color: 'var(--color-text-muted)' }}>
                No pandals matching "{search}".
              </p>
            ) : (
              filtered.map((p) => {
                const isSelected = selectedPandal?.id === p.id;
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: 'var(--space-300)',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedPandal(p)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedPandal(p);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: '0 0 var(--space-100) 0', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                        {p.name}
                      </h4>
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                        📍 {p.location.split(',')[0]}
                      </span>
                    </div>

                    {p.theme && (
                      <p style={{ margin: '0 0 var(--space-100) 0', fontSize: 'var(--font-xs)', color: 'var(--color-primary)' }}>
                        Theme: {p.theme}
                      </p>
                    )}

                    <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                      Visiting hours: {p.timing}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {selectedPandal && (
          <Card title={selectedPandal.name}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
              <div>
                <strong>Location: </strong>
                <span>{selectedPandal.location}</span>
              </div>

              {selectedPandal.theme && (
                <div>
                  <strong>Art & Concept Theme: </strong>
                  <span>{selectedPandal.theme}</span>
                </div>
              )}

              {selectedPandal.artisan && (
                <div>
                  <strong>Idol Artisan: </strong>
                  <span>{selectedPandal.artisan}</span>
                </div>
              )}

              <div>
                <strong>Visiting Timings: </strong>
                <span>{selectedPandal.timing}</span>
              </div>

              {selectedPandal.specialFeatures && (
                <div>
                  <strong>Highlights & Attractions: </strong>
                  <p style={{ marginTop: 'var(--space-100)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {selectedPandal.specialFeatures}
                  </p>
                </div>
              )}

              {selectedPandal.history && (
                <div>
                  <strong>Heritage: </strong>
                  <p style={{ marginTop: 'var(--space-100)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {selectedPandal.history}
                  </p>
                </div>
              )}

              <div style={{ marginTop: 'var(--space-400)', padding: 'var(--space-300)', background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: '0 0 var(--space-200) 0', fontSize: 'var(--font-sm)' }}>
                  Coordinates: <code>{selectedPandal.latitude}, {selectedPandal.longitude}</code>
                </p>
                <a
                  href={`https://www.google.com/maps?q=${selectedPandal.latitude},${selectedPandal.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--primary btn--sm"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Open in Google Maps / Directions ↗
                </a>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
