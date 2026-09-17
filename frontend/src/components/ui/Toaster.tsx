import { useEffect } from 'react';

import { dismissToast } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const AUTO_DISMISS_MS = 5000;

/**
 * Renders queued toasts and clears them automatically.
 *
 * Mounted once in App, so any component can notify the user by dispatching
 * `pushToast` without rendering anything itself.
 */
export function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toasts.length === 0) return;

    // One timer per toast, so each dismisses on its own schedule rather than
    // the whole stack disappearing when the oldest expires.
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dispatch(dismissToast(toast.id)), AUTO_DISMISS_MS),
    );

    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="toaster" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.variant}`} role="status">
          <span className="toast__message">{toast.message}</span>
          <button
            type="button"
            className="toast__close"
            onClick={() => dispatch(dismissToast(toast.id))}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
