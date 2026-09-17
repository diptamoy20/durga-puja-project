import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

export function ForbiddenPage() {
  return (
    <div className="error-page">
      <p className="error-page__code">403</p>
      <h1 className="error-page__title">You do not have access to that page</h1>
      <p className="error-page__description">
        Your account does not hold the permission this page requires. If you believe this is wrong,
        ask an administrator to review your roles.
      </p>

      <Link to={ROUTES.DASHBOARD} className="btn btn--primary btn--md">
        <span>Back to dashboard</span>
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="error-page">
      <p className="error-page__code">404</p>
      <h1 className="error-page__title">Page not found</h1>
      <p className="error-page__description">
        The page you asked for does not exist, or it may have moved.
      </p>

      <Link to={ROUTES.DASHBOARD} className="btn btn--primary btn--md">
        <span>Back to dashboard</span>
      </Link>
    </div>
  );
}
