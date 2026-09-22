import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface GalleryBreadcrumbItem {
  label: string;
  to?: string;
}

interface GalleryModuleHeaderProps {
  breadcrumbs: GalleryBreadcrumbItem[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function GalleryModuleHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
  meta,
}: GalleryModuleHeaderProps) {
  return (
    <header className="page__header">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={`${crumb.label}-${index}`}>
                {crumb.to && !isLast ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="page__header-row">
        <div>
          {meta}
          <h1 className="page__title">{title}</h1>
          {subtitle && <p className="page__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page__header-actions">{actions}</div>}
      </div>
    </header>
  );
}
