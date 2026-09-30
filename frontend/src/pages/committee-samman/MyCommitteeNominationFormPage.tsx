import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatContestDate, formatNominationStatus } from '@/constants/samman';
import { committeeSammanService } from '@/services/sammanService';
import { subcategoryService } from '@/services/contentService';
import { errorMessage } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Contest, SharadSammanNomination } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

export function MyCommitteeNominationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'draft' | 'submit' | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contests & Nominations
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<number | ''>('');
  const [committeeNominations, setCommitteeNominations] = useState<SharadSammanNomination[]>([]);
  const [existingNomination, setExistingNomination] = useState<SharadSammanNomination | null>(null);

  // Form Fields
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pandalImage, setPandalImage] = useState('');
  const [photos, setPhotos] = useState<string[]>(['']);

  const activeContests = useMemo(() => contests.filter((c) => c.status === 'ACTIVE'), [contests]);

  const selectedContest = useMemo(() => {
    return (
      contests.find((c) => c.id === Number(selectedContestId)) ||
      (isEdit ? existingNomination?.contest : null) ||
      null
    );
  }, [contests, selectedContestId, isEdit, existingNomination]);

  // List categories already submitted in the selected contest
  const existingCategories = useMemo(() => {
    if (!selectedContestId) return [];
    return committeeNominations
      .filter((item) => (!isEdit || item.id !== Number(id)) && item.contestId === Number(selectedContestId))
      .map((item) => item.category);
  }, [committeeNominations, selectedContestId, isEdit, id]);

  // Initial Load: Fetch contests and existing nominations
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [listData, contestsData, activeContestData, categoriesData] = await Promise.all([
          committeeSammanService.list({ perPage: 100 }),
          committeeSammanService.getContests().catch((): Contest[] => []),
          committeeSammanService.getActiveContest().catch(() => null),
          subcategoryService.listNominationCategories().catch((): string[] => []),
        ]);
        if (!isMounted) return;

        setAvailableCategories(categoriesData);

        const contestsList = [...contestsData];
        if (activeContestData && !contestsList.some((c) => c.id === activeContestData.id)) {
          contestsList.push(activeContestData);
        }
        const fallbackContest = listData.activeContest;
        if (fallbackContest && !contestsList.some((c) => c.id === fallbackContest.id)) {
          contestsList.push(fallbackContest);
        }
        setContests(contestsList);
        setCommitteeNominations(listData.items ?? []);

        if (isEdit && id) {
          const nom = await committeeSammanService.get(Number(id));
          if (!isMounted) return;
          setExistingNomination(nom);
          setSelectedContestId(nom.contestId);

          if (nom.status !== 'DRAFT') {
            setError(`Only draft nominations can be modified. This nomination has already been "${formatNominationStatus(nom.status)}".`);
            setLoading(false);
            return;
          }

          setTitle(nom.title || '');
          setDescription(nom.description || '');
          setCategory(nom.category || '');
          setPandalImage(nom.snapshotData?.pandalImage || nom.committee?.pandalImage || '');

          const existingPhotos = Array.isArray(nom.snapshotData?.photos) ? nom.snapshotData.photos : [];
          if (existingPhotos.length > 0) {
            setPhotos(existingPhotos);
          } else if (nom.committee?.pandalImage) {
            setPhotos([nom.committee.pandalImage]);
          }

          if (nom.category && !categoriesData.includes(nom.category)) {
            setAvailableCategories((prev) => [nom.category, ...prev]);
          }
        } else {
          const activeList = contestsList.filter((c) => c.status === 'ACTIVE');
          if (activeContestData && activeContestData.status === 'ACTIVE') {
            setSelectedContestId(activeContestData.id);
          } else if (activeList.length > 0) {
            setSelectedContestId(activeList[0].id);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(errorMessage(err, 'Failed to load nomination data.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const committeeDisplayName =
    existingNomination?.committee?.committeeName ||
    (user?.name ? `${user.name}` : 'Authenticated Puja Committee');

  const validateForm = (): boolean => {
    setError(null);
    if (!isEdit && (!selectedContest || selectedContest.status !== 'ACTIVE')) {
      const msg = 'Nominations can only be submitted for ACTIVE contests.';
      setError(msg);
      toast.error(msg);
      return false;
    }

    const trimmedCategory = category.trim();

    if (!trimmedCategory) {
      toast.warning('Please select an award category.');
      return false;
    }

    if (existingCategories.includes(trimmedCategory)) {
      toast.warning(`A nomination for your committee in category "${trimmedCategory}" already exists for this contest.`);
      return false;
    }

    return true;
  };

  const executeSave = async (directSubmit: boolean = false) => {
    setError(null);
    setSubmitting(true);
    setSubmitAction(directSubmit ? 'submit' : 'draft');

    const trimmedCategory = category.trim();
    const cleanPhotos = photos.map((p) => p.trim()).filter(Boolean);
    const primaryPandal = pandalImage.trim() || cleanPhotos[0] || undefined;

    try {
      if (isEdit && id) {
        await committeeSammanService.update(Number(id), {
          category: trimmedCategory,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          photos: cleanPhotos.length > 0 ? cleanPhotos : undefined,
          pandalImage: primaryPandal,
          submitNow: directSubmit,
        });

        toast.success(
          directSubmit
            ? 'Nomination submitted successfully for administrative review!'
            : 'Draft nomination updated successfully.',
        );
        setShowSubmitModal(false);
        navigate(ROUTES.MY_COMMITTEE_NOMINATIONS);
      } else {
        await committeeSammanService.create({
          contestId: Number(selectedContestId),
          category: trimmedCategory,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          photos: cleanPhotos.length > 0 ? cleanPhotos : undefined,
          pandalImage: primaryPandal,
          submitNow: directSubmit,
        });

        toast.success(
          directSubmit
            ? 'Nomination created and submitted for review successfully.'
            : 'Nomination saved as Draft successfully.',
        );
        setShowSubmitModal(false);
        navigate(ROUTES.MY_COMMITTEE_NOMINATIONS);
      }
    } catch (err: unknown) {
      const message = errorMessage(err, 'Failed to save nomination.');
      setError(message);
      toast.error(message);
      setShowSubmitModal(false);
    } finally {
      setSubmitting(false);
      setSubmitAction(null);
    }
  };

  const handleSaveDraft = () => {
    if (validateForm()) {
      executeSave(false);
    }
  };

  const handleDirectSubmitClick = () => {
    if (validateForm()) {
      setShowSubmitModal(true);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      executeSave(false);
    }
  };

  if (loading) {
    return <PageLoader label={isEdit ? 'Loading draft nomination...' : 'Preparing nomination form...'} />;
  }

  if (isEdit && existingNomination && existingNomination.status !== 'DRAFT') {
    return (
      <div className="page samman-page">
        <div className="samman-form-container">
          <header className="page__header">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li><Link to={ROUTES.DASHBOARD}>Dashboard</Link></li>
                <li><Link to={ROUTES.MY_COMMITTEE_NOMINATIONS}>Sharad Samman</Link></li>
                <li><Link to={ROUTES.MY_COMMITTEE_NOMINATIONS}>My Nominations</Link></li>
                <li><span>Edit Nomination #{id}</span></li>
              </ol>
            </nav>
            <h1 className="page__title">Nomination Locked</h1>
          </header>
          <Card>
            <div style={{ padding: 'var(--space-5)' }}>
              <Alert variant="warning" title="Nomination is Locked for Review">
                Only draft nominations can be modified. This nomination has already progressed to{' '}
                <strong>&ldquo;{formatNominationStatus(existingNomination.status)}&rdquo;</strong> status and cannot be edited.
              </Alert>
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <Button variant="primary" onClick={() => navigate(ROUTES.MY_COMMITTEE_NOMINATION_DETAIL(id!))}>
                  View Nomination Details
                </Button>
                <Button variant="secondary" onClick={() => navigate(ROUTES.MY_COMMITTEE_NOMINATIONS)}>
                  &larr; Back to My Nominations
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!isEdit && activeContests.length === 0) {
    return (
      <div className="page samman-page">
        <div className="samman-form-container">
          <header className="page__header">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li><Link to={ROUTES.DASHBOARD}>Dashboard</Link></li>
                <li><Link to={ROUTES.MY_COMMITTEE_NOMINATIONS}>Sharad Samman</Link></li>
                <li><Link to={ROUTES.MY_COMMITTEE_NOMINATIONS}>My Nominations</Link></li>
                <li><span>New Nomination</span></li>
              </ol>
            </nav>
            <h1 className="page__title">Submissions Unavailable</h1>
          </header>
          <Card>
            <div style={{ padding: 'var(--space-5)' }}>
              <Alert variant="warning" title="No Active Contest for Submissions">
                New nominations can only be created and submitted when a contest is currently <strong>ACTIVE</strong>.
                There is currently no active contest session open for submissions.
              </Alert>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Button variant="secondary" onClick={() => navigate(ROUTES.MY_COMMITTEE_NOMINATIONS)}>
                  &larr; Back to My Nominations
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const trimmedCat = category.trim();
  const isCategoryConflict = Boolean(trimmedCat && existingCategories.includes(trimmedCat));

  return (
    <div className="page samman-page">
      <div className="samman-form-container">
        <header className="page__header">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to={ROUTES.DASHBOARD}>Dashboard</Link></li>
              <li><Link to={ROUTES.MY_COMMITTEE_NOMINATIONS}>Sharad Samman</Link></li>
              <li><Link to={ROUTES.MY_COMMITTEE_NOMINATIONS}>My Nominations</Link></li>
              <li><span>{isEdit ? `Edit #${id}` : 'New Nomination'}</span></li>
            </ol>
          </nav>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h1 className="page__title">{isEdit ? `Edit Nomination #${id}` : 'Submit Sharad Samman Nomination'}</h1>
              <p className="page__subtitle">
                {isEdit
                  ? `Update concept and category details for ${committeeDisplayName}.`
                  : "Submit your Puja Committee's official artistic pandal concept and craftsmanship for state-level award recognition."}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(isEdit && id ? ROUTES.MY_COMMITTEE_NOMINATION_DETAIL(id) : ROUTES.MY_COMMITTEE_NOMINATIONS)}
            >
              &larr; Back
            </Button>
          </div>
        </header>

        {error && <Alert variant="error">{error}</Alert>}

        {/* Active Contest & Multi-Category Callout */}
        <div className="samman-rule-callout">
          <i className="fas fa-trophy" style={{ marginTop: '2px' }} />
          <div>
            <div>
              <strong>Contest Session:</strong>{' '}
              {selectedContest ? (
                <>
                  {selectedContest.name} ({selectedContest.year})
                  {formatContestDate(selectedContest.endDate) && (
                    <> &bull; Last Date for Entries: {formatContestDate(selectedContest.endDate)}</>
                  )}
                </>
              ) : (
                'Select an active contest session'
              )}
            </div>
            <div style={{ marginTop: 'var(--space-1)', fontSize: '0.875rem' }}>
              <strong>Multi-Category Nomination Policy:</strong> A Puja Committee may submit nominations under multiple categories in the same contest, but only one nomination per category per contest.
            </div>
          </div>
        </div>

        {/* Categories Already Nominated Callout */}
        {existingCategories.length > 0 && (
          <Card className="samman-filter-card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-emphasis)', marginBottom: 'var(--space-2)' }}>
              <i className="fas fa-circle-check" style={{ color: 'var(--color-success)', marginRight: 'var(--space-2)' }} aria-hidden="true" />
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

        <div className="samman-form-card">
          <form onSubmit={handleFormSubmit} className="form">
            <Card>
              {/* Section 1: Contest & Puja Committee */}
              <div className="samman-form-section">
                <h2 className="samman-form-section__title">Contest & Puja Committee</h2>
                <p className="samman-form-section__desc">
                  Contest session and committee associations are fixed for your committee portal session.
                </p>

                <div className="form-grid form-grid--2">
                  <div className="field">
                    <label className="field__label" htmlFor="form-contest-id">
                      Contest Session {isEdit ? '' : <span className="field__required">*</span>}
                    </label>
                    {isEdit ? (
                      <div className="field__control" style={{ background: 'var(--colour-canvas)', fontWeight: 600 }}>
                        {selectedContest ? (
                          <>
                            {selectedContest.name} ({selectedContest.year})
                            {formatContestDate(selectedContest.endDate) && (
                              <span style={{ fontWeight: 400, color: 'var(--colour-ink-soft)', marginLeft: 'var(--space-2)' }}>
                                &bull; Last Date: {formatContestDate(selectedContest.endDate)}
                              </span>
                            )}
                          </>
                        ) : (
                          'Assigned Contest'
                        )}
                      </div>
                    ) : (
                      <select
                        id="form-contest-id"
                        name="contestId"
                        className="field__control form-control"
                        value={selectedContestId}
                        onChange={(e) => setSelectedContestId(e.target.value ? Number(e.target.value) : '')}
                        required
                      >
                        {activeContests.length === 0 ? (
                          <option value="">No active contests available</option>
                        ) : (
                          activeContests.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.year})
                              {formatContestDate(c.endDate) ? ` — Last Date: ${formatContestDate(c.endDate)}` : ''}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                    <p className="field__hint">
                      {isEdit
                        ? 'Contest session cannot be changed once the nomination draft is created.'
                        : 'Select the active festival award contest session to submit this nomination for.'}
                    </p>
                  </div>
                  <div className="field">
                    <span className="field__label">Puja Committee</span>
                    <div className="field__control" style={{ background: 'var(--colour-canvas)', fontWeight: 600 }}>
                      {committeeDisplayName}
                    </div>
                    <p className="field__hint">
                      Automatically assigned to your authenticated committee profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Award Category & Theme */}
              <div className="samman-form-section">
                <h2 className="samman-form-section__title">Award Category & Concept Theme</h2>
                <p className="samman-form-section__desc">
                  Define the specific award category and the thematic narrative of this nomination.
                </p>

                <div className="field">
                  <label className="field__label" htmlFor="form-category">
                    Award Category <span className="field__required">*</span>
                  </label>
                  <select
                    id="form-category"
                    className="field__control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select award category...</option>
                    {availableCategories.map((cat) => {
                      const isTaken = existingCategories.includes(cat);
                      return (
                        <option key={cat} value={cat} disabled={isTaken}>
                          {cat} {isTaken ? '(Already Nominated)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <p className="field__hint">
                    The committee may have only one nomination per category in this contest. Choose an award category.
                  </p>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="form-title">
                    Nomination Title / Theme Name <span className="field__optional">(Optional)</span>
                  </label>
                  <input
                    id="form-title"
                    type="text"
                    className="field__control"
                    placeholder="e.g. Shobhabazar Rajbari Heritage Clay Modeling & Terracotta"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                  />
                  <p className="field__hint">
                    A catchy or traditional title highlighting the theme, pandal concept, or idol artistry.
                  </p>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="form-desc">
                    Concept Narrative & Pandal Description <span className="field__optional">(Optional)</span>
                  </label>
                  <textarea
                    id="form-desc"
                    rows={6}
                    className="field__control"
                    placeholder="Describe the historical significance, cultural theme, safety and crowd management features, lighting architecture, and artisans involved in this presentation..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="field__hint">
                    Provide detailed notes for evaluation during the administrative and jury review phases.
                  </p>
                </div>
              </div>

              {/* Section 3: Puja & Pandal Pictures */}
              <div className="samman-form-section">
                <h2 className="samman-form-section__title">Puja & Pandal Pictures</h2>
                <p className="samman-form-section__desc">
                  Provide high-resolution photos of your Puja pandal, idol craftsmanship, illumination architecture, and traditional decor. These pictures will be displayed to the public on the official Sharad Samman voting portal.
                </p>

                <div className="field">
                  <label className="field__label" htmlFor="form-pandal-image">
                    Primary Pandal Cover Image URL <span className="field__optional">(Optional)</span>
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input
                      id="form-pandal-image"
                      type="url"
                      className="field__control"
                      placeholder="https://example.com/pandal-exterior.jpg"
                      value={pandalImage}
                      onChange={(e) => setPandalImage(e.target.value)}
                    />
                  </div>
                  <p className="field__hint">
                    Main cover photograph showcasing the exterior pandal theme and architectural structure.
                  </p>
                </div>

                <div className="field">
                  <label className="field__label">
                    Additional Puja & Artistry Photos <span className="field__optional">({photos.filter(Boolean).length} added)</span>
                  </label>
                  <p className="field__hint" style={{ marginBottom: 'var(--space-3)' }}>
                    Add multiple pictures (Idol artistry, lighting decoration, traditional craftsmanship, cultural rituals).
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {photos.map((photoUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: 'var(--colour-canvas)',
                            border: '1px solid var(--colour-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {photoUrl.trim() ? (
                            <img
                              src={photoUrl}
                              alt={`Preview ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <i className="fas fa-image" style={{ color: 'var(--colour-ink-soft)', fontSize: '1.2rem' }} />
                          )}
                        </div>

                        <input
                          type="url"
                          className="field__control"
                          placeholder={`Photo ${idx + 1} URL (e.g. idol, illumination, craftsmanship)...`}
                          value={photoUrl}
                          onChange={(e) => {
                            const updated = [...photos];
                            updated[idx] = e.target.value;
                            setPhotos(updated);
                          }}
                          style={{ flex: 1 }}
                        />

                        {photos.length > 1 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setPhotos(photos.filter((_, i) => i !== idx));
                            }}
                            title="Remove this photo"
                          >
                            <i className="fas fa-trash-can" style={{ color: 'var(--color-danger)' }} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setPhotos([...photos, ''])}
                    >
                      <i className="fas fa-plus" style={{ marginRight: '6px' }} />
                      Add Another Picture
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section 4: Actions */}
              <div style={{ padding: 'var(--space-4) var(--space-5)', background: 'var(--colour-canvas)', borderTop: '1px solid var(--colour-border)' }}>
                <div className="form-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(isEdit && id ? ROUTES.MY_COMMITTEE_NOMINATION_DETAIL(id) : ROUTES.MY_COMMITTEE_NOMINATIONS)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSaveDraft}
                    disabled={submitting || isCategoryConflict}
                  >
                    <i
                      className={`fas ${submitting && submitAction === 'draft' ? 'fa-spinner fa-spin' : 'fa-save'}`}
                      aria-hidden="true"
                      style={{ marginRight: '6px' }}
                    />
                    {submitting && submitAction === 'draft' ? 'Saving Draft...' : 'Save as Draft'}
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleDirectSubmitClick}
                    disabled={submitting || isCategoryConflict}
                  >
                    <i
                      className={`fas ${submitting && submitAction === 'submit' ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}
                      aria-hidden="true"
                      style={{ marginRight: '6px' }}
                    />
                    {submitting && submitAction === 'submit' ? 'Submitting...' : 'Submit Nomination'}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Direct Submit Confirmation Modal */}
        {showSubmitModal && (
          <Modal
            open={showSubmitModal}
            title="Submit Nomination?"
            onClose={() => {
              if (!submitting) {
                setShowSubmitModal(false);
              }
            }}
            footer={
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => executeSave(true)}
                  disabled={submitting}
                  loading={submitting && submitAction === 'submit'}
                  leadingIcon={
                    !(submitting && submitAction === 'submit') ? (
                      <i className="fas fa-paper-plane" aria-hidden="true" style={{ marginRight: '6px' }} />
                    ) : undefined
                  }
                >
                  {submitting && submitAction === 'submit' ? 'Submitting...' : 'Submit Nomination'}
                </Button>
              </>
            }
          >
            <div className="samman-confirm-modal">
              <div className="samman-confirm-modal__icon-wrap" aria-hidden="true">
                <i className="fas fa-circle-info" />
              </div>
              <div className="samman-confirm-modal__content">
                <p className="samman-confirm-modal__message">
                  Are you sure you want to directly submit this nomination? Once submitted, it will be placed in the{' '}
                  <strong>review queue</strong> for administrative evaluation.
                </p>

                {(category.trim() || committeeDisplayName) && (
                  <div className="samman-confirm-modal__card">
                    {category.trim() && (
                      <div className="samman-confirm-modal__row">
                        <span className="samman-confirm-modal__label">Award Category:</span>
                        <span className="samman-confirm-modal__value samman-confirm-modal__value--highlight">
                          {category.trim()}
                        </span>
                      </div>
                    )}
                    {committeeDisplayName && (
                      <div className="samman-confirm-modal__row">
                        <span className="samman-confirm-modal__label">Puja Committee:</span>
                        <span className="samman-confirm-modal__value">{committeeDisplayName}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="samman-confirm-modal__note">
                  You can monitor and review the progress of this entry from your nominations list after submission.
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default MyCommitteeNominationFormPage;
