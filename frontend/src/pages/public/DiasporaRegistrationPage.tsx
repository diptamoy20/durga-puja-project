import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { publicRegistrationService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';

export function DiasporaRegistrationPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Female',
    email: '',
    mobile: '',
    country: '',
    city: '',
    passportNo: '',
    nationality: 'Indian',
    address1: '',
    address2: '',
    state: '',
    postalCode: '',
    districtOrigin: 'Kolkata',
    village: '',
    relationshipWithBengal: 'Born in Bengal',
    languages: 'Bengali, English',
    interests: [] as string[],
    volunteer: false,
    receiveUpdates: true,
    termsAccepted: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => {
      const current = prev.interests;
      const updated = current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest];
      return { ...prev, interests: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      toast.warning('You must accept the terms and conditions to register.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await publicRegistrationService.submitDiaspora({
        ...formData,
        passportNo: formData.passportNo || undefined,
        address2: formData.address2 || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        village: formData.village || undefined,
        languages: formData.languages || undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined,
      });
      toast.success('Registration submitted successfully!');
      navigate(ROUTES.PUBLIC_THANK_YOU('diaspora', res.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-600)', textAlign: 'center' }}>
        <div style={{ marginBottom: 'var(--space-200)' }}>
          <Link to={ROUTES.PUBLIC_CHOOSE_TYPE} className="btn btn--secondary btn--sm">
            ← Change Registration Type
          </Link>
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-100)' }}>
          Diaspora Registration
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Join the global registry of non-resident Bengalis and diaspora cultural networks.
        </p>
      </header>

      {error && <Alert tone="danger" style={{ marginBottom: 'var(--space-400)' }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-500)' }}>
          <Card title="1. Personal Information">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="dfName">Full Name *</label>
                <input
                  id="dfName"
                  name="fullName"
                  type="text"
                  required
                  className="field__control"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dDob">Date of Birth *</label>
                <input
                  id="dDob"
                  name="dob"
                  type="date"
                  required
                  className="field__control"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dGender">Gender *</label>
                <select
                  id="dGender"
                  name="gender"
                  required
                  className="field__control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dEmail">Email Address *</label>
                <input
                  id="dEmail"
                  name="email"
                  type="email"
                  required
                  className="field__control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dMobile">Mobile Number (with country code) *</label>
                <input
                  id="dMobile"
                  name="mobile"
                  type="tel"
                  required
                  className="field__control"
                  placeholder="+44 7123 456789"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dNationality">Nationality *</label>
                <input
                  id="dNationality"
                  name="nationality"
                  type="text"
                  required
                  className="field__control"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dPassport">Passport / National ID No</label>
                <input
                  id="dPassport"
                  name="passportNo"
                  type="text"
                  className="field__control"
                  value={formData.passportNo}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="2. Overseas Residential Address">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="dAddr1">Address Line 1 *</label>
                <input
                  id="dAddr1"
                  name="address1"
                  type="text"
                  required
                  className="field__control"
                  value={formData.address1}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="dAddr2">Address Line 2</label>
                <input
                  id="dAddr2"
                  name="address2"
                  type="text"
                  className="field__control"
                  value={formData.address2}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dCity">City *</label>
                <input
                  id="dCity"
                  name="city"
                  type="text"
                  required
                  className="field__control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dState">State / Province</label>
                <input
                  id="dState"
                  name="state"
                  type="text"
                  className="field__control"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dPostal">Postal / ZIP Code</label>
                <input
                  id="dPostal"
                  name="postalCode"
                  type="text"
                  className="field__control"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dCountry">Current Country *</label>
                <input
                  id="dCountry"
                  name="country"
                  type="text"
                  required
                  className="field__control"
                  placeholder="e.g. United Kingdom, USA, Germany"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="3. Roots & Connection to Bengal">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="dOrigin">District of Origin in Bengal *</label>
                <input
                  id="dOrigin"
                  name="districtOrigin"
                  type="text"
                  required
                  className="field__control"
                  value={formData.districtOrigin}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dVillage">Ancestral Town / Village</label>
                <input
                  id="dVillage"
                  name="village"
                  type="text"
                  className="field__control"
                  value={formData.village}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dRelation">Relationship with Bengal *</label>
                <select
                  id="dRelation"
                  name="relationshipWithBengal"
                  required
                  className="field__control"
                  value={formData.relationshipWithBengal}
                  onChange={handleChange}
                >
                  <option value="Born in Bengal">Born in Bengal</option>
                  <option value="Parents from Bengal">Parents from Bengal</option>
                  <option value="Grandparents from Bengal">Grandparents from Bengal</option>
                  <option value="Lived / Educated in Bengal">Lived / Educated in Bengal</option>
                  <option value="Spouse from Bengal">Spouse from Bengal</option>
                  <option value="Cultural Enthusiast">Cultural Enthusiast</option>
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="dLang">Languages Spoken</label>
                <input
                  id="dLang"
                  name="languages"
                  type="text"
                  className="field__control"
                  value={formData.languages}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-400)' }}>
              <label className="field__label">Areas of Interest</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-300)', marginTop: 'var(--space-150)' }}>
                {['Puja Celebrations', 'Cultural Heritage', 'Volunteering', 'Youth Exchanges', 'Art & Music', 'Tourism'].map((item) => (
                  <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(item)}
                      onChange={() => handleInterestChange(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          <Card title="4. Declaration & Consent">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="volunteer"
                  checked={formData.volunteer}
                  onChange={handleChange}
                />
                <span>I would like to volunteer for diaspora events and community initiatives.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="receiveUpdates"
                  checked={formData.receiveUpdates}
                  onChange={handleChange}
                />
                <span>Receive festival newsletters, live broadcast links, and cultural announcements.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  required
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />
                <span>I confirm that the information provided is accurate and agree to the Terms & Privacy Policy *</span>
              </label>
            </div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-400)' }}>
            <Button type="submit" variant="primary" size="lg" disabled={submitting} style={{ minWidth: '240px' }}>
              {submitting ? 'Submitting Registration…' : 'Submit Registration'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
