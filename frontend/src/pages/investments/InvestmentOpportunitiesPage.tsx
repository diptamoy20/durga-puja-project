import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { adminInvestmentService } from '@/services/investmentService';
import type {
  InvestmentOpportunity,
  InvestmentOpportunityStatus,
  InvestmentAdminStats,
} from '@/types/investments';

import '@/styles/investments-admin.css';

const STATUS_TABS: { label: string; value: string; color?: string }[] = [
  { label: 'All Opportunities', value: '' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export const InvestmentOpportunitiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || '';
  const toast = useToast();
  const { can } = useAuth();

  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [stats, setStats] = useState<InvestmentAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<InvestmentOpportunity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_INVESTMENTS);
  const canDelete = can(PERMISSIONS.DELETE_INVESTMENTS);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        adminInvestmentService.opportunities.list({
          status: currentStatus || undefined,
          search: search.trim() || undefined,
          perPage: 100,
        }),
        adminInvestmentService.stats(),
      ]);
      setOpportunities(listRes.items);
      setStats(statsRes);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleTabChange = (statusValue: string) => {
    if (statusValue) {
      setSearchParams({ status: statusValue });
    } else {
      setSearchParams({});
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminInvestmentService.opportunities.remove(deleteTarget.id as any);
      toast.success(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete opportunity');
    } finally {
      setDeleting(false);
    }
  };

  const renderStatusBadge = (status: InvestmentOpportunityStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="neutral">Draft</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'APPROVED':
        return <Badge variant="info">Approved</Badge>;
      case 'PUBLISHED':
        return <Badge variant="success">Published</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'ARCHIVED':
        return <Badge variant="neutral">Archived</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="page investor-admin-page">
      {/* Standard CMS Page Header */}
      <PageHeader
        title="Investment Opportunities & Showcase"
        description="Manage investment projects, review editorial approval workflows, and publish verified dossiers to the public showcase."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Investor Showcase' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2, 8px)', flexWrap: 'wrap' }}>
            <Link to={ROUTES.ADMIN_INVESTMENT_ENQUIRIES} className="btn btn--outline btn--md">
              <i className="fas fa-envelope-open-text" style={{ marginRight: '6px' }} />
              Enquiries ({stats?.ENQUIRIES ?? 0})
            </Link>
            <Link to={ROUTES.ADMIN_INVESTMENT_ASSOCIATIONS} className="btn btn--outline btn--md">
              <i className="fas fa-building" style={{ marginRight: '6px' }} />
              Chambers & Associations
            </Link>
            <Link to={ROUTES.PUBLIC_INVESTOR_SHOWCASE} target="_blank" className="btn btn--ghost btn--md">
              <i className="fas fa-external-link-alt" style={{ marginRight: '6px' }} />
              Public Showcase ↗
            </Link>
            {canCreate && (
              <Link to={ROUTES.ADMIN_INVESTMENT_NEW} className="btn btn--primary btn--md">
                <i className="fas fa-plus" style={{ marginRight: '6px' }} />
                New Opportunity
              </Link>
            )}
          </div>
        }
      />

      {/* KPI Stats Summary Cards */}
      <div className="inv-stats-grid">
        <div className="inv-stat-widget" style={{ borderTop: '3px solid #64748b' }}>
          <div className="inv-stat-widget__val" style={{ color: 'var(--colour-ink, #0f172a)' }}>
            {stats?.TOTAL ?? opportunities.length}
          </div>
          <div className="inv-stat-widget__lbl">Total Projects</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #94a3b8' }}>
          <div className="inv-stat-widget__val" style={{ color: '#475569' }}>
            {stats?.DRAFT ?? 0}
          </div>
          <div className="inv-stat-widget__lbl">Drafts</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #d97706' }}>
          <div className="inv-stat-widget__val" style={{ color: '#d97706' }}>
            {stats?.PENDING_APPROVAL ?? 0}
          </div>
          <div className="inv-stat-widget__lbl">Pending Review</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #2563eb' }}>
          <div className="inv-stat-widget__val" style={{ color: '#2563eb' }}>
            {stats?.APPROVED ?? 0}
          </div>
          <div className="inv-stat-widget__lbl">Approved</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #059669' }}>
          <div className="inv-stat-widget__val" style={{ color: '#059669' }}>
            {stats?.PUBLISHED ?? 0}
          </div>
          <div className="inv-stat-widget__lbl">Live Published</div>
        </div>

        <div className="inv-stat-widget" style={{ borderTop: '3px solid #9333ea' }}>
          <div className="inv-stat-widget__val" style={{ color: '#9333ea' }}>
            {stats?.ENQUIRIES ?? 0}
          </div>
          <div className="inv-stat-widget__lbl">Investor Leads</div>
        </div>
      </div>

      {/* Filter & Status Navigation Card */}
      <div className="inv-filter-card">
        <div className="inv-filter-row">
          <div className="inv-pill-group">
            {STATUS_TABS.map((tab) => {
              const isActive = currentStatus === tab.value;
              const count = tab.value === '' ? stats?.TOTAL : stats ? (stats as any)[tab.value] : undefined;

              return (
                <button
                  key={tab.value}
                  type="button"
                  className={`inv-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.value)}
                >
                  <span>{tab.label}</span>
                  {count !== undefined && (
                    <span className="pill-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '320px', flex: '1 1 320px', maxWidth: '480px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="search"
                className="field__control"
                placeholder="Search opportunities, sector, location..."
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
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setSearch('');
                  loadData();
                }}
              >
                Reset
              </Button>
            )}
          </form>
        </div>
      </div>

      {/* Opportunities Table Card */}
      <Card>
        {loading ? (
          <div style={{ padding: '60px 0' }}>
            <PageLoader label="Loading investment opportunities..." />
          </div>
        ) : opportunities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--colour-ink)' }}>No Investment Opportunities Found</h3>
            <p style={{ color: 'var(--colour-ink-soft)', margin: '0 0 20px', fontSize: '0.925rem' }}>
              {currentStatus ? `There are no projects currently in "${currentStatus}" status.` : 'No investment projects have been created yet.'}
            </p>
            {canCreate && (
              <Link to={ROUTES.ADMIN_INVESTMENT_NEW} className="btn btn--primary btn--md">
                <i className="fas fa-plus" style={{ marginRight: '6px' }} />
                Create First Opportunity
              </Link>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Opportunity Details</th>
                  <th>Sector & Location</th>
                  <th>Investment Scale</th>
                  <th>Assigned Chamber</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Leads</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <div className="inv-table-title">{opp.title}</div>
                      <div className="inv-table-slug">/{opp.slug}</div>
                    </td>
                    <td>
                      <div className="inv-table-sector">{opp.sector}</div>
                      <div className="inv-table-location">
                        <i className="fas fa-map-marker-alt" style={{ color: '#ef4444', fontSize: '0.75rem' }} />
                        {opp.location}
                      </div>
                    </td>
                    <td>
                      <span className="inv-table-scale">
                        {opp.investmentRange || opp.scaleOrRange || 'Open / Flexible'}
                      </span>
                    </td>
                    <td>
                      {opp.association ? (
                        <span className="inv-badge-chamber" title={opp.association.name}>
                          <i className="fas fa-landmark" style={{ color: '#64748b', fontSize: '0.75rem' }} />
                          {opp.association.code}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.775rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td>{renderStatusBadge(opp.status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`inv-enquiry-count-badge ${(opp._count?.enquiries || 0) > 0 ? 'inv-enquiry-count-badge--has' : ''}`}>
                        {opp._count?.enquiries ?? 0}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="inv-actions-cell">
                        <Link
                          to={ROUTES.ADMIN_INVESTMENT_DETAIL(opp.id)}
                          className="btn btn--secondary btn--sm"
                          title="Review workflow & details"
                        >
                          <i className="fas fa-eye" style={{ marginRight: '4px' }} />
                          Review
                        </Link>
                        {opp.status !== 'PUBLISHED' && (
                          <Link
                            to={ROUTES.ADMIN_INVESTMENT_EDIT(opp.id)}
                            className="btn btn--outline btn--sm"
                            title="Edit opportunity specifications"
                          >
                            <i className="fas fa-edit" />
                          </Link>
                        )}
                        {opp.status === 'PUBLISHED' && (
                          <Link
                            to={ROUTES.PUBLIC_INVESTOR_OPPORTUNITY_DETAIL(opp.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--ghost btn--sm"
                            title="View public live showcase page"
                          >
                            <i className="fas fa-external-link-alt" style={{ color: '#059669', marginRight: '4px' }} />
                            Live
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(opp)}
                            title="Delete Opportunity"
                          >
                            <i className="fas fa-trash" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Investment Opportunity?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action will remove the opportunity and historical logs.`}
        confirmLabel="Delete Opportunity"
        destructive={true}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default InvestmentOpportunitiesPage;
