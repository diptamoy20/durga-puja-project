import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

interface Crumb {
  label: string;
  to?: string;
}

interface WebinarBreadcrumbProps {
  items: Crumb[];
}

export function WebinarBreadcrumb({ items }: WebinarBreadcrumbProps) {
  return (
    <nav className="breadcrumbs webinar-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
