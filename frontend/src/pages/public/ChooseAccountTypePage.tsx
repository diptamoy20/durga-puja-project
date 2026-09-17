import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';

export function ChooseAccountTypePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-600) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-800)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-200)' }}>
          Create Your Account
        </h1>
        <p style={{ fontSize: 'var(--font-md)', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Choose the registration option that best describes you or your organisation to join the global festival network.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-600)' }}>
        <Card className="account-type-card" style={{ padding: 'var(--space-500)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-300)', color: 'var(--color-primary)' }}>
            🌐
          </div>
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-200)' }}>
            Diaspora Registration
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-400)' }}>
            For individuals, families, and overseas Bengalis who want to stay connected with the homeland, cultural updates, and festival activities.
          </p>
          <ul style={{ paddingLeft: 'var(--space-400)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.8, marginBottom: 'var(--space-600)', flex: 1 }}>
            <li>Official global diaspora recognition and directory</li>
            <li>Direct updates on live streams and festive events</li>
            <li>Volunteer and cultural contribution opportunities</li>
            <li>Connect with local puja committees across cities</li>
          </ul>
          <Link
            to={ROUTES.PUBLIC_REGISTER_DIASPORA}
            className="btn btn--primary btn--lg"
            style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
          >
            Register as Diaspora
          </Link>
        </Card>

        <Card className="account-type-card" style={{ padding: 'var(--space-500)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-300)', color: 'var(--color-primary)' }}>
            🏛️
          </div>
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-200)' }}>
            Puja Committee Registration
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-400)' }}>
            For puja organisers, clubs, and cultural associations planning Durga Puja celebrations in Bengal, across India, and globally.
          </p>
          <ul style={{ paddingLeft: 'var(--space-400)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.8, marginBottom: 'var(--space-600)', flex: 1 }}>
            <li>Official committee verification & accreditation</li>
            <li>Feature your pandal on the Interactive Pandal Atlas</li>
            <li>Publish photos, videos, and virtual live streams</li>
            <li>Portal management account upon approval</li>
          </ul>
          <Link
            to={ROUTES.PUBLIC_REGISTER_COMMITTEE}
            className="btn btn--primary btn--lg"
            style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
          >
            Register a Committee
          </Link>
        </Card>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-800)', color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
        Already have a portal account?{' '}
        <Link to={ROUTES.LOGIN} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Log in here
        </Link>
      </div>
    </div>
  );
}
