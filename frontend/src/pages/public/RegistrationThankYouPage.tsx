import { Link, useParams } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';

export function RegistrationThankYouPage() {
  const { type = 'diaspora', registrationNo = '' } = useParams<{ type: string; registrationNo: string }>();
  const isDiaspora = type === 'diaspora';

  return (
    <div className="registration-page registration-page--center">
      <Card>
        <div className="registration-thankyou">
          <div className="registration-thankyou__icon" aria-hidden="true">✓</div>
          <h1>
            Thank you for your {isDiaspora ? 'Diaspora' : 'Puja Committee'} registration.
          </h1>
          <p className="registration-thankyou__label">Your registration number is</p>
          <p className="registration-thankyou__number">{registrationNo}</p>
          <p className="registration-thankyou__copy">
            A confirmation email has been sent to the address provided. Our team will review your submission and contact you if anything further is required.
          </p>
          <Link to={ROUTES.PUBLIC_CHOOSE_TYPE} className="btn btn--primary btn--md">
            Return to Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
