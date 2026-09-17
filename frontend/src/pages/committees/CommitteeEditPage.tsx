import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { committeeService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';
import type { CommitteeUpdatePayload, PujaCommittee } from '@/types/registration';

export function CommitteeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [committee, setCommittee] = useState<PujaCommittee | null>(null);
  const [formData, setFormData] = useState<CommitteeUpdatePayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    committeeService
      .get(Number(id))
      .then((data) => {
        setCommittee(data);
        setFormData({
          committeeName: data.committeeName,
          establishedYear: data.establishedYear,
          pujaType: data.pujaType,
          pujaCategory: data.pujaCategory,
          committeeDescription: data.committeeDescription,
          contactPersonName: data.contactPersonName,
          designation: data.designation,
          email: data.email,
          mobile: data.mobile,
          country: data.country,
          state: data.state,
          city: data.city,
          postalCode: data.postalCode,
          venueName: data.venueName,
          venueAddress: data.venueAddress,
          landmark: data.landmark ?? undefined,
          address: data.address,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load committee.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'establishedYear' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await committeeService.update(Number(id), formData);
      toast.success('Committee details updated successfully.');
      navigate(ROUTES.COMMITTEE_DETAIL(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update committee.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!committee) {
    return (
      <div className="page">
        <Alert tone="danger">{error ?? 'Committee not found.'}</Alert>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', marginBottom: 'var(--space-100)' }}>
          <Link to={ROUTES.COMMITTEE_DETAIL(committee.id)} className="btn btn--secondary btn--sm">
            ← Back to Details
          </Link>
        </div>
        <h1 className="page__title">Edit: {committee.committeeName}</h1>
        <p className="page__subtitle">Registration No: {committee.registrationNo}</p>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
          <Card title="Committee Details">
            <div className="field">
              <label className="field__label" htmlFor="committeeName">
                Committee Name *
              </label>
              <input
                id="committeeName"
                name="committeeName"
                type="text"
                required
                className="field__control"
                value={formData.committeeName ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="establishedYear">
                Established Year *
              </label>
              <input
                id="establishedYear"
                name="establishedYear"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                required
                className="field__control"
                value={formData.establishedYear ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pujaType">
                Puja Type *
              </label>
              <select
                id="pujaType"
                name="pujaType"
                required
                className="field__control"
                value={formData.pujaType ?? ''}
                onChange={handleChange}
              >
                <option value="Community">Community</option>
                <option value="Traditional">Traditional / Bonedi Bari</option>
                <option value="Housing Society">Housing Society</option>
                <option value="Association">Association / Club</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pujaCategory">
                Puja Category *
              </label>
              <select
                id="pujaCategory"
                name="pujaCategory"
                required
                className="field__control"
                value={formData.pujaCategory ?? ''}
                onChange={handleChange}
              >
                <option value="Heritage">Heritage</option>
                <option value="Thematic">Thematic</option>
                <option value="Traditional">Traditional</option>
                <option value="Eco-Friendly">Eco-Friendly</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="committeeDescription">
                Description
              </label>
              <textarea
                id="committeeDescription"
                name="committeeDescription"
                rows={3}
                className="field__control"
                value={formData.committeeDescription ?? ''}
                onChange={handleChange}
              />
            </div>
          </Card>

          <Card title="Contact Person">
            <div className="field">
              <label className="field__label" htmlFor="contactPersonName">
                Contact Person Name *
              </label>
              <input
                id="contactPersonName"
                name="contactPersonName"
                type="text"
                required
                className="field__control"
                value={formData.contactPersonName ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="designation">
                Designation *
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                required
                className="field__control"
                value={formData.designation ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="field__control"
                value={formData.email ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="mobile">
                Mobile / Phone *
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                className="field__control"
                value={formData.mobile ?? ''}
                onChange={handleChange}
              />
            </div>
          </Card>

          <Card title="Venue & Address" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="venueName">
                  Venue Name *
                </label>
                <input
                  id="venueName"
                  name="venueName"
                  type="text"
                  required
                  className="field__control"
                  value={formData.venueName ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="venueAddress">
                  Venue Address *
                </label>
                <input
                  id="venueAddress"
                  name="venueAddress"
                  type="text"
                  required
                  className="field__control"
                  value={formData.venueAddress ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="landmark">
                  Landmark
                </label>
                <input
                  id="landmark"
                  name="landmark"
                  type="text"
                  className="field__control"
                  value={formData.landmark ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="city">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="field__control"
                  value={formData.city ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="state">
                  State *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  className="field__control"
                  value={formData.state ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="postalCode">
                  Postal Code *
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  className="field__control"
                  value={formData.postalCode ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="country">
                  Country *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  className="field__control"
                  value={formData.country ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="address">
                  Full Postal Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  required
                  className="field__control"
                  value={formData.address ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
          <Link to={ROUTES.COMMITTEE_DETAIL(committee.id)} className="btn btn--secondary btn--md">
            Cancel
          </Link>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving changes…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
