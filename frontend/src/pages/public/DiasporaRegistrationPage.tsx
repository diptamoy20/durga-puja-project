import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { RegistrationCaptcha } from '@/components/registration/RegistrationCaptcha';
import { RegistrationSection } from '@/components/registration/RegistrationSection';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { GENDER_OPTIONS, INTEREST_OPTIONS } from '@/constants/registration';
import { ROUTES } from '@/constants/routes';
import { publicRegistrationService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';

const initialForm = {
  fullName: '',
  dob: '',
  gender: '',
  email: '',
  mobile: '',
  country: '',
  city: '',
  passportNo: '',
  nationality: '',
  address1: '',
  address2: '',
  state: '',
  postalCode: '',
  districtOrigin: '',
  village: '',
  relationshipWithBengal: '',
  languages: '',
  interests: [] as string[],
  volunteer: '',
  receiveUpdates: false,
  termsAccepted: false,
};

export function DiasporaRegistrationPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState(initialForm);
  const [captcha, setCaptcha] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
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

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleReset = () => {
    setFormData(initialForm);
    setCaptcha('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      toast.warning('You must agree to the Terms & Privacy Policy.');
      return;
    }
    if (formData.volunteer === '') {
      toast.warning('Please indicate whether you would like to volunteer.');
      return;
    }
    if (!captchaToken) {
      toast.warning('Security check is not ready. Please refresh and try again.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await publicRegistrationService.submitDiaspora({
        fullName: formData.fullName.trim(),
        dob: formData.dob,
        gender: formData.gender,
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        passportNo: formData.passportNo.trim() || undefined,
        nationality: formData.nationality.trim(),
        address1: formData.address1.trim(),
        address2: formData.address2.trim() || undefined,
        state: formData.state.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        districtOrigin: formData.districtOrigin.trim(),
        village: formData.village.trim() || undefined,
        relationshipWithBengal: formData.relationshipWithBengal.trim(),
        languages: formData.languages.trim(),
        interests: formData.interests.length > 0 ? formData.interests : undefined,
        volunteer: formData.volunteer === '1',
        receiveUpdates: formData.receiveUpdates,
        termsAccepted: true,
        captcha,
        captchaToken,
      });
      navigate(ROUTES.PUBLIC_THANK_YOU('diaspora', res.registrationNo));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check the highlighted fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={ROUTES.PUBLIC_CHOOSE_TYPE}>Home</Link></li>
          <li><span>Diaspora Registration</span></li>
        </ol>
      </nav>

      <header className="registration-page__header">
        <h1>Diaspora Registration</h1>
        <p>Register with Durga Puja Global Connect.</p>
      </header>

      {error && <Alert tone="danger">Please correct the highlighted fields and submit the form again. {error}</Alert>}

      <form onSubmit={handleSubmit} className="registration-form">
        <RegistrationSection title="PERSONAL INFORMATION" icon="user">
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="fullName">Full Name <span className="field__required">*</span></label>
              <input id="fullName" name="fullName" required className="field__control" value={formData.fullName} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="dob">Date of Birth <span className="field__required">*</span></label>
              <input id="dob" name="dob" type="date" required className="field__control" value={formData.dob} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="gender">Gender <span className="field__required">*</span></label>
              <select id="gender" name="gender" required className="field__control" value={formData.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="email">Email Address <span className="field__required">*</span></label>
              <input id="email" name="email" type="email" required className="field__control" value={formData.email} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="mobile">Mobile Number <span className="field__required">*</span></label>
              <input id="mobile" name="mobile" required className="field__control" value={formData.mobile} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="country">Country of Residence <span className="field__required">*</span></label>
              <input id="country" name="country" required className="field__control" value={formData.country} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="city">City <span className="field__required">*</span></label>
              <input id="city" name="city" required className="field__control" value={formData.city} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="passportNo">Passport / ID Number</label>
              <input id="passportNo" name="passportNo" className="field__control" value={formData.passportNo} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="nationality">Nationality <span className="field__required">*</span></label>
              <input id="nationality" name="nationality" required className="field__control" value={formData.nationality} onChange={handleChange} />
            </div>
          </div>
        </RegistrationSection>

        <RegistrationSection title="ADDRESS INFORMATION" icon="map-marker-alt">
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="address1">Address Line 1 <span className="field__required">*</span></label>
              <input id="address1" name="address1" required className="field__control" value={formData.address1} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="address2">Address Line 2</label>
              <input id="address2" name="address2" className="field__control" value={formData.address2} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="state">State / Province</label>
              <input id="state" name="state" className="field__control" value={formData.state} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="postalCode">Zip / Postal Code</label>
              <input id="postalCode" name="postalCode" className="field__control" value={formData.postalCode} onChange={handleChange} />
            </div>
          </div>
        </RegistrationSection>

        <RegistrationSection title="CONNECTION WITH BENGAL" icon="heart">
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="districtOrigin">Place of Origin in Bengal <span className="field__required">*</span></label>
              <input id="districtOrigin" name="districtOrigin" required className="field__control" value={formData.districtOrigin} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="village">Family Origin (Village / Town)</label>
              <input id="village" name="village" className="field__control" value={formData.village} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="relationshipWithBengal">How are you connected with Bengal? <span className="field__required">*</span></label>
              <input id="relationshipWithBengal" name="relationshipWithBengal" required className="field__control" value={formData.relationshipWithBengal} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="languages">Languages you speak <span className="field__required">*</span></label>
              <input id="languages" name="languages" required className="field__control" value={formData.languages} onChange={handleChange} />
            </div>
          </div>
        </RegistrationSection>

        <RegistrationSection title="INTERESTS & ENGAGEMENT" icon="hands-helping">
          <div className="registration-checkgrid">
            {INTEREST_OPTIONS.map((option) => (
              <label key={option.value} className="registration-check">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(option.value)}
                  onChange={() => toggleInterest(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <span className="field__label">Volunteer <span className="field__required">*</span></span>
            <div className="registration-radio-group">
              {[
                { value: '1', label: 'Yes' },
                { value: '0', label: 'No' },
              ].map((option) => (
                <label key={option.value} className="registration-radio">
                  <input
                    type="radio"
                    name="volunteer"
                    value={option.value}
                    required
                    checked={formData.volunteer === option.value}
                    onChange={handleChange}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </RegistrationSection>

        <RegistrationSection title="COMMUNICATION PREFERENCES" icon="bell">
          <label className="registration-check">
            <input type="checkbox" name="receiveUpdates" checked={formData.receiveUpdates} onChange={handleChange} />
            <span>Receive updates</span>
          </label>
          <label className="registration-check">
            <input type="checkbox" name="termsAccepted" required checked={formData.termsAccepted} onChange={handleChange} />
            <span>Agree to Terms &amp; Privacy Policy <span className="field__required">*</span></span>
          </label>
        </RegistrationSection>

        <RegistrationCaptcha
          value={captcha}
          token={captchaToken}
          onChange={setCaptcha}
          onTokenChange={setCaptchaToken}
        />

        <div className="form-actions">
          <Button type="button" variant="secondary" size="md" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Register'}
          </Button>
        </div>
      </form>
    </div>
  );
}
