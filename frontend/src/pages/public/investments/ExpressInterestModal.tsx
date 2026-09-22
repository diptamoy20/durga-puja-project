import { useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { publicInvestmentService } from '@/services/investmentService';
import type { InvestmentOpportunity, IndustryAssociation } from '@/types/investments';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: InvestmentOpportunity | null;
  association?: IndustryAssociation | null;
  onSuccess?: (enquiryCode: string) => void;
}

export function ExpressInterestModal({
  isOpen,
  onClose,
  opportunity,
  association,
  onSuccess,
}: ExpressInterestModalProps) {
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [designation, setDesignation] = useState('');
  const [investorType, setInvestorType] = useState('Individual / Angel');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('');
  const [investmentBudget, setInvestmentBudget] = useState(opportunity?.investmentRange || '');
  const [proposedTimeline, setProposedTimeline] = useState('3 - 6 Months');
  const [message, setMessage] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in all required fields (Name, Email, Phone, Message).');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const enquiry = await publicInvestmentService.enquiries.submit({
        opportunityId: opportunity?.id ? Number(opportunity.id) : undefined,
        associationId: association?.id ? Number(association.id) : opportunity?.associationId ? Number(opportunity.associationId) : undefined,
        fullName: fullName.trim(),
        organization: organization.trim() || undefined,
        designation: designation.trim() || undefined,
        investorType,
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim() || 'India',
        city: city.trim() || undefined,
        investmentBudget: investmentBudget.trim() || undefined,
        proposedTimeline,
        message: message.trim(),
      });

      setSubmittedCode(enquiry.enquiryCode);
      if (onSuccess) {
        onSuccess(enquiry.enquiryCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit enquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedCode(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleResetAndClose}
      title={
        submittedCode
          ? 'Interest Registered Successfully!'
          : `Express Interest: ${opportunity?.title || 'Investment Opportunity'}`
      }
      size="lg"
    >
      {submittedCode ? (
        <div style={{ textAlign: 'center', padding: '24px 8px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--colour-brand)' }}>
            Thank You for Expressing Interest!
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--colour-ink-soft)', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Your investment enquiry has been recorded and routed to the assigned Industry Chamber / State Single Window Cell.
          </p>

          <div
            style={{
              background: '#fef2f2',
              border: '1px dashed #dc2626',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '360px',
              margin: '0 auto 24px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#991b1b', letterSpacing: '0.5px' }}>
              Your Enquiry Reference Code
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b', marginTop: '4px', letterSpacing: '1px' }}>
              {submittedCode}
            </div>
          </div>

          <Button variant="primary" onClick={handleResetAndClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="enquiry-modal-form">
          {error && <Alert variant="error">{error}</Alert>}

          {opportunity && (
            <div style={{ background: '#f9fafb', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Target Opportunity:</strong> {opportunity.title} ({opportunity.sector})
              {opportunity.association && (
                <div style={{ color: 'var(--colour-ink-soft)', marginTop: '2px' }}>
                  Routed to: <strong>{opportunity.association.name}</strong>
                </div>
              )}
            </div>
          )}

          <div className="enquiry-form-grid">
            <Input
              label="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Debabrata Roy"
              required
            />
            <Input
              label="Official Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="enquiry-form-grid">
            <Input
              label="Phone / Mobile Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
            <Select
              label="Investor Profile"
              value={investorType}
              onChange={(e) => setInvestorType(e.target.value)}
              options={[
                { value: 'Individual / Angel', label: 'Individual / Angel Investor' },
                { value: 'Institutional / VC', label: 'Venture Capital / Private Equity' },
                { value: 'Corporate / Conglomerate', label: 'Corporate / Industrial House' },
                { value: 'Diaspora / NRI', label: 'Diaspora / Non-Resident Indian' },
                { value: 'MSME Entrepreneur', label: 'MSME Entrepreneur / Joint Venture' },
              ]}
            />
          </div>

          <div className="enquiry-form-grid">
            <Input
              label="Organization / Firm"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Company or Fund Name"
            />
            <Input
              label="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Managing Director, Partner, etc."
            />
          </div>

          <div className="enquiry-form-grid">
            <Input
              label="Country of Origin / Residence"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="India, United Kingdom, USA, etc."
            />
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Kolkata, London, Singapore, etc."
            />
          </div>

          <div className="enquiry-form-grid">
            <Input
              label="Target Investment Budget"
              value={investmentBudget}
              onChange={(e) => setInvestmentBudget(e.target.value)}
              placeholder="e.g. ₹2 Cr - ₹5 Cr or USD $500K"
            />
            <Select
              label="Proposed Deployment Timeline"
              value={proposedTimeline}
              onChange={(e) => setProposedTimeline(e.target.value)}
              options={[
                { value: 'Immediate (< 3 Months)', label: 'Immediate (< 3 Months)' },
                { value: '3 - 6 Months', label: '3 - 6 Months' },
                { value: '6 - 12 Months', label: '6 - 12 Months' },
                { value: 'Exploratory / Planning Stage', label: 'Exploratory / Planning Stage' },
              ]}
            />
          </div>

          <Textarea
            label="Specific Interests, Proposed Collaboration or Questions *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Describe your investment appetite, technical capabilities, or inquiries for the Chamber/State department..."
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button variant="secondary" type="button" onClick={handleResetAndClose} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={busy}>
              Submit Investment Enquiry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
