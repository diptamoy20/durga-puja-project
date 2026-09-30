import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AssociationImageField } from '@/components/associations/AssociationImageField';
import { ROUTES } from '@/constants/routes';
import { associationService, type CreateAssociationDto } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';

const emptyForm: CreateAssociationDto = {
  name: '',
  description: '',
  establishedYear: new Date().getFullYear(),
  contactPersonName: '',
  designation: '',
  email: '',
  mobile: '',
  website: '',
  socialLinks: {},
  country: '',
  state: '',
  city: '',
  postalCode: '',
  address: '',
  logoImage: '',
  coverImage: '',
};

export function AssociationCreatePage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateAssociationDto>({ ...emptyForm });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ id: number; registrationNo: string; status: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateAssociationDto, string>>>({});

  const validateForm = (data: CreateAssociationDto): Partial<Record<keyof CreateAssociationDto, string>> => {
    const errors: Partial<Record<keyof CreateAssociationDto, string>> = {};
    if (!data.name.trim() || data.name.trim().length < 2) errors.name = 'Association name is required.';
    if (!data.description.trim() || data.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    }
    if (data.establishedYear !== undefined && (data.establishedYear < 1900 || data.establishedYear > new Date().getFullYear() + 1)) {
      errors.establishedYear = 'Enter a valid year between 1900 and next year.';
    }
    if (!data.contactPersonName.trim()) errors.contactPersonName = 'Contact person name is required.';
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!data.mobile.trim()) errors.mobile = 'Mobile number is required.';
    if (!data.country.trim()) errors.country = 'Country is required.';
    if (!data.state.trim()) errors.state = 'State / region is required.';
    if (!data.city.trim()) errors.city = 'City is required.';
    if (!data.postalCode.trim()) errors.postalCode = 'Postal code is required.';
    if (!data.address.trim() || data.address.trim().length < 5) {
      errors.address = 'Full address must be at least 5 characters.';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setCreating(true);
    try {
      const res = await associationService.create(form);
      setCreated(res);
      setForm({ ...emptyForm });
      toastSuccess(`Association created (${res.registrationNo})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create association.';
      toastError(msg);
    } finally {
      setCreating(false);
    }
  };

  const inputProps = (name: keyof CreateAssociationDto) => ({
    value: form[name] as string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    error: formErrors[name],
  });

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={ROUTES.DASHBOARD}>Dashboard</Link></li>
          <li><span>Add Association</span></li>
        </ol>
      </nav>

      <header className="page__header">
        <Link to={ROUTES.ASSOCIATIONS} className="btn btn--secondary btn--sm">
          Back to Directory
        </Link>
        <div>
          <h1 className="page__title">Add Association</h1>
          <p className="page__subtitle">
            Manually create a single association. It is created as PENDING and enters the review workflow before
            appearing in the public directory.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <Card title="Association Details">
          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field__label" htmlFor="createName">Association Name <span className="field__required">*</span></label>
              <input id="createName" {...inputProps('name')} className="field__control" placeholder="Bengali Cultural Association, Kolkata" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createEstablishedYear">Established Year</label>
              <input id="createEstablishedYear" {...inputProps('establishedYear')} type="number" className="field__control" min="1900" max={new Date().getFullYear() + 1} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label" htmlFor="createDescription">Description <span className="field__required">*</span></label>
              <textarea id="createDescription" {...inputProps('description')} className="field__control" rows={3} placeholder="Mission, history, and community impact…" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createContactPerson">Contact Person <span className="field__required">*</span></label>
              <input id="createContactPerson" {...inputProps('contactPersonName')} className="field__control" placeholder="Dr. Amit Chatterjee" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createDesignation">Designation</label>
              <input id="createDesignation" {...inputProps('designation')} className="field__control" placeholder="President / Secretary" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createEmail">Email <span className="field__required">*</span></label>
              <input id="createEmail" {...inputProps('email')} type="email" className="field__control" placeholder="info@bengalassociation.example" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createMobile">Mobile <span className="field__required">*</span></label>
              <input id="createMobile" {...inputProps('mobile')} className="field__control" placeholder="+91 xxxxx xxxxx" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createWebsite">Website</label>
              <input id="createWebsite" {...inputProps('website')} className="field__control" placeholder="https://bengalassociation.example" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createSocialLinks">Social Links</label>
              <input
                id="createSocialLinks"
                className="field__control"
                placeholder='{"facebook":"https://facebook.com/association","instagram":"https://instagram.com/association"}'
                value={Object.keys(form.socialLinks || {}).length ? JSON.stringify(form.socialLinks) : ''}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  let socialLinks: Record<string, string> = {};
                  if (raw) {
                    try {
                      const parsed = JSON.parse(raw);
                      if (parsed && typeof parsed === 'object') socialLinks = parsed;
                    } catch {
                      /* keep last valid value */
                    }
                  }
                  setForm((prev) => ({ ...prev, socialLinks }));
                }}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createCountry">Country <span className="field__required">*</span></label>
              <input id="createCountry" {...inputProps('country')} className="field__control" placeholder="India" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createState">State / Region <span className="field__required">*</span></label>
              <input id="createState" {...inputProps('state')} className="field__control" placeholder="West Bengal" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createCity">City <span className="field__required">*</span></label>
              <input id="createCity" {...inputProps('city')} className="field__control" placeholder="Kolkata" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="createPostalCode">Postal Code <span className="field__required">*</span></label>
              <input id="createPostalCode" {...inputProps('postalCode')} className="field__control" placeholder="700001" />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field__label" htmlFor="createAddress">Full Address <span className="field__required">*</span></label>
              <textarea id="createAddress" {...inputProps('address')} className="field__control" rows={2} placeholder="Complete mailing address…" />
            </div>
            <div className="field">
              <AssociationImageField
                id="createLogoImage"
                label="Logo Image"
                value={form.logoImage}
                onChange={(path) => setForm((prev) => ({ ...prev, logoImage: path ?? '' }))}
              />
            </div>
            <div className="field">
              <AssociationImageField
                id="createCoverImage"
                label="Cover Image"
                value={form.coverImage}
                onChange={(path) => setForm((prev) => ({ ...prev, coverImage: path ?? '' }))}
              />
            </div>
          </div>
          <div className="form-actions">
            <Button type="submit" loading={creating}>
              Create Association
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setForm({ ...emptyForm }); setFormErrors({}); setCreated(null); }}
            >
              Clear
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ASSOCIATIONS)}>
              Cancel
            </Button>
          </div>
        </Card>
      </form>

      {created && (
        <Alert tone="success" style={{ marginTop: 'var(--space-300)' }}>
          Created: <strong>{created.registrationNo}</strong> (ID: {created.id}) — Status: {created.status}
        </Alert>
      )}
    </div>
  );
}