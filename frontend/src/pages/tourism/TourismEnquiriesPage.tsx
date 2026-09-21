import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminTourismService } from '@/services/tourismService';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import type { TourismEnquiry, TourismEnquiryStatus, TourismAdminStats } from '@/types/tourism';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'New', value: 'NEW' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Itinerary Sent', value: 'ITINERARY_SENT' },
  { label: 'Closed', value: 'CLOSED' },
];

export function TourismEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<TourismEnquiry[]>([]);
  const [stats, setStats] = useState<TourismAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Quick Status Modal
  const [statusModalEnquiry, setStatusModalEnquiry] = useState<TourismEnquiry | null>(null);
  const [targetStatus, setTargetStatus] = useState<TourismEnquiryStatus>('UNDER_REVIEW');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: any = {};
      if (statusFilter !== 'all') query.status = statusFilter;
      if (search.trim()) query.search = search.trim();

      const [listRes, statsRes] = await Promise.allSettled([
        adminTourismService.enquiries.list(query),
        adminTourismService.stats.get(),
      ]);

      if (listRes.status === 'fulfilled') {
        setEnquiries(listRes.value.items || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      setError('Unable to load tourism concierge enquiries.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenStatusModal = (enq: TourismEnquiry) => {
    setStatusModalEnquiry(enq);
    setTargetStatus(
      enq.status === 'NEW'
        ? 'UNDER_REVIEW'
        : enq.status === 'UNDER_REVIEW'
        ? 'ASSIGNED'
        : enq.status === 'ASSIGNED'
        ? 'CONTACTED'
        : enq.status === 'CONTACTED'
        ? 'ITINERARY_SENT'
        : 'CLOSED',
    );
    setStatusComment('');
  };

  const handleSaveStatus = async () => {
    if (!statusModalEnquiry) return;
    setUpdatingStatus(true);
    try {
      await adminTourismService.enquiries.updateStatus(
        statusModalEnquiry.id,
        targetStatus,
        statusComment || `Status changed to ${targetStatus}`,
      );
      setStatusModalEnquiry(null);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update enquiry status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusVariant = (st: string): 'danger' | 'warning' | 'info' | 'success' | 'neutral' => {
    switch (st) {
      case 'NEW':
        return 'danger';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'ASSIGNED':
      case 'CONTACTED':
      case 'ITINERARY_SENT':
        return 'info';
      case 'CLOSED':
        return 'success';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Tourism Concierge Enquiries"
        description="Manage pilgrim and tourist trip-planning enquiries, assign handlers, and track 6-stage workflow."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Tourism Concierge' }]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Link to={ROUTES.PUBLIC_TRIP_PLANNER} target="_blank" className="btn btn--outline btn--md">
              View Public Planner ↗
            </Link>
            <Button variant="secondary" size="md" onClick={loadData}>
              ↻ Refresh
            </Button>
          </div>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {/* KPI Stats Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <Card style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--colour-ink)' }}>
            {stats?.enquiries?.total_enquiries ?? enquiries.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', fontWeight: 600, marginTop: '4px' }}>
            Total Enquiries
          </div>
        </Card>

        <Card style={{ textAlign: 'center', padding: 'var(--space-3)', borderTop: '3px solid #dc2626' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>
            {stats?.enquiries?.new_count ?? enquiries.filter((e) => e.status === 'NEW').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', fontWeight: 600, marginTop: '4px' }}>
            New
          </div>
        </Card>

        <Card style={{ textAlign: 'center', padding: 'var(--space-3)', borderTop: '3px solid #d97706' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>
            {stats?.enquiries?.under_review_count ?? enquiries.filter((e) => e.status === 'UNDER_REVIEW').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', fontWeight: 600, marginTop: '4px' }}>
            Under Review
          </div>
        </Card>

        <Card style={{ textAlign: 'center', padding: 'var(--space-3)', borderTop: '3px solid #2563eb' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>
            {enquiries.filter((e) => e.status === 'ASSIGNED' || e.status === 'CONTACTED').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', fontWeight: 600, marginTop: '4px' }}>
            Assigned / Contacted
          </div>
        </Card>

        <Card style={{ textAlign: 'center', padding: 'var(--space-3)', borderTop: '3px solid #9333ea' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#9333ea' }}>
            {enquiries.filter((e) => e.status === 'ITINERARY_SENT').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', fontWeight: 600, marginTop: '4px' }}>
            Itinerary Sent
          </div>
        </Card>

        <Card style={{ textAlign: 'center', padding: 'var(--space-3)', borderTop: '3px solid #059669' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
            {stats?.enquiries?.closed_count ?? enquiries.filter((e) => e.status === 'CLOSED').length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--colour-ink-soft)', fontWeight: 600, marginTop: '4px' }}>
            Closed
          </div>
        </Card>
      </div>

      {/* Filter Card */}
      <Card className="mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={statusFilter === opt.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '280px' }}>
            <input
              type="search"
              className="field__control"
              placeholder="Search code, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
          </form>
        </div>
      </Card>

      {/* Enquiries Table Card */}
      <Card>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Enquiry Code</th>
                <th>Traveler Name</th>
                <th>Contact</th>
                <th>Origin / Country</th>
                <th>Party / Dates</th>
                <th>Language</th>
                <th>Status</th>
                <th>Received</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    Loading concierge enquiries…
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No tourism concierge enquiries found matching current filters.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td>
                      <Link
                        to={ROUTES.ADMIN_TOURISM_ENQUIRY_DETAIL(enq.id)}
                        style={{ color: 'var(--colour-brand)', fontWeight: 700, textDecoration: 'none' }}
                      >
                        {enq.enquiryCode}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{enq.fullName}</div>
                    </td>
                    <td style={{ color: 'var(--colour-ink-soft)', fontSize: '12.5px' }}>
                      <div>{enq.email}</div>
                      <div>{enq.phone}</div>
                    </td>
                    <td>
                      {enq.city ? `${enq.city}, ` : ''}{enq.country}
                    </td>
                    <td style={{ fontSize: '12.5px' }}>
                      <div>{enq.numberOfTravellers} pax ({enq.durationPreference || '3-4 Days'})</div>
                      <div style={{ color: 'var(--colour-ink-soft)', fontSize: '11.5px' }}>
                        {enq.startDate ? new Date(enq.startDate).toLocaleDateString() : 'Flexible'}
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {enq.preferredLanguage || 'en'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(enq.status)}>
                        {enq.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--colour-ink-soft)', fontSize: '12px' }}>
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                        <Link
                          to={ROUTES.ADMIN_TOURISM_ENQUIRY_DETAIL(enq.id)}
                          className="btn btn--outline btn--sm"
                        >
                          View
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenStatusModal(enq)}
                        >
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Status Modal */}
      <Modal
        open={Boolean(statusModalEnquiry)}
        onClose={() => setStatusModalEnquiry(null)}
        title={statusModalEnquiry ? `Update Status: ${statusModalEnquiry.enquiryCode}` : 'Update Status'}
      >
        <div>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--colour-ink-soft)' }}>
            Change workflow state for traveler {statusModalEnquiry?.fullName}.
          </p>

          <div className="field mb-4">
            <label className="field__label">
              New Status
            </label>
            <select
              className="field__control"
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as TourismEnquiryStatus)}
            >
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="CONTACTED">Contacted</option>
              <option value="ITINERARY_SENT">Itinerary Sent</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="field mb-4">
            <label className="field__label">
              Status Change Note / Remark
            </label>
            <textarea
              className="field__control"
              rows={3}
              placeholder="Optional remark or action taken..."
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setStatusModalEnquiry(null)}
              disabled={updatingStatus}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSaveStatus}
              disabled={updatingStatus}
            >
              {updatingStatus ? 'Updating...' : 'Confirm Status Change'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
