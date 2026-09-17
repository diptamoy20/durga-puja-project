import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { Pagination } from '@/components/ui/Pagination';
import { ROUTES } from '@/constants/routes';
import { RoleFilters } from '@/components/roles/RoleFilters';
import { SortHeader } from '@/components/table/SortHeader';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/services/api';
import { roleService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { PaginationMeta, Permission, Role, RoleListQuery, RoleStats } from '@/types';

interface RoleFormValues {
  name: string;
  description?: string;
}

type PendingAction =
  | { type: 'delete'; role: Role }
  | { type: 'restore'; role: Role }
  | { type: 'toggle'; role: Role }
  | null;

const DEFAULT_QUERY: RoleListQuery = {
  page: 1,
  perPage: 15,
  sortBy: 'name',
  sortDir: 'asc',
};

export function RolesPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { can } = useAuth();

  const [query, setQuery] = useState<RoleListQuery>(DEFAULT_QUERY);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<RoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Role | 'new' | null>(null);
  const [viewing, setViewing] = useState<(Role & { permissions: Permission[] }) | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busy, setBusy] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_ROLES);
  const canEdit = can(PERMISSIONS.EDIT_ROLES);
  const canDelete = can(PERMISSIONS.DELETE_ROLES);
  const canManagePermissions = can(PERMISSIONS.MANAGE_ROLE_PERMISSIONS);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [list, counts] = await Promise.all([roleService.list(query), roleService.stats()]);

      setRoles(list.items);
      setPagination(list.pagination ?? null);
      setStats(counts);
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to load roles.'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchQuery = useCallback((patch: Partial<RoleListQuery>) => {
    setQuery((prev) => ({
      ...prev,
      ...patch,
      // Any change other than paging returns to page 1, since page 7 of a
      // freshly filtered list is usually empty.
      ...(patch.page === undefined ? { page: 1 } : {}),
    }));
  }, []);

  /** Clicking the active column flips direction; a new column starts ascending. */
  const sortBy = (column: NonNullable<RoleListQuery['sortBy']>) =>
    patchQuery({
      sortBy: column,
      sortDir: query.sortBy === column && query.sortDir === 'asc' ? 'desc' : 'asc',
    });

  const openEditor = (role: Role | 'new') => {
    setEditing(role);
    reset(
      role === 'new'
        ? { name: '', description: '' }
        : { name: role.name, description: role.description ?? '' },
    );
  };

  const openDetails = async (role: Role) => {
    try {
      setViewing(await roleService.get(role.id));
    } catch (caught) {
      toast.error(errorMessage(caught, 'Unable to load the role.'));
    }
  };

  const onSubmit = async (values: RoleFormValues) => {
    setBusy(true);

    try {
      if (editing === 'new') {
        await roleService.create(values);
        toast.success('Role created.');
      } else if (editing) {
        await roleService.update(editing.id, values);
        toast.success('Role updated.');
      }

      setEditing(null);
      await load();
    } catch (caught) {
      toast.error(errorMessage(caught, 'Unable to save the role.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    const { role } = pending;
    setBusy(true);

    try {
      if (pending.type === 'delete') {
        await roleService.remove(role.id);
        toast.success(`${role.name} has been moved to the trash.`);
      } else if (pending.type === 'restore') {
        await roleService.restore(role.id);
        toast.success(`${role.name} has been restored, and is inactive.`);
      } else {
        const { status } = await roleService.toggleStatus(role.id);
        toast.success(`${role.name} is now ${status.toLowerCase()}.`);
      }

      setPending(null);
      await load();
    } catch (caught) {
      // System roles, roles still assigned, and roles not in the trash are all
      // refused by the server with an explanation worth showing.
      toast.error(errorMessage(caught, 'Unable to complete that action.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmCopy: Record<NonNullable<PendingAction>['type'], { title: string; label: string }> = {
    delete: { title: 'Delete Role', label: 'Delete' },
    restore: { title: 'Restore Role', label: 'Restore' },
    toggle: { title: 'Toggle Status', label: 'Continue' },
  };

  return (
    <>
      <PageHeader
        title="Role Management"
        description="Create and manage portal roles for access control."
        breadcrumbs={[{ label: 'Dashboard', to: ROUTES.DASHBOARD }, { label: 'Roles' }]}
        actions={
          <>
            {canManagePermissions && (
              <Link className="btn btn--secondary btn--md" to={ROUTES.PERMISSION_MATRIX}>
                <i className="fas fa-table-cells" aria-hidden="true" />
                <span>Permission Matrix</span>
              </Link>
            )}

            {canCreate && (
              <Button
                variant="success"
                leadingIcon={<i className="fas fa-circle-plus" aria-hidden="true" />}
                onClick={() => openEditor('new')}
              >
                Create Role
              </Button>
            )}
          </>
        }
      />

      <div className="metric-grid">
        <MetricCard
          label="Total Roles"
          value={stats?.total ?? null}
          icon="fa-id-badge"
          tone="primary"
          badge={{ text: 'Total', tone: 'info' }}
        />
        <MetricCard
          label="Active Roles"
          value={stats?.active ?? null}
          icon="fa-circle-check"
          tone="success"
          badge={{ text: 'Active', tone: 'success' }}
        />
        <MetricCard
          label="Inactive Roles"
          value={stats?.inactive ?? null}
          icon="fa-ban"
          tone="neutral"
          badge={{ text: 'Inactive', tone: 'neutral' }}
        />
        <MetricCard
          label="Deleted Roles"
          value={stats?.trashed ?? null}
          icon="fa-trash"
          tone="warning"
          badge={{ text: 'Trashed', tone: 'warning' }}
        />
      </div>

      {query.trashed && (
        <Alert variant="warning">
          Viewing soft-deleted roles.{' '}
          <button
            type="button"
            className="btn btn--link btn--sm"
            onClick={() => patchQuery({ trashed: false })}
          >
            <span>Back to active list</span>
          </button>
        </Alert>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="card--filters">
        <RoleFilters
          query={query}
          onChange={patchQuery}
          onReset={() => setQuery({ ...DEFAULT_QUERY, trashed: query.trashed })}
        />
      </Card>

      <Card className="card--table" title="Roles">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <SortHeader
                    label="Name"
                    active={query.sortBy === 'name'}
                    direction={query.sortDir}
                    onSort={() => sortBy('name')}
                  />
                </th>
                <th scope="col">
                  <SortHeader
                    label="Slug"
                    active={query.sortBy === 'slug'}
                    direction={query.sortDir}
                    onSort={() => sortBy('slug')}
                  />
                </th>
                <th scope="col">Permissions</th>
                <th scope="col">Users</th>
                <th scope="col">
                  <SortHeader
                    label="Status"
                    active={query.sortBy === 'status'}
                    direction={query.sortDir}
                    onSort={() => sortBy('status')}
                  />
                </th>
                <th scope="col" className="table__actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table__placeholder">
                    <Spinner label="Loading roles" />
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table__placeholder">
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <span className="table__primary">{role.name}</span>
                      {role.description && (
                        <span className="table__secondary">{role.description}</span>
                      )}
                    </td>

                    <td>
                      <code>{role.slug}</code>
                    </td>

                    <td>
                      <Badge variant="info">{String(role.permissionCount)}</Badge>
                    </td>

                    <td>
                      <Badge variant="info">{String(role.userCount)}</Badge>
                    </td>

                    <td>
                      <Badge variant={role.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {role.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    <td className="table__actions">
                      <div className="row-actions">
                        {query.trashed ? (
                          canDelete && (
                            <button
                              type="button"
                              className="icon-button icon-button--success"
                              title="Restore"
                              aria-label={`Restore ${role.name}`}
                              onClick={() => setPending({ type: 'restore', role })}
                            >
                              <i className="fas fa-rotate-left" aria-hidden="true" />
                            </button>
                          )
                        ) : (
                          <>
                            <button
                              type="button"
                              className="icon-button icon-button--secondary"
                              title="View"
                              aria-label={`View ${role.name}`}
                              onClick={() => void openDetails(role)}
                            >
                              <i className="fas fa-eye" aria-hidden="true" />
                            </button>

                            {canManagePermissions && (
                              <Link
                                to={ROUTES.PERMISSION_MATRIX}
                                className="icon-button icon-button--primary"
                                title="Assign Permissions"
                                aria-label={`Assign permissions for ${role.name}`}
                              >
                                <i className="fas fa-shield-halved" aria-hidden="true" />
                              </Link>
                            )}

                            {canEdit && (
                              <button
                                type="button"
                                className="icon-button icon-button--secondary"
                                title="Edit"
                                aria-label={`Edit ${role.name}`}
                                onClick={() => openEditor(role)}
                              >
                                <i className="fas fa-pencil" aria-hidden="true" />
                              </button>
                            )}

                            {/* Super Admin and friends must stay active, so the
                                server refuses to deactivate them. */}
                            {canEdit && !(role.isSystem && role.status === 'ACTIVE') && (
                              <button
                                type="button"
                                className="icon-button icon-button--warning"
                                title="Toggle Status"
                                aria-label={`Toggle status of ${role.name}`}
                                onClick={() => setPending({ type: 'toggle', role })}
                              >
                                <i className="fas fa-toggle-on" aria-hidden="true" />
                              </button>
                            )}

                            {canDelete && !role.isSystem && (
                              <button
                                type="button"
                                className="icon-button icon-button--danger"
                                title="Delete"
                                aria-label={`Delete ${role.name}`}
                                onClick={() => setPending({ type: 'delete', role })}
                              >
                                <i className="fas fa-trash" aria-hidden="true" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <Pagination pagination={pagination} onPageChange={(page) => patchQuery({ page })} />
        )}
      </Card>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Create Role' : `Edit ${editing?.name ?? 'role'}`}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Role name"
            required
            error={errors.name?.message}
            {...register('name', {
              required: 'Enter a role name.',
              minLength: { value: 2, message: 'Use at least 2 characters.' },
            })}
          />

          <Textarea label="Description" rows={3} {...register('description')} />

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save role
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={viewing !== null}
        title={viewing?.name ?? 'Role'}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <>
            <dl className="detail-list">
              <div>
                <dt>Slug</dt>
                <dd>
                  <code>{viewing.slug}</code>
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{viewing.status === 'ACTIVE' ? 'Active' : 'Inactive'}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{viewing.isSystem ? 'System role' : 'Custom role'}</dd>
              </div>
              <div>
                <dt>Members</dt>
                <dd>{viewing.userCount}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{viewing.description ?? '—'}</dd>
              </div>
            </dl>

            <h3 className="detail-subtitle">Permissions ({viewing.permissions.length})</h3>

            {viewing.permissions.length === 0 ? (
              <p className="detail-empty">No permissions granted yet.</p>
            ) : (
              <ul className="chip-list">
                {viewing.permissions.map((permission) => (
                  <li className="chip" key={permission.id}>
                    {permission.permissionName}
                  </li>
                ))}
              </ul>
            )}

            {canManagePermissions && (
              <div className="form-actions">
                <Button variant="secondary" onClick={() => setViewing(null)}>
                  Close
                </Button>
                <Button onClick={() => navigate(ROUTES.PERMISSION_MATRIX)}>
                  Assign permissions
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? confirmCopy[pending.type].title : ''}
        message={
          pending?.type === 'delete'
            ? `Are you sure you want to delete ${pending.role.name}? This action can be restored later.`
            : pending?.type === 'restore'
              ? `Restore ${pending.role.name}? It comes back inactive until you activate it.`
              : pending
                ? `Toggle status for ${pending.role.name}? It will become ${
                    pending.role.status === 'ACTIVE' ? 'inactive' : 'active'
                  }.`
                : ''
        }
        confirmLabel={pending ? confirmCopy[pending.type].label : 'Confirm'}
        destructive={pending?.type === 'delete'}
        busy={busy}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

export default RolesPage;
