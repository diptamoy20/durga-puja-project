import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ title, description, actions, children, className = '', style }: CardProps) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || actions) && (
        <header className="card__header">
          <div>
            {title && <h2 className="card__title">{title}</h2>}
            {description && <p className="card__description">{description}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}

      <div className="card__body">{children}</div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
    </div>
  );
}
