import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { associationService, type PublicAssociation } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';

import '@/styles/public-associations.css';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function PublicAssociationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success: toastSuccess, error: toastError } = useToast();
  const [association, setAssociation] = useState<PublicAssociation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    associationService
      .get(Number(id))
      .then(setAssociation)
      .catch((err) => setError(err instanceof Error ? err.message : 'Association not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const closeSubscribe = () => {
    if (subscribing) return;
    setSubscribeOpen(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!association) return;
    setSubscribing(true);
    try {
      await associationService.subscribe(association.id, { email: subscribeEmail, name: subscribeName || undefined });
      setSubscribed(true);
      toastSuccess('You are now subscribed to updates for this association.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!association || !subscribeEmail) return;
    setUnsubscribing(true);
    try {
      await associationService.unsubscribe(association.id, subscribeEmail);
      setSubscribed(false);
      setSubscribeEmail('');
      setSubscribeName('');
      toastSuccess('You have been unsubscribed from updates for this association.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not unsubscribe. Please try again.');
    } finally {
      setUnsubscribing(false);
    }
  };

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
  const verified = association.verification.verified;
  const location = [association.city, association.state, association.country].filter(Boolean).join(', ');

  return (
    <div className="public-associations">
      <Link to={ROUTES.PUBLIC_ASSOCIATIONS} className="public-association__back">
        ← Back to directory
      </Link>

      <div className="pa-profile">
        <div className="pa-profile__hero">
          {coverUrl && (
            <img
              className="pa-profile__hero-cover"
              src={coverUrl}
              alt=""
              aria-hidden="true"
            />
          )}
          <div className="pa-profile__hero-inner">
            <div className="pa-profile__logo">
              {logoUrl ? (
                <img src={logoUrl} alt={`${association.name} logo`} />
              ) : (
                <div className="pa-profile__logo-placeholder" aria-hidden="true">🏢</div>
              )}
            </div>
            <div className="pa-profile__identity">
              <div className="pa-profile__badge-row">
                {verified ? (
                  <span className="pa-profile__verified">
                    <span aria-hidden="true">✓</span> Verified Association
                  </span>
                ) : (
                  <span className="pa-profile__established">Not verified</span>
                )}
                {association.establishedYear && (
                  <span className="pa-profile__established">Est. {association.establishedYear}</span>
                )}
              </div>
              <h1>{association.name}</h1>
              {location && (
                <p className="pa-profile__flag">
                  <span aria-hidden="true">📍</span> {location}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pa-profile__body">
          <div className="pa-profile__main">
            <section className="pa-profile__card">
              <h2 className="pa-profile__card-title">About</h2>
              <p className="pa-profile__description">
                {association.description || 'No description provided.'}
              </p>
            </section>

            <section className="pa-profile__card">
              <h2 className="pa-profile__card-title">Registration Details</h2>
              <dl className="pa-profile__grid">
                <div className="pa-profile__item">
                  <dt>Registration No.</dt>
                  <dd>{association.registrationNo}</dd>
                </div>
                {association.associationId && (
                  <div className="pa-profile__item">
                    <dt>Association ID</dt>
                    <dd>{association.associationId}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="pa-profile__card">
              <h2 className="pa-profile__card-title">Location</h2>
              <dl className="pa-profile__grid">
                <div className="pa-profile__item">
                  <dt>Country</dt>
                  <dd>{association.country}</dd>
                </div>
                <div className="pa-profile__item">
                  <dt>State / Region</dt>
                  <dd>{association.state}</dd>
                </div>
                <div className="pa-profile__item">
                  <dt>City</dt>
                  <dd>{association.city}</dd>
                </div>
                {association.postalCode && (
                  <div className="pa-profile__item">
                    <dt>Postal Code</dt>
                    <dd>{association.postalCode}</dd>
                  </div>
                )}
                {association.address && (
                  <div className="pa-profile__item">
                    <dt>Address</dt>
                    <dd>{association.address}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="pa-profile__card">
              <h2 className="pa-profile__card-title">Contact</h2>
              <dl className="pa-profile__grid">
                {association.contactPersonName && (
                  <div className="pa-profile__item">
                    <dt>Contact Person</dt>
                    <dd>{association.contactPersonName}</dd>
                  </div>
                )}
                {association.designation && (
                  <div className="pa-profile__item">
                    <dt>Designation</dt>
                    <dd>{association.designation}</dd>
                  </div>
                )}
                {association.email && (
                  <div className="pa-profile__item">
                    <dt>Email</dt>
                    <dd><a href={`mailto:${association.email}`}>{association.email}</a></dd>
                  </div>
                )}
                {association.mobile && (
                  <div className="pa-profile__item">
                    <dt>Mobile</dt>
                    <dd><a href={`tel:${association.mobile}`}>{association.mobile}</a></dd>
                  </div>
                )}
                {association.website && (
                  <div className="pa-profile__item">
                    <dt>Website</dt>
                    <dd>
                      <a href={association.website} target="_blank" rel="noopener noreferrer">
                        {association.website.replace(/^https?:\/\//, '')}
                      </a>
                    </dd>
                  </div>
                )}
                {association.socialLinks && Object.keys(association.socialLinks).length > 0 && (
                  <div className="pa-profile__item">
                    <dt>Social</dt>
                    <dd style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-200)' }}>
                      {Object.entries(association.socialLinks).map(([platform, url]) => (
                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer">
                          {platform}
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>

          <aside className="pa-profile__panel">
            <div className="pa-profile__verify">
              <div className="pa-profile__verify-title">
                {verified ? (
                  <>
                    <span className="pa-profile__verify-check" aria-hidden="true">✓</span>
                    Verified Association
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">⏳</span>
                    Not Verified
                  </>
                )}
              </div>
              <p className="pa-profile__verify-meta">
                {verified
                  ? association.verification.verifiedAt
                    ? `Verified on ${dateFormat.format(new Date(association.verification.verifiedAt))}${association.verification.verifiedBy ? ` by ${association.verification.verifiedBy.name}` : ''}.`
                    : 'This association is verified.'
                  : 'This association has not been verified yet.'}
              </p>
            </div>

            <div className="pa-profile__subscribe">
              <h2 className="pa-profile__subscribe-title">Get updates</h2>
              <p className="pa-profile__subscribe-text">
                Receive an email when this association is verified or its status changes.
              </p>
              {subscribed ? (
                <div className="pa-profile__subscribe-done">
                  <span aria-hidden="true">✅</span>
                  <span>You&apos;re subscribed to updates for this association.</span>
                  <Button variant="secondary" size="sm" onClick={handleUnsubscribe} disabled={unsubscribing}>
                    {unsubscribing ? 'Unsubscribing…' : 'Unsubscribe'}
                  </Button>
                </div>
              ) : (
                <Button variant="primary" size="md" onClick={() => setSubscribeOpen(true)}>
                  Subscribe for updates
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Modal open={subscribeOpen} title={`Subscribe to ${association.name}`} onClose={closeSubscribe}>
        {subscribed ? (
          <div>
            <p style={{ margin: 0 }}>
              Subscription confirmed for <strong>{subscribeEmail}</strong>. You&apos;ll be notified when
              this association is verified or changes status.
            </p>
            <div className="form-actions" style={{ marginTop: 'var(--space-300)' }}>
              <Button variant="secondary" size="md" onClick={() => setSubscribeOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe}>
            <div className="field">
              <label className="field__label" htmlFor="associationSubscribeEmail">
                Email address <span className="field__required">*</span>
              </label>
              <input
                id="associationSubscribeEmail"
                type="email"
                required
                className="field__control"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field" style={{ marginTop: 'var(--space-300)' }}>
              <label className="field__label" htmlFor="associationSubscribeName">
                Name <span className="field__optional">(optional)</span>
              </label>
              <input
                id="associationSubscribeName"
                type="text"
                className="field__control"
                value={subscribeName}
                onChange={(e) => setSubscribeName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="form-actions" style={{ marginTop: 'var(--space-300)' }}>
              <Button type="button" variant="secondary" size="md" onClick={closeSubscribe} disabled={subscribing}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={subscribing}>
                {subscribing ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}