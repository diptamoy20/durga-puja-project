import { useEffect, useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { NAVIGATION } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import type { NavItem } from '@/constants/navigation';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { can } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const appName = import.meta.env.VITE_APP_NAME ?? 'Durga Puja Global Summit';

  const sections = useMemo(
    () =>
      NAVIGATION.filter(
        (section) =>
          (!section.permissions || can(...section.permissions)) &&
          !(section.hiddenWhen && can(...section.hiddenWhen)),
      )
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => !item.permissions || can(...item.permissions)),
        }))
        // Hide items the user cannot use, then drop sections left empty.
        .filter((section) => section.items.length > 0),
    [can],
  );

  /** Label of the section holding the current route, if any. */
  const activeSection = useMemo(() => {
    const matches = (item: NavItem) =>
      item.to !== undefined && (item.end ? pathname === item.to : pathname.startsWith(item.to));

    return sections.find((section) => section.items.some(matches))?.label;
  }, [sections, pathname]);

  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  // Following a link into a collapsed section should reveal where you landed.
  useEffect(() => {
    if (activeSection) setToggled((prev) => ({ ...prev, [activeSection]: true }));
  }, [activeSection]);

  /**
   * `open` is read here rather than inside the updater: React clears
   * `currentTarget` once the handler returns, and the updater runs later.
   */
  const handleToggle = (label: string, event: SyntheticEvent<HTMLDetailsElement>) => {
    const { open: isOpen } = event.currentTarget;

    setToggled((prev) => ({ ...prev, [label]: isOpen }));
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} id="app-sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark" aria-hidden="true">
          <i className="fas fa-globe" />
        </span>
        <span className="sidebar__identity">
          <span className="sidebar__name">{appName}</span>
          <span className="sidebar__region">West Bengal</span>
        </span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {sections.map((section) => (
          <details
            key={section.label}
            className="menu-group"
            open={toggled[section.label] ?? (section.defaultOpen || section.label === activeSection)}
            onToggle={(event) => handleToggle(section.label, event)}
          >
            <summary className="menu-section-toggle">
              <span className="menu-section-label">{section.label}</span>
              <i className="fas fa-chevron-down menu-section-chevron" aria-hidden="true" />
            </summary>

            <ul className="menu-section-body">
              {section.items.map((item) => (
                <li key={`${section.label}:${item.label}`}>
                  {item.to ? (
                    <NavLink
                      to={item.to}
                      end={item.end}
                      // Closing the drawer on navigate matters on mobile, where
                      // the sidebar overlays the content it just linked to.
                      onClick={onNavigate}
                      className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
                    >
                      <i
                        className={`fas ${item.icon} sidebar__icon ${
                          item.tone ? `sidebar__icon--${item.tone}` : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span className="sidebar__text">{item.label}</span>
                    </NavLink>
                  ) : (
                    /* No screen behind it yet, so it is shown but inert rather
                       than linking nowhere. */
                    <span className="sidebar__link is-pending" aria-disabled="true">
                      <i className={`fas ${item.icon} sidebar__icon`} aria-hidden="true" />
                      <span className="sidebar__text">{item.label}</span>
                      <span className="sidebar__soon">Soon</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}

        <div className="sidebar__footer">
          <button type="button" className="sidebar__link sidebar__logout" onClick={handleLogout}>
            <i className="fas fa-arrow-right-from-bracket sidebar__icon" aria-hidden="true" />
            <span className="sidebar__text">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
