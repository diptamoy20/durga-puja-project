import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { sammanService } from '@/services/sammanService';
import { useToast } from '@/hooks/useToast';
import type { CommitteeOption, Contest, SharadSammanNomination } from '@/types/samman';

import '@/styles/sharad-samman-admin.css';

const SUGGESTED_CATEGORIES = [
  'Best Traditional Pandal',
  'Best Contemporary Pandal',
  'Best Idol Artistry',
  'Best Illumination & Lighting',
  'Eco-Friendly / Green Puja',
  'Social Impact & Inclusion',
  'Best Crowd Management',
  'Heritage & Culture Preservation',
];

export function NominationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'draft' | 'submit' | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metadata options
  const [contests, setContests] = useState<Contest[]>([]);
  const [committees, setCommittees] = useState<CommitteeOption[]>([]);
  const [committeeSearch, setCommitteeSearch] = useState('');
  const [searchingCommittees, setSearchingCommittees] = useState(false);

  // Form State
  const [contestId, setContestId] = useState<number | ''>('');
  const [pujaCommitteeId, setPujaCommitteeId] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [existingNomination, setExistingNomination] = useState<SharadSammanNomination | null>(null);

  const selectedCommittee = committees.find((c) => String(c.id) === String(pujaCommitteeId));
  const selectedCommitteeName =
    selectedCommittee?.committeeName ||
    (isEdit ? existingNomination?.committee?.committeeName : undefined);

  // Load Contests & Initial Committees
  useEffect(() => {
    sammanService
      .getContests()
      .then((data) => {
        setContests(data);
        if (!isEdit && data.length > 0 && !contestId) {
          const active = data.find((c) => c.status === 'ACTIVE') || data[0];
          setContestId(active.id);
        }
      })
      .catch(() => undefined);

    if (!isEdit) {
      setSearchingCommittees(true);
      sammanService
        .searchCommittees()
        .then(setCommittees)
        .catch(() => undefined)
        .finally(() => setSearchingCommittees(false));
    }
  }, [isEdit]);

  // Load Existing Nomination for Edit
  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    sammanService
      .get(Number(id))
      .then((nom) => {
        setExistingNomination(nom);
        setContestId(nom.contestId);
        setPujaCommitteeId(nom.pujaCommitteeId);
        setCategory(nom.category || '');
        setTitle(nom.title || '');
        setDescription(nom.description || '');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load nomination details.');
      })
      .finally(() => setLoading(false));
  }, [isEdit, id]);

  // Dynamic search for committees (when adding)
  const handleCommitteeSearch = (term: string) => {
    setCommitteeSearch(term);
    setSearchingCommittees(true);
    sammanService
      .searchCommittees(term)
      .then(setCommittees)
      .catch(() => undefined)
      .finally(() => setSearchingCommittees(false));
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!isEdit) {
      if (!contestId) {
        toast.warning('Please select a contest session.');
        return false;
      }
      if (!pujaCommitteeId) {
        toast.warning('Please select a Puja Committee.');
        return false;
      }
    }

    if (!category.trim()) {
      toast.warning('Please specify an award category.');
      return false;
    }

    return true;
  };

  const executeSave = async (directSubmit: boolean = false) => {
    setError(null);
    setSubmitting(true);
    setSubmitAction(directSubmit ? 'submit' : 'draft');

    try {
      if (isEdit && id) {
        await sammanService.update(Number(id), {
          category: category.trim(),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
        });
        toast.success('Nomination updated successfully.');
        navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_DETAIL(id));
      } else {
        const created = await sammanService.create({
          contestId: Number(contestId),
          pujaCommitteeId: Number(pujaCommitteeId),
          category: category.trim(),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
        });

        if (directSubmit) {
          try {
            await sammanService.changeStatus(created.id, {
              status: 'SUBMITTED',
            });
            toast.success('Nomination created and submitted for review successfully.');
          } catch (statusErr: unknown) {
            toast.error(
              statusErr instanceof Error
                ? `Nomination saved as Draft, but direct submission failed: ${statusErr.message}`
                : 'Nomination saved as Draft, but failed to submit.',
            );
          }
        } else {
          toast.success('Nomination created as Draft successfully.');
        }

        setShowSubmitModal(false);
        navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_DETAIL(created.id));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save nomination.';
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


  if (loading) return <PageLoader label="Loading nomination details..." />;

  if (isEdit && existingNomination?.status === 'SHORTLISTED') {
    return (
      <div className="page samman-page">
        <div className="samman-form-container">
          <header className="page__header">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li><Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link></li>
                <li><Link to={ROUTES.SHARAD_SAMMAN_NOMINATIONS}>Nominations</Link></li>
                <li><span>Edit Nomination #{id}</span></li>
              </ol>
            </nav>
            <h1 className="page__title">Nomination Locked</h1>
          </header>
          <Card>
            <div style={{ padding: 'var(--space-5)' }}>
              <Alert variant="warning" title="Nomination is Shortlisted">
                Shortlisted nominations have an immutable snapshot and cannot be modified directly.
                To make changes, return to the detail page and demote the status from Shortlisted.
              </Alert>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Button variant="secondary" onClick={() => navigate(ROUTES.SHARAD_SAMMAN_NOMINATION_DETAIL(id!))}>
                  &larr; Back to Nomination Details
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page samman-page">
      <div className="samman-form-container">
        <header className="page__header">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to={ROUTES.SHARAD_SAMMAN_DASHBOARD}>Sharad Samman</Link></li>
            <li><Link to={ROUTES.SHARAD_SAMMAN_NOMINATIONS}>Nominations</Link></li>
            <li><span>{isEdit ? `Edit #${id}` : 'New Nomination'}</span></li>
          </ol>
        </nav>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 className="page__title">{isEdit ? `Edit Nomination #${id}` : 'Create Nomination'}</h1>
            <p className="page__subtitle">
              {isEdit
                ? `Update concept and category details for ${existingNomination?.committee?.committeeName || 'nomination'}.`
                : 'Create an award nomination entry on behalf of a registered Puja Committee.'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(isEdit && id ? ROUTES.SHARAD_SAMMAN_NOMINATION_DETAIL(id) : ROUTES.SHARAD_SAMMAN_NOMINATIONS)}
          >
            &larr; Back
          </Button>
        </div>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="samman-rule-callout">
        <i className="fas fa-info-circle" style={{ marginTop: '2px' }} />
        <div>
          <strong>Multi-Category Nomination Policy:</strong> A Puja Committee may submit nominations under multiple categories in the same contest, but only one nomination per category per contest.
        </div>
      </div>

      <div className="samman-form-card">
        <form
          onSubmit={handleFormSubmit}
          className="form"
        >
          <Card>
            {/* Section 1: Contest & Committee Selection */}
            <div className="samman-form-section">
              <h2 className="samman-form-section__title">Contest & Puja Committee</h2>
              <p className="samman-form-section__desc">
                {isEdit
                  ? 'Contest session and committee associations are fixed for this nomination.'
                  : 'Select the active contest session and the approved committee submitting this nomination.'}
              </p>

              {isEdit ? (
                <div className="form-grid form-grid--2">
                  <div className="field">
                    <span className="field__label">Contest Session</span>
                    <div className="field__control" style={{ background: 'var(--colour-canvas)', fontWeight: 600 }}>
                      {existingNomination?.contest?.name || `Contest #${existingNomination?.contestId}`} ({existingNomination?.contest?.year})
                    </div>
                  </div>
                  <div className="field">
                    <span className="field__label">Puja Committee</span>
                    <div className="field__control" style={{ background: 'var(--colour-canvas)', fontWeight: 600 }}>
                      {existingNomination?.committee?.committeeName} &bull; {existingNomination?.committee?.city}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="field">
                    <label className="field__label" htmlFor="form-contest">
                      Contest Session <span className="field__required">*</span>
                    </label>
                    <select
                      id="form-contest"
                      className="field__control"
                      value={contestId}
                      onChange={(e) => setContestId(Number(e.target.value))}
                      required
                    >
                      <option value="">Select Contest Session...</option>
                      {contests.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.year}) — Status: {c.status}
                        </option>
                      ))}
                    </select>
                    <p className="field__hint">
                      The festival award contest session this nomination belongs to.
                    </p>
                  </div>

                  <div className="form-grid form-grid--2">
                    <div className="field">
                      <label className="field__label" htmlFor="filter-committee">
                        Filter Puja Committees
                      </label>
                      <div className="samman-search-wrapper">
                        <i className="fas fa-search samman-search-icon" aria-hidden="true" />
                        <input
                          id="filter-committee"
                          type="search"
                          className="field__control samman-search-input"
                          placeholder="Search by name, reg. no., or city..."
                          value={committeeSearch}
                          onChange={(e) => handleCommitteeSearch(e.target.value)}
                        />
                      </div>
                      <p className="field__hint">
                        Type keywords to filter the dropdown list below.
                      </p>
                    </div>

                    <div className="field">
                      <label className="field__label" htmlFor="form-committee">
                        Select Committee <span className="field__required">*</span>
                      </label>
                      <select
                        id="form-committee"
                        className="field__control"
                        value={pujaCommitteeId}
                        onChange={(e) => setPujaCommitteeId(Number(e.target.value))}
                        required
                      >
                        <option value="">
                          {searchingCommittees ? 'Searching committees…' : '— Choose Puja Committee —'}
                        </option>
                        {committees.map((comm) => (
                          <option key={comm.id} value={comm.id}>
                            {comm.committeeName} ({comm.city}) — Reg: {comm.registrationNo}
                          </option>
                        ))}
                      </select>
                      <p className="field__hint">
                        Only approved committees with registered portal accounts are eligible.
                      </p>
                    </div>
                  </div>
                </>
              )}
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
                <input
                  id="form-category"
                  type="text"
                  list="category-suggestions"
                  className="field__control"
                  placeholder="Select standard category or type a custom one (e.g. Best Traditional Pandal)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={100}
                  required
                />
                <datalist id="category-suggestions">
                  {SUGGESTED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="field__hint">
                  The committee may have only one nomination per category in this contest. Choose or type an award category.
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

            {/* Section 3: Actions */}
            <div style={{ padding: 'var(--space-4) var(--space-5)', background: 'var(--colour-canvas)', borderTop: '1px solid var(--colour-border)' }}>
              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(isEdit && id ? ROUTES.SHARAD_SAMMAN_NOMINATION_DETAIL(id) : ROUTES.SHARAD_SAMMAN_NOMINATIONS)}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                {!isEdit ? (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSaveDraft}
                      disabled={submitting}
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
                      disabled={submitting}
                    >
                      <i
                        className={`fas ${submitting && submitAction === 'submit' ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}
                        aria-hidden="true"
                        style={{ marginRight: '6px' }}
                      />
                      {submitting && submitAction === 'submit' ? 'Submitting...' : 'Submit Nomination'}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                  >
                    <i
                      className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-check'}`}
                      aria-hidden="true"
                      style={{ marginRight: '6px' }}
                    />
                    {submitting ? 'Saving...' : 'Update Nomination'}
                  </Button>
                )}
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
                <strong>review queue</strong> for evaluation.
              </p>

              {(category.trim() || selectedCommitteeName) && (
                <div className="samman-confirm-modal__card">
                  {category.trim() && (
                    <div className="samman-confirm-modal__row">
                      <span className="samman-confirm-modal__label">Award Category:</span>
                      <span className="samman-confirm-modal__value samman-confirm-modal__value--highlight">
                        {category.trim()}
                      </span>
                    </div>
                  )}
                  {selectedCommitteeName && (
                    <div className="samman-confirm-modal__row">
                      <span className="samman-confirm-modal__label">Puja Committee:</span>
                      <span className="samman-confirm-modal__value">{selectedCommitteeName}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="samman-confirm-modal__note">
                You can monitor, review, and evaluate the status of this entry from the Sharad Samman nominations list after submission.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  </div>
  );
}

export default NominationFormPage;
