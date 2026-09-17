import type { ReactNode } from 'react';

type Variant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: Variant;
  tone?: Variant | 'danger' | 'default';
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

export function Alert({ variant, tone = 'info', title, children, onDismiss, style }: AlertProps) {
  const effective = (variant ?? (tone === 'danger' ? 'error' : tone === 'default' ? 'info' : tone)) as Variant;

  return (
    <div
      className={`alert alert--${effective}`}
      style={style}
      role={effective === 'error' ? 'alert' : 'status'}
    >
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__message">{children}</div>
      </div>

      {onDismiss && (
        <button type="button" className="alert__close" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
