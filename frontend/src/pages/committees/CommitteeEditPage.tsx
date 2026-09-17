import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { PUJA_CATEGORY_OPTIONS, PUJA_TYPE_OPTIONS } from '@/constants/registration';
import { ROUTES } from '@/constants/routes';
import { committeeService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';
import type { PujaCommittee } from '@/types/registration';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1799 }, (_, index) => currentYear - index);

export function CommitteeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [committee, setCommittee] = useState<PujaCommittee | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [certFile, setCertFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [pandalFile, setPandalFile] = useState<File | null>(null);
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
          landmark: data.landmark ?? '',
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
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null) payload.append(key, String(val));
      });
      if (certFile) payload.append('registrationCertificate', certFile);
      if (addressFile) payload.append('addressProof', addressFile);
      if (pandalFile) payload.append('pandalImage', pandalFile);

      await committeeService.update(Number(id), payload);
      toast.success('Committee application updated successfully.');
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
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to={ROUTES.COMMITTEES}>Committee Applications</Link></li>
            <li><Link to={ROUTES.COMMITTEE_DETAIL(committee.id)}>{committee.registrationNo}</Link></li>
            <li><span>Edit</span></li>
          </ol>
        </nav>
        <h1 className="page__title">Edit Committee Application</h1>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="committee-edit-grid">
            <h2 className="committee-edit-section">Basic Information</h2>

            <div className="field">
              <label className="field__label">Registration Number</label>
              <input className="field__control" value={committee.registrationNo} disabled />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="committeeName">Committee Name</label>
              <input id="committeeName" name="committeeName" required className="field__control" value={formData.committeeName ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="establishedYear">Established Year</label>
              <select id="establishedYear" name="establishedYear" required className="field__control" value={formData.establishedYear ?? ''} onChange={handleChange}>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pujaType">Puja Type</label>
              <select id="pujaType" name="pujaType" required className="field__control" value={formData.pujaType ?? ''} onChange={handleChange}>
                {PUJA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pujaCategory">Puja Category</label>
              <select id="pujaCategory" name="pujaCategory" required className="field__control" value={formData.pujaCategory ?? ''} onChange={handleChange}>
                {PUJA_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="contactPersonName">Contact Person</label>
              <input id="contactPersonName" name="contactPersonName" required className="field__control" value={formData.contactPersonName ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="designation">Designation</label>
              <input id="designation" name="designation" required className="field__control" value={formData.designation ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="field__control" value={formData.email ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="mobile">Mobile</label>
              <input id="mobile" name="mobile" required className="field__control" value={formData.mobile ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="country">Country</label>
              <input id="country" name="country" required className="field__control" value={formData.country ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="state">State / Province</label>
              <input id="state" name="state" required className="field__control" value={formData.state ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="city">City</label>
              <input id="city" name="city" required className="field__control" value={formData.city ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="postalCode">PIN / ZIP Code</label>
              <input id="postalCode" name="postalCode" required className="field__control" value={formData.postalCode ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="venueName">Venue / Pandal Name</label>
              <input id="venueName" name="venueName" required className="field__control" value={formData.venueName ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="venueAddress">Venue Address</label>
              <input id="venueAddress" name="venueAddress" required className="field__control" value={formData.venueAddress ?? ''} onChange={handleChange} />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="landmark">Landmark</label>
              <input id="landmark" name="landmark" className="field__control" value={formData.landmark ?? ''} onChange={handleChange} />
            </div>

            <div className="field committee-edit-grid__full">
              <label className="field__label" htmlFor="committeeDescription">Committee Description</label>
              <textarea
                id="committeeDescription"
                name="committeeDescription"
                rows={3}
                maxLength={300}
                className="field__control"
                value={formData.committeeDescription ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field committee-edit-grid__full">
              <label className="field__label" htmlFor="address">Full Address</label>
              <textarea id="address" name="address" rows={2} required className="field__control" value={formData.address ?? ''} onChange={handleChange} />
            </div>

            <h2 className="committee-edit-section committee-edit-grid__full">Documents</h2>

            {[
              { id: 'registrationCertificate', label: 'Committee Registration Certificate', file: certFile, setFile: setCertFile },
              { id: 'addressProof', label: 'Address Proof', file: addressFile, setFile: setAddressFile },
              { id: 'pandalImage', label: 'Pandal / Puja Image', file: pandalFile, setFile: setPandalFile },
            ].map(({ id: fieldId, label, file, setFile }) => (
              <div key={fieldId} className="field">
                <label className="field__label" htmlFor={fieldId}>{label}</label>
                <input
                  id={fieldId}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="field__control"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <p className="field__hint">{file?.name ?? 'Leave blank to keep the current file. PDF, JPG, PNG up to 5 MB.'}</p>
              </div>
            ))}
          </div>

          <div className="form-actions" style={{ marginTop: 'var(--space-400)' }}>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
            <Link to={ROUTES.COMMITTEE_DETAIL(committee.id)} className="btn btn--secondary btn--md">
              Cancel
            </Link>
          </div>
        </Card>
      </form>
    </div>
  );
}
