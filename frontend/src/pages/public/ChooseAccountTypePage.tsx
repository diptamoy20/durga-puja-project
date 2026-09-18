import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';

export function ChooseAccountTypePage() {
  return (
    <div className="registration-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to={ROUTES.PUBLIC_CHOOSE_TYPE}>Home</Link></li>
          <li><span>Create Account</span></li>
        </ol>
      </nav>

      <header className="registration-page__header registration-page__header--center">
        <h1>Create Your Account</h1>
        <p>Choose the registration that best describes you or your organisation.</p>
      </header>

      <div className="account-type-grid">
        <Card className="account-type-card">
          <div className="account-type-card__icon" aria-hidden="true">👥</div>
          <h2>Diaspora Registration</h2>
          <p>For individuals and families who want to stay connected with the global Bengali community.</p>
          <ul>
            <li>Community news and events</li>
            <li>Cultural and volunteer opportunities</li>
            <li>Festival discovery across cities</li>
          </ul>
          <Link to={ROUTES.PUBLIC_REGISTER_DIASPORA} className="btn btn--primary btn--md">
            Register as Diaspora
          </Link>
        </Card>

        <Card className="account-type-card">
          <div className="account-type-card__icon" aria-hidden="true">🏛️</div>
          <h2>Puja Committee Registration</h2>
          <p>For organisations and committees planning Durga Puja celebrations.</p>
          <ul>
            <li>Committee profile and festival details</li>
            <li>Visitor and programme information</li>
            <li>Global network visibility</li>
          </ul>
          <Link to={ROUTES.PUBLIC_REGISTER_COMMITTEE} className="btn btn--primary btn--md">
            Register a Committee
          </Link>
        </Card>
      </div>

      <p className="registration-page__footer-note">
        Already have a portal account? <Link to={ROUTES.LOGIN}>Log in</Link>.
      </p>
    </div>
  );
}
