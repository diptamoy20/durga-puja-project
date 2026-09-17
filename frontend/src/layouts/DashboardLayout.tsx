import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/ui/Spinner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { setSidebarOpen, toggleSidebar } from '@/store/slices/uiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const DESKTOP_BREAKPOINT = 1024;

/** Authenticated shell: sidebar, topbar and the routed page. */
export function DashboardLayout() {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const location = useLocation();

  // The sidebar is a permanent column on desktop and an overlay drawer below
  // it, so the open state follows the viewport rather than being purely manual.
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

    const sync = (matches: boolean) => dispatch(setSidebarOpen(matches));

    sync(query.matches);

    const handleChange = (event: MediaQueryListEvent) => sync(event.matches);
    query.addEventListener('change', handleChange);

    return () => query.removeEventListener('change', handleChange);
  }, [dispatch]);

  const closeOnMobile = () => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) dispatch(setSidebarOpen(false));
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'app-shell--sidebar-open' : ''}`}>
      <Sidebar open={sidebarOpen} onNavigate={closeOnMobile} />

      {/* Dims and closes the drawer on mobile only; hidden on desktop by CSS. */}
      <div
        className="app-shell__overlay"
        onClick={closeOnMobile}
        role="presentation"
        aria-hidden="true"
      />

      <div className="app-shell__main">
        <Topbar onToggleSidebar={() => dispatch(toggleSidebar())} sidebarOpen={sidebarOpen} />

        <main className="app-shell__content" id="main-content">
          {/* Keyed on the path so a lazy page swap restarts the fallback
              instead of showing the previous page's spinner state. */}
          <Suspense key={location.pathname} fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
