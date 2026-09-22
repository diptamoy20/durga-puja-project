import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import '@/styles/public-webinars.css';

interface PublicWebinarLayoutProps {
  children: React.ReactNode;
  brandLabel?: string;
  brandTo?: string;
}

export function PublicWebinarLayout({
  children,
  brandLabel = 'Durga Puja GS • Webinars',
  brandTo = ROUTES.PUBLIC_WEBINARS,
}: PublicWebinarLayoutProps) {
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === ROUTES.PUBLIC_WEBINARS
      ? pathname === ROUTES.PUBLIC_WEBINARS
      : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <div className="public-webinars">
      <nav className="public-webinars__nav">
        <div className="public-webinars__nav-inner">
          <Link to={brandTo} className="public-webinars__brand">
            <i className="fas fa-display" aria-hidden="true" />
            {brandLabel}
          </Link>
          <div className="public-webinars__nav-links">
            <Link
              to={ROUTES.PUBLIC_WEBINARS}
              className={`public-webinars__nav-link${isActive(ROUTES.PUBLIC_WEBINARS) ? ' is-active' : ''}`}
            >
              Schedule
            </Link>
            <Link
              to={ROUTES.PUBLIC_WEBINAR_REPLAYS}
              className={`public-webinars__nav-link${isActive(ROUTES.PUBLIC_WEBINAR_REPLAYS) ? ' is-active' : ''}`}
            >
              Replay Library
            </Link>
            <Link to={ROUTES.PUBLIC_GALLERY} className="public-webinars__nav-link">
              Gallery
            </Link>
            <Link to={ROUTES.PUBLIC_ATLAS} className="public-webinars__nav-link">
              Pandal Atlas
            </Link>
            <Link to={ROUTES.LOGIN} className="public-webinars__btn public-webinars__btn--light">
              Login
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
