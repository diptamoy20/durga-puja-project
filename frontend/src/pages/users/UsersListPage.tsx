import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { UserAvatar } from '@/components/users/UserAvatar';
import { UserFilters } from '@/components/users/UserFilters';
import { departmentService, roleService } from '@/services/userService';
import {
  bulkDeleteUsers,
  bulkUpdateUserStatus,
  clearGeneratedPassword,
  deleteUser,
  fetchUsers,
  resetQuery,
  setQuery,
  toggleSelectAll,
  toggleSelected,
} from '@/store/slices/usersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { userMgmtBreadcrumbs } from '@/utils/userManagementHelpers';
import type { Department, RoleSummary, User, UserListQuery, UserStatus } from '@/types';

type PendingAction =
  | { type: 'delete'; id: number; name: string }
  | { type: 'bulk-delete'; ids: number[] }
  | null;

const BULK_STATUSES: Array<{ value: UserStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Activate' },
  { value: 'INACTIVE', label: 'Deactivate' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Block' },
];

/** "Blocked" is the wording the portal has always used for a suspension. */
const STATUS_LABELS: Partial<Record<UserStatus, string>> = { SUSPENDED: 'blocked' };

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

function fullName(user: User): string {
  return user.name ?? (`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—');
}

export function UsersListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { can, user: currentUser } = useAuth();

  const { items, pagination, query, listStatus, listError, selectedIds, generatedPassword } =
    useAppSelector((state) => state.users);

  // Filter options come straight from the API rather than the store: they are
  // small, rarely change, and only this page needs them.
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busy, setBusy] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<UserStatus | ''>('');

  const canCreate = can(PERMISSIONS.CREATE_USERS);
  const canEdit = can(PERMISSIONS.EDIT_USERS);
  const canDelete = can(PERMISSIONS.DELETE_USERS);
  const canSelect = canEdit || canDelete;

  useEffect(() => {
    dispatch(fetchUsers(query));
  }, [dispatch, query]);

  useEffect(() => {
    let active = true;

    const loadFilters = async () => {
      try {
        const [roleResult, departmentResult] = await Promise.all([
          can(PERMISSIONS.VIEW_ROLES) ? roleService.list({ perPage: 100 }) : Promise.resolve(null),
          can(PERMISSIONS.VIEW_DEPARTMENTS) ? departmentService.list() : Promise.resolve(null),
        ]);

        // Guard against a state update after the page has unmounted.
        if (!active) return;

        if (roleResult) {
          setRoles(roleResult.items.map(({ id, name, slug }) => ({ id, name, slug })));
        }
        if (departmentResult) {
          setDepartments(departmentResult.map(({ id, name, code }) => ({ id, name, code })));
        }
      } catch {
        // Filters are a convenience; the table still works without them.
      }
    };

    void loadFilters();

    return () => {
      active = false;
    };
  }, [can]);

  const handleFilterChange = useCallback(
    (patch: Partial<UserListQuery>) => dispatch(setQuery(patch)),
    [dispatch],
  );

  const allSelected = useMemo(
    () => items.length > 0 && selectedIds.length === items.length,
    [items.length, selectedIds.length],
  );

  const applyBulkStatus = async () => {
    if (!bulkStatus) return;

    if (selectedIds.length === 0) {
      toast.warning('Please select at least one user.');
      return;
    }

    setBusy(true);

    try {
      const result = await dispatch(bulkUpdateUserStatus({ ids: selectedIds, status: bulkStatus }));

      if (bulkUpdateUserStatus.fulfilled.match(result)) {
        const { updated } = result.payload;
        toast.success(`${updated} user${updated === 1 ? '' : 's'} updated.`);
        setBulkStatus('');
      } else {
        toast.error(result.payload ?? 'Unable to update the selected users.');
      }
    } finally {
      setBusy(false);
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    setBusy(true);

    try {
      if (pending.type === 'delete') {
        const result = await dispatch(deleteUser(pending.id));

        if (deleteUser.fulfilled.match(result)) {
          toast.success(`${pending.name} has been deleted.`);
        } else {
          toast.error(result.payload ?? 'Unable to delete the user.');
        }
      } else {
        const result = await dispatch(bulkDeleteUsers(pending.ids));

        if (bulkDeleteUsers.fulfilled.match(result)) {
          const { deleted, skipped } = result.payload;

          toast.success(`${deleted} user${deleted === 1 ? '' : 's'} deleted.`);

          // The server refuses to remove your own account or the last Super
          // Admin, so say which rows survived instead of silently keeping them.
          if (skipped.length > 0) {
            toast.warning(
              `${skipped.length} account${skipped.length === 1 ? '' : 's'} could not be deleted and were skipped.`,
            );
          }
        } else {
          toast.error(result.payload ?? 'Unable to delete the selected users.');
        }
      }
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const columnCount = canSelect ? 9 : 8;

  return (
    <div className="page users-page">
      <PageHeader
        title="User Management"
        description="Create, edit and manage portal user accounts."
        breadcrumbs={userMgmtBreadcrumbs({ label: 'Users' })}
        actions={
          canCreate ? (
            <Button
              variant="success"
              leadingIcon={<i className="fas fa-circle-plus" aria-hidden="true" />}
              onClick={() => navigate(ROUTES.USER_NEW)}
            >
              Create User
            </Button>
          ) : undefined
        }
      />

      {generatedPassword && (
        <Alert
          variant="success"
          title="Temporary password generated"
          onDismiss={() => dispatch(clearGeneratedPassword())}
        >
          Share this password securely with the user — it is shown only once:{' '}
          <code>{generatedPassword}</code>
        </Alert>
      )}

      {listError && <Alert variant="error">{listError}</Alert>}

      <Card className="card--filters">
        <UserFilters
          query={query}
          roles={roles}
          departments={departments}
          onChange={handleFilterChange}
          onReset={() => dispatch(resetQuery())}
        />
      </Card>

      <Card
        className="card--table"
        title="Users"
        actions={
          canSelect && (
            <div className="bulk-actions">
              {canEdit && (
                <>
                  <label className="sr-only" htmlFor="bulk-status">
                    Bulk status
                  </label>
                  <select
                    id="bulk-status"
                    className="field__control field__control--sm"
                    value={bulkStatus}
                    onChange={(event) => setBulkStatus(event.target.value as UserStatus | '')}
                  >
                    <option value="">Bulk status</option>
                    {BULK_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!bulkStatus || selectedIds.length === 0 || busy}
                    onClick={applyBulkStatus}
                  >
                    Apply
                  </Button>
                </>
              )}

              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={() => setPending({ type: 'bulk-delete', ids: selectedIds })}
                >
                  {selectedIds.length > 0
                    ? `Delete Selected (${selectedIds.length})`
                    : 'Delete Selected'}
                </Button>
              )}
            </div>
          )
        }
      >
        <div className="table-wrapper">
          <table className="table table--users">
            <thead>
              <tr>
                {canSelect && (
                  <th scope="col" className="table__checkbox">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => dispatch(toggleSelectAll())}
                      aria-label="Select all users on this page"
                    />
                  </th>
                )}
                <th scope="col">User</th>
                <th scope="col">Employee ID</th>
                <th scope="col">Role</th>
                <th scope="col">Department</th>
                <th scope="col">Location</th>
                <th scope="col">Status</th>
                <th scope="col">Last Login</th>
                <th scope="col" className="table__actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {listStatus === 'loading' && items.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="table__placeholder">
                    <Spinner label="Loading users" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="table__placeholder">
                    No users found.
                  </td>
                </tr>
              ) : (
                items.map((user) => (
                  <tr key={user.id}>
                    {canSelect && (
                      <td className="table__checkbox">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => dispatch(toggleSelected(user.id))}
                          aria-label={`Select ${fullName(user)}`}
                        />
                      </td>
                    )}

                    <td>
                      <div className="user-cell">
                        <UserAvatar
                          firstName={user.firstName}
                          lastName={user.lastName}
                          profileImage={user.profileImage}
                        />
                        <div className="user-cell__text">
                          <Link to={ROUTES.USER_DETAIL(user.id)} className="user-cell__name">
                            {fullName(user)}
                          </Link>
                          <span className="user-cell__email">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.employeeId ?? '—'}</td>

                    <td>
                      {user.roles.length > 0 ? user.roles.map((role) => role.name).join(', ') : '—'}
                    </td>

                    <td>{user.department?.name ?? '—'}</td>

                    <td>{[user.city, user.state].filter(Boolean).join(', ') || '—'}</td>

                    <td>
                      <StatusBadge status={user.status} label={STATUS_LABELS[user.status]} />
                    </td>

                    <td>
                      {user.lastLoginAt
                        ? dateTimeFormat.format(new Date(user.lastLoginAt))
                        : 'Never'}
                    </td>

                    <td className="table__actions">
                      <div className="row-actions">
                        <Link
                          to={ROUTES.USER_DETAIL(user.id)}
                          className="icon-button icon-button--primary"
                          aria-label={`View ${fullName(user)}`}
                        >
                          <i className="fas fa-eye" aria-hidden="true" />
                        </Link>

                        {canEdit && (
                          <Link
                            to={ROUTES.USER_EDIT(user.id)}
                            className="icon-button icon-button--secondary"
                            aria-label={`Edit ${fullName(user)}`}
                          >
                            <i className="fas fa-pencil" aria-hidden="true" />
                          </Link>
                        )}

                        {/* Deleting yourself would end your own session, so the
                            action is hidden for the signed-in account. */}
                        {canDelete && user.id !== currentUser?.id && (
                          <button
                            type="button"
                            className="icon-button icon-button--danger"
                            aria-label={`Delete ${fullName(user)}`}
                            onClick={() =>
                              setPending({ type: 'delete', id: user.id, name: fullName(user) })
                            }
                          >
                            <i className="fas fa-trash" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={(page) => dispatch(setQuery({ page }))}
          />
        )}
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.type === 'bulk-delete' ? 'Delete Selected Users' : 'Delete User'}
        message={
          pending?.type === 'bulk-delete'
            ? `Delete ${pending.ids.length} account${pending.ids.length === 1 ? '' : 's'}? This cannot be undone.`
            : `Are you sure you want to delete ${pending?.type === 'delete' ? pending.name : 'this user'}?`
        }
        confirmLabel="Delete"
        destructive
        busy={busy}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

export default UsersListPage;
