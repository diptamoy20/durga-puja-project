import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Topbar({ onToggleSidebar, sidebarOpen }: TopbarProps) {
  const { user, displayName } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const initials = (displayName.match(/\b\w/g) ?? ['?']).slice(0, 2).join('').toUpperCase();

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__toggle"
        onClick={onToggleSidebar}
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        aria-label="Toggle navigation"
      >
        <span aria-hidden="true">☰</span>
      </button>

      <div className="topbar__spacer" />

      <div className="topbar__account">
        <button
          type="button"
          className="topbar__avatar-button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span className="topbar__avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="topbar__identity">
            <span className="topbar__name">{displayName}</span>
            <span className="topbar__role">{user?.roles[0] ?? 'No role assigned'}</span>
          </span>
        </button>

        {menuOpen && (
          <>
            {/* Click-away target, so the menu closes on any outside click. */}
            <button
              type="button"
              className="topbar__backdrop"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
              tabIndex={-1}
            />

            <div className="topbar__menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="topbar__menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(ROUTES.PROFILE);
                }}
              >
                My profile
              </button>

              <button
                type="button"
                role="menuitem"
                className="topbar__menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(ROUTES.CHANGE_PASSWORD);
                }}
              >
                Change password
              </button>

              <button
                type="button"
                role="menuitem"
                className="topbar__menu-item topbar__menu-item--danger"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
