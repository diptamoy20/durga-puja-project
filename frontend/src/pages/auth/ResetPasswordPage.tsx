import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { errorMessage } from '@/services/api';

interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>();

  const password = watch('password');

  const onSubmit = async (values: ResetFormValues) => {
    setFailure(null);

    try {
      await authService.resetPassword({ token, email, password: values.password });
      setDone(true);
    } catch (error) {
      setFailure(errorMessage(error, 'Unable to reset the password.'));
    }
  };

  // A link that lost its query string cannot be completed, so say so rather
  // than letting the user fill in a form that is certain to fail.
  if (!token || !email) {
    return (
      <div className="auth-form">
        <div className="auth-header">
          <div className="auth-header__icon auth-header__icon--warning">
            <i className="fas fa-triangle-exclamation" aria-hidden="true" />
          </div>
          <h2>Link Not Valid</h2>
          <p>This reset link is incomplete or has expired</p>
        </div>

        <Link className="auth-button-link" to={ROUTES.FORGOT_PASSWORD}>
          <i className="fas fa-redo" aria-hidden="true" /> Request a New Link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-form">
        <div className="auth-header">
          <div className="auth-header__icon">
            <i className="fas fa-circle-check" aria-hidden="true" />
          </div>
          <h2>Password Updated</h2>
          <p>You can now sign in with your new password</p>
        </div>

        <Link className="auth-button-link" to={ROUTES.LOGIN}>
          <i className="fas fa-sign-in-alt" aria-hidden="true" /> Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div className="auth-header">
        <div className="auth-header__icon">
          <i className="fas fa-lock-open" aria-hidden="true" />
        </div>
        <h2>Choose a New Password</h2>
        <p>Resetting the password for {email}</p>
      </div>

      {failure && <Alert variant="error">{failure}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="New Password"
          icon="fa-lock"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          hint="At least 8 characters, with upper and lower case letters and a number."
          autoFocus
          required
          error={errors.password?.message}
          {...register('password', {
            required: 'Choose a password.',
            minLength: { value: 8, message: 'Use at least 8 characters.' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Include upper and lower case letters and a number.',
            },
          })}
        />

        <Input
          label="Confirm New Password"
          icon="fa-check-circle"
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Re-enter the password.',
            validate: (value) => value === password || 'The passwords do not match.',
          })}
        />

        <Button
          type="submit"
          variant="auth"
          fullWidth
          loading={isSubmitting}
          leadingIcon={<i className="fas fa-shield-halved" aria-hidden="true" />}
        >
          Update Password
        </Button>

        <div className="auth-link">
          Remember your password?{' '}
          <Link to={ROUTES.LOGIN}>
            <i className="fas fa-sign-in-alt" aria-hidden="true" /> Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
