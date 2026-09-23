import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatContestDate, SUGGESTED_CATEGORIES } from '@/constants/samman';
import { committeeSammanService } from '@/services/sammanService';
import { useToast } from '@/hooks/useToast';
import type { Contest } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

export function MyCommitteeNominationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Contest & Existing nominations for category preview
  const [activeContest, setActiveContest] = useState<Contest | null>(null);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  // Form Fields
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Initial Load: Fetch active contest and existing nominations
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const listData = await committeeSammanService.list({ perPage: 100 });
        if (!isMounted) return;

        if (listData.activeContest) {
          setActiveContest(listData.activeContest);
        }

        // List categories already submitted in this contest
        const currentCats = listData.items
          .filter((item) => !isEdit || item.id !== Number(id))
          .map((item) => item.category);
        setExistingCategories(currentCats);

        if (isEdit && id) {
          const nom = await committeeSammanService.get(Number(id));
          if (!isMounted) return;

          if (nom.status !== 'DRAFT') {
            setError(`Only draft nominations can be modified. This nomination has already been "${nom.status}".`);
            setLoading(false);
            return;
          }

          setTitle(nom.title || '');
          setDescription(nom.description || '');

          if (SUGGESTED_CATEGORIES.includes(nom.category)) {
            setCategory(nom.category);
            setIsCustomCategory(false);
          } else {
            setCategory('CUSTOM');
            setCustomCategory(nom.category);
            setIsCustomCategory(true);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load nomination data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomCategory(true);
      setCategory('CUSTOM');
    } else {
      setIsCustomCategory(false);
      setCategory(val);
      setCustomCategory('');
    }
  };

  const getEffectiveCategory = (): string => {
    if (isCustomCategory) {
      return customCategory.trim();
    }
    return category.trim();
  };

  const handleSave = async (submitNow: boolean) => {
    const effectiveCategory = getEffectiveCategory();

    if (!effectiveCategory) {
      setError('Please select or specify an award category.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a nomination title or theme.');
      return;
    }

    if (!description.trim()) {
      setError('Please describe your pandal concept and artistry.');
      return;
    }

    if (existingCategories.includes(effectiveCategory)) {
      setError(`A nomination for your committee in category "${effectiveCategory}" already exists for this contest.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEdit && id) {
        await committeeSammanService.update(Number(id), {
          category: effectiveCategory,
          title: title.trim(),
          description: description.trim(),
          submitNow,
        });

        toast.success(
          submitNow
            ? 'Nomination submitted successfully for administrative review!'
            : 'Draft nomination updated successfully.',
        );
      } else {
        await committeeSammanService.create({
          category: effectiveCategory,
          title: title.trim(),
          description: description.trim(),
          contestId: activeContest?.id,
          submitNow,
        });

        toast.success(
          submitNow
            ? 'Nomination submitted successfully for administrative review!'
            : 'Nomination saved as Draft.',
        );
      }

      navigate(ROUTES.MY_COMMITTEE_NOMINATIONS);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save nomination.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader label={isEdit ? 'Loading draft nomination...' : 'Preparing nomination form...'} />;
  }

  const effectiveCat = getEffectiveCategory();
  const isCategoryConflict = existingCategories.includes(effectiveCat);

  return (
    <div className="page samman-page">
      <PageHeader
        title={isEdit ? 'Edit Draft Nomination' : 'Submit Sharad Samman Nomination'}
        description="Submit your Puja Committee's official artistic pandal concept and craftsmanship for state-level award recognition."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Sharad Samman', to: ROUTES.MY_COMMITTEE_NOMINATIONS },
          { label: isEdit ? 'Edit Draft' : 'New Nomination' },
        ]}
      />

      {/* Active Contest Banner */}
      <div className="samman-rule-callout" style={{ marginBottom: 'var(--space-5)' }}>
        <i className="fa-solid fa-trophy" aria-hidden="true" />
        <div>
          <div>
            <strong>Active Contest:</strong>{' '}
            {activeContest ? (
              <>
                {activeContest.name} (Contest Year: {activeContest.year}
                {formatContestDate(activeContest.endDate) && (
                  <> · Last Date: {formatContestDate(activeContest.endDate)}</>
                )}
                )
              </>
            ) : (
              'Sharad Samman 2026'
            )}
          </div>
          <div style={{ marginTop: 'var(--space-1)', fontSize: '0.875rem' }}>
            Multi-Category Rule: You can nominate in multiple categories. However, each committee may submit <strong>only one nomination per category</strong>.
          </div>
        </div>
      </div>

      {/* Categories Already Nominated Callout */}
      {existingCategories.length > 0 && (
        <Card className="samman-filter-card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-4)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-emphasis)', marginBottom: 'var(--space-2)' }}>
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-success)', marginRight: 'var(--space-2)' }} aria-hidden="true" />
            Categories already nominated by your committee for this contest:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {existingCategories.map((cat) => (
              <span key={cat} className="samman-category-badge" style={{ opacity: 0.85 }}>
                {cat} (Nominated)
              </span>
            ))}
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="error" style={{ marginBottom: 'var(--space-5)' }}>
          {error}
        </Alert>
      )}

      {isCategoryConflict && (
        <Alert variant="warning" style={{ marginBottom: 'var(--space-5)' }}>
          Your committee has already submitted a nomination in category &quot;{effectiveCat}&quot;. Please select a different category to submit another entry.
        </Alert>
      )}

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          className="form-grid"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
        >
          {/* Section: Category */}
          <div className="samman-form-section">
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)' }}>Award Category</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              Choose the award category best suited for your pandal&apos;s artistic theme or craftsmanship.
            </p>

            <div className="form-grid form-grid--2">
              <div className="field">
                <label className="field__label" htmlFor="award-category-select">
                  Award Category <span className="field__required">*</span>
                </label>
                <select
                  id="award-category-select"
                  className="input select"
                  value={category}
                  onChange={handleCategorySelectChange}
                  disabled={submitting}
                  required
                >
                  <option value="">-- Select an Award Category --</option>
                  {SUGGESTED_CATEGORIES.map((cat) => {
                    const isTaken = existingCategories.includes(cat);
                    return (
                      <option key={cat} value={cat} disabled={isTaken}>
                        {cat} {isTaken ? '(Already Nominated)' : ''}
                      </option>
                    );
                  })}
                  <option value="CUSTOM">+ Specify Custom Category...</option>
                </select>
                <div className="field__hint">
                  Committees may submit once per category. Taken categories are disabled.
                </div>
              </div>

              {isCustomCategory && (
                <div className="field">
                  <label className="field__label" htmlFor="custom-category-input">
                    Custom Category Name <span className="field__required">*</span>
                  </label>
                  <input
                    id="custom-category-input"
                    type="text"
                    className="input"
                    placeholder="e.g. Best Dhunuchi Dance Performance"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    disabled={submitting}
                    maxLength={100}
                    required
                  />
                  <div className="field__hint">Provide a descriptive award category name.</div>
                </div>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)' }} />

          {/* Section: Theme & Concept */}
          <div className="samman-form-section">
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)' }}>Pandal Concept & Theme</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              Explain the creative narrative, artisan craftsmanship, and highlights of this nomination.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="field">
                <label className="field__label" htmlFor="nomination-title">
                  Nomination Title / Pandal Theme <span className="field__required">*</span>
                </label>
                <input
                  id="nomination-title"
                  type="text"
                  className="input"
                  placeholder="e.g. Terracotta Heritage of Bishnupur: Revival of Ancient Clay Temple Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  maxLength={200}
                  required
                />
                <div className="field__hint">
                  A compelling title or theme name summarizing your pandal concept ({title.length}/200 chars).
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="nomination-description">
                  Concept & Artistry Description <span className="field__required">*</span>
                </label>
                <textarea
                  id="nomination-description"
                  className="input textarea"
                  rows={6}
                  placeholder="Provide detailed concept notes: artistic vision, lead artisan/architect names, eco-friendly materials used, historical inspiration, lighting innovation, and cultural significance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  required
                />
                <div className="field__hint">
                  This narrative will be reviewed by the Sharad Samman jury panel during evaluation.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="form-actions"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border-subtle)',
            }}
          >
            <Link to={ROUTES.MY_COMMITTEE_NOMINATIONS} className="btn btn--secondary">
              Cancel
            </Link>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSave(false)}
                loading={submitting}
                disabled={isCategoryConflict}
              >
                <i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Save as Draft
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={() => handleSave(true)}
                loading={submitting}
                disabled={isCategoryConflict}
              >
                <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Submit Nomination
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
