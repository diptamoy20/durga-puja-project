import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { publicRegistrationService } from '@/services/registrationService';

export function RegistrationThankYouPage() {
  const { type = 'diaspora', id } = useParams<{ type: string; id: string }>();

  const [registrationNo, setRegistrationNo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    publicRegistrationService
      .getThankYou(type as 'diaspora' | 'committee', Number(id))
      .then((res) => {
        setRegistrationNo(res.registrationNo);
      })
      .catch(() => {
        // Fallback placeholder if not found or already loaded
        setRegistrationNo(`DPGC-${type.slice(0, 3).toUpperCase()}-${id}`);
      })
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) return <PageLoader />;

  const isDiaspora = type === 'diaspora';

  return (
    <div style={{ maxWidth: '640px', margin: 'var(--space-800) auto', textAlign: 'center' }}>
      <Card style={{ padding: 'var(--space-800) var(--space-600)' }}>
        <div style={{ fontSize: '3.5rem', color: 'var(--color-success)', marginBottom: 'var(--space-300)' }}>
          ✓
        </div>

        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-200)' }}>
          Thank you for your {isDiaspora ? 'Diaspora' : 'Puja Committee'} registration!
        </h1>

        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-400)' }}>
          Your application has been received and logged in the state festival registry.
        </p>

        {registrationNo && (
          <div
            style={{
              display: 'inline-block',
              background: 'var(--color-surface-sunken)',
              border: '1px dashed var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-300) var(--space-500)',
              marginBottom: 'var(--space-500)',
            }}
          >
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
              Your Registration Number:
            </span>
            <strong style={{ fontSize: 'var(--font-lg)', color: 'var(--color-primary)', letterSpacing: '1px' }}>
              {registrationNo}
            </strong>
          </div>
        )}

        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', maxWidth: '480px', margin: '0 auto var(--space-600) auto', lineHeight: 1.6 }}>
          A confirmation record has been created. Our administrative department will verify your details.
          {isDiaspora
            ? ' Once verified, you will receive notifications about upcoming events and virtual live feeds.'
            : ' Upon approval, portal credentials will be dispatched to your authorized email address.'}
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-300)', justifyContent: 'center' }}>
          <Link to={ROUTES.PUBLIC_ATLAS} className="btn btn--secondary btn--md">
            Explore Pandal Map
          </Link>
          <Link to={ROUTES.PUBLIC_GALLERY} className="btn btn--secondary btn--md">
            View Gallery
          </Link>
          <Link to={ROUTES.LOGIN} className="btn btn--primary btn--md">
            Portal Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
