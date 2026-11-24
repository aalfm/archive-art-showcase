import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { getDashboardStats } from '@/lib/actions/admin.actions';
import { query } from '@/lib/db';
import DashboardStatCard from '@/components/ui/DashboardStatCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Overview — ARCHIVE',
};

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function AdminOverviewPage() {
  await requireRole('admin');

  const [stats, pendingCuratorCountRes, pendingCuratorsRes, pendingReportsRes] = await Promise.all([
    getDashboardStats(),
    query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'curator' AND curator_status = 'pending'`),
    query(`
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'curator' AND curator_status = 'pending'
      ORDER BY created_at DESC
      LIMIT 3
    `),
    query(`
      SELECT r.id, r.reason, r.created_at,
             a.title AS artwork_title,
             COALESCE(u.name, 'Deleted User') AS reporter_name
      FROM reports r
      JOIN artworks a ON r.artwork_id = a.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 3
    `),
  ]);

  const pendingCuratorCount = pendingCuratorCountRes.rows[0]?.count ?? 0;

  const attentionItems = [
    ...pendingReportsRes.rows.map((r) => ({
      key: `report-${r.id}`,
      type: 'Artwork Report',
      title: r.artwork_title,
      meta: `${r.reason} · Reported by ${r.reporter_name} · ${formatShortDate(r.created_at)}`,
      href: '/dashboard/admin/reports',
      actionLabel: 'Review',
      createdAt: new Date(r.created_at).getTime(),
    })),
    ...pendingCuratorsRes.rows.map((c) => ({
      key: `curator-${c.id}`,
      type: 'Curator Verification',
      title: c.name,
      meta: `${c.email} · Applied ${formatShortDate(c.created_at)}`,
      href: '/dashboard/admin/curators',
      actionLabel: 'Verify',
      createdAt: new Date(c.created_at).getTime(),
    })),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="dash-overview">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Overview</h1>
          <p className="dashboard-subtitle">
            Platform summary and items requiring administrative review.
          </p>
        </div>
      </div>

      {/* Primary Metrics (3 Focused Cards) */}
      <div className="dash-kpi-grid">
        <DashboardStatCard
          label="Total Users"
          value={stats.totalUsers}
          href="/dashboard/admin/users"
          linkLabel="Manage Users →"
        />
        <DashboardStatCard
          label="Pending Moderation"
          value={stats.pendingReports}
          href="/dashboard/admin/reports"
          linkLabel="Review Reports →"
        />
        <DashboardStatCard
          label="Pending Curators"
          value={pendingCuratorCount}
          href="/dashboard/admin/curators"
          linkLabel="Verify Curators →"
        />
      </div>

      {/* Priority Attention List */}
      <section className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Needs Attention</h2>
            <p className="dash-section-desc">
              Recent moderation reports and curator verification requests.
            </p>
          </div>
          <Link href="/dashboard/admin/reports" className="dash-inline-link">
            Moderation Queue →
          </Link>
        </div>

        {attentionItems.length === 0 ? (
          <div className="dash-empty">
            <p>All clear. No curator applications or content reports require attention right now.</p>
          </div>
        ) : (
          <div className="dash-panel">
            <ul className="dash-list">
              {attentionItems.map((item) => (
                <li key={item.key} className="dash-list-item">
                  <div className="dash-list-main">
                    <span className="dash-item-kicker">{item.type}</span>
                    <span className="dash-item-title">{item.title}</span>
                    <span className="dash-item-meta">{item.meta}</span>
                  </div>
                  <Link href={item.href} className="dash-row-link">
                    {item.actionLabel} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Direct Links to Full Management Pages */}
      <section className="dash-section">
        <div className="dash-section-head">
          <h2 className="dash-section-title">Management</h2>
        </div>
        <div className="dash-quick-links">
          <Link href="/dashboard/admin/users" className="dash-quick-link">
            <span>User Management</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/dashboard/admin/curators" className="dash-quick-link">
            <span>Curator Verification</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/dashboard/admin/reports" className="dash-quick-link">
            <span>Content Moderation</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/dashboard/admin/categories" className="dash-quick-link">
            <span>Categories</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
