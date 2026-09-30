import { Link, Outlet } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

import '@/styles/public-layout.css';

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-layout__header">
        <div className="public-layout__header-inner">
          <Link to={ROUTES.DASHBOARD} className="public-layout__brand">
            <span aria-hidden="true">🌺</span>
            <span>Durga Puja Global Connect</span>
          </Link>

          <nav className="public-layout__nav" aria-label="Public site">
            <Link to={ROUTES.PUBLIC_ATLAS} className="public-layout__nav-link">
              Pandal Map
            </Link>
            <Link to={ROUTES.PUBLIC_GALLERY} className="public-layout__nav-link">
              Gallery
            </Link>
            <Link
              to={ROUTES.PUBLIC_ASSOCIATIONS}
              style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }}
            >
              Associations
            </Link>
            <Link
              to={ROUTES.PUBLIC_WEBINARS}
              style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }}
            >
              Webinars
            </Link>
            <Link to={ROUTES.PUBLIC_PODCASTS} className="public-layout__nav-link">
              Podcasts
            </Link>
            <Link to={ROUTES.PUBLIC_NEWS} className="public-layout__nav-link">
              News
            </Link>
            <Link to={ROUTES.PUBLIC_CHOOSE_TYPE} className="btn btn--primary btn--sm">
              Register Account
            </Link>
            <Link to={ROUTES.LOGIN} className="btn btn--secondary btn--sm">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="public-layout__main">
        <Outlet />
      </main>

      <footer className="public-layout__footer">
        <div className="public-layout__footer-inner">
          <div>
            <p className="public-layout__footer-title">Durga Puja Global Connect</p>
            <p className="public-layout__footer-copy">
              Connecting the global Bengali diaspora and celebrating Durga Puja worldwide.
            </p>
          </div>
          <div className="public-layout__footer-meta">
            © {new Date().getFullYear()} Government of West Bengal · Tourism Department
          </div>
        </div>
      </footer>
    </div>
  );
}
