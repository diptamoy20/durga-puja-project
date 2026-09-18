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

function navItemIsActive(item: NavItem, pathname: string, search: string): boolean {
  if (!item.to) return false;

  const [itemPath, itemQuery = ''] = item.to.split('?');
  const currentParams = new URLSearchParams(search);
  const itemParams = new URLSearchParams(itemQuery);

  const pathMatches = itemQuery
    ? pathname === itemPath
    : item.end === true
      ? pathname === itemPath
      : pathname === itemPath || pathname.startsWith(`${itemPath}/`);

  if (!pathMatches) return false;

  if (itemQuery) {
    for (const [key, value] of itemParams.entries()) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  }

  if (item.to === ROUTES.PUBLIC_ATLAS) {
    return pathname === ROUTES.PUBLIC_ATLAS || pathname.startsWith(`${ROUTES.PUBLIC_ATLAS}/`);
  }

  // Unfiltered list links stay inactive when a status query is present.
  if (item.to === ROUTES.PANDAL_ATLAS || item.to === ROUTES.COMMITTEES || item.to === ROUTES.ARTICLES) {
    return !currentParams.get('status');
  }

  if (item.to === ROUTES.GALLERY_MEDIA) {
    return !currentParams.get('status');
  }

  if (item.to === ROUTES.MY_COMMITTEE_MEDIA) {
    return !currentParams.get('status');
  }

  if (item.to === ROUTES.WEBINARS) {
    return !currentParams.get('status');
  }

  return true;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { can } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

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
        .filter((section) => section.items.length > 0),
    [can],
  );

  const activeSection = useMemo(() => {
    return sections.find((section) =>
      section.items.some((item) => navItemIsActive(item, pathname, search)),
    )?.label;
  }, [sections, pathname, search]);

  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeSection) setToggled((prev) => ({ ...prev, [activeSection]: true }));
  }, [activeSection]);

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
                      onClick={onNavigate}
                      className={() =>
                        `sidebar__link ${navItemIsActive(item, pathname, search) ? 'is-active' : ''}`
                      }
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
