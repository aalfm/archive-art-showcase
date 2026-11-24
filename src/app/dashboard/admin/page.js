import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { getDashboardStats } from '@/lib/actions/admin.actions';
import { query } from '@/lib/db';
import DashboardStatCard from '@/components/ui/DashboardStatCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Overview — ARCHIVE',
};

export default async function AdminOverviewPage() {
  await requireRole('admin');
  const stats = await getDashboardStats();

  // Get recent reports and pending curators for quick action
  const [pendingCuratorsRes, pendingReportsRes] = await Promise.all([
    query(`
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'curator' AND curator_status = 'pending'
      ORDER BY created_at ASC
      LIMIT 5
    `),
    query(`
      SELECT r.id, r.reason, r.created_at,
             a.id as artwork_id, a.title as artwork_title,
             COALESCE(u.name, 'Deleted User') as reporter_name
      FROM reports r
      JOIN artworks a ON r.artwork_id = a.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 5
    `),
  ]);

  const pendingCurators = pendingCuratorsRes.rows;
  const pendingReports = pendingReportsRes.rows;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Overview</h1>
          <p className="dashboard-subtitle">Central operations and governance control for the ARCHIVE platform.</p>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="stats-grid">
        <DashboardStatCard
          label="Total Users"
          value={stats.totalUsers}
          href="/dashboard/admin/users"
          linkLabel="Manage Users →"
        />
        <DashboardStatCard
          label="Active Artworks"
          value={stats.totalArtworks}
          href="/explore"
          linkLabel="View Gallery →"
        />
        <DashboardStatCard
          label="Reports Pending Moderation"
          value={stats.pendingReports}
          href="/dashboard/admin/reports"
          linkLabel="Review Reports →"
        />
        <DashboardStatCard
          label="Active Challenges"
          value={stats.activeChallenges}
          href="/challenges"
          linkLabel="View Challenges →"
        />
      </div>

      <div className="admin-overview-tables-grid">
        {/* Pending Curators */}
        <div className="admin-overview-table-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--accent)', letterSpacing: '0.1em' }}>
              PENDING CURATOR APPLICATIONS ({pendingCurators.length})
            </h2>
            <Link href="/dashboard/admin/curators" style={{ fontSize: '0.8rem', color: 'var(--surface)', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {pendingCurators.length === 0 ? (
            <div style={{ padding: 24, background: '#141618', borderRadius: 8, border: '1px solid var(--bg-secondary)', color: 'var(--surface)', fontSize: '0.86rem' }}>
              No curator applications awaiting review.
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCurators.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--surface)' }}>{c.email}</td>
                      <td>
                        <Link href="/dashboard/admin/curators" className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                          Verify
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Reports */}
        <div className="admin-overview-table-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--accent)', letterSpacing: '0.1em' }}>
              RECENT CONTENT REPORTS ({pendingReports.length})
            </h2>
            <Link href="/dashboard/admin/reports" style={{ fontSize: '0.8rem', color: 'var(--surface)', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {pendingReports.length === 0 ? (
            <div style={{ padding: 24, background: '#141618', borderRadius: 8, border: '1px solid var(--bg-secondary)', color: 'var(--surface)', fontSize: '0.86rem' }}>
              All content is safe. No reports awaiting review.
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReports.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.artwork_title}</td>
                      <td>
                        <span className="badge badge-rejected" style={{ fontSize: '0.7rem' }}>
                          {r.reason}
                        </span>
                      </td>
                      <td>
                        <Link href="/dashboard/admin/reports" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                          Moderate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
