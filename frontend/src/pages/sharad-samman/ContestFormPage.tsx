import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { sammanService } from '@/services/sammanService';
import { useToast } from '@/hooks/useToast';
import type { Contest, ContestStatus } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

function toInputDate(isoStr?: string | null): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function ContestFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingContest, setExistingContest] = useState<Contest | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ContestStatus>('DRAFT');

  // Load existing contest when in edit mode
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    sammanService
      .getContest(Number(id))
      .then((c) => {
        setExistingContest(c);
        setName(c.name);
        setYear(c.year);
        setDescription(c.description || '');
        setStartDate(toInputDate(c.startDate));
        setEndDate(toInputDate(c.endDate));
        setStatus(c.status);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load contest details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Contest Name is required.');
      return;
    }

    if (!year || isNaN(Number(year))) {
      setError('Valid Contest Year is required.');
      return;
    }

    const numYear = Number(year);
    if (numYear < 2000 || numYear > 2100) {
      setError('Contest Year must be between 2000 and 2100.');
      return;
    }

    if (!startDate) {
      setError('Start Date is required.');
      return;
    }

    if (!endDate) {
      setError('Last Date is required.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start Date cannot be after Last Date.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await sammanService.updateContest(Number(id), {
          name: trimmedName,
          year: numYear,
          description: description.trim() || undefined,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(`${endDate}T23:59:59.999Z`).toISOString(),
          status,
        });
        toast.success(`Contest "${trimmedName}" updated successfully.`);
      } else {
        await sammanService.createContest({
          name: trimmedName,
          year: numYear,
          description: description.trim() || undefined,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(`${endDate}T23:59:59.999Z`).toISOString(),
          status,
        });
        toast.success(`Contest "${trimmedName}" created successfully.`);
      }
      navigate(ROUTES.SHARAD_SAMMAN_CONTESTS);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save contest.');
    } finally {
      setSubmitting(false);
    }
  };

  const nominationCount = existingContest?._count?.nominations ?? 0;

  if (loading) {
    return (
      <div className="page samman-page">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="page samman-page" id="contest-form-page">
      {/* Header */}
      <header className="page__header">
        <div className="page__titles">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link></li>
              <li><Link to={ROUTES.SHARAD_SAMMAN_CONTESTS}>Contest Session</Link></li>
              <li><span>{isEdit ? 'Edit Contest' : 'Create Contest'}</span></li>
            </ol>
          </nav>
          <h1 className="page__title">
            {isEdit ? `Edit Contest: ${existingContest?.name || ''}` : 'Create Sharad Samman Contest'}
          </h1>
          <p className="page__subtitle">
            {isEdit
              ? 'Update competition metadata, year, schedules, and active status in-place.'
              : 'Set up a new edition of the Sharad Samman award competition.'}
          </p>
        </div>

        <div className="page__actions">
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTESTS)}
          >
            <i className="fas fa-arrow-left" aria-hidden="true" style={{ marginRight: '6px' }} />
            Back to Contests
          </Button>
        </div>
      </header>

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </Alert>
      )}

      {/* In-place Edit Safeguard Notice */}
      {isEdit && (
        <Alert variant="info" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <i className="fas fa-shield-halved" aria-hidden="true" style={{ fontSize: '1.1rem' }} />
            <div>
              <strong>In-Place Update:</strong> Editing modifies Contest #{id} directly. All{' '}
              <strong>{nominationCount}</strong> associated nominations remain securely linked to this contest.
            </div>
          </div>
        </Alert>
      )}

      {/* Main Form Card Container */}
      <div className="contest-form-card">
        <Card title={isEdit ? 'Contest Configuration' : 'New Contest Details'}>
          <form onSubmit={handleSubmit} className="form" noValidate>
            <div className="contest-form-grid">
              {/* Row 1: Contest Name (2/3) + Contest Year (1/3) */}
              <div className="field contest-form-grid__col-2">
                <label htmlFor="contest-name" className="field__label">
                  Contest Name <span className="field__required">*</span>
                </label>
                <input
                  type="text"
                  id="contest-name"
                  className="field__control contest-form-control"
                  placeholder="e.g. Sharad Samman 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={150}
                  required
                />
                <p className="field__hint">
                  The official public and administrative title of this competition edition.
                </p>
              </div>

              <div className="field contest-form-grid__col-1">
                <label htmlFor="contest-year" className="field__label">
                  Contest Year <span className="field__required">*</span>
                </label>
                <input
                  type="number"
                  id="contest-year"
                  className="field__control contest-form-control"
                  placeholder="e.g. 2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
                  min={2000}
                  max={2100}
                  required
                />
                <p className="field__hint">
                  Calendar festival year (e.g. 2026).
                </p>
              </div>

              {/* Row 2: Start Date (1/3) + Last Date (1/3) + Status (1/3) */}
              <div className="field contest-form-grid__col-1">
                <label htmlFor="contest-start-date" className="field__label">
                  Start Date <span className="field__required">*</span>
                </label>
                <input
                  type="date"
                  id="contest-start-date"
                  className="field__control contest-form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <p className="field__hint">
                  Date when nominations open.
                </p>
              </div>

              <div className="field contest-form-grid__col-1">
                <label htmlFor="contest-end-date" className="field__label">
                  Last Date / Deadline <span className="field__required">*</span>
                </label>
                <input
                  type="date"
                  id="contest-end-date"
                  className="field__control contest-form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
                <p className="field__hint">
                  Submission cutoff for Puja Committees.
                </p>
              </div>

              <div className="field contest-form-grid__col-1">
                <label htmlFor="contest-status" className="field__label">
                  Status <span className="field__required">*</span>
                </label>
                <select
                  id="contest-status"
                  className="field__control contest-form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContestStatus)}
                >
                  <option value="DRAFT">DRAFT (Internal Preparation)</option>
                  <option value="ACTIVE">ACTIVE (Accepting Nominations)</option>
                  <option value="CLOSED">CLOSED (Evaluation / Finished)</option>
                </select>
                <p className="field__hint">
                  Active status displays on committee nomination portals.
                </p>
              </div>

              {/* Row 3: Description (full width 3/3) */}
              <div className="field contest-form-grid__col-3">
                <label htmlFor="contest-description" className="field__label">
                  Description <span className="field__optional">(Optional)</span>
                </label>
                <textarea
                  id="contest-description"
                  className="field__control contest-form-textarea"
                  placeholder="Provide award categories overview, eligibility criteria notes, or competition guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="field__hint">
                  Optional description displayed on competition dashboards and informational cards.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--colour-border)',
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(ROUTES.SHARAD_SAMMAN_CONTESTS)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                id="btn-submit-contest"
                loading={submitting}
              >
                <i className="fas fa-check" aria-hidden="true" style={{ marginRight: '6px' }} />
                {isEdit ? 'Save Changes' : 'Create Contest'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
