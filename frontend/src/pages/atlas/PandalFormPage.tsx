import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { adminAtlasService } from '@/services/atlasService';
import { committeeService } from '@/services/registrationService';
import { useToast } from '@/hooks/useToast';
import type { PandalFormValues } from '@/types/atlas';
import type { PujaCommittee } from '@/types/registration';

export function PandalFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [committees, setCommittees] = useState<PujaCommittee[]>([]);
  const [formData, setFormData] = useState<PandalFormValues>({
    name: '',
    location: '',
    latitude: 22.5726,
    longitude: 88.3639,
    pujaCommitteeId: 0,
    timing: '6:00 AM - 12:00 AM',
    specialFeatures: '',
    theme: '',
    artisan: '',
    history: '',
    pujaType: 'Community',
    footfall: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    committeeService
      .list({ perPage: 100, status: 'APPROVED' })
      .then((res) => {
        setCommittees(res.items);
        if (!isEdit && res.items.length > 0 && !formData.pujaCommitteeId) {
          setFormData((prev) => ({ ...prev, pujaCommitteeId: res.items[0].id }));
        }
      })
      .catch(() => {});
  }, [isEdit, formData.pujaCommitteeId]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminAtlasService
      .get(Number(id))
      .then((p) => {
        setFormData({
          name: p.name,
          location: p.location,
          latitude: p.latitude,
          longitude: p.longitude,
          pujaCommitteeId: p.pujaCommitteeId,
          timing: p.timing,
          specialFeatures: p.specialFeatures,
          theme: p.theme ?? '',
          artisan: p.artisan ?? '',
          history: p.history ?? '',
          pujaType: p.pujaType ?? 'Community',
          footfall: p.footfall ?? '',
          contactPhone: p.contactPhone ?? '',
          contactEmail: p.contactEmail ?? '',
          website: p.website ?? '',
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load pandal.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'latitude' || name === 'longitude'
          ? parseFloat(value) || 0
          : name === 'pujaCommitteeId'
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim() || !formData.pujaCommitteeId) {
      toast.warning('Please enter pandal name, location, and select committee.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await adminAtlasService.update(Number(id), formData);
        toast.success('Pandal updated successfully.');
        navigate(ROUTES.PANDAL_ATLAS_DETAIL(id));
      } else {
        const created = await adminAtlasService.create(formData);
        toast.success('Pandal created successfully.');
        navigate(ROUTES.PANDAL_ATLAS_DETAIL(created.id));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save pandal.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="page__header">
        <div style={{ marginBottom: 'var(--space-100)' }}>
          <Link to={ROUTES.PANDAL_ATLAS} className="btn btn--secondary btn--sm">
            ← Back to Pandals
          </Link>
        </div>
        <h1 className="page__title">{isEdit ? 'Edit Pandal' : 'Add New Pandal'}</h1>
        <p className="page__subtitle">
          Configure geographic coordinates, special attractions, and visitor information.
        </p>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-400)' }}>
          <Card title="Pandal Identification">
            <div className="field">
              <label className="field__label" htmlFor="pName">Pandal Name *</label>
              <input
                id="pName"
                name="name"
                type="text"
                required
                className="field__control"
                placeholder="e.g. Bagbazar Sarbojanin"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pCommittee">Puja Committee *</label>
              <select
                id="pCommittee"
                name="pujaCommitteeId"
                required
                className="field__control"
                value={formData.pujaCommitteeId}
                onChange={handleChange}
              >
                <option value="">Select Committee</option>
                {committees.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.committeeName} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pTheme">Theme / Concept</label>
              <input
                id="pTheme"
                name="theme"
                type="text"
                className="field__control"
                placeholder="e.g. Traditional Bengal Terracotta"
                value={formData.theme ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pArtisan">Idol Artisan / Sculptor</label>
              <input
                id="pArtisan"
                name="artisan"
                type="text"
                className="field__control"
                placeholder="e.g. Sanatan Dinda"
                value={formData.artisan ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pTiming">Visitor Timing *</label>
              <input
                id="pTiming"
                name="timing"
                type="text"
                required
                className="field__control"
                value={formData.timing}
                onChange={handleChange}
              />
            </div>
          </Card>

          <Card title="Geographic Location">
            <div className="field">
              <label className="field__label" htmlFor="pLocation">Location / Address *</label>
              <input
                id="pLocation"
                name="location"
                type="text"
                required
                className="field__control"
                placeholder="e.g. Bagbazar, North Kolkata"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="pLat">Latitude *</label>
                <input
                  id="pLat"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  required
                  className="field__control"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="pLng">Longitude *</label>
                <input
                  id="pLng"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  required
                  className="field__control"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-200)' }}>
              Coordinates place the pin on the interactive Map Atlas for thousands of festival visitors.
            </p>

            <div className="field">
              <label className="field__label" htmlFor="pFootfall">Expected Daily Footfall</label>
              <input
                id="pFootfall"
                name="footfall"
                type="text"
                className="field__control"
                placeholder="e.g. 50,000+"
                value={formData.footfall ?? ''}
                onChange={handleChange}
              />
            </div>
          </Card>

          <Card title="Attractions & Contact" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="pPhone">Contact Phone</label>
                <input
                  id="pPhone"
                  name="contactPhone"
                  type="tel"
                  className="field__control"
                  value={formData.contactPhone ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="pEmail">Contact Email</label>
                <input
                  id="pEmail"
                  name="contactEmail"
                  type="email"
                  className="field__control"
                  value={formData.contactEmail ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="pWeb">Website / Social</label>
                <input
                  id="pWeb"
                  name="website"
                  type="url"
                  className="field__control"
                  placeholder="https://..."
                  value={formData.website ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="pSpecial">Special Features & Attractions *</label>
                <textarea
                  id="pSpecial"
                  name="specialFeatures"
                  rows={3}
                  required
                  className="field__control"
                  placeholder="Describe illumination, architectural highlights, prasad distribution..."
                  value={formData.specialFeatures}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="pHistory">Pandal History & Heritage</label>
                <textarea
                  id="pHistory"
                  name="history"
                  rows={3}
                  className="field__control"
                  placeholder="Historical heritage, founding stories, traditions..."
                  value={formData.history ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-200)', marginTop: 'var(--space-400)' }}>
          <Link to={ROUTES.PANDAL_ATLAS} className="btn btn--secondary btn--md">
            Cancel
          </Link>
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Pandal' : 'Create Pandal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
