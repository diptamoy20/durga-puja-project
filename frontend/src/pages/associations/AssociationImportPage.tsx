import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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

const sampleJson = JSON.stringify(
  [
    {
      name: 'Bengal Association of London',
      description: 'A community association promoting Bengali culture, language, and heritage.',
      establishedYear: 1985,
      contactPersonName: 'John Doe',
      designation: 'Secretary',
      email: 'info@bengallondon.example',
      mobile: '+44 20 7946 0958',
      website: 'https://bengallondon.example',
      socialLinks: { facebook: 'https://facebook.com/bengallondon' },
      country: 'United Kingdom',
      state: 'Greater London',
      city: 'London',
      postalCode: 'E14 9GE',
      address: '123 Community Hall, Canary Wharf, London',
    },
  ],
  null,
  2,
);

interface ImportResult {
  total: number;
  succeeded: number;
  failed: number;
  failures: Array<{ name: string; email: string; message: string }>;
}

export function AssociationImportPage() {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [form, setForm] = useState<CreateAssociationDto>({ ...emptyForm });
  const [importJson, setImportJson] = useState('');
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [singleResult, setSingleResult] = useState<{ id: number; registrationNo: string; status: string } | null>(null);
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
      setSingleResult(res);
      setForm({ ...emptyForm });
      toastSuccess(`Association created (${res.registrationNo})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create association.';
      toastError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = importJson.trim();
    if (!text) {
      toastWarning('Paste a JSON array of associations.');
      return;
    }
    let items: CreateAssociationDto[];
    try {
      items = JSON.parse(text);
    } catch {
      toastError('Invalid JSON.');
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      toastWarning('JSON must be a non-empty array.');
      return;
    }
    if (items.length > 100) {
      toastWarning('Maximum 100 associations per batch.');
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await associationService.import(items);
      setImportResult(res);
      setImportJson('');
      if (res.failed > 0) {
        toastWarning(`Import complete: ${res.succeeded} succeeded, ${res.failed} failed.`);
      } else {
        toastSuccess(`Import complete: ${res.succeeded} succeeded.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed.';
      toastError(msg);
    } finally {
      setImporting(false);
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-400)' }}>
        <h1 style={{ margin: '0 0 var(--space-100)', fontSize: 'var(--font-xl)' }}>Add / Import Associations</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Create a single association or bulk-import from JSON. All entries are created as <strong>PENDING</strong>
          and enter the review workflow before appearing in the public directory.
        </p>
      </div>

      <Card>
        <h2 style={{ margin: '0 0 var(--space-300)', fontSize: 'var(--font-lg)' }}>Add Single Association</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-300)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Association Name *
              </label>
              <input {...inputProps('name')} className="field__control" placeholder="Bengal Association of London" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Established Year
              </label>
              <input {...inputProps('establishedYear')} type="number" className="field__control" min="1900" max={new Date().getFullYear() + 1} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Description *
              </label>
              <textarea {...inputProps('description')} className="field__control" rows={3} placeholder="Mission, history, and community impact…" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Contact Person *
              </label>
              <input {...inputProps('contactPersonName')} className="field__control" placeholder="Dr. Amit Chatterjee" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Designation
              </label>
              <input {...inputProps('designation')} className="field__control" placeholder="President / Secretary" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Email *
              </label>
              <input {...inputProps('email')} type="email" className="field__control" placeholder="info@association.example" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Mobile *
              </label>
              <input {...inputProps('mobile')} className="field__control" placeholder="+44 7777 123456" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Website
              </label>
              <input {...inputProps('website')} className="field__control" placeholder="https://association.example" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Social Links
              </label>
              <input
                className="field__control"
                placeholder='{"facebook": "https://facebook.com/x", "instagram": "..."}'
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
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Country *
              </label>
              <input {...inputProps('country')} className="field__control" placeholder="United Kingdom" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                State / Region *
              </label>
              <input {...inputProps('state')} className="field__control" placeholder="Greater London" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                City *
              </label>
              <input {...inputProps('city')} className="field__control" placeholder="London" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Postal Code *
              </label>
              <input {...inputProps('postalCode')} className="field__control" placeholder="E14 9GE" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Full Address *
              </label>
              <textarea {...inputProps('address')} className="field__control" rows={2} placeholder="Complete mailing address…" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Logo Image (relative path)
              </label>
              <input {...inputProps('logoImage')} className="field__control" placeholder="association-documents/logo.png" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-100)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Cover Image (relative path)
              </label>
              <input {...inputProps('coverImage')} className="field__control" placeholder="association-documents/cover.png" />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-400)', display: 'flex', gap: 'var(--space-200)' }}>
            <Button type="submit" loading={creating}>
              Create Association
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setForm({ ...emptyForm }); setFormErrors({}); setSingleResult(null); }}>
              Clear
            </Button>
          </div>
        </form>
        {singleResult && (
          <Alert tone="success" style={{ marginTop: 'var(--space-300)' }}>
            Created: <strong>{singleResult.registrationNo}</strong> (ID: {singleResult.id}) — Status: {singleResult.status}
          </Alert>
        )}
      </Card>

      <Card style={{ marginTop: 'var(--space-500)' }}>
        <h2 style={{ margin: '0 0 var(--space-300)', fontSize: 'var(--font-lg)' }}>Bulk Import (JSON)</h2>
        <p style={{ margin: '0 0 var(--space-300)', color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
          Paste a JSON array of association objects. Each object must contain the required fields shown above.
          Maximum 100 items per batch. Every imported association is created as <strong>PENDING</strong> — it only
          appears in the public directory after an admin approves it.
        </p>
        <form onSubmit={handleImport}>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            className="field__control"
            rows={10}
            placeholder={sampleJson}
          />
          <div style={{ marginTop: 'var(--space-300)', display: 'flex', gap: 'var(--space-200)' }}>
            <Button type="submit" loading={importing}>
              Import Associations
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setImportJson(''); setImportResult(null); }}>
              Clear
            </Button>
          </div>
        </form>
        {importResult && (
          <div style={{ marginTop: 'var(--space-300)' }}>
            <Alert tone={importResult.failed > 0 ? 'warning' : 'success'}>
              <strong>Total:</strong> {importResult.total} &nbsp;|&nbsp;
              <strong>Succeeded:</strong> {importResult.succeeded} &nbsp;|&nbsp;
              <strong>Failed:</strong> {importResult.failed}
            </Alert>
            {importResult.failures.length > 0 && (
              <details style={{ marginTop: 'var(--space-200)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Show failures ({importResult.failures.length})</summary>
                <ul style={{ margin: 'var(--space-200) 0 0', paddingLeft: 'var(--space-400)', color: 'var(--color-danger)' }}>
                  {importResult.failures.map((f, i) => (
                    <li key={i}>
                      <strong>{f.name}</strong> ({f.email}): {f.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}