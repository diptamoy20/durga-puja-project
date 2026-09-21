import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function PublicLayout() {
  const location = useLocation();

  const navLinks = [
    { label: 'Pandal Map', to: ROUTES.PUBLIC_ATLAS },
    { label: 'Gallery', to: ROUTES.PUBLIC_GALLERY },
    { label: 'Webinars', to: ROUTES.PUBLIC_WEBINARS },
    { label: 'Podcasts', to: ROUTES.PUBLIC_PODCASTS },
    { label: 'Tourism Concierge', to: ROUTES.PUBLIC_TOURISM_CONCIERGE },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--colour-canvas)' }}>
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--colour-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          {/* Brand Logo */}
          <Link
            to={ROUTES.DASHBOARD}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--colour-brand)',
              fontWeight: 800,
              fontSize: '17px',
              letterSpacing: '-0.2px',
            }}
          >
            <span style={{ fontSize: '22px' }}>🌺</span>
            <span>Durga Puja Global Connect</span>
          </Link>

          {/* Navigation Links & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {navLinks.map((link) => {
                const isActive =
                  link.to === ROUTES.PUBLIC_TOURISM_CONCIERGE
                    ? location.pathname.startsWith('/public/tourism')
                    : location.pathname.startsWith(link.to);

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    style={{
                      textDecoration: 'none',
                      color: isActive ? 'var(--colour-brand)' : 'var(--colour-ink)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      background: isActive ? 'var(--colour-brand-tint)' : 'transparent',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
              <Link
                to={ROUTES.PUBLIC_CHOOSE_TYPE}
                className="btn btn--primary btn--sm"
                style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '7px 14px', fontSize: '13px' }}
              >
                Register Account
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="btn btn--secondary btn--sm"
                style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '7px 14px', fontSize: '13px' }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      <footer
        style={{
          background: 'var(--colour-surface)',
          borderTop: '1px solid var(--colour-border)',
          padding: '32px 24px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--colour-ink)' }}>
              Durga Puja Global Connect
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'var(--colour-ink-soft)' }}>
              Connecting the global Bengali diaspora and celebrating Durga Puja worldwide.
            </p>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--colour-ink-soft)' }}>
            © {new Date().getFullYear()} Government of West Bengal · Tourism Department
          </div>
        </div>
      </footer>
    </div>
  );
}
