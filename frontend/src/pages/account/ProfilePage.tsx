import { Link } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';
import { StatusBadge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageHeader
        title="My profile"
        description="Your account details, as held by the portal."
        actions={
          <Link to={ROUTES.CHANGE_PASSWORD} className="btn btn--secondary btn--md">
            <span>Change password</span>
          </Link>
        }
      />

      <Card title="Account">
        <dl className="detail-list">
          <div>
            <dt>Name</dt>
            <dd>{user.name ?? '—'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Username</dt>
            <dd>{user.username ?? '—'}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{user.phone ?? '—'}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={user.status} />
            </dd>
          </div>
          <div>
            <dt>Last sign-in</dt>
            <dd>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Roles and permissions" description="Contact an administrator to change these.">
        <h3 className="subheading">Roles</h3>
        {user.roles.length === 0 ? (
          <p className="muted">No roles assigned.</p>
        ) : (
          <ul className="chip-list">
            {user.roles.map((role) => (
              <li key={role} className="chip">
                {role}
              </li>
            ))}
          </ul>
        )}

        <h3 className="subheading">Permissions</h3>
        {user.isSuperAdmin ? (
          <p className="muted">
            As a Super Admin you hold every permission, including ones added in future.
          </p>
        ) : user.permissions.length === 0 ? (
          <p className="muted">No permissions granted.</p>
        ) : (
          <ul className="chip-list">
            {user.permissions.map((permission) => (
              <li key={permission} className="chip chip--subtle">
                {permission.replace(/_/g, ' ')}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default ProfilePage;
