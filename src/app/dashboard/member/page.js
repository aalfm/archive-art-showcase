import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DashboardStatCard from '@/components/ui/DashboardStatCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Member Overview — ARCHIVE',
};

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function MemberOverviewPage() {
  const user = await requireRole('member');

  const [statsRes, recentArtworksRes, recentSubmissionsRes] = await Promise.all([
    query(
      `
      SELECT
        (SELECT COUNT(*)::int FROM artworks WHERE user_id = $1 AND status = 'active') AS published_artworks,
        (SELECT COUNT(DISTINCT a.id)::int
         FROM artworks a
         JOIN reports r ON r.artwork_id = a.id
         WHERE a.user_id = $1 AND r.status = 'pending') AS artworks_in_review,
        (SELECT COUNT(*)::int FROM artworks WHERE user_id = $1 AND status = 'taken_down') AS taken_down_artworks,
        (SELECT COUNT(DISTINCT s.challenge_id)::int
         FROM submissions s
         JOIN challenges c ON s.challenge_id = c.id
         WHERE s.member_id = $1 AND c.end_date >= NOW()) AS active_challenges,
        (SELECT COUNT(*)::int
         FROM submissions s
         JOIN challenges c ON s.challenge_id = c.id
         WHERE s.member_id = $1 AND s.winner_rank IS NULL AND c.end_date >= NOW()) AS pending_submissions
      `,
      [user.id]
    ),
    query(
      `
      SELECT a.id, a.title, a.like_count, a.status, a.created_at,
             COALESCE(c.name, 'Architecture') AS category_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT 3
      `,
      [user.id]
    ),
    query(
      `
      SELECT s.id, s.winner_rank, s.created_at,
             c.id AS challenge_id, c.title AS challenge_title,
             (c.end_date < NOW()) AS challenge_ended,
             a.title AS artwork_title
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      JOIN artworks a ON s.artwork_id = a.id
      WHERE s.member_id = $1
      ORDER BY s.created_at DESC
      LIMIT 3
      `,
      [user.id]
    ),
  ]);

  const stats = statsRes.rows[0] || {
    published_artworks: 0,
    artworks_in_review: 0,
    taken_down_artworks: 0,
    active_challenges: 0,
    pending_submissions: 0,
  };

  const underReviewTotal = stats.artworks_in_review + stats.pending_submissions;
  const underReviewHref =
    stats.artworks_in_review > 0 ? '/dashboard/member/artworks' : '/dashboard/member/submissions';

  const recentActivity = [
    ...recentSubmissionsRes.rows.map((sub) => {
      const statusText = sub.winner_rank
        ? `Ranked #${sub.winner_rank}`
        : sub.challenge_ended
          ? 'Judging Closed'
          : 'Under Review';

      return {
        key: `sub-${sub.id}`,
        kicker: 'Challenge Entry',
        title: sub.challenge_title,
        meta: `${sub.artwork_title} · ${statusText} · ${formatShortDate(sub.created_at)}`,
        href: '/dashboard/member/submissions',
        actionLabel: 'Status',
        createdAt: new Date(sub.created_at).getTime(),
      };
    }),
    ...recentArtworksRes.rows.map((art) => ({
      key: `art-${art.id}`,
      kicker: art.status === 'active' ? 'Published Work' : 'Taken Down',
      title: art.title,
      meta: `${art.category_name} · ${art.like_count} ${art.like_count === 1 ? 'like' : 'likes'} · ${formatShortDate(art.created_at)}`,
      href: `/dashboard/member/artworks/${art.id}/edit`,
      actionLabel: 'Manage',
      createdAt: new Date(art.created_at).getTime(),
    })),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);

  const hasModerationNotice = stats.artworks_in_review > 0 || stats.taken_down_artworks > 0;

  return (
    <div className="dash-overview">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Member Overview</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user.name}. Here is a brief summary of your works and challenges.
          </p>
        </div>
        <Link href="/dashboard/member/artworks/create" className="btn-primary">
          + Upload Artwork
        </Link>
      </div>

      {/* Primary Metrics (3 Focused Cards) */}
      <div className="dash-kpi-grid">
        <DashboardStatCard
          label="Published Artworks"
          value={stats.published_artworks}
          href="/dashboard/member/artworks"
          linkLabel="My Artworks →"
        />
        <DashboardStatCard
          label="Active Challenges"
          value={stats.active_challenges}
          href="/dashboard/member/submissions"
          linkLabel="My Submissions →"
        />
        <DashboardStatCard
          label="Under Review"
          value={underReviewTotal}
          href={underReviewHref}
          linkLabel="View Status →"
        />
      </div>

      {/* Conditional Important Artwork Review / Moderation Notice */}
      {hasModerationNotice && (
        <div className="dash-notice" role="status">
          <div className="dash-notice-body">
            <span className="dash-notice-label">Artwork Status Notice</span>
            <p className="dash-notice-text">
              {stats.artworks_in_review > 0
                ? `${stats.artworks_in_review} ${stats.artworks_in_review === 1 ? 'artwork is' : 'artworks are'} currently under moderation review.`
                : ''}
              {stats.artworks_in_review > 0 && stats.taken_down_artworks > 0 ? ' ' : ''}
              {stats.taken_down_artworks > 0
                ? `${stats.taken_down_artworks} ${stats.taken_down_artworks === 1 ? 'artwork has' : 'artworks have'} been taken down by an administrator.`
                : ''}
            </p>
          </div>
          <Link href="/dashboard/member/artworks" className="dash-row-link">
            Review Artworks →
          </Link>
        </div>
      )}

      {/* Concise Recent Activity */}
      <section className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Recent Activity</h2>
            <p className="dash-section-desc">
              Your latest published works and active challenge entries.
            </p>
          </div>
          <Link href="/dashboard/member/artworks" className="dash-inline-link">
            All Artworks →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="dash-empty dash-empty--with-cta">
            <p>You haven&apos;t published an artwork or joined a challenge yet.</p>
            <Link href="/dashboard/member/artworks/create" className="btn-primary">
              Upload Your First Artwork
            </Link>
          </div>
        ) : (
          <div className="dash-panel">
            <ul className="dash-list">
              {recentActivity.map((item) => (
                <li key={item.key} className="dash-list-item">
                  <div className="dash-list-main">
                    <span className="dash-item-kicker">{item.kicker}</span>
                    <Link href={item.href} className="dash-item-title dash-item-title-link">
                      {item.title}
                    </Link>
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

      {/* Quick Navigation to Full Sections */}
      <section className="dash-section">
        <div className="dash-section-head">
          <h2 className="dash-section-title">Manage Workspace</h2>
        </div>
        <div className="dash-quick-links">
          <Link href="/dashboard/member/artworks" className="dash-quick-link">
            <span>My Artworks</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/dashboard/member/submissions" className="dash-quick-link">
            <span>Challenge Submissions</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/dashboard/member/favorites" className="dash-quick-link">
            <span>Saved Favorites</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/dashboard/member/profile" className="dash-quick-link">
            <span>Profile &amp; Settings</span>
            <span className="dash-quick-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
