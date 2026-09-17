import { useEffect, useState } from 'react';

/**
 * Delays a rapidly-changing value, so a search box triggers one request after
 * typing stops rather than one per keystroke.
 */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);

    // Clearing on each change is what actually produces the debounce: a new
    // keystroke cancels the pending update before it fires.
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
