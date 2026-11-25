import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { applyAvatarPolicy } from '@/lib/avatar';
import { formatRoleLabel } from '@/lib/utils';
import { query } from '@/lib/db';
import UserAvatar from '@/components/ui/UserAvatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import UserStatusButton from './UserStatusButton';
import UserFilters from './UserFilters';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'User Management — ARCHIVE',
};

export default async function AdminUsersPage({ searchParams }) {
  const currentAdmin = await requireRole('admin');
  const sp = await searchParams;
  const search = (sp?.q || '').trim();
  const roleFilter = (sp?.role || '').trim().toLowerCase();

  let sql = `
    SELECT u.id, u.name, u.email, u.role, u.curator_status, u.is_active,
           CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END as profile_image,
           u.created_at,
           COUNT(a.id) as artwork_count
    FROM users u
    LEFT JOIN artworks a ON a.user_id = u.id AND a.status = 'active'
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
  }

  if (roleFilter && ['member', 'curator', 'admin'].includes(roleFilter)) {
    params.push(roleFilter);
    sql += ` AND LOWER(u.role) = $${params.length}`;
  }

  sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

  const res = await query(sql, params);
  const users = res.rows.map((row) => applyAvatarPolicy(row));

  const roleBreadcrumbLabel =
    roleFilter && ['member', 'curator', 'admin'].includes(roleFilter)
      ? `${formatRoleLabel(roleFilter)}s`
      : null;
  const breadcrumbItems = roleBreadcrumbLabel
    ? [
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'User Management', href: '/dashboard/admin/users' },
        { label: roleBreadcrumbLabel },
      ]
    : [
        { label: 'Dashboard', href: '/dashboard/admin' },
        { label: 'User Management' },
      ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">User management</h1>
          <p className="dashboard-subtitle">Manage member accounts, curators, and access roles ({users.length} users).</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <UserFilters initialSearch={search} initialRole={roleFilter} />

      {/* Users Table */}
      <div className="data-table-wrap">
        <table className="data-table dashboard-responsive-table admin-users-table">
          <colgroup>
            <col className="admin-users-col-name" />
            <col className="admin-users-col-email" />
            <col className="admin-users-col-role" />
            <col className="admin-users-col-account" />
            <col className="admin-users-col-curator" />
            <col className="admin-users-col-artworks" />
            <col className="admin-users-col-joined" />
            <col className="admin-users-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>User name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Account status</th>
              <th>Curator status</th>
              <th>Active artworks</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="data-table-empty-cell">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isActive = u.is_active !== false;
                return (
                  <tr key={u.id}>
                    <td data-label="User name" data-cell="primary" style={{ fontWeight: 600 }}>
                      <div className="dashboard-user-cell">
                        <UserAvatar
                          src={u.profile_image}
                          role={u.role}
                          name={u.name}
                          size={28}
                        />
                        {u.role === 'member' ? (
                          <Link
                            href={`/dashboard/admin/users/${u.id}`}
                            className="dashboard-user-link dashboard-user-cell-name"
                          >
                            {u.name}
                          </Link>
                        ) : (
                          <span className="dashboard-user-cell-name">{u.name}</span>
                        )}
                      </div>
                    </td>
                    <td data-label="Email" className="table-cell-break">
                      {u.email}
                    </td>
                    <td data-label="Role">
                      <span
                        className={`badge ${
                          u.role === 'admin'
                            ? 'badge-role-admin'
                            : u.role === 'curator'
                              ? 'badge-role-curator'
                              : 'badge-role-member'
                        }`}
                      >
                        {formatRoleLabel(u.role)}
                      </span>
                    </td>
                    <td data-label="Account status">
                      <span className={`badge ${isActive ? 'badge-approved' : 'badge-rejected'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Curator status">
                      {u.role === 'curator' ? (
                        <span className={`badge badge-${u.curator_status}`}>
                          {u.curator_status === 'approved' ? 'Verified' : u.curator_status === 'pending' ? 'Pending' : 'Rejected'}
                        </span>
                      ) : (
                        <span className="table-cell-muted">—</span>
                      )}
                    </td>
                    <td data-label="Active artworks" className="table-cell-num">
                      {u.artwork_count}
                    </td>
                    <td data-label="Joined" className="table-cell-meta">
                      {new Date(u.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td data-label="Actions" data-cell="actions">
                      <div className="table-actions-group">
                        {u.role === 'member' && (
                          <Link
                            href={`/dashboard/admin/users/${u.id}`}
                            className="btn-secondary table-action-btn"
                            id={`btn-view-member-${u.id}`}
                          >
                            View details
                          </Link>
                        )}
                        <UserStatusButton
                          userId={u.id}
                          userName={u.name}
                          userRole={u.role}
                          isActive={isActive}
                          currentAdminId={currentAdmin.id}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
