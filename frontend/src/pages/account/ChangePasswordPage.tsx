import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { errorMessage } from '@/services/api';
import { loadSession } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>();

  const newPassword = watch('newPassword');

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setFailure(null);

    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      // Refresh the session so the `mustChangePassword` banner clears.
      await dispatch(loadSession());

      toast.success('Your password has been changed.');
      navigate(ROUTES.PROFILE);
    } catch (error) {
      setFailure(errorMessage(error, 'Unable to change the password.'));
    }
  };

  return (
    <>
      <PageHeader
        title="Change password"
        description="Choose a new password for your account."
        breadcrumbs={[{ label: 'My profile', to: ROUTES.PROFILE }, { label: 'Change password' }]}
      />

      {failure && <Alert variant="error">{failure}</Alert>}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="form--narrow">
          <Input
            label="Current password"
            type="password"
            required
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword', { required: 'Enter your current password.' })}
          />

          <Input
            label="New password"
            type="password"
            required
            autoComplete="new-password"
            hint="At least 8 characters, with upper and lower case letters and a number."
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'Choose a new password.',
              minLength: { value: 8, message: 'Use at least 8 characters.' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Include upper and lower case letters and a number.',
              },
            })}
          />

          <Input
            label="Confirm new password"
            type="password"
            required
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Re-enter the new password.',
              validate: (value) => value === newPassword || 'The passwords do not match.',
            })}
          />

          <div className="form-actions">
            <Button variant="secondary" onClick={() => navigate(ROUTES.PROFILE)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

export default ChangePasswordPage;
