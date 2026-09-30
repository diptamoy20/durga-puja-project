import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { adminInvestmentService } from '@/services/investmentService';
import type {
  InvestmentEnquiry,
  InvestmentEnquiryStatus,
  IndustryAssociation,
} from '@/types/investments';
import { ROUTES } from '@/constants/routes';

import '@/styles/investments-admin.css';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'In Discussion', value: 'IN_DISCUSSION' },
  { label: 'Meeting Scheduled', value: 'MEETING_SCHEDULED' },
  { label: 'Closed / Converted', value: 'CLOSED_CONVERTED' },
  { label: 'Closed / Rejected', value: 'CLOSED_REJECTED' },
];

export const InvestmentEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<InvestmentEnquiry[]>([]);
  const [associations, setAssociations] = useState<IndustryAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [associationFilter, setAssociationFilter] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetchAssociations();
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [page, statusFilter, associationFilter]);

  const fetchAssociations = async () => {
    try {
      const data = await adminInvestmentService.getAssociations();
      setAssociations(data || []);
    } catch {
      // non-blocking
    }
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminInvestmentService.getEnquiries({
        page,
        limit,
        status: statusFilter || undefined,
        assignedAssociationId: associationFilter || undefined,
        search: search.trim() || undefined,
      });
      setEnquiries(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load investment enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEnquiries();
  };

  const renderStatusBadge = (status: InvestmentEnquiryStatus | string) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="danger">New Lead</Badge>;
      case 'UNDER_REVIEW':
      case 'IN_REVIEW':
        return <Badge variant="warning">Under Review</Badge>;
      case 'CONTACTED':
      case 'FORWARDED_TO_CHAMBER':
        return <Badge variant="info">Contacted</Badge>;
      case 'IN_DISCUSSION':
      case 'MEETING_SCHEDULED':
        return <Badge variant="info">In Discussion</Badge>;
      case 'CLOSED_CONVERTED':
      case 'CONVERTED':
        return <Badge variant="success">Converted</Badge>;
      case 'CLOSED_REJECTED':
      case 'CLOSED':
        return <Badge variant="neutral">Closed</Badge>;
      default:
        return <Badge variant="neutral">{status.replace(/_/g, ' ')}</Badge>;
    }
  };

  const newCount = enquiries.filter((e) => e.status === 'NEW').length;
  const reviewCount = enquiries.filter((e) => e.status === 'UNDER_REVIEW' || e.status === 'IN_REVIEW').length;
  const discussionCount = enquiries.filter((e) => e.status === 'CONTACTED' || e.status === 'IN_DISCUSSION' || e.status === 'MEETING_SCHEDULED').length;
  const closedCount = enquiries.filter((e) => e.status === 'CLOSED_CONVERTED' || e.status === 'CLOSED_REJECTED' || e.status === 'CLOSED').length;

  return (
    <div className="page investor-admin-page">
      {/* Page Header */}
      <PageHeader
        title="Investor Enquiries & Leads"
        description="Track, assign, and coordinate investment expressions of interest from domestic and global diaspora investors."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Investor Showcase', to: ROUTES.ADMIN_INVESTMENTS },
          { label: 'Enquiries' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2, 8px)', flexWrap: 'wrap' }}>
            <Link to={ROUTES.ADMIN_INVESTMENTS} className="btn btn--outline btn--md">
              <i className="fas fa-folder-open" style={{ marginRight: '6px' }} />
              Opportunities
            </Link>
            <Link to={ROUTES.ADMIN_INVESTMENT_ASSOCIATIONS} className="btn btn--outline btn--md">
              <i className="fas fa-building" style={{ marginRight: '6px' }} />
              Chambers
            </Link>
            <Button variant="secondary" size="md" onClick={fetchEnquiries}>
              <i className="fas fa-sync-alt" style={{ marginRight: '6px' }} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Stats Summary Cards */}
      <div className="inv-stats-grid">
        <div className="inv-stat-widget" style={{ borderTop: '3px solid #64748b' }}>
          <div className="inv-stat-widget__val" style={{ color: 'var(--colour-ink, #0f172a)' }}>
            {total || enquiries.length}
          </div>
          <div className="inv-stat-widget__lbl">Total Enquiries</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #dc2626' }}>
          <div className="inv-stat-widget__val" style={{ color: '#dc2626' }}>
            {newCount}
          </div>
          <div className="inv-stat-widget__lbl">New Inquiries</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #d97706' }}>
          <div className="inv-stat-widget__val" style={{ color: '#d97706' }}>
            {reviewCount}
          </div>
          <div className="inv-stat-widget__lbl">Under Review</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #2563eb' }}>
          <div className="inv-stat-widget__val" style={{ color: '#2563eb' }}>
            {discussionCount}
          </div>
          <div className="inv-stat-widget__lbl">In Discussion</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #059669' }}>
          <div className="inv-stat-widget__val" style={{ color: '#059669' }}>
            {closedCount}
          </div>
          <div className="inv-stat-widget__lbl">Closed / Converted</div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="inv-filter-card">
        <div className="inv-filter-row" style={{ gap: '16px' }}>
          <div className="inv-pill-group">
            {STATUS_FILTERS.slice(0, 5).map((f) => (
              <button
                key={f.value}
                type="button"
                className={`inv-pill-btn ${statusFilter === f.value ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: '1 1 340px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <input
                type="search"
                className="field__control"
                placeholder="Search investor, email, org, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '34px' }}
              />
              <i
                className="fas fa-search"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <select
              className="field__control"
              value={associationFilter}
              onChange={(e) => {
                setAssociationFilter(e.target.value);
                setPage(1);
              }}
              style={{ flex: '0 1 200px' }}
            >
              <option value="">All Chambers</option>
              {associations.map((assoc) => (
                <option key={assoc.id} value={assoc.id}>
                  {assoc.name} ({assoc.code})
                </option>
              ))}
            </select>

            <Button type="submit" variant="secondary" size="md">
              Filter
            </Button>

            {(search || statusFilter || associationFilter) && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setAssociationFilter('');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            )}
          </form>
        </div>
      </div>

      {error && (
        <Card style={{ color: '#ef4444', marginBottom: '16px' }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }} />
          {error}
        </Card>
      )}

      {/* Table Card */}
      <Card>
        {loading ? (
          <div style={{ padding: '60px 0' }}>
            <PageLoader label="Loading investor enquiries..." />
          </div>
        ) : enquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📩</div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--colour-ink)' }}>
              No Investor Enquiries Found
            </h3>
            <p style={{ color: 'var(--colour-ink-soft)', margin: 0, fontSize: '0.925rem' }}>
              No investment expressions of interest match the selected search criteria or filter.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Enquiry Code</th>
                  <th>Investor & Organization</th>
                  <th>Contact Details</th>
                  <th>Target Project / Sector</th>
                  <th>Proposed Scale</th>
                  <th>Assigned Chamber</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq: any) => {
                  const investorName = enq.fullName || enq.investorName || 'Anonymous Investor';
                  const orgName = enq.organization || enq.organizationName;
                  const opp = enq.opportunity;
                  const assoc = enq.association || enq.assignedAssociation;

                  return (
                    <tr key={enq.id}>
                      <td>
                        <span
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            background: '#f1f5f9',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            display: 'inline-block',
                          }}
                        >
                          {enq.enquiryCode}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{investorName}</div>
                        {orgName && (
                          <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '1px' }}>
                            <i className="fas fa-briefcase" style={{ fontSize: '0.75rem', marginRight: '4px', color: '#94a3b8' }} />
                            {orgName}
                          </div>
                        )}
                        {enq.designation && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{enq.designation}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                          <i className="fas fa-envelope" style={{ fontSize: '0.75rem', marginRight: '5px', color: '#64748b' }} />
                          {enq.email}
                        </div>
                        {enq.phone && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                            <i className="fas fa-phone" style={{ fontSize: '0.75rem', marginRight: '5px', color: '#94a3b8' }} />
                            {enq.phone}
                          </div>
                        )}
                        {enq.country && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            📍 {enq.country}
                          </div>
                        )}
                      </td>
                      <td>
                        {opp ? (
                          <Link
                            to={ROUTES.ADMIN_INVESTMENT_DETAIL(opp.id)}
                            style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}
                          >
                            {opp.title}
                          </Link>
                        ) : (
                          <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                            General: {enq.targetSector || 'Cross-Sector'}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem' }}>
                          {enq.proposedCapital || enq.investmentBudget || enq.indicativeBudget || 'Undisclosed'}
                        </span>
                      </td>
                      <td>
                        {assoc ? (
                          <span className="inv-badge-chamber" title={assoc.name}>
                            <i className="fas fa-landmark" style={{ color: '#64748b', fontSize: '0.75rem' }} />
                            {assoc.code}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.775rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>{renderStatusBadge(enq.status)}</td>
                      <td style={{ fontSize: '0.825rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(enq.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={ROUTES.ADMIN_INVESTMENT_ENQUIRY_DETAIL(enq.id)}
                          className="btn btn--secondary btn--sm"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <i className="fas fa-eye" style={{ marginRight: '4px' }} />
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {enquiries.length} of {total} enquiries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvestmentEnquiriesPage;

