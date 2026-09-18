import type { ReactNode } from 'react';

interface RegistrationSectionProps {
  title: string;
  icon?: string;
  description?: string;
  children: ReactNode;
}

export function RegistrationSection({ title, icon, description, children }: RegistrationSectionProps) {
  return (
    <section className="registration-section card">
      <header className="registration-section__header card__header">
        <div>
          <h2 className="registration-section__title card__title">
            {icon && <i className={`fas fa-${icon}`} aria-hidden="true" />} {title}
          </h2>
          {description && <p className="card__description">{description}</p>}
        </div>
      </header>
      <div className="registration-section__body card__body">{children}</div>
    </section>
  );
}
