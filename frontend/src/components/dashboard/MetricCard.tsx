export type MetricTone = 'info' | 'warning' | 'primary' | 'danger' | 'success' | 'neutral';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface MetricCardProps {
  label: string;
  /** `null` while the figure is still loading. */
  value: number | null;
  /** Font Awesome class, e.g. `fa-globe`. */
  icon: string;
  tone: MetricTone;
  badge?: { text: string; tone: BadgeTone };
}

const numberFormat = new Intl.NumberFormat('en-IN');

export function MetricCard({ label, value, icon, tone, badge }: MetricCardProps) {
  return (
    <div className="dashboard-card metric-card">
      <div className="metric-card__body">
        <div className="metric-top">
          <div className={`metric-icon metric-icon--${tone}`}>
            <i className={`fas ${icon}`} aria-hidden="true" />
          </div>

          {badge && <span className={`metric-badge metric-badge--${badge.tone}`}>{badge.text}</span>}
        </div>

        <p className="metric-label">{label}</p>
        <p className="metric-value">{value === null ? '—' : numberFormat.format(value)}</p>
      </div>
    </div>
  );
}
