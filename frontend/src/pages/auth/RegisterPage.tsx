import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { registerAccount } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RegisterPayload } from '@/types';

interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
  terms: boolean;
}

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  // Read here rather than in the validator so the rule re-evaluates when the
  // password changes, not only when the confirm field is edited.
  const password = watch('password');

  const onSubmit = async ({
    confirmPassword: _confirm,
    terms: _terms,
    ...payload
  }: RegisterFormValues) => {
    const result = await dispatch(registerAccount(payload));

    if (registerAccount.fulfilled.match(result)) {
      setSubmitted(true);
      reset();
    }
  };

  if (submitted) {
    return (
      <div className="auth-form">
        <div className="auth-header">
          <div className="auth-header__icon">
            <i className="fas fa-circle-check" aria-hidden="true" />
          </div>
          <h2>Account Created</h2>
          <p>Your registration is awaiting approval</p>
        </div>

        <div className="auth-note">
          <i className="fas fa-info-circle" aria-hidden="true" />
          You will receive an email once an administrator activates your account. New accounts are
          created as guest users until then.
        </div>

        <Link className="auth-button-link" to={ROUTES.LOGIN}>
          <i className="fas fa-sign-in-alt" aria-hidden="true" /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div className="auth-header">
        <div className="auth-header__icon">
          <i className="fas fa-user-plus" aria-hidden="true" />
        </div>
        <h2>Join Our Community</h2>
        <p>Create your tourism account today</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-grid form-grid--2">
          <Input
            label="First Name"
            icon="fa-user"
            placeholder="John"
            autoComplete="given-name"
            autoFocus
            required
            error={errors.firstName?.message}
            {...register('firstName', { required: 'Enter your first name.' })}
          />

          <Input
            label="Last Name"
            icon="fa-user"
            placeholder="Doe"
            autoComplete="family-name"
            required
            error={errors.lastName?.message}
            {...register('lastName', { required: 'Enter your last name.' })}
          />
        </div>

        <Input
          label="Email Address"
          icon="fa-envelope"
          type="email"
          placeholder="your@email.com"
          autoComplete="username"
          required
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your email address.',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
          })}
        />

        <Input
          label="Phone"
          icon="fa-phone"
          type="tel"
          placeholder="Optional"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone', {
            pattern: { value: /^[\d\s+()-]{7,20}$/, message: 'Enter a valid phone number.' },
          })}
        />

        <Input
          label="Password"
          icon="fa-lock"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          hint="At least 8 characters, with upper and lower case letters and a number."
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
          label="Confirm Password"
          icon="fa-check-circle"
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Re-enter your password.',
            validate: (value) => value === password || 'The passwords do not match.',
          })}
        />

        <label className="remember-checkbox">
          <input type="checkbox" {...register('terms', { required: true })} />
          <span>
            I agree to the <a href="#terms">Terms &amp; Conditions</a>
          </span>
        </label>

        <Button
          type="submit"
          variant="auth"
          fullWidth
          loading={status === 'loading'}
          leadingIcon={<i className="fas fa-user-check" aria-hidden="true" />}
        >
          Create Account
        </Button>

        <div className="auth-link">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN}>
            <i className="fas fa-sign-in-alt" aria-hidden="true" /> Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
