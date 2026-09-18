import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { RegistrationSection } from '@/components/registration/RegistrationSection';
import { publicRegistrationService } from '@/services/registrationService';

interface RegistrationCaptchaProps {
  value: string;
  token: string;
  onChange: (value: string) => void;
  onTokenChange: (token: string) => void;
}

export function RegistrationCaptcha({ value, token, onChange, onTokenChange }: RegistrationCaptchaProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await publicRegistrationService.getCaptcha();
      setQuestion(result.question);
      onTokenChange(result.captchaToken);
      onChange('');
    } finally {
      setLoading(false);
    }
  }, [onChange, onTokenChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <RegistrationSection title="SECURITY CHECK" icon="shield-alt">
      <div className="form-grid form-grid--2">
        <div className="field">
          <label className="field__label" htmlFor="registrationCaptcha">
            Solve the calculation <span className="field__required">*</span>
          </label>
          <div className="registration-captcha">
            <span className="registration-captcha__question" id="captchaQuestion">
              {loading ? 'Loading…' : question}
            </span>
            <input
              id="registrationCaptcha"
              name="captcha"
              inputMode="numeric"
              required
              className="field__control"
              aria-describedby="captchaQuestion"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => void refresh()} aria-label="Refresh security question">
              Refresh
            </Button>
          </div>
          {!token && !loading && (
            <p className="field__hint">Captcha could not be loaded. Click refresh and try again.</p>
          )}
        </div>
      </div>
    </RegistrationSection>
  );
}
