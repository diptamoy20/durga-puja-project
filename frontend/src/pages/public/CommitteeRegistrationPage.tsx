import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { RegistrationCaptcha } from '@/components/registration/RegistrationCaptcha';
import { RegistrationSection } from '@/components/registration/RegistrationSection';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  COMMITTEE_COUNTRY_OPTIONS,
  COMMITTEE_STATE_OPTIONS,
  PUJA_CATEGORY_OPTIONS,
  PUJA_TYPE_OPTIONS,
} from '@/constants/registration';
import { ROUTES } from '@/constants/routes';
import { publicRegistrationService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: currentYear - 1799 }, (_, index) => currentYear - index);

function UploadZone({
  id,
  label,
  file,
  onFileChange,
}: {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label} <span className="field__required">*</span>
      </label>
      <div
        className="registration-upload-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFileChange(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <p className="registration-upload-zone__title">Drag &amp; Drop file here</p>
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className="registration-upload-zone__input"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <label htmlFor={id} className="btn btn--secondary btn--sm">
          Browse
        </label>
        <p className="registration-upload-zone__hint">{file?.name ?? 'PDF, JPG, PNG up to 5 MB'}</p>
      </div>
    </div>
  );
}

export function CommitteeRegistrationPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const initialForm = useMemo(
    () => ({
      committeeName: '',
      establishedYear: '',
      pujaType: '',
      pujaCategory: '',
      committeeDescription: '',
      contactPersonName: '',
      designation: '',
      email: '',
      mobile: '',
      country: '',
      state: '',
      city: '',
      postalCode: '',
      venueName: '',
      venueAddress: '',
      landmark: '',
      address: '',
      declaration: false,
    }),
    [],
  );

  const [formData, setFormData] = useState(initialForm);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [pandalFile, setPandalFile] = useState<File | null>(null);
  const [captcha, setCaptcha] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.declaration) {
      toast.warning('Please accept the declaration.');
      return;
    }
    if (!certFile || !addressFile || !pandalFile) {
      toast.warning('All required documents must be uploaded.');
      return;
    }
    if (!captchaToken) {
      toast.warning('Security check is not ready. Please refresh and try again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => payload.append(key, String(val)));
    payload.append('registrationCertificate', certFile);
    payload.append('addressProof', addressFile);
    payload.append('pandalImage', pandalFile);
    payload.append('captcha', captcha);
    payload.append('captchaToken', captchaToken);

    try {
      const res = await publicRegistrationService.submitCommittee(payload);
      navigate(ROUTES.PUBLIC_THANK_YOU('committee', res.registrationNo));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please check the highlighted fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-page committee-registration-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={ROUTES.PUBLIC_CHOOSE_TYPE}>Home</Link></li>
          <li><span>Puja Committee Registration</span></li>
        </ol>
      </nav>

      <header className="registration-page__header">
        <h1>Puja Committee Registration</h1>
        <p>Register your Puja Committee with Durga Puja Global Connect.</p>
      </header>

      {error && <Alert tone="danger">Please correct the highlighted fields and submit the form again. {error}</Alert>}

      <div className="committee-registration-layout">
        <form onSubmit={handleSubmit} className="registration-form">
          <RegistrationSection title="COMMITTEE INFORMATION" icon="landmark">
            <div className="form-grid form-grid--2">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="committeeName">Puja Committee Name <span className="field__required">*</span></label>
                <input id="committeeName" name="committeeName" required className="field__control" value={formData.committeeName} onChange={handleChange} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="establishedYear">Established Year <span className="field__required">*</span></label>
                <select id="establishedYear" name="establishedYear" required className="field__control" value={formData.establishedYear} onChange={handleChange}>
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="pujaType">Type of Puja <span className="field__required">*</span></label>
                <select id="pujaType" name="pujaType" required className="field__control" value={formData.pujaType} onChange={handleChange}>
                  <option value="">Select type</option>
                  {PUJA_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="pujaCategory">Puja Category <span className="field__required">*</span></label>
                <select id="pujaCategory" name="pujaCategory" required className="field__control" value={formData.pujaCategory} onChange={handleChange}>
                  <option value="">Select category</option>
                  {PUJA_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="committeeDescription">Brief Description of Committee <span className="field__required">*</span></label>
                <textarea
                  id="committeeDescription"
                  name="committeeDescription"
                  rows={4}
                  maxLength={300}
                  required
                  className="field__control"
                  value={formData.committeeDescription}
                  onChange={handleChange}
                />
                <p className="field__hint">{formData.committeeDescription.length}/300</p>
              </div>
            </div>
          </RegistrationSection>

          <RegistrationSection title="CONTACT PERSON DETAILS" icon="user">
            <div className="form-grid form-grid--2">
              <div className="field">
                <label className="field__label" htmlFor="contactPersonName">Full Name <span className="field__required">*</span></label>
                <input id="contactPersonName" name="contactPersonName" required className="field__control" value={formData.contactPersonName} onChange={handleChange} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="designation">Designation <span className="field__required">*</span></label>
                <input id="designation" name="designation" required className="field__control" value={formData.designation} onChange={handleChange} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="email">Email Address <span className="field__required">*</span></label>
                <input id="email" name="email" type="email" required className="field__control" value={formData.email} onChange={handleChange} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="mobile">Mobile Number <span className="field__required">*</span></label>
                <input id="mobile" name="mobile" type="tel" required className="field__control" value={formData.mobile} onChange={handleChange} />
              </div>
            </div>
          </RegistrationSection>

          <RegistrationSection title="LOCATION DETAILS" icon="map-marker-alt">
            <div className="form-grid form-grid--2">
              <div className="field">
                <label className="field__label" htmlFor="country">Country <span className="field__required">*</span></label>
                <select id="country" name="country" required className="field__control" value={formData.country} onChange={handleChange}>
                  <option value="">Select country</option>
                  {COMMITTEE_COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="state">State / Province <span className="field__required">*</span></label>
                <select id="state" name="state" required className="field__control" value={formData.state} onChange={handleChange}>
                  <option value="">Select state / province</option>
                  {COMMITTEE_STATE_OPTIONS.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="city">City <span className="field__required">*</span></label>
                <input id="city" name="city" required className="field__control" value={formData.city} onChange={handleChange} />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="postalCode">PIN / ZIP Code <span className="field__required">*</span></label>
                <input id="postalCode" name="postalCode" required className="field__control" value={formData.postalCode} onChange={handleChange} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="address">Full Address <span className="field__required">*</span></label>
                <textarea id="address" name="address" rows={3} required className="field__control" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </RegistrationSection>

          <RegistrationSection title="PUJA VENUE DETAILS" icon="map-pin">
            <div className="form-grid form-grid--2">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="venueName">Venue / Pandal Name <span className="field__required">*</span></label>
                <input id="venueName" name="venueName" required className="field__control" value={formData.venueName} onChange={handleChange} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="venueAddress">Address <span className="field__required">*</span></label>
                <input id="venueAddress" name="venueAddress" required className="field__control" value={formData.venueAddress} onChange={handleChange} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="landmark">Landmark</label>
                <input id="landmark" name="landmark" className="field__control" value={formData.landmark} onChange={handleChange} />
              </div>
            </div>
          </RegistrationSection>

          <RegistrationSection title="DOCUMENT UPLOAD" icon="cloud-upload-alt">
            <UploadZone id="registrationCertificate" label="Committee Registration Certificate" file={certFile} onFileChange={setCertFile} />
            <UploadZone id="addressProof" label="Address Proof" file={addressFile} onFileChange={setAddressFile} />
            <UploadZone id="pandalImage" label="Pandal / Puja Image" file={pandalFile} onFileChange={setPandalFile} />
          </RegistrationSection>

          <RegistrationSection title="DECLARATION" icon="check-circle">
            <label className="registration-check">
              <input type="checkbox" name="declaration" required checked={formData.declaration} onChange={handleChange} />
              <span>
                I hereby declare that the information provided above is true and correct to the best of my knowledge.
              </span>
            </label>
          </RegistrationSection>

          <RegistrationCaptcha
            value={captcha}
            token={captchaToken}
            onChange={setCaptcha}
            onTokenChange={setCaptchaToken}
          />

          <div className="form-actions">
            <Button type="reset" variant="secondary" size="md" onClick={() => setFormData(initialForm)}>
              Reset
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Register'}
            </Button>
          </div>
        </form>

        <aside className="committee-registration-sidebar">
          <section className="card">
            <div className="card__body">
              <h2 className="card__title">Why Register Your Puja Committee?</h2>
              {[
                ['Global Visibility', 'Get your Puja listed on the global platform.'],
                ['Unique ID', 'Receive a unique ID for your committee.'],
                ['Connect & Collaborate', 'Network with communities worldwide.'],
                ['Updates & Support', 'Get important updates and support from us.'],
              ].map(([title, copy]) => (
                <article key={title} className="committee-benefit-card">
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="card">
            <div className="card__body">
              <h2 className="card__title">Guidelines</h2>
              <ul className="committee-guidelines">
                <li>Provide accurate and complete information.</li>
                <li>Ensure uploaded documents are valid.</li>
                <li>Your application will be reviewed by our team.</li>
                <li>You will receive your Unique ID after verification.</li>
              </ul>
            </div>
          </section>
          <section className="card">
            <div className="card__body">
              <h2 className="card__title">Already Registered?</h2>
              <Link to={ROUTES.LOGIN} className="btn btn--secondary btn--md" style={{ width: '100%' }}>
                Login Now
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
