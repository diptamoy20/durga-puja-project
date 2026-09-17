import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Accessible dialog built on the native `<dialog>` element, which gives focus
 * trapping and Escape-to-close for free rather than reimplementing them.
 */
export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // Fires for Escape as well as programmatic close, keeping React state in
    // step with the element's own open/closed state.
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog ref={ref} className="modal" aria-labelledby="modal-title">
      <div className="modal__panel">
        <header className="modal__header">
          <h2 className="modal__title" id="modal-title">
            {title}
          </h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn btn--secondary btn--md" onClick={onCancel} disabled={busy}>
            <span>Cancel</span>
          </button>
          <button
            type="button"
            className={`btn btn--${destructive ? 'danger' : 'primary'} btn--md`}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            <span>{busy ? 'Working…' : confirmLabel}</span>
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
