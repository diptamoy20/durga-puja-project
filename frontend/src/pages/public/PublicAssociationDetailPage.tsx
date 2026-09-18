import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { associationService, type PublicAssociation } from '@/services/associationService';

import '@/styles/public-associations.css';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function PublicAssociationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [association, setAssociation] = useState<PublicAssociation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    associationService
      .get(Number(id))
      .then(setAssociation)
      .catch((err) => setError(err instanceof Error ? err.message : 'Association not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (error || !association) {
    return (
      <div className="public-associations">
        <Alert tone="danger">{error ?? 'Association not found.'}</Alert>
        <Link to={ROUTES.PUBLIC_ASSOCIATIONS} className="public-association__back">
          ← Back to directory
        </Link>
      </div>
    );
  }

  const logoUrl = association.logoImage ? associationService.fileUrl(association.logoImage) : null;
  const coverUrl = association.coverImage ? associationService.fileUrl(association.coverImage) : null;

  return (
    <div className="public-associations">
      <Link to={ROUTES.PUBLIC_ASSOCIATIONS} className="public-association__back">
        ← Back to directory
      </Link>

      {coverUrl && (
        <div className="public-association-detail__cover">
          <img src={coverUrl} alt={`${association.name} cover`} />
        </div>
      )}

      <div className="public-association-detail">
        <div className="public-association-detail__media">
          {logoUrl ? (
            <img src={logoUrl} alt={`${association.name} logo`} />
          ) : (
            <div className="public-association-detail__media-placeholder" aria-hidden="true">🏢</div>
          )}
        </div>

        <aside className="public-association-detail__sidebar">
          <div
            className={`public-association-detail__verification ${association.verification.verified ? '' : 'rejected'}`}
          >
            <div className="public-association-detail__verification-title">
              <span aria-hidden="true">{association.verification.verified ? '✅' : '❌'}</span>
              {association.verification.verified ? 'Verified Association' : 'Not Verified'}
            </div>
            <div className="public-association-detail__verification-meta">
              {association.verification.verifiedAt
                ? `Verified on ${dateFormat.format(new Date(association.verification.verifiedAt))}`
                : 'Pending verification'}
              {association.verification.verifiedBy && (
                <>
                  {' · by '}
                  <strong>{association.verification.verifiedBy.name}</strong>
                </>
              )}
            </div>
          </div>

          <h1>{association.name}</h1>
          {association.description && (
            <p className="public-association-detail__description">{association.description}</p>
          )}
          <hr />

          <dl className="public-association-detail__meta">
            <dt>Registration No.</dt>
            <dd>{association.registrationNo}</dd>
            {association.associationId && (
              <>
                <dt>Association ID</dt>
                <dd>{association.associationId}</dd>
              </>
            )}
            {association.establishedYear && (
              <>
                <dt>Established</dt>
                <dd>{association.establishedYear}</dd>
              </>
            )}
            <dt>Country</dt>
            <dd>{association.country}</dd>
            <dt>State / Region</dt>
            <dd>{association.state}</dd>
            <dt>City</dt>
            <dd>{association.city}</dd>
            {association.postalCode && (
              <>
                <dt>Postal Code</dt>
                <dd>{association.postalCode}</dd>
              </>
            )}
          </dl>

          <section className="public-association-detail__section">
            <h2 className="public-association-detail__section-title">Contact</h2>
            <dl className="public-association-detail__meta">
              {association.contactPersonName && (
                <>
                  <dt>Contact Person</dt>
                  <dd>{association.contactPersonName}</dd>
                </>
              )}
              {association.designation && (
                <>
                  <dt>Designation</dt>
                  <dd>{association.designation}</dd>
                </>
              )}
              {association.email && (
                <>
                  <dt>Email</dt>
                  <dd><a href={`mailto:${association.email}`}>{association.email}</a></dd>
                </>
              )}
              {association.mobile && (
                <>
                  <dt>Mobile</dt>
                  <dd><a href={`tel:${association.mobile}`}>{association.mobile}</a></dd>
                </>
              )}
              {association.website && (
                <>
                  <dt>Website</dt>
                  <dd><a href={association.website} target="_blank" rel="noopener noreferrer">{association.website}</a></dd>
                </>
              )}
              {association.socialLinks && Object.keys(association.socialLinks).length > 0 && (
                <>
                  <dt>Social</dt>
                  <dd>
                    {Object.entries(association.socialLinks).map(([platform, url]) => (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={{ marginRight: 'var(--space-200)' }}>
                        {platform}
                      </a>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </section>

          {association.address && (
            <section className="public-association-detail__section">
              <h2 className="public-association-detail__section-title">Address</h2>
              <p className="public-association-detail__meta">{association.address}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}