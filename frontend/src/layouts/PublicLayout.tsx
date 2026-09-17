import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'var(--space-300) var(--space-400)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to={ROUTES.DASHBOARD}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-200)',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: 'var(--font-lg)',
            }}
          >
            <span>🌺</span>
            <span>Durga Puja Global Connect</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-400)', flexWrap: 'wrap' }}>
            <Link
              to={ROUTES.PUBLIC_ATLAS}
              style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }}
            >
              Pandal Map
            </Link>
            <Link
              to={ROUTES.PUBLIC_GALLERY}
              style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }}
            >
              Gallery
            </Link>
            <Link
              to={ROUTES.PUBLIC_WEBINARS}
              style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }}
            >
              Webinars
            </Link>
            <Link
              to={ROUTES.PUBLIC_PODCASTS}
              style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }}
            >
              Podcasts
            </Link>
            <Link
              to={ROUTES.PUBLIC_CHOOSE_TYPE}
              className="btn btn--primary btn--sm"
              style={{ textDecoration: 'none' }}
            >
              Register Account
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="btn btn--secondary btn--sm"
              style={{ textDecoration: 'none' }}
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, padding: 'var(--space-600) var(--space-400)', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      <footer
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-600) var(--space-400)',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-300)',
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Durga Puja Global Connect</p>
            <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
              Connecting the global Bengali diaspora and celebrating Durga Puja worldwide.
            </p>
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} Government of West Bengal · Tourism Department
          </div>
        </div>
      </footer>
    </div>
  );
}
