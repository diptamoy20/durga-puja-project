import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/ui/Spinner';
import { errorMessage } from '@/services/api';
import { roleService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { userMgmtBreadcrumbs, USER_MGMT_CRUMBS } from '@/utils/userManagementHelpers';
import type { Permission } from '@/types';

interface MatrixRole {
  id: number;
  name: string;
  slug: string;
  isSystem: boolean;
}

interface MatrixData {
  roles: MatrixRole[];
  modules: Array<{ module: string; permissions: Permission[] }>;
  granted: string[];
}

const cellKey = (roleId: number, permissionId: number) => `${roleId}:${permissionId}`;

/**
 * Role × permission matrix. Edits are held locally and saved one role at a
 * time, which keeps each save to a single `PUT /roles/:id/permissions` call.
 */
export function PermissionsPage() {
  const toast = useToast();
  const { can, refreshPermissions } = useAuth();

  const [data, setData] = useState<MatrixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [dirtyRoles, setDirtyRoles] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);

  const editable = can(PERMISSIONS.MANAGE_ROLE_PERMISSIONS);

  const load = useCallback(async () => {
    setError(null);

    try {
      const matrix = await roleService.matrix();
      setData(matrix);
      setGranted(new Set(matrix.granted));
      setDirtyRoles(new Set());
    } catch (caught) {
      setError(errorMessage(caught, 'Unable to load the permission matrix.'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const allPermissions = useMemo(
    () => data?.modules.flatMap((module) => module.permissions) ?? [],
    [data],
  );

  const markDirty = (...roleIds: number[]) => {
    setDirtyRoles((current) => {
      const next = new Set(current);
      roleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggle = (roleId: number, permissionId: number) => {
    const key = cellKey(roleId, permissionId);

    setGranted((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

    markDirty(roleId);
  };

  /** Column header: grant or revoke every permission for one role. */
  const toggleRoleColumn = (roleId: number, selectAll: boolean) => {
    if (!data) return;

    setGranted((current) => {
      const next = new Set(current);

      allPermissions.forEach((permission) => {
        const key = cellKey(roleId, permission.id);
        if (selectAll) next.add(key);
        else next.delete(key);
      });

      return next;
    });

    markDirty(roleId);
  };

  /** Module row: grant or revoke that module's permissions for every role. */
  const toggleModuleRow = (moduleName: string, selectAll: boolean) => {
    if (!data) return;

    const permissions =
      data.modules.find((module) => module.module === moduleName)?.permissions ?? [];

    setGranted((current) => {
      const next = new Set(current);

      data.roles.forEach((role) => {
        permissions.forEach((permission) => {
          const key = cellKey(role.id, permission.id);
          if (selectAll) next.add(key);
          else next.delete(key);
        });
      });

      return next;
    });

    markDirty(...data.roles.map((role) => role.id));
  };

  const isRoleColumnFullyGranted = (roleId: number): boolean =>
    allPermissions.length > 0 &&
    allPermissions.every((permission) => granted.has(cellKey(roleId, permission.id)));

  const isModuleRowFullyGranted = (moduleName: string): boolean => {
    if (!data) return false;

    const permissions =
      data.modules.find((module) => module.module === moduleName)?.permissions ?? [];

    if (permissions.length === 0) return false;

    return data.roles.every((role) =>
      permissions.every((permission) => granted.has(cellKey(role.id, permission.id))),
    );
  };

  const permissionIdsFor = useCallback(
    (roleId: number): number[] =>
      allPermissions
        .filter((permission) => granted.has(cellKey(roleId, permission.id)))
        .map((permission) => permission.id),
    [allPermissions, granted],
  );

  const save = async () => {
    if (dirtyRoles.size === 0) return;
    setSaving(true);

    try {
      // Sequential rather than parallel: each role is a separate write and the
      // server records an audit entry per change, so order stays readable.
      for (const roleId of dirtyRoles) {
        await roleService.syncPermissions(roleId, permissionIdsFor(roleId));
      }

      toast.success('Permission matrix saved. Other signed-in users must sign in again to pick up role changes.');
      setConfirmSave(false);
      await load();
      await refreshPermissions();
    } catch (caught) {
      toast.error(errorMessage(caught, 'Unable to save the permission matrix.'));
    } finally {
      setSaving(false);
    }
  };

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!data) return <PageLoader label="Loading permission matrix" />;

  const hasPermissions = allPermissions.length > 0;

  return (
    <>
      <PageHeader
        title="Role Permission Matrix"
        description="Assign permissions across roles in a single view."
        breadcrumbs={userMgmtBreadcrumbs(
          USER_MGMT_CRUMBS.roles,
          { label: 'Permission Matrix' },
        )}
        actions={
          <Link className="btn btn--secondary btn--md" to={ROUTES.ROLES}>
            <i className="fas fa-arrow-left" aria-hidden="true" />
            <span>Back to Roles</span>
          </Link>
        }
      />

      {!editable && (
        <Alert variant="info">You can view the permission matrix but not change it.</Alert>
      )}

      <Card className="card--matrix">
        <form
          className="matrix-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (editable && dirtyRoles.size > 0) setConfirmSave(true);
          }}
        >
          <div className="matrix-toolbar">
            <p className="matrix-toolbar__hint">
              Use column headers to select all permissions for a role.
            </p>

            {editable && (
              <Button
                type="submit"
                variant="success"
                loading={saving}
                disabled={dirtyRoles.size === 0}
                leadingIcon={<i className="fas fa-circle-check" aria-hidden="true" />}
              >
                Save Matrix
              </Button>
            )}
          </div>

          <div className="table-wrapper table-wrapper--matrix matrix-scroll">
            <table className="table table--matrix matrix-table">
              <thead>
                <tr>
                  <th scope="col" className="matrix__corner">
                    Permission
                  </th>
                  {data.roles.map((role) => (
                    <th key={role.id} scope="col" className="matrix__role">
                      <div className="matrix__role-head">
                        <span className="matrix__role-name">{role.name}</span>
                        {editable && (
                          <input
                            type="checkbox"
                            className="matrix__master"
                            checked={isRoleColumnFullyGranted(role.id)}
                            onChange={(event) => toggleRoleColumn(role.id, event.target.checked)}
                            title={`Select all for ${role.name}`}
                            aria-label={`Select all permissions for ${role.name}`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {!hasPermissions ? (
                  <tr>
                    <td colSpan={data.roles.length + 1} className="table__placeholder">
                      No permissions available.
                    </td>
                  </tr>
                ) : (
                  data.modules.map((module) => (
                    <Fragment key={module.module}>
                      <tr className="matrix__module-row module-row">
                        <th scope="rowgroup" colSpan={data.roles.length + 1}>
                          <div className="matrix__module-head">
                            <span>{module.module}</span>
                            {editable && (
                              <input
                                type="checkbox"
                                className="matrix__master"
                                checked={isModuleRowFullyGranted(module.module)}
                                onChange={(event) =>
                                  toggleModuleRow(module.module, event.target.checked)
                                }
                                title="Select module row"
                                aria-label={`Select all permissions in ${module.module}`}
                              />
                            )}
                          </div>
                        </th>
                      </tr>

                      {module.permissions.map((permission) => (
                        <tr key={permission.id}>
                          <th scope="row" className="matrix__permission">
                            <span className="table__primary">{permission.permissionName}</span>
                            <code className="matrix__permission-key">{permission.permissionKey}</code>
                          </th>

                          {data.roles.map((role) => (
                            <td key={role.id} className="matrix__cell">
                              <input
                                type="checkbox"
                                checked={granted.has(cellKey(role.id, permission.id))}
                                onChange={() => toggle(role.id, permission.id)}
                                disabled={!editable}
                                aria-label={`${permission.permissionName} for ${role.name}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {editable && (
            <div className="matrix-footer">
              <Button
                type="submit"
                variant="success"
                loading={saving}
                disabled={dirtyRoles.size === 0}
                leadingIcon={<i className="fas fa-circle-check" aria-hidden="true" />}
              >
                Save Matrix
              </Button>
            </div>
          )}
        </form>
      </Card>

      <ConfirmDialog
        open={confirmSave}
        title="Save permission matrix"
        message="Save the entire permission matrix?"
        confirmLabel="Save Matrix"
        busy={saving}
        onConfirm={save}
        onCancel={() => setConfirmSave(false)}
      />
    </>
  );
}

export default PermissionsPage;
