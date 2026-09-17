import { Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from '@/routes';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/ui/Spinner';
import { Toaster } from '@/components/ui/Toaster';
import { loadSession, sessionExpired } from '@/store/slices/authSlice';
import { setSessionExpiredHandler } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';

export function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Validates any stored token before the router decides what to render.
    void dispatch(loadSession());

    // The axios interceptor cannot dispatch directly without importing the
    // store into the service layer, so it calls back into Redux from here.
    setSessionExpiredHandler(() => dispatch(sessionExpired()));
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>

      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
