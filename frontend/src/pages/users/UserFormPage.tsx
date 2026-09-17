import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { ROUTES } from '@/constants/routes';
import { clearSaveError, createUser, fetchUser, updateUser } from '@/store/slices/usersSlice';
import { departmentService, roleService } from '@/services/userService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/useToast';
import type { Department, RoleSummary, UserFormValues, UserStatus } from '@/types';

const STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

/** Create and edit share this form; `mode` drives the differences. */
export function UserFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const userId = id ? Number(id) : undefined;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { selected, selectedStatus, saveStatus, saveError } = useAppSelector(
    (state) => state.users,
  );

  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: { firstName: '', lastName: '', email: '', status: 'ACTIVE' },
  });

  useEffect(() => {
    dispatch(clearSaveError());
  }, [dispatch]);

  useEffect(() => {
    if (mode === 'edit' && userId) dispatch(fetchUser(userId));
  }, [dispatch, mode, userId]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [roleResult, departmentResult] = await Promise.all([
          roleService.list({ perPage: 100 }),
          departmentService.list(),
        ]);

        if (!active) return;

        setRoles(roleResult.items.map(({ id: roleId, name, slug }) => ({ id: roleId, name, slug })));
        setDepartments(
          departmentResult.map(({ id: deptId, name, code }) => ({ id: deptId, name, code })),
        );
      } catch {
        toast.warning('Roles and departments could not be loaded.');
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [toast]);

  // Populate the form once the user arrives. React Hook Form keeps its own
  // state, so it has to be told explicitly rather than re-rendered into place.
  useEffect(() => {
    if (mode !== 'edit' || !selected) return;

    reset({
      firstName: selected.firstName ?? '',
      lastName: selected.lastName ?? '',
      email: selected.email,
      phone: selected.phone ?? '',
      username: selected.username ?? '',
      employeeId: selected.employeeId ?? '',
      country: selected.country ?? '',
      state: selected.state ?? '',
      city: selected.city ?? '',
      address: selected.address ?? '',
      departmentId: selected.department?.id,
      status: selected.status,
    });

    setSelectedRoleIds(selected.roles.map((role) => role.id));
  }, [mode, selected, reset]);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId) ? current.filter((value) => value !== roleId) : [...current, roleId],
    );
  };

  const onSubmit = async (values: UserFormValues) => {
    // Empty strings would overwrite stored values with blanks, so they are
    // dropped and the field is simply left untouched.
    const payload: UserFormValues = {
      ...values,
      roleIds: selectedRoleIds,
      departmentId: values.departmentId ? Number(values.departmentId) : undefined,
    };

    Object.keys(payload).forEach((key) => {
      const typedKey = key as keyof UserFormValues;
      if (payload[typedKey] === '') delete payload[typedKey];
    });

    if (mode === 'create') {
      const result = await dispatch(createUser(payload));

      if (createUser.fulfilled.match(result)) {
        toast.success('User created.');
        navigate(ROUTES.USERS);
      }

      return;
    }

    if (!userId) return;

    const result = await dispatch(updateUser({ id: userId, values: payload }));

    if (updateUser.fulfilled.match(result)) {
      toast.success('User updated.');
      navigate(ROUTES.USER_DETAIL(userId));
    }
  };

  if (mode === 'edit' && selectedStatus === 'loading') {
    return <PageLoader label="Loading user" />;
  }

  if (mode === 'edit' && selectedStatus === 'failed') {
    return (
      <Alert variant="error" title="User not found">
        That account could not be loaded. It may have been deleted.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title={mode === 'create' ? 'New user' : `Edit ${selected?.name ?? 'user'}`}
        breadcrumbs={[
          { label: 'Users', to: ROUTES.USERS },
          { label: mode === 'create' ? 'New' : 'Edit' },
        ]}
      />

      {saveError && <Alert variant="error">{saveError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card title="Account details">
          <div className="form-grid form-grid--2">
            <Input
              label="First name"
              required
              error={errors.firstName?.message}
              {...register('firstName', { required: 'Enter a first name.' })}
            />

            <Input
              label="Last name"
              required
              error={errors.lastName?.message}
              {...register('lastName', { required: 'Enter a last name.' })}
            />

            <Input
              label="Email address"
              type="email"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Enter an email address.',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
              })}
            />

            <Input label="Phone" type="tel" {...register('phone')} />

            <Input label="Username" hint="Optional alternative sign-in name" {...register('username')} />

            <Input label="Employee ID" {...register('employeeId')} />

            {mode === 'create' && (
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                hint="Leave blank to generate a temporary password."
                error={errors.password?.message}
                {...register('password', {
                  minLength: { value: 8, message: 'Use at least 8 characters.' },
                })}
              />
            )}

            <Select
              label="Status"
              options={STATUS_OPTIONS}
              {...register('status')}
            />

            <Select
              label="Department"
              placeholder="No department"
              options={departments.map((department) => ({
                value: department.id,
                label: department.name,
              }))}
              {...register('departmentId')}
            />
          </div>
        </Card>

        <Card title="Location" description="Used for reporting and regional filters.">
          <div className="form-grid form-grid--3">
            <Input label="Country" {...register('country')} />
            <Input label="State" {...register('state')} />
            <Input label="City" {...register('city')} />
          </div>

          <Textarea label="Address" {...register('address')} />
        </Card>

        <Card title="Roles" description="Roles determine what this account can do.">
          {roles.length === 0 ? (
            <p className="muted">No roles are available to assign.</p>
          ) : (
            <div className="checkbox-grid">
              {roles.map((role) => (
                <label key={role.id} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>
          )}
        </Card>

        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate(ROUTES.USERS)}>
            Cancel
          </Button>

          <Button type="submit" loading={saveStatus === 'loading'}>
            {mode === 'create' ? 'Create user' : 'Save changes'}
          </Button>
        </div>
      </form>
    </>
  );
}

export default UserFormPage;
