import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
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
    SELECT u.id, u.name, u.email, u.role, u.curator_status, u.is_active, u.created_at,
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
  const users = res.rows;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">User Management</h1>
          <p className="dashboard-subtitle">Manage member accounts, curators, and access roles ({users.length} users).</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <UserFilters initialSearch={search} initialRole={roleFilter} />

      {/* Users Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Account Status</th>
              <th>Curator Status</th>
              <th>Active Artworks</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'left', padding: 32, color: 'var(--surface)' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isActive = u.is_active !== false;
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      {u.role === 'member' ? (
                        <Link href={`/artists/${u.id}`} target="_blank" className="dashboard-user-link">
                          {u.name}
                        </Link>
                      ) : (
                        u.name
                      )}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--surface)' }}>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'admin'
                            ? 'badge-role-admin'
                            : u.role === 'curator'
                              ? 'badge-role-curator'
                              : 'badge-role-member'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isActive ? 'badge-approved' : 'badge-rejected'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {u.role === 'curator' ? (
                        <span className={`badge badge-${u.curator_status}`}>
                          {u.curator_status === 'approved' ? 'Verified' : u.curator_status === 'pending' ? 'Pending' : 'Rejected'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--surface)', fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {u.artwork_count}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--surface)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td>
                      <UserStatusButton
                        userId={u.id}
                        userName={u.name}
                        userRole={u.role}
                        isActive={isActive}
                        currentAdminId={currentAdmin.id}
                      />
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
