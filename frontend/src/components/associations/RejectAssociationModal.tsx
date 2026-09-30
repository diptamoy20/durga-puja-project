import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface RejectAssociationModalProps {
  open: boolean;
  associationName: string;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectAssociationModal({ open, associationName, busy, onConfirm, onCancel }: RejectAssociationModalProps) {
  const [reason, setReason] = useState('');

  const close = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal open={open} title="Reject Association" onClose={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason.trim()) return;
          onConfirm(reason.trim());
        }}
      >
        <p style={{ margin: '0 0 var(--space-300)' }}>
          Rejecting <strong>{associationName}</strong> keeps it out of the public directory.
        </p>
        <div className="field">
          <label className="field__label" htmlFor="rejectAssociationReason">
            Rejection reason <span className="field__required">*</span>
          </label>
          <textarea
            id="rejectAssociationReason"
            rows={4}
            required
            className="field__control"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="form-actions" style={{ marginTop: 'var(--space-300)' }}>
          <Button type="button" variant="secondary" size="md" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="md" loading={busy}>
            Reject
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RejectAssociationModal;