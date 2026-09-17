import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { clearAuthError, login } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { LoginCredentials } from '@/types';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '', remember: false },
  });

  // A stale error from a previous visit should not greet the user.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (values: LoginCredentials) => {
    const result = await dispatch(login(values));

    if (login.fulfilled.match(result)) {
      // Return the user to the page that bounced them here, if any.
      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from ?? ROUTES.DASHBOARD, { replace: true });
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <div className="auth-header__icon">
          <i className="fas fa-sign-in-alt" aria-hidden="true" />
        </div>
        <h2>Welcome Back</h2>
        <p>Sign in to your tourism account</p>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => dispatch(clearAuthError())}>
          {error}
        </Alert>
      )}

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

        <Input
          label="Password"
          icon="fa-lock"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          error={errors.password?.message}
          {...register('password', { required: 'Enter your password.' })}
        />

        <label className="remember-checkbox">
          <input type="checkbox" {...register('remember')} />
          <span>Remember me</span>
        </label>

        <Button
          type="submit"
          variant="auth"
          fullWidth
          loading={status === 'loading'}
          leadingIcon={<i className="fas fa-sign-in-alt" aria-hidden="true" />}
        >
          Sign In
        </Button>

        <div className="auth-forgot">
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <i className="fas fa-redo" aria-hidden="true" /> Forgot your password?
          </Link>
        </div>

        <div className="auth-link">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER}>
            <i className="fas fa-user-plus" aria-hidden="true" /> Create one
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
