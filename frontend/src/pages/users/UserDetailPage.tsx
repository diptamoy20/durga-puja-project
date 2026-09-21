import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/Spinner';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import {
  clearGeneratedPassword,
  deleteUser,
  fetchUser,
  resetUserPassword,
} from '@/store/slices/usersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { userMgmtBreadcrumbs, USER_MGMT_CRUMBS } from '@/utils/userManagementHelpers';

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : '—';
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { can, user: currentUser } = useAuth();

  const { selected, selectedStatus, generatedPassword } = useAppSelector((state) => state.users);

  const [confirming, setConfirming] = useState<'delete' | 'reset' | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (Number.isFinite(userId)) dispatch(fetchUser(userId));
  }, [dispatch, userId]);

  const handleConfirm = async () => {
    setBusy(true);

    try {
      if (confirming === 'delete') {
        const result = await dispatch(deleteUser(userId));

        if (deleteUser.fulfilled.match(result)) {
          toast.success('User deleted.');
          navigate(ROUTES.USERS);
        } else {
          toast.error(result.payload ?? 'Unable to delete the user.');
        }
      }

      if (confirming === 'reset') {
        const result = await dispatch(resetUserPassword({ id: userId }));

        if (resetUserPassword.fulfilled.match(result)) {
          toast.success('Password reset. The temporary password is shown above.');
        } else {
          toast.error(result.payload ?? 'Unable to reset the password.');
        }
      }
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  if (selectedStatus === 'loading' || (!selected && selectedStatus === 'idle')) {
    return <PageLoader label="Loading user" />;
  }

  if (!selected) {
    return (
      <Alert variant="error" title="User not found">
        That account could not be loaded. <Link to={ROUTES.USERS}>Back to users</Link>.
      </Alert>
    );
  }

  const isSelf = selected.id === currentUser?.id;

  return (
    <div className="page">
      <PageHeader
        title={selected.name ?? selected.email}
        description={selected.email}
        breadcrumbs={userMgmtBreadcrumbs(USER_MGMT_CRUMBS.users, { label: 'View User' })}
        actions={
          <>
            {can(PERMISSIONS.EDIT_USERS) && (
              <Link to={ROUTES.USER_EDIT(selected.id)} className="btn btn--secondary btn--md">
                <span>Edit</span>
              </Link>
            )}

            {can(PERMISSIONS.RESET_USER_PASSWORD) && (
              <Button variant="secondary" onClick={() => setConfirming('reset')}>
                Reset password
              </Button>
            )}

            {can(PERMISSIONS.DELETE_USERS) && !isSelf && (
              <Button variant="danger" onClick={() => setConfirming('delete')}>
                Delete
              </Button>
            )}
          </>
        }
      />

      {generatedPassword && (
        <Alert
          variant="success"
          title="Temporary password"
          onDismiss={() => dispatch(clearGeneratedPassword())}
        >
          Share this securely — it is shown only once: <code>{generatedPassword}</code>
        </Alert>
      )}

      {selected.mustChangePassword && (
        <Alert variant="warning">
          This account is using a temporary password and must change it at next sign-in.
        </Alert>
      )}

      <Card title="Account">
        <dl className="detail-list">
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={selected.status} />
            </dd>
          </div>
          <div>
            <dt>Username</dt>
            <dd>{selected.username ?? '—'}</dd>
          </div>
          <div>
            <dt>Employee ID</dt>
            <dd>{selected.employeeId ?? '—'}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{selected.phone ?? '—'}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{selected.department?.name ?? '—'}</dd>
          </div>
          <div>
            <dt>Email verified</dt>
            <dd>{selected.emailVerified ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt>Last sign-in</dt>
            <dd>{formatDate(selected.lastLoginAt)}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(selected.createdAt)}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Roles">
        {selected.roles.length === 0 ? (
          <p className="muted">No roles are assigned, so this account cannot access any module.</p>
        ) : (
          <ul className="chip-list">
            {selected.roles.map((role) => (
              <li key={role.id} className="chip">
                {role.name}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Location">
        <dl className="detail-list">
          <div>
            <dt>Country</dt>
            <dd>{selected.country ?? '—'}</dd>
          </div>
          <div>
            <dt>State</dt>
            <dd>{selected.state ?? '—'}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{selected.city ?? '—'}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{selected.address ?? '—'}</dd>
          </div>
        </dl>
      </Card>

      <ConfirmDialog
        open={confirming !== null}
        title={confirming === 'delete' ? 'Delete user' : 'Reset password'}
        message={
          confirming === 'delete'
            ? `Delete ${selected.name ?? selected.email}? This cannot be undone.`
            : 'Generate a new temporary password? The current password will stop working immediately.'
        }
        confirmLabel={confirming === 'delete' ? 'Delete' : 'Reset password'}
        destructive={confirming === 'delete'}
        busy={busy}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(null)}
      />
    </div>
  );
}

export default UserDetailPage;
