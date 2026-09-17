import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`}>
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="page-header__row">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {description && <p className="page-header__description">{description}</p>}
        </div>

        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
}
