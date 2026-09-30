import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import { associationService } from '@/services/associationService';
import { useToast } from '@/hooks/useToast';

const sampleHeaders = [
  'Name', 'Description', 'Established Year', 'Contact Person Name', 'Designation',
  'Email', 'Mobile', 'Website', 'Social Links', 'Country', 'State',
  'City', 'Postal Code', 'Address', 'Logo Image', 'Cover Image',
];

const sampleRow = [
  'Bengali Cultural Association of Kolkata',
  'Promoting Bengali heritage, art, and community events across Kolkata.',
  2015,
  'Dr. Amit Chatterjee',
  'President',
  'contact@bengaliculture.example',
  '+91 xxxxx xxxxx',
  'https://bengaliculture.example',
  '{"facebook":"https://facebook.com/bengaliculture"}',
  'India',
  'West Bengal',
  'Kolkata',
  '700001',
  '12 Sarat Bose Road, Kolkata, West Bengal 700001',
  'association-documents/logo-bengaliculture.png',
  'association-documents/cover-bengaliculture.png',
];

const IMPORT_TEMPLATE_URL = `${import.meta.env.BASE_URL}import-templates/association-import-template.xlsx`;

interface ImportResult {
  total: number;
  succeeded: number;
  failed: number;
  failures: Array<{ name: string; email: string; message: string }>;
}

export function AssociationImportPage() {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importKey, setImportKey] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      toastWarning('Choose an Excel file (.xlsx or .xls) to import.');
      return;
    }
    if (!/\.(xlsx|xls)$/i.test(importFile.name)) {
      toastError('Only .xlsx or .xls files are supported.');
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await associationService.importExcel(importFile);
      setImportResult(res);
      setImportFile(null);
      setImportKey((k) => k + 1);
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

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={ROUTES.DASHBOARD}>Dashboard</Link></li>
          <li><span>Import Associations</span></li>
        </ol>
      </nav>

      <header className="page__header">
        <Link to={ROUTES.ASSOCIATIONS} className="btn btn--secondary btn--sm">
          Back to Directory
        </Link>
        <div>
          <h1 className="page__title">Import Associations</h1>
          <p className="page__subtitle">
            Bulk-import associations from an Excel workbook (.xlsx or .xls). Every imported association is created as{' '}
            <strong>PENDING</strong> and enters the review workflow before appearing in the public directory.
          </p>
        </div>
      </header>

      <section className="card">
        <header className="card__header">
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <i className="fas fa-file-excel" aria-hidden="true" style={{ fontSize: 20, color: 'var(--colour-ink-faint)' }} />
            <h2 className="card__title">Bulk Import</h2>
          </div>
        </header>
        <div className="card__body">
          <form onSubmit={handleImport} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="associationImportFile">
                Excel file <span className="field__required">*</span>
              </label>
              <input
                id="associationImportFile"
                type="file"
                accept=".xlsx,.xls"
                key={importKey}
                style={{ display: 'none' }}
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-300)', alignItems: 'center' }}>
                <label htmlFor="associationImportFile" className="upload-button upload-button--primary" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-upload" aria-hidden="true" /> Choose File
                </label>
                <span style={{ fontSize: 'var(--font-sm)' }}>
                  {importFile ? (
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Selected: <strong style={{ color: 'var(--color-text)' }}>{importFile.name}</strong>
                    </span>
                  ) : (
                    <span className="field__hint" style={{ display: 'inline-block', marginTop: 0 }}>
                      No file selected
                    </span>
                  )}
                </span>
              </div>
              <p className="field__hint">
                Supported formats: .xlsx, .xls. One association per row, maximum 100 rows per batch.
              </p>
            </div>

            <Alert tone="info" title="Download Demo Excel" style={{ marginTop: 'var(--space-100)' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-300)',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 13 }}>
                  Download the template to see the exact column headers and sample data (India / West Bengal). Fill in
                  your data and upload it.{' '}
                  <strong>Use the provided template and do not change the header names.</strong>
                </span>
                <a className="btn btn--secondary btn--sm" href={IMPORT_TEMPLATE_URL} download="association-import-template.xlsx">
                  <i className="fas fa-file-download" aria-hidden="true" /> Download Demo Excel
                </a>
              </div>
            </Alert>

            <details style={{ marginBottom: 'var(--space-4)' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                Expected columns (first row = headers)
              </summary>
              <div
                className="table-wrapper"
                style={{
                  marginTop: 'var(--space-3)',
                  border: '1px solid var(--colour-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <table className="table table--matrix" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {sampleHeaders.map((header) => (
                        <th key={header} style={{ whiteSpace: 'nowrap' }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {sampleRow.map((cell, index) => (
                        <td key={index} style={{ whiteSpace: 'nowrap' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="field__hint" style={{ marginTop: 'var(--space-2)' }}>
                Keep the header row unchanged. The sample row shows expected values (from the demo template).
              </p>
            </details>

            <div className="form-actions">
              <Button type="submit" loading={importing} disabled={!importFile}>
                Import Associations
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setImportFile(null); setImportResult(null); setImportKey((k) => k + 1); }}
              >
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
        </div>
      </section>

      <Card title="Instructions">
        <ol
          style={{
            margin: 0,
            paddingLeft: 'var(--space-300)',
            display: 'grid',
            gap: 'var(--space-100)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-sm)',
          }}
        >
          <li>Download the demo Excel under "Bulk Import (Excel)".</li>
          <li>Fill in your association data in the sample rows.</li>
          <li>Do not rename, change, or remove headers.</li>
          <li>Add one association per row (maximum 100 rows per batch).</li>
          <li>Save the file as .xlsx or .xls.</li>
          <li>Upload the file above and click "Import Associations".</li>
        </ol>
        <Alert tone="warning" title="Important" style={{ marginTop: 'var(--space-300)' }}>
          <ul style={{ margin: 0, paddingLeft: 'var(--space-300)' }}>
            <li>Do not change column headers.</li>
            <li>Do not add, remove, or rename columns.</li>
            <li>Use the provided template to avoid import errors.</li>
          </ul>
        </Alert>
      </Card>
    </div>
  );
}