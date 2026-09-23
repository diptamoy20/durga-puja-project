import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { AssociationImageField } from '@/components/associations/AssociationImageField';
import { ROUTES } from '@/constants/routes';
import { associationService, type AssociationDetail, type CreateAssociationDto } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';

function toForm(a: AssociationDetail): CreateAssociationDto {
  return {
    name: a.name,
    description: a.description,
    establishedYear: a.establishedYear ?? undefined,
    contactPersonName: a.contactPersonName,
    designation: a.designation,
    email: a.email,
    mobile: a.mobile,
    website: a.website ?? undefined,
    socialLinks: a.socialLinks ?? {},
    country: a.country,
    state: a.state,
    city: a.city,
    postalCode: a.postalCode,
    address: a.address,
    logoImage: a.logoImage ?? undefined,
    coverImage: a.coverImage ?? undefined,
  };
}

export function AssociationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [form, setForm] = useState<CreateAssociationDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    associationService
      .adminGet(Number(id))
      .then((a) => setForm(toForm(a)))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Association not found.'));
  }, [id]);

  const set = useCallback(
    <K extends keyof CreateAssociationDto>(key: K, value: CreateAssociationDto[K]) => {
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form) return;
    setSubmitting(true);
    try {
      const updated = await associationService.update(Number(id), form);
      toastSuccess(`Association "${updated.name}" updated.`);
      navigate(ROUTES.ASSOCIATION_DETAIL(Number(id)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update association.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="page">
        <Alert tone="danger">{loadError}</Alert>
        <Link to={ROUTES.ASSOCIATIONS} className="btn btn--secondary btn--md" style={{ marginTop: 'var(--space-300)' }}>
          Back to directory
        </Link>
      </div>
    );
  }

  if (!form) return <PageLoader />;

  const field = <K extends keyof CreateAssociationDto>(key: K) => ({
    value: form[key],
    onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = ev.target.type === 'number' ? Number(ev.target.value) : ev.target.value;
      set(key, value as CreateAssociationDto[K]);
    },
  });

  const idLabel = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const LabeledField = ({
    label,
    required,
    fullWidth,
    children,
  }: {
    label: string;
    required?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="field" style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <label className="field__label" htmlFor={idLabel(label)}>
        {label}
        {required && <span className="field__required"> *</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="page">
      <header className="page__header">
        <Link to={ROUTES.ASSOCIATION_DETAIL(Number(id))} className="btn btn--secondary btn--sm">
          Back to details
        </Link>
        <div>
          <h1 className="page__title">Edit Association</h1>
          <p className="page__subtitle">Update the association profile and contact details.</p>
        </div>
      </header>

      <Card title="Association Details">
        <form onSubmit={handleSubmit}>
          <div className="form-grid form-grid--2">
            <LabeledField label="Association Name" required>
              <input id={idLabel('Association Name')} {...field('name')} className="field__control" placeholder="Bengali Cultural Association, Kolkata" required />
            </LabeledField>
            <LabeledField label="Established Year">
              <input id={idLabel('Established Year')} {...field('establishedYear')} type="number" className="field__control" min="1900" max={new Date().getFullYear() + 1} />
            </LabeledField>
            <LabeledField label="Description" required fullWidth>
              <textarea id={idLabel('Description')} {...field('description')} className="field__control" rows={3} placeholder="Mission, history, and community impact…" required />
            </LabeledField>
            <LabeledField label="Contact Person" required>
              <input id={idLabel('Contact Person')} {...field('contactPersonName')} className="field__control" placeholder="Dr. Amit Chatterjee" required />
            </LabeledField>
            <LabeledField label="Designation">
              <input id={idLabel('Designation')} {...field('designation')} className="field__control" placeholder="President / Secretary" />
            </LabeledField>
            <LabeledField label="Email" required>
              <input id={idLabel('Email')} {...field('email')} type="email" className="field__control" placeholder="info@bengalassociation.example" required />
            </LabeledField>
            <LabeledField label="Mobile" required>
              <input id={idLabel('Mobile')} {...field('mobile')} className="field__control" placeholder="+91 xxxxx xxxxx" required />
            </LabeledField>
            <LabeledField label="Website">
              <input id={idLabel('Website')} {...field('website')} className="field__control" placeholder="https://bengalassociation.example" />
            </LabeledField>
            <LabeledField label="Country" required>
              <input id={idLabel('Country')} {...field('country')} className="field__control" placeholder="India" required />
            </LabeledField>
            <LabeledField label="State / Region" required>
              <input id={idLabel('State / Region')} {...field('state')} className="field__control" placeholder="West Bengal" required />
            </LabeledField>
            <LabeledField label="City" required>
              <input id={idLabel('City')} {...field('city')} className="field__control" placeholder="Kolkata" required />
            </LabeledField>
            <LabeledField label="Postal Code" required>
              <input id={idLabel('Postal Code')} {...field('postalCode')} className="field__control" placeholder="700001" required />
            </LabeledField>
            <LabeledField label="Full Address" required fullWidth>
              <textarea id={idLabel('Full Address')} {...field('address')} className="field__control" rows={2} placeholder="Complete mailing address…" required />
            </LabeledField>
            <AssociationImageField
              id={idLabel('Logo Image')}
              label="Logo Image"
              value={form.logoImage}
              onChange={(path) => set('logoImage', path ?? undefined)}
            />
            <AssociationImageField
              id={idLabel('Cover Image')}
              label="Cover Image"
              value={form.coverImage}
              onChange={(path) => set('coverImage', path ?? undefined)}
            />
          </div>
          <div className="form-actions">
            <Button type="submit" loading={submitting}>Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ASSOCIATION_DETAIL(Number(id)))}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}