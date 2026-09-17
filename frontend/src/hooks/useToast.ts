import { useCallback, useMemo } from 'react';

import { pushToast, type ToastVariant } from '@/store/slices/uiSlice';
import { useAppDispatch } from '@/store/hooks';

/**
 * Convenience wrapper so components do not build toast actions by hand.
 *
 * The returned object is memoised: it is commonly used inside effect
 * dependency arrays, and a fresh object each render would re-run them forever.
 */
export function useToast() {
  const dispatch = useAppDispatch();

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      dispatch(pushToast(message, variant));
    },
    [dispatch],
  );

  return useMemo(
    () => ({
      notify,
      success: (message: string) => notify(message, 'success'),
      error: (message: string) => notify(message, 'error'),
      warning: (message: string) => notify(message, 'warning'),
      info: (message: string) => notify(message, 'info'),
    }),
    [notify],
  );
}
