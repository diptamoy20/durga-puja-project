import type { ReactNode } from 'react';

export interface Tile {
  label: string;
  /** `null` while the figure is still loading. */
  value: number | null;
}

interface TileGridProps {
  title: string;
  tiles: Tile[];
  action?: ReactNode;
}

const numberFormat = new Intl.NumberFormat('en-IN');

/** A titled card holding a row of small labelled counts. */
export function TileGrid({ title, tiles, action }: TileGridProps) {
  return (
    <section className="dashboard-card tile-card">
      <div className="tile-card__head">
        <h2 className="tile-card__title">{title}</h2>
        {action}
      </div>

      <div className="tile-grid">
        {tiles.map((tile) => (
          <div className="tile" key={tile.label}>
            <p className="tile__label">{tile.label}</p>
            <p className="tile__value">
              {tile.value === null ? '—' : numberFormat.format(tile.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
