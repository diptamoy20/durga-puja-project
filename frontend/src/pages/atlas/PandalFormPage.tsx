import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CoordinatePickerMap } from '@/components/atlas/CoordinatePickerMap';
import { GalleryModuleHeader } from '@/components/gallery/GalleryModuleHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { adminAtlasService } from '@/services/atlasService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { atlasFileUrl, ATLAS_LIST_LABEL } from '@/utils/atlasHelpers';
import type { AtlasFormCommitteeOption, PandalFormValues } from '@/types/atlas';

export function PandalFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { can } = useAuth();
  const isModerator = can(PERMISSIONS.MODERATE_PANDAL_ATLAS);

  const [committees, setCommittees] = useState<AtlasFormCommitteeOption[]>([]);
  const [formIsModerator, setFormIsModerator] = useState(isModerator);
  const [linkedCommitteeName, setLinkedCommitteeName] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [removePhotos, setRemovePhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [virtualTourFile, setVirtualTourFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<PandalFormValues>({
    name: '',
    location: '',
    latitude: 22.572646,
    longitude: 88.363895,
    pujaCommitteeId: 0,
    timing: '',
    ritualSchedule: '',
    livestreamUrl: '',
    virtualTourUrl: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('DRAFT');

  useEffect(() => {
    adminAtlasService
      .formOptions()
      .then((options) => {
        setFormIsModerator(options.isModerator);
        setCommittees(options.committees);
        if (options.isModerator) {
          if (!isEdit && options.defaultCommitteeId) {
            setFormData((prev) => ({
              ...prev,
              pujaCommitteeId: prev.pujaCommitteeId || options.defaultCommitteeId!,
            }));
          }
          return;
        }
        const committee = options.committees[0];
        setLinkedCommitteeName(committee?.committeeName ?? null);
        if (options.defaultCommitteeId) {
          setFormData((prev) => ({ ...prev, pujaCommitteeId: options.defaultCommitteeId! }));
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load committee options.');
      });
  }, [isEdit]);

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
          ritualSchedule: p.ritualSchedule ?? '',
          livestreamUrl: p.livestreamUrl ?? '',
          virtualTourUrl: p.virtualTourUrl && p.virtualTourUrl.startsWith('http') ? p.virtualTourUrl : '',
        });
        setExistingPhotos(Array.isArray(p.photos) ? p.photos : p.photoUrls ?? []);
        setRejectionRemarks(p.rejectionRemarks);
        setStatus(p.status);
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewPhotos(files);
    setNewPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const toggleRemovePhoto = (path: string) => {
    setRemovePhotos((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const save = async (action: 'draft' | 'submit' | 'save') => {
    if (!formData.name.trim() || !formData.location.trim() || !formData.timing.trim()) {
      toast.warning('Please enter pandal name, location, and visiting hours.');
      return;
    }
    if (formIsModerator && !formData.pujaCommitteeId) {
      toast.warning('Please select a Puja Committee.');
      return;
    }
    if (!formIsModerator && !formData.pujaCommitteeId) {
      toast.warning('No approved committee is linked to your account.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = { ...formData, action };
      if (isEdit && id) {
        await adminAtlasService.update(
          Number(id),
          { ...payload, removePhotos },
          newPhotos,
          virtualTourFile,
        );
        toast.success(action === 'submit' ? 'Pandal updated and submitted for moderation.' : 'Pandal updated successfully.');
        navigate(ROUTES.PANDAL_ATLAS_DETAIL(id));
      } else {
        const created = await adminAtlasService.create(payload, newPhotos, virtualTourFile);
        toast.success(
          action === 'submit'
            ? 'Pandal created and submitted for moderation.'
            : 'Pandal saved as draft.',
        );
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
      <GalleryModuleHeader
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: ATLAS_LIST_LABEL, to: ROUTES.PANDAL_ATLAS },
          { label: isEdit ? 'Edit Pandal' : 'Add New Pandal' },
        ]}
        title={isEdit ? 'Edit Pandal Entry' : 'Add New Pandal'}
        subtitle="Create a pandal entry with location coordinates, photos, ritual schedule, and digital experience links."
      />

      {rejectionRemarks && status === 'REJECTED' && (
        <Alert tone="danger">
          <strong>Moderator feedback:</strong> {rejectionRemarks}
        </Alert>
      )}

      {error && <Alert tone="danger">{error}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 'var(--space-400)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <Card title="Pandal Information">
            {formIsModerator ? (
              <div className="field">
                <label className="field__label" htmlFor="pCommittee">Puja Committee *</label>
                <select
                  id="pCommittee"
                  name="pujaCommitteeId"
                  required
                  className="field__control"
                  value={formData.pujaCommitteeId || ''}
                  onChange={handleChange}
                >
                  <option value="">-- Select Puja Committee --</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.committeeName} ({c.registrationNo ?? 'No Reg'})
                    </option>
                  ))}
                </select>
              </div>
            ) : linkedCommitteeName ? (
              <div className="field">
                <label className="field__label">Puja Committee</label>
                <input
                  type="text"
                  className="field__control"
                  value={linkedCommitteeName}
                  readOnly
                  disabled
                />
                <p className="field__hint">Atlas entries are linked to your approved committee automatically.</p>
              </div>
            ) : null}

            <div className="field">
              <label className="field__label" htmlFor="pName">Pandal Name *</label>
              <input
                id="pName"
                name="name"
                type="text"
                required
                className="field__control"
                placeholder="e.g. Bagbazar Sarbojanin Durgotsav"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pLocation">Location / Detailed Address *</label>
              <textarea
                id="pLocation"
                name="location"
                rows={3}
                required
                className="field__control"
                placeholder="Full street address, locality, city, PIN"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pTiming">Visiting Hours / Timing *</label>
              <input
                id="pTiming"
                name="timing"
                type="text"
                required
                className="field__control"
                placeholder="e.g. 8:00 AM – Midnight (Open 24 hrs for Sasthi to Dashami)"
                value={formData.timing}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pRitual">Ritual Schedule</label>
              <textarea
                id="pRitual"
                name="ritualSchedule"
                rows={5}
                className="field__control"
                placeholder="Day-by-day key puja timings (Saptami, Ashtami Sandhi Puja, Navami, Dashami)..."
                value={formData.ritualSchedule ?? ''}
                onChange={handleChange}
              />
            </div>
          </Card>

          <Card title="Pandal Photos">
            {isEdit && existingPhotos.length > 0 && (
              <div style={{ marginBottom: 'var(--space-300)' }}>
                <p className="field__label">Current Photos (check to delete)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-200)' }}>
                  {existingPhotos.map((path, idx) => (
                    <label
                      key={`${path}-${idx}`}
                      style={{
                        position: 'relative',
                        width: 120,
                        height: 90,
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: removePhotos.includes(path) ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                      }}
                    >
                      <img
                        src={atlasFileUrl(path)}
                        alt={`Existing ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 'var(--font-xs)' }}>
                        <input
                          type="checkbox"
                          checked={removePhotos.includes(path)}
                          onChange={() => toggleRemovePhoto(path)}
                        />{' '}
                        Delete
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label className="field__label" htmlFor="pPhotos">
                {isEdit ? 'Upload Additional Photos' : 'Upload Photo Gallery'}
              </label>
              <input
                id="pPhotos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="field__control"
                onChange={handlePhotoSelect}
              />
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                Up to 10 photos (JPG, PNG, WebP, max 10MB each). First image is the primary thumbnail.
              </p>
            </div>

            {newPhotoPreviews.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-150)' }}>
                {newPhotoPreviews.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <Card title="Map Coordinates">
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-200)' }}>
              Click anywhere on the map or drag the pin marker to auto-fill accurate coordinates.
            </p>
            <CoordinatePickerMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={(lat, lng) => setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-200)', marginTop: 'var(--space-300)' }}>
              <div className="field">
                <label className="field__label" htmlFor="pLat">Latitude *</label>
                <input
                  id="pLat"
                  name="latitude"
                  type="number"
                  step="any"
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
                  step="any"
                  required
                  className="field__control"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="Digital Experience (Optional)">
            <div className="field">
              <label className="field__label" htmlFor="pLive">Livestream URL</label>
              <input
                id="pLive"
                name="livestreamUrl"
                type="url"
                className="field__control"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.livestreamUrl ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pTour">Virtual Tour / 360° View URL</label>
              <input
                id="pTour"
                name="virtualTourUrl"
                type="url"
                className="field__control"
                placeholder="Paste link (Matterport, Google Maps, etc.)"
                value={formData.virtualTourUrl ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="pTourFile">Or upload a 360° photo</label>
              <input
                id="pTourFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="field__control"
                onChange={(e) => setVirtualTourFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </Card>

          <Card>
            <div style={{ display: 'grid', gap: 'var(--space-200)' }}>
              {(!isEdit || status === 'DRAFT' || status === 'REJECTED') && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={saving}
                  onClick={() => save('submit')}
                >
                  {isEdit ? 'Save & Submit for Moderation' : 'Submit for Moderation'}
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={saving}
                onClick={() => save(isEdit ? 'save' : 'draft')}
              >
                {isEdit ? 'Update Pandal' : 'Save as Draft'}
              </Button>
              <Link to={isEdit && id ? ROUTES.PANDAL_ATLAS_DETAIL(id) : ROUTES.PANDAL_ATLAS} className="btn btn--link">
                Cancel
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
