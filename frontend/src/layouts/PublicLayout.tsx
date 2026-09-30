import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

import '@/styles/public-layout.css';

const NAV_LINKS = [
  { label: 'Pandal Map', to: ROUTES.PUBLIC_ATLAS },
  { label: 'Gallery', to: ROUTES.PUBLIC_GALLERY },
  { label: 'Associations', to: ROUTES.PUBLIC_ASSOCIATIONS },
  { label: 'Webinars', to: ROUTES.PUBLIC_WEBINARS },
  { label: 'Podcasts', to: ROUTES.PUBLIC_PODCASTS },
  { label: 'News', to: ROUTES.PUBLIC_NEWS },
  { label: 'Tourism Concierge', to: ROUTES.PUBLIC_TOURISM_CONCIERGE },
  { label: 'Investor Showcase', to: ROUTES.PUBLIC_INVESTOR_SHOWCASE },
  { label: "People's Choice Voting", to: ROUTES.PUBLIC_SHARAD_SAMMAN_VOTE },
];

export function PublicLayout() {
  const location = useLocation();

  return (
    <div className="public-layout">
      <header className="public-layout__header">
        <div className="public-layout__header-inner">
          <Link to={ROUTES.DASHBOARD} className="public-layout__brand">
            <span aria-hidden="true">🌺</span>
            <span>Durga Puja Global Connect</span>
          </Link>

          <nav className="public-layout__nav" aria-label="Public site">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.to === ROUTES.PUBLIC_TOURISM_CONCIERGE
                  ? location.pathname.startsWith('/public/tourism')
                  : link.to === ROUTES.PUBLIC_INVESTOR_SHOWCASE
                  ? location.pathname.startsWith('/public/investments')
                  : link.to === ROUTES.PUBLIC_ASSOCIATIONS
                  ? location.pathname.startsWith('/public/associations')
                  : location.pathname.startsWith(link.to);

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive: routerActive }) =>
                    `public-layout__nav-link ${isActive || routerActive ? 'active' : ''}`
                  }
                  style={({ isActive: routerActive }) => ({
                    color: isActive || routerActive ? 'var(--colour-brand)' : undefined,
                    fontWeight: isActive || routerActive ? 700 : undefined,
                  })}
                >
                  {link.label}
                </NavLink>
              );
            })}
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

export default PublicLayout;
