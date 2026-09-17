import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { errorMessage } from '@/services/api';

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setFailure(null);

    try {
      await authService.forgotPassword(email);
      // The API deliberately does not reveal whether the address exists, so
      // the same confirmation is shown either way.
      setSent(true);
    } catch (error) {
      setFailure(errorMessage(error, 'Unable to send the reset link.'));
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <div className="auth-header__icon">
          <i className="fas fa-key" aria-hidden="true" />
        </div>
        <h2>Reset Password</h2>
        <p>We&apos;ll help you regain access to your account</p>
      </div>

      <div className="auth-note">
        <i className="fas fa-info-circle" aria-hidden="true" />
        Forgot your password? No problem. Just let us know your email address and we&apos;ll send
        you a password reset link.
      </div>

      {sent ? (
        <>
          <div className="success-message">
            If an account exists for that address, a password reset link is on its way. The link
            expires in 60 minutes.
          </div>

          <Link className="auth-button-link" to={ROUTES.LOGIN}>
            <i className="fas fa-sign-in-alt" aria-hidden="true" /> Back to Sign In
          </Link>
        </>
      ) : (
        <>
          {failure && <Alert variant="error">{failure}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="Email Address"
              icon="fa-envelope"
              type="email"
              placeholder="your@email.com"
              autoComplete="username"
              autoFocus
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Enter your email address.',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
              })}
            />

            <Button
              type="submit"
              variant="auth"
              fullWidth
              loading={isSubmitting}
              leadingIcon={<i className="fas fa-envelope-open" aria-hidden="true" />}
            >
              Send Reset Link
            </Button>

            <div className="auth-link">
              Remember your password?{' '}
              <Link to={ROUTES.LOGIN}>
                <i className="fas fa-sign-in-alt" aria-hidden="true" /> Sign in
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
