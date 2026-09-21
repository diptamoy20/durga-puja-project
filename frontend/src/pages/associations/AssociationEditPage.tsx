import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Alert tone="danger">{loadError}</Alert>
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

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 var(--space-300)', fontSize: 'var(--font-xl)' }}>Edit Association</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-300)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Association Name *</label>
              <input {...field('name')} className="field__control" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Established Year</label>
              <input {...field('establishedYear')} type="number" className="field__control" min="1900" max={new Date().getFullYear() + 1} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Description *</label>
              <textarea {...field('description')} className="field__control" rows={3} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Contact Person *</label>
              <input {...field('contactPersonName')} className="field__control" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Designation</label>
              <input {...field('designation')} className="field__control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Email *</label>
              <input {...field('email')} type="email" className="field__control" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Mobile *</label>
              <input {...field('mobile')} className="field__control" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Website</label>
              <input {...field('website')} className="field__control" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Country *</label>
              <input {...field('country')} className="field__control" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>State / Region *</label>
              <input {...field('state')} className="field__control" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>City *</label>
              <input {...field('city')} className="field__control" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Postal Code *</label>
              <input {...field('postalCode')} className="field__control" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Full Address *</label>
              <textarea {...field('address')} className="field__control" rows={2} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Logo Image (relative path)</label>
              <input {...field('logoImage')} className="field__control" placeholder="association-documents/logo.png" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>Cover Image (relative path)</label>
              <input {...field('coverImage')} className="field__control" placeholder="association-documents/cover.png" />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-400)', display: 'flex', gap: 'var(--space-200)' }}>
            <Button type="submit" loading={submitting}>Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ASSOCIATION_DETAIL(Number(id)))}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}