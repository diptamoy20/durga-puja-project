import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { publicRegistrationService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';

export function CommitteeRegistrationPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    committeeName: '',
    establishedYear: 1980,
    pujaType: 'Community',
    pujaCategory: 'Heritage',
    committeeDescription: '',
    contactPersonName: '',
    designation: 'General Secretary',
    email: '',
    mobile: '',
    country: 'India',
    state: 'West Bengal',
    city: 'Kolkata',
    postalCode: '',
    venueName: '',
    venueAddress: '',
    landmark: '',
    address: '',
    declaration: false,
  });

  const [certFile, setCertFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [pandalFile, setPandalFile] = useState<File | null>(null);

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
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'establishedYear' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.declaration) {
      toast.warning('Please agree to the committee declaration.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      payload.append(key, String(val));
    });

    if (certFile) payload.append('registrationCertificate', certFile);
    if (addressFile) payload.append('addressProof', addressFile);
    if (pandalFile) payload.append('pandalImage', pandalFile);

    try {
      const res = await publicRegistrationService.submitCommittee(payload);
      toast.success('Puja Committee application submitted successfully!');
      navigate(ROUTES.PUBLIC_THANK_YOU('committee', res.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please check form fields.');
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
          Puja Committee Registration
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Register your celebration to be accredited on the global portal, pandal atlas, and media gallery.
        </p>
      </header>

      {error && <Alert tone="danger" style={{ marginBottom: 'var(--space-400)' }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-500)' }}>
          <Card title="1. Committee Profile">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="cName">Committee Name *</label>
                <input
                  id="cName"
                  name="committeeName"
                  type="text"
                  required
                  className="field__control"
                  placeholder="e.g. Ekdalia Evergreen Club"
                  value={formData.committeeName}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cYear">Year Established *</label>
                <input
                  id="cYear"
                  name="establishedYear"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                  className="field__control"
                  value={formData.establishedYear}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cType">Puja Type *</label>
                <select
                  id="cType"
                  name="pujaType"
                  required
                  className="field__control"
                  value={formData.pujaType}
                  onChange={handleChange}
                >
                  <option value="Community">Community / Sarbojanin</option>
                  <option value="Traditional">Traditional / Bonedi Bari</option>
                  <option value="Housing Society">Housing Society / Complex</option>
                  <option value="Association">Association / Club</option>
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cCat">Puja Category *</label>
                <select
                  id="cCat"
                  name="pujaCategory"
                  required
                  className="field__control"
                  value={formData.pujaCategory}
                  onChange={handleChange}
                >
                  <option value="Heritage">Heritage & Traditional</option>
                  <option value="Thematic">Art & Concept / Thematic</option>
                  <option value="Eco-Friendly">Eco-Friendly & Green</option>
                  <option value="Community Welfare">Community & Social Focus</option>
                </select>
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="cDesc">Committee Description & Highlights *</label>
                <textarea
                  id="cDesc"
                  name="committeeDescription"
                  rows={3}
                  required
                  className="field__control"
                  placeholder="Briefly describe your puja committee, history, and community activities..."
                  value={formData.committeeDescription}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="2. Authorised Contact Person">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="cpName">Contact Person Name *</label>
                <input
                  id="cpName"
                  name="contactPersonName"
                  type="text"
                  required
                  className="field__control"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cpDesig">Designation *</label>
                <input
                  id="cpDesig"
                  name="designation"
                  type="text"
                  required
                  className="field__control"
                  placeholder="Secretary, President, etc."
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cpEmail">Official Email *</label>
                <input
                  id="cpEmail"
                  name="email"
                  type="email"
                  required
                  className="field__control"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cpMobile">Contact Mobile *</label>
                <input
                  id="cpMobile"
                  name="mobile"
                  type="tel"
                  required
                  className="field__control"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="3. Venue & Location">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="cvName">Venue / Pandal Ground Name *</label>
                <input
                  id="cvName"
                  name="venueName"
                  type="text"
                  required
                  className="field__control"
                  value={formData.venueName}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cvAddr">Venue Address *</label>
                <input
                  id="cvAddr"
                  name="venueAddress"
                  type="text"
                  required
                  className="field__control"
                  value={formData.venueAddress}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cvLandmark">Nearest Landmark</label>
                <input
                  id="cvLandmark"
                  name="landmark"
                  type="text"
                  className="field__control"
                  value={formData.landmark}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cvCity">City *</label>
                <input
                  id="cvCity"
                  name="city"
                  type="text"
                  required
                  className="field__control"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cvState">State *</label>
                <input
                  id="cvState"
                  name="state"
                  type="text"
                  required
                  className="field__control"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cvPostal">Postal Code *</label>
                <input
                  id="cvPostal"
                  name="postalCode"
                  type="text"
                  required
                  className="field__control"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cvCountry">Country *</label>
                <input
                  id="cvCountry"
                  name="country"
                  type="text"
                  required
                  className="field__control"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="cFullAddr">Official Postal / Registered Address *</label>
                <textarea
                  id="cFullAddr"
                  name="address"
                  rows={2}
                  required
                  className="field__control"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="4. Supporting Documents & Photos">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-400)' }}>
              <div className="field">
                <label className="field__label" htmlFor="docCert">
                  Registration Certificate / Permission Copy
                </label>
                <input
                  id="docCert"
                  type="file"
                  className="field__control"
                  accept=".pdf,image/*"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="docAddr">
                  Address Proof Document
                </label>
                <input
                  id="docAddr"
                  type="file"
                  className="field__control"
                  accept=".pdf,image/*"
                  onChange={(e) => setAddressFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="docPandal">
                  Pandal Photo or Layout Mockup
                </label>
                <input
                  id="docPandal"
                  type="file"
                  className="field__control"
                  accept="image/*"
                  onChange={(e) => setPandalFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </Card>

          <Card title="5. Declaration">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                name="declaration"
                required
                checked={formData.declaration}
                onChange={handleChange}
              />
              <span>
                I hereby declare on behalf of the committee that all information provided is true and accurate, and our committee agrees to abide by festival safety norms and government guidelines. *
              </span>
            </label>
          </Card>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-400)' }}>
            <Button type="submit" variant="primary" size="lg" disabled={submitting} style={{ minWidth: '240px' }}>
              {submitting ? 'Submitting Application…' : 'Submit Committee Application'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
