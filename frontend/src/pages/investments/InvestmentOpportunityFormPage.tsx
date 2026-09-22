import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { RichTextEditor } from '@/components/articles/RichTextEditor';
import '@/styles/articles-admin.css';
import '@/styles/investments-admin.css';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { adminInvestmentService, publicInvestmentService } from '@/services/investmentService';
import type { InvestmentOpportunityFormValues, IndustryAssociation, InvestmentDocument } from '@/types/investments';

function formatToHtmlParagraphs(text: string): string {
  if (!text) return '';
  if (/<(p|div|h[1-6]|ul|ol|li|blockquote|table|section|article)[^>]*>/i.test(text)) {
    return text;
  }
  return text
    .split(/\n\s*\n/)
    .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

const SECTORS = [
  { value: 'Tourism & Hospitality', label: 'Tourism & Hospitality' },
  { value: 'Handicrafts & Artisans', label: 'Handicrafts & Artisans' },
  { value: 'Creative Economy', label: 'Creative Economy' },
  { value: 'IT & Cultural Tech', label: 'IT & Cultural Tech' },
  { value: 'Smart City & Clean Tech', label: 'Smart City & Clean Tech' },
  { value: 'F&B & Agri-business', label: 'F&B & Agri-business' },
  { value: 'Heritage Infrastructure', label: 'Heritage Infrastructure' },
];

const FILE_TYPES = [
  { value: 'PDF', label: 'PDF Document (.pdf)' },
  { value: 'PPTX', label: 'Pitch Deck / Presentation (.pptx)' },
  { value: 'XLSX', label: 'Financial Model / Spreadsheet (.xlsx)' },
  { value: 'DOCX', label: 'Project Report (.docx)' },
  { value: 'ZIP', label: 'Document Archive (.zip)' },
];

export function InvestmentOpportunityFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [associations, setAssociations] = useState<IndustryAssociation[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'plain'>('visual');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sector, setSector] = useState('Tourism & Hospitality');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('Kolkata');
  const [district, setDistrict] = useState('Kolkata');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [investmentRange, setInvestmentRange] = useState('₹1 Cr - ₹5 Cr');
  const [investmentMin, setInvestmentMin] = useState('');
  const [investmentMax, setInvestmentMax] = useState('');
  const [projectType, setProjectType] = useState('Public-Private Partnership (PPP)');
  const [expectedRoi, setExpectedRoi] = useState('18% - 24% IRR');
  const [highlightsText, setHighlightsText] = useState('');
  const [incentives, setIncentives] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [associationId, setAssociationId] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');

  // Documents & Dossiers
  const [documents, setDocuments] = useState<InvestmentDocument[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docType, setDocType] = useState('PDF');
  const [docSize, setDocSize] = useState('');
  const [docError, setDocError] = useState<string | null>(null);

  const handleAddDocument = (customDoc?: InvestmentDocument) => {
    if (customDoc) {
      setDocuments((prev) => [...prev, customDoc]);
      return;
    }

    if (!docTitle.trim() || !docUrl.trim()) {
      setDocError('Please provide both a Document Title and a valid URL.');
      return;
    }

    setDocError(null);
    setDocuments((prev) => [
      ...prev,
      {
        title: docTitle.trim(),
        url: docUrl.trim(),
        fileType: docType || 'PDF',
        fileSize: docSize.trim() || undefined,
      },
    ]);

    // Reset inputs
    setDocTitle('');
    setDocUrl('');
    setDocSize('');
  };

  const handleRemoveDocument = (indexToRemove: number) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  useEffect(() => {
    // Load associations
    publicInvestmentService.associations.list().then(setAssociations).catch(() => {});

    if (isEditing && id) {
      setLoading(true);
      adminInvestmentService.opportunities
        .get(Number(id))
        .then((opp) => {
          setTitle(opp.title);
          setSlug(opp.slug);
          setSector(opp.sector);
          setCategory(opp.category || '');
          setLocation(opp.location);
          setDistrict(opp.district || '');
          setSummary(opp.summary || '');
          setDescription(opp.description);
          setInvestmentRange(opp.investmentRange || opp.scaleOrRange || '');
          setInvestmentMin(opp.investmentMin ? String(opp.investmentMin) : '');
          setInvestmentMax(opp.investmentMax ? String(opp.investmentMax) : '');
          setProjectType(opp.projectType || '');
          setExpectedRoi(opp.expectedRoi || '');
          setHighlightsText(opp.highlights ? opp.highlights.join('\n') : '');
          setIncentives(opp.incentives || '');
          setCoverImageUrl(opp.coverImageUrl || '');
          setAssociationId(opp.associationId ? String(opp.associationId) : '');
          setContactEmail(opp.contactEmail || '');
          setContactPhone(opp.contactPhone || '');
          setIsFeatured(Boolean(opp.isFeatured));
          setSortOrder(String(opp.sortOrder || 0));
          setDocuments(Array.isArray(opp.documents) ? opp.documents : []);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load opportunity');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !investmentRange.trim()) {
      setError('Please fill in Title, Description, Location, and Investment Range.');
      return;
    }

    setSaving(true);
    setError(null);

    const highlights = highlightsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: InvestmentOpportunityFormValues = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      sector,
      category: category.trim() || undefined,
      location: location.trim(),
      district: district.trim() || undefined,
      summary: summary.trim() || undefined,
      description: formatToHtmlParagraphs(description.trim()),
      investmentRange: investmentRange.trim(),
      investmentMin: investmentMin ? Number(investmentMin) : undefined,
      investmentMax: investmentMax ? Number(investmentMax) : undefined,
      projectType: projectType.trim() || undefined,
      expectedRoi: expectedRoi.trim() || undefined,
      highlights: highlights.length > 0 ? highlights : undefined,
      incentives: incentives.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      documents: documents.length > 0 ? documents : [],
      associationId: associationId ? Number(associationId) : undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      isFeatured,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      if (isEditing && id) {
        await adminInvestmentService.opportunities.update(Number(id), payload);
        toast.success('Opportunity updated successfully.');
        navigate(ROUTES.ADMIN_INVESTMENT_DETAIL(id));
      } else {
        const created = await adminInvestmentService.opportunities.create(payload);
        toast.success('Opportunity created successfully as DRAFT.');
        navigate(ROUTES.ADMIN_INVESTMENT_DETAIL(created.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save opportunity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader label="Loading opportunity form..." />;
  }

  const selectedAssociation = associations.find((a) => String(a.id) === String(associationId));

  return (
    <div className="page">
      {/* Standard CMS Breadcrumb Header */}
      <header className="page__header">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
            </li>
            <li>
              <Link to={ROUTES.ADMIN_INVESTMENTS}>Investor Showcase</Link>
            </li>
            <li>
              <span aria-current="page">
                {isEditing ? 'Edit Opportunity' : 'New Opportunity'}
              </span>
            </li>
          </ol>
        </nav>

        <div className="page__header-row">
          <div>
            <h1 className="page__title">
              {isEditing ? 'Edit Investment Opportunity' : 'Create New Investment Opportunity'}
            </h1>
            <p className="page__subtitle">
              {isEditing
                ? 'Modify project specifications, financial projections, and attached dossiers.'
                : 'New opportunities start in Draft status and must be submitted for approval before publishing.'}
            </p>
          </div>
          <div className="page__header-actions">
            <Link to={ROUTES.ADMIN_INVESTMENTS} className="btn btn--secondary btn--sm">
              ← Back to List
            </Link>
          </div>
        </div>
      </header>

      {error && <Alert tone="danger">{error}</Alert>}

      {!isEditing && (
        <Alert tone="info">
          <strong>Workflow Policy:</strong> Creating an opportunity will save it as a <strong>DRAFT</strong>. It will not appear publicly until it has been reviewed, explicitly approved, and published.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="article-form-grid">
          {/* Left Column (2fr): Main Content & Financial Scope */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 20px)' }}>
            {/* 1. Project Overview & Scope */}
            <Card title="1. Project Overview & Scope">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  label="Opportunity Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Heritage Boutique Hotels along Hooghly Riverfront"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <Select
                    label="Industry Sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    options={SECTORS}
                    required
                  />
                  <Input
                    label="Subcategory / Focus Area"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Heritage Conservation, Solar Microgrids"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <Input
                    label="Location / Region"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kumartuli, North Kolkata"
                    required
                  />
                  <Input
                    label="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Kolkata, Bankura, Howrah"
                  />
                </div>

                <Textarea
                  label="Executive Summary (Short Excerpt for Showcase Cards)"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="A brief 2-3 sentence overview of the investment opportunity..."
                />

                <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <label className="field__label" style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--colour-ink)', margin: 0 }}>
                        Detailed Project Description & Scope <span className="field__required">*</span>
                      </label>
                      <p style={{ margin: '3px 0 0', fontSize: '0.825rem', color: 'var(--colour-ink-soft, #64748b)' }}>
                        Write in normal English. Describe the project background, market demand, business model, and operational roadmap.
                      </p>
                    </div>
                    <div style={{ display: 'inline-flex', background: 'var(--colour-canvas, #f1f5f9)', padding: '3px', borderRadius: '8px', border: '1px solid var(--colour-border, #e2e8f0)' }}>
                      <button
                        type="button"
                        onClick={() => setEditorMode('visual')}
                        style={{
                          border: 'none',
                          background: editorMode === 'visual' ? '#ffffff' : 'transparent',
                          color: editorMode === 'visual' ? '#0f172a' : '#64748b',
                          boxShadow: editorMode === 'visual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span>✍️ Visual Editor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('plain')}
                        style={{
                          border: 'none',
                          background: editorMode === 'plain' ? '#ffffff' : 'transparent',
                          color: editorMode === 'plain' ? '#0f172a' : '#64748b',
                          boxShadow: editorMode === 'plain' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span>📝 Plain Text</span>
                      </button>
                    </div>
                  </div>

                  {editorMode === 'visual' ? (
                    <RichTextEditor
                      id="investment-description-editor"
                      value={description}
                      onChange={setDescription}
                      placeholder="Type full project description in normal English (e.g. Project overview, market need, expected return, key phases)..."
                      minHeight={260}
                    />
                  ) : (
                    <Textarea
                      label="Project Description (Plain Text Mode)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={10}
                      placeholder="Write in normal English. Paragraph breaks will be formatted automatically..."
                      required
                    />
                  )}
                </div>
              </div>
            </Card>

            {/* 2. Investment Scale & Financial Yield */}
            <Card title="2. Investment Scale & Financial Yield">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <Input
                    label="Investment Scale / Range (Display Text)"
                    value={investmentRange}
                    onChange={(e) => setInvestmentRange(e.target.value)}
                    placeholder="e.g. ₹2 Cr - ₹10 Cr or USD $500K+"
                    required
                  />
                  <Input
                    label="Project Model / Investment Mode"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="e.g. PPP, Private Equity, Joint Venture"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <Input
                    label="Min Amount (INR digits)"
                    type="number"
                    value={investmentMin}
                    onChange={(e) => setInvestmentMin(e.target.value)}
                    placeholder="e.g. 20000000"
                  />
                  <Input
                    label="Max Amount (INR digits)"
                    type="number"
                    value={investmentMax}
                    onChange={(e) => setInvestmentMax(e.target.value)}
                    placeholder="e.g. 100000000"
                  />
                  <Input
                    label="Expected ROI / Yield"
                    value={expectedRoi}
                    onChange={(e) => setExpectedRoi(e.target.value)}
                    placeholder="e.g. 18% - 22% IRR"
                  />
                </div>

                <Textarea
                  label="Key Strategic Highlights (One per line)"
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  rows={3}
                  placeholder="Prime riverfront access with private docking&#10;State heritage tax rebates&#10;Guaranteed festival peak occupancy"
                />

                <Textarea
                  label="State Government Incentives & Single Window Support"
                  value={incentives}
                  onChange={(e) => setIncentives(e.target.value)}
                  rows={3}
                  placeholder="Eligible subsidies under West Bengal Tourism / MSME Policy, stamp duty waivers, and fast-track clearance."
                />
              </div>
            </Card>

            {/* 3. Attached Documents & Dossiers */}
            <Card title="3. Attached Documents, Project Decks & Dossiers">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--colour-ink-soft, #64748b)', lineHeight: 1.5 }}>
                  Attach project dossiers, detailed project reports (DPRs), investor pitch decks, financial models, or government notifications that prospective investors can download directly from the showcase.
                </p>

                {/* Quick Presets */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--colour-ink-soft, #94a3b8)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Quick Presets:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px' }}
                      onClick={() => {
                        setDocTitle('Detailed Project Report (DPR)');
                        setDocType('PDF');
                        setDocSize('4.5 MB');
                      }}
                    >
                      + Detailed Project Report (PDF)
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px' }}
                      onClick={() => {
                        setDocTitle('Executive Investor Pitch Deck');
                        setDocType('PPTX');
                        setDocSize('8.2 MB');
                      }}
                    >
                      + Investor Pitch Deck (PPTX)
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px' }}
                      onClick={() => {
                        setDocTitle('Project Financial Model & Projections');
                        setDocType('XLSX');
                        setDocSize('1.8 MB');
                      }}
                    >
                      + Financial Model (XLSX)
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px' }}
                      onClick={() => {
                        setDocTitle('State Tourism Policy Guidelines & Subsidies');
                        setDocType('PDF');
                        setDocSize('2.1 MB');
                      }}
                    >
                      + State Policy Notification (PDF)
                    </button>
                  </div>
                </div>

                {/* Add Document Box */}
                <div
                  style={{
                    background: 'var(--colour-canvas, #f8fafc)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--colour-border, #e2e8f0)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--colour-ink, #1e293b)' }}>
                    ➕ Add a New Document / Dossier
                  </div>

                  {docError && (
                    <div style={{ fontSize: '0.8rem', color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
                      {docError}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <Input
                      label="Document Title"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="e.g. Detailed Project Report (DPR)"
                    />
                    <Input
                      label="Document File / Download URL"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      placeholder="https://... or /uploads/documents/dpr.pdf"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) auto', gap: '12px', alignItems: 'flex-end' }}>
                    <Select
                      label="File Type / Format"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      options={FILE_TYPES}
                    />
                    <Input
                      label="File Size (Optional)"
                      value={docSize}
                      onChange={(e) => setDocSize(e.target.value)}
                      placeholder="e.g. 3.2 MB"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => handleAddDocument()}
                      style={{ height: '40px', whiteSpace: 'nowrap' }}
                    >
                      + Add to List
                    </Button>
                  </div>
                </div>

                {/* Attached Documents List */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--colour-ink, #1e293b)', marginBottom: '10px' }}>
                    Attached Files ({documents.length}):
                  </div>

                  {documents.length === 0 ? (
                    <div
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        background: 'var(--colour-canvas, #f8fafc)',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: '1px dashed var(--colour-border, #cbd5e1)',
                        color: 'var(--colour-ink-soft, #94a3b8)',
                        fontSize: '0.875rem',
                      }}
                    >
                      No documents attached yet. Use the form above or pick a preset to add project dossiers.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {documents.map((doc, idx) => {
                        const isPdf = (doc.fileType || '').toUpperCase().includes('PDF');
                        const isXls = (doc.fileType || '').toUpperCase().includes('XLS');
                        const isPpt = (doc.fileType || '').toUpperCase().includes('PPT');
                        const iconColor = isPdf ? '#dc2626' : isXls ? '#16a34a' : isPpt ? '#ea580c' : '#4f46e5';
                        const iconBadge = isPdf ? '📕 PDF' : isXls ? '📊 XLS' : isPpt ? '📽️ PPT' : '📄 DOC';

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 14px',
                              background: 'var(--colour-surface, #ffffff)',
                              borderRadius: 'var(--radius-md, 8px)',
                              border: '1px solid var(--colour-border, #e2e8f0)',
                              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.03))',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              <span
                                style={{
                                  background: 'var(--colour-canvas, #f1f5f9)',
                                  color: iconColor,
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: `1px solid ${iconColor}33`,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {iconBadge}
                              </span>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--colour-ink, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {doc.title}
                                </div>
                                <div style={{ fontSize: '0.775rem', color: 'var(--colour-ink-soft, #64748b)', display: 'flex', gap: '8px' }}>
                                  <span style={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    🔗 {doc.url}
                                  </span>
                                  {doc.fileSize && <span>• {doc.fileSize}</span>}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              {doc.url && (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn--outline btn--sm"
                                  style={{ fontSize: '0.775rem', padding: '4px 8px' }}
                                >
                                  Test URL ↗
                                </a>
                              )}
                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveDocument(idx)}
                                style={{ padding: '4px 8px', fontSize: '0.775rem' }}
                              >
                                🗑 Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1fr): Workflow, Chamber & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 20px)' }}>
            {/* Publish & Actions Card */}
            <Card title="Opportunity Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--colour-ink-soft, #64748b)', lineHeight: 1.4 }}>
                  {isEditing
                    ? 'Save your edits. If the opportunity is published, changes will update immediately.'
                    : 'This opportunity will be saved in Draft status. You can submit it for approval from the detail page.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Button variant="primary" type="submit" loading={saving} style={{ width: '100%' }}>
                    {isEditing ? '💾 Save Changes' : '💾 Save as Draft'}
                  </Button>
                  <Link to={ROUTES.ADMIN_INVESTMENTS} className="btn btn--secondary" style={{ width: '100%', textAlign: 'center' }}>
                    Cancel
                  </Link>
                </div>
              </div>
            </Card>

            {/* Facilitation Chamber */}
            <Card title="Assigned Industry Chamber">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Select
                  label="Chamber / Association"
                  value={associationId}
                  onChange={(e) => setAssociationId(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Industry Chamber --' },
                    ...associations.map((a) => ({ value: String(a.id), label: `${a.code} - ${a.name}` })),
                  ]}
                />

                {selectedAssociation && (
                  <div
                    style={{
                      background: 'var(--colour-canvas, #f8fafc)',
                      border: '1px solid var(--colour-border, #e2e8f0)',
                      borderRadius: 'var(--radius-md, 8px)',
                      padding: '12px',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--colour-ink)' }}>
                      {selectedAssociation.name} ({selectedAssociation.code})
                    </div>
                    {selectedAssociation.contactPerson && (
                      <div style={{ fontSize: '0.775rem', color: 'var(--colour-ink-soft)', marginTop: '4px' }}>
                        Contact: {selectedAssociation.contactPerson}
                      </div>
                    )}
                    {selectedAssociation.email && (
                      <div style={{ fontSize: '0.775rem', color: 'var(--colour-ink-soft)' }}>
                        Email: {selectedAssociation.email}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Media & Visibility Settings */}
            <Card title="Media & Showcase Settings">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Input
                  label="Cover Image URL"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                />

                {coverImageUrl && (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--colour-border)', maxHeight: '160px' }}>
                    <img
                      src={coverImageUrl}
                      alt="Cover Preview"
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <Input
                  label="Contact Email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="invest@chamber.com"
                />

                <Input
                  label="Contact Helpline"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91-33-2220-8332"
                />

                <Input
                  label="Display Sort Order (Lower = higher priority)"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />

                <div style={{ paddingTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    🌟 Mark as Featured Opportunity
                  </label>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default InvestmentOpportunityFormPage;
