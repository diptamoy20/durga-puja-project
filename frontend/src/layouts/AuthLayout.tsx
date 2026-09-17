import { Outlet } from 'react-router-dom';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'fa-map-marked-alt',
    title: 'Explore Destinations',
    description: 'Browse curated travel destinations and hidden gems',
  },
  {
    icon: 'fa-calendar-check',
    title: 'Plan & Book',
    description: 'Organize your trips and book accommodations easily',
  },
  {
    icon: 'fa-users',
    title: 'Community',
    description: 'Connect with fellow travellers and share experiences',
  },
  {
    icon: 'fa-star',
    title: 'Top Rated',
    description: 'Access reviews and ratings from verified travellers',
  },
];

/**
 * Split-screen shell for sign-in, register and password recovery.
 *
 * The left panel is decorative and is hidden below 768px, so the form gets the
 * full width on a phone — same behaviour as the Blade layout it replaces.
 */
export function AuthLayout() {
  return (
    <div className="auth-container">
      <div className="auth-grid">
        <aside className="auth-left">
          <h1>Welcome to Tourism Portal</h1>
          <p>
            Discover amazing destinations, plan your perfect journey, and create unforgettable
            memories with our comprehensive tourism management platform.
          </p>

          <div className="auth-features">
            {FEATURES.map((feature) => (
              <div className="auth-feature" key={feature.title}>
                <i className={`fas ${feature.icon}`} aria-hidden="true" />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="auth-right">
          <div className="auth-panel">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
