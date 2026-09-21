import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { ConfirmDialog, Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { Pagination } from '@/components/ui/Pagination';
import { PermissionFilters } from '@/components/roles/PermissionFilters';
import { ROUTES } from '@/constants/routes';
import { SortHeader } from '@/components/table/SortHeader';
import { Spinner } from '@/components/ui/Spinner';
import { errorMessage } from '@/services/api';
import { permissionService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { userMgmtBreadcrumbs } from '@/utils/userManagementHelpers';
import type {
  PaginationMeta,
  Permission,
  PermissionDetail,
  PermissionFormValues,
  PermissionListQuery,
  PermissionStats,
} from '@/types';

type PendingAction =
  | { type: 'delete'; permission: Permission }
  | { type: 'restore'; permission: Permission }
  | { type: 'toggle'; permission: Permission }
  | null;

const DEFAULT_QUERY: PermissionListQuery = {
  page: 1,
  perPage: 15,
  sortBy: 'module',
  sortDir: 'asc',
};

export function PermissionsListPage() {
  const toast = useToast();
  const { can } = useAuth();

  const [query, setQuery] = useState<PermissionListQuery>(DEFAULT_QUERY);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<PermissionStats | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Permission | 'new' | null>(null);
  const [viewing, setViewing] = useState<PermissionDetail | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busy, setBusy] = useState(false);

  const canCreate = can(PERMISSIONS.CREATE_PERMISSIONS);
  const canEdit = can(PERMISSIONS.EDIT_PERMISSIONS);
  const canDelete = can(PERMISSIONS.DELETE_PERMISSIONS);
  const canManageRolePermissions = can(PERMISSIONS.MANAGE_ROLE_PERMISSIONS);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [list, counts, moduleNames] = await Promise.all([
        permissionService.list(query),
        permissionService.stats(),
        permissionService.modules(),
      ]);

      setPermissions(list.items);
      setPagination(list.pagination ?? null);
      setStats(counts);
      setModules(moduleNames);
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to load permissions.'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchQuery = useCallback((patch: Partial<PermissionListQuery>) => {
    setQuery((prev) => ({
      ...prev,
      ...patch,
      // Any change other than paging returns to page 1, since page 7 of a
      // freshly filtered list is usually empty.
      ...(patch.page === undefined ? { page: 1 } : {}),
    }));
  }, []);

  /** Clicking the active column flips direction; a new column starts ascending. */
  const sortBy = (column: NonNullable<PermissionListQuery['sortBy']>) =>
    patchQuery({
      sortBy: column,
      sortDir: query.sortBy === column && query.sortDir === 'asc' ? 'desc' : 'asc',
    });

  const openEditor = (permission: Permission | 'new') => {
    setEditing(permission);
    reset(
      permission === 'new'
        ? { module: '', permissionName: '', permissionKey: '', description: '' }
        : {
            module: permission.module,
            permissionName: permission.permissionName,
            permissionKey: permission.permissionKey,
            description: permission.description ?? '',
          },
    );
  };

  const openDetails = async (permission: Permission) => {
    try {
      setViewing(await permissionService.get(permission.id));
    } catch (caught) {
      toast.error(errorMessage(caught, 'Unable to load the permission.'));
    }
  };

  const onSubmit = async (values: PermissionFormValues) => {
    setBusy(true);

    try {
      if (editing === 'new') {
        await permissionService.create(values);
        toast.success('Permission created.');
      } else if (editing) {
        // The key is immutable server-side, so it is not sent on update.
        await permissionService.update(editing.id, {
          module: values.module,
          permissionName: values.permissionName,
          description: values.description,
        });
        toast.success('Permission updated.');
      }

      setEditing(null);
      await load();
    } catch (caught) {
      toast.error(errorMessage(caught, 'Unable to save the permission.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    const { permission } = pending;
    setBusy(true);

    try {
      if (pending.type === 'delete') {
        await permissionService.remove(permission.id);
        toast.success(`${permission.permissionName} has been moved to the trash.`);
      } else if (pending.type === 'restore') {
        await permissionService.restore(permission.id);
        toast.success(`${permission.permissionName} has been restored, and is inactive.`);
      } else {
        const { status } = await permissionService.toggleStatus(permission.id);
        toast.success(`${permission.permissionName} is now ${status.toLowerCase()}.`);
      }

      setPending(null);
      await load();
    } catch (caught) {
      // Built-in keys and permissions not in the trash are refused by the
      // server with an explanation worth showing.
      toast.error(errorMessage(caught, 'Unable to complete that action.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmCopy: Record<NonNullable<PendingAction>['type'], { title: string; label: string }> = {
    delete: { title: 'Delete Permission', label: 'Delete' },
    restore: { title: 'Restore Permission', label: 'Restore' },
    toggle: { title: 'Toggle Status', label: 'Continue' },
  };

  return (
    <>
      <PageHeader
        title="Permission Management"
        description="Manage module permissions used by portal roles."
        breadcrumbs={userMgmtBreadcrumbs({ label: 'Permissions' })}
        actions={
          <>
            {canManageRolePermissions && (
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
                Create Permission
              </Button>
            )}
          </>
        }
      />

      <div className="stat-grid">
        <StatCard label="Total Permissions" value={stats?.total ?? '—'} />
        <StatCard label="Active" value={stats?.active ?? '—'} tone="success" />
        <StatCard label="Modules" value={stats?.modules ?? '—'} />
        <StatCard label="Trashed" value={stats?.trashed ?? '—'} tone="warning" />
      </div>

      {query.trashed && (
        <Alert variant="warning">
          Viewing soft-deleted permissions.{' '}
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
        <PermissionFilters
          query={query}
          modules={modules}
          onChange={patchQuery}
          onReset={() => setQuery({ ...DEFAULT_QUERY, trashed: query.trashed })}
        />
      </Card>

      <Card className="card--table" title="Permissions">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <SortHeader
                    label="Module"
                    active={query.sortBy === 'module'}
                    direction={query.sortDir}
                    onSort={() => sortBy('module')}
                  />
                </th>
                <th scope="col">
                  <SortHeader
                    label="Permission"
                    active={query.sortBy === 'permissionName'}
                    direction={query.sortDir}
                    onSort={() => sortBy('permissionName')}
                  />
                </th>
                <th scope="col">
                  <SortHeader
                    label="Key"
                    active={query.sortBy === 'permissionKey'}
                    direction={query.sortDir}
                    onSort={() => sortBy('permissionKey')}
                  />
                </th>
                <th scope="col">Roles</th>
                <th scope="col">Status</th>
                <th scope="col" className="table__actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table__placeholder">
                    <Spinner label="Loading permissions" />
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table__placeholder">
                    No permissions found.
                  </td>
                </tr>
              ) : (
                permissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>{permission.module}</td>

                    <td>
                      <span className="table__primary">{permission.permissionName}</span>
                      {permission.description && (
                        <span className="table__secondary">{permission.description}</span>
                      )}
                    </td>

                    <td>
                      <code>{permission.permissionKey}</code>
                    </td>

                    <td>
                      <Badge variant="info">{String(permission.roleCount ?? 0)}</Badge>
                    </td>

                    <td>
                      <Badge variant={permission.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {permission.status === 'ACTIVE' ? 'Active' : 'Inactive'}
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
                              aria-label={`Restore ${permission.permissionName}`}
                              onClick={() => setPending({ type: 'restore', permission })}
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
                              aria-label={`View ${permission.permissionName}`}
                              onClick={() => void openDetails(permission)}
                            >
                              <i className="fas fa-eye" aria-hidden="true" />
                            </button>

                            {canEdit && (
                              <button
                                type="button"
                                className="icon-button icon-button--secondary"
                                title="Edit"
                                aria-label={`Edit ${permission.permissionName}`}
                                onClick={() => openEditor(permission)}
                              >
                                <i className="fas fa-pencil" aria-hidden="true" />
                              </button>
                            )}

                            {canEdit && (
                              <button
                                type="button"
                                className="icon-button icon-button--warning"
                                title="Toggle Status"
                                aria-label={`Toggle status of ${permission.permissionName}`}
                                onClick={() => setPending({ type: 'toggle', permission })}
                              >
                                <i className="fas fa-toggle-on" aria-hidden="true" />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                className="icon-button icon-button--danger"
                                title="Delete"
                                aria-label={`Delete ${permission.permissionName}`}
                                onClick={() => setPending({ type: 'delete', permission })}
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
        title={editing === 'new' ? 'Create Permission' : `Edit ${editing?.permissionName ?? ''}`}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Module"
            required
            list="permission-modules"
            placeholder="e.g. Pandal Atlas"
            error={errors.module?.message}
            {...register('module', {
              required: 'Enter a module name.',
              minLength: { value: 2, message: 'Use at least 2 characters.' },
            })}
          />

          {/* Suggests existing modules without preventing a new one. */}
          <datalist id="permission-modules">
            {modules.map((module) => (
              <option key={module} value={module} />
            ))}
          </datalist>

          <Input
            label="Permission name"
            required
            placeholder="e.g. Publish Pandal"
            error={errors.permissionName?.message}
            {...register('permissionName', {
              required: 'Enter a permission name.',
              minLength: { value: 2, message: 'Use at least 2 characters.' },
            })}
          />

          <Input
            label="Permission key"
            required
            placeholder="e.g. publish_pandal"
            // The guards compare against this key, so changing it later would
            // silently revoke access; it is fixed once created.
            disabled={editing !== 'new'}
            hint={
              editing === 'new'
                ? 'Lowercase letters, numbers and underscores. This is what the code checks.'
                : 'The key cannot be changed after creation.'
            }
            error={errors.permissionKey?.message}
            {...register('permissionKey', {
              required: 'Enter a permission key.',
              pattern: {
                value: /^[a-z][a-z0-9_]*$/,
                message: 'Use lowercase letters, numbers and underscores only.',
              },
            })}
          />

          <Textarea label="Description" rows={3} {...register('description')} />

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save permission
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={viewing !== null}
        title={viewing?.permissionName ?? 'Permission'}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <>
            <dl className="detail-list">
              <div>
                <dt>Module</dt>
                <dd>{viewing.module}</dd>
              </div>
              <div>
                <dt>Key</dt>
                <dd>
                  <code>{viewing.permissionKey}</code>
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{viewing.status === 'ACTIVE' ? 'Active' : 'Inactive'}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{viewing.description ?? '—'}</dd>
              </div>
            </dl>

            <h3 className="detail-subtitle">Held by ({viewing.roles.length})</h3>

            {viewing.roles.length === 0 ? (
              <p className="detail-empty">No role holds this permission yet.</p>
            ) : (
              <ul className="chip-list">
                {viewing.roles.map((role) => (
                  <li className="chip" key={role.id}>
                    {role.name}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? confirmCopy[pending.type].title : ''}
        message={
          pending?.type === 'delete'
            ? `Are you sure you want to delete ${pending.permission.permissionName}? It can be restored later.`
            : pending?.type === 'restore'
              ? `Restore ${pending.permission.permissionName}? It comes back inactive until you activate it.`
              : pending
                ? `Toggle status for ${pending.permission.permissionName}? Holders lose or regain it at their next sign-in.`
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

export default PermissionsListPage;
