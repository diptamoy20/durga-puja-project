import { useEffect, useState } from 'react';

import { associationService } from '@/services/associationService';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

interface AssociationImageFieldProps {
  id: string;
  label: string;
  /** Current stored relative path (e.g. `association-documents/logo.png`). */
  value: string | undefined;
  /** Called with the stored path after a successful upload, or without a value when cleared. */
  onChange: (path: string | undefined) => void;
  hint?: string;
  error?: string;
}

/**
 * Upload control for association logo / cover images. Hides the native file
 * input and uploads the selection through the existing association file
 * endpoint, storing the returned relative path in the form value.
 */
export function AssociationImageField({ id, label, value, onChange, hint, error }: AssociationImageFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = '';
    if (!file) return;

    setLocalError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError('Only PNG, JPG, JPEG, or WebP images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setLocalError('Image must be 10 MB or smaller.');
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setSelectedFile(file);
    setObjectUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { storedPath } = await associationService.uploadImage(file);
      onChange(storedPath);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const shownError = localError ?? error;
  const previewSrc = objectUrl ?? (value ? associationService.fileUrl(value) : null);
  const fileName = selectedFile ? selectedFile.name : value ? value.split('/').pop() : null;
  const errorId = `${id}-error`;

  return (
    <div className={`field ${shownError ? 'field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleChange} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-300)', alignItems: 'center' }}>
        <label htmlFor={id} className="upload-button upload-button--secondary" style={{ cursor: 'pointer' }}>
          <i className="fas fa-upload" aria-hidden="true" /> Choose File
        </label>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
          {uploading ? (
            'Uploading…'
          ) : fileName ? (
            <strong style={{ color: 'var(--color-text)' }}>{fileName}</strong>
          ) : (
            'No file selected'
          )}
        </span>
      </div>
      {previewSrc && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <img
            src={previewSrc}
            alt={label}
            style={{
              maxWidth: 160,
              maxHeight: 90,
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--colour-border)',
            }}
          />
        </div>
      )}
      {shownError ? (
        <p className="field__error" id={errorId} role="alert">
          {shownError}
        </p>
      ) : (
        <p className="field__hint">{hint ?? 'PNG, JPG, JPEG or WebP · max 10 MB'}</p>
      )}
    </div>
  );
}