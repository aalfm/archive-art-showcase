import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatEditorialTitle } from '@/lib/utils';
import DashboardStatCard from '@/components/ui/DashboardStatCard';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curator Overview — ARCHIVE',
};

function formatShortDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function CuratorOverviewPage() {
  const user = await requireRole('curator');

  const [statsRes, challengesRes] = await Promise.all([
    query(
      `
      SELECT
        COUNT(DISTINCT c.id)::int AS total_challenges,
        COUNT(DISTINCT CASE WHEN NOW() BETWEEN c.start_date AND c.end_date THEN c.id END)::int AS active_challenges,
        COUNT(DISTINCT CASE WHEN s.winner_rank IS NULL THEN s.id END)::int AS pending_review_submissions
      FROM challenges c
      LEFT JOIN submissions s ON s.challenge_id = c.id
      WHERE c.curator_id = $1
      `,
      [user.id]
    ),
    query(
      `
      SELECT c.id, c.title, c.end_date,
             COUNT(DISTINCT s.id)::int AS submission_count,
             COUNT(DISTINCT CASE WHEN s.winner_rank IS NULL THEN s.id END)::int AS pending_count,
             CASE
               WHEN NOW() < c.start_date THEN 'upcoming'
               WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
               ELSE 'ended'
             END AS status
      FROM challenges c
      LEFT JOIN submissions s ON s.challenge_id = c.id
      WHERE c.curator_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 4
      `,
      [user.id]
    ),
  ]);

  const stats = statsRes.rows[0] || {
    total_challenges: 0,
    active_challenges: 0,
    pending_review_submissions: 0,
  };
  const challenges = challengesRes.rows;

  return (
    <div className="dash-overview">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Overview' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Curator Overview</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user.name}. Here is a brief summary of your challenges and submissions awaiting review.
          </p>
        </div>
        <Link href="/dashboard/curator/challenges/create" className="btn-primary">
          + Create Challenge
        </Link>
      </div>

      <div className="dash-kpi-grid">
        <DashboardStatCard
          label="Managed Challenges"
          value={stats.total_challenges}
          href="/dashboard/curator/challenges"
          linkLabel="My Challenges →"
        />
        <DashboardStatCard
          label="Active Challenges"
          value={stats.active_challenges}
          href="/dashboard/curator/challenges?status=active"
          linkLabel="View Active →"
        />
        <DashboardStatCard
          label="Submissions to Review"
          value={stats.pending_review_submissions}
          href="/dashboard/curator/challenges"
          linkLabel="Review Entries →"
        />
      </div>

      <section className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">Recent Challenge Activity</h2>
            <p className="dash-section-desc">
              Latest programs under your curation. Open full management to edit or judge entries.
            </p>
          </div>
          <Link href="/dashboard/curator/challenges" className="dash-inline-link">
            Manage All →
          </Link>
        </div>

        {challenges.length === 0 ? (
          <div className="dash-empty dash-empty--with-cta">
            <p>You haven&apos;t created any challenges yet.</p>
            <Link href="/dashboard/curator/challenges/create" className="btn-primary">
              Create Your First Challenge
            </Link>
          </div>
        ) : (
          <div className="dash-panel">
            <ul className="dash-list">
              {challenges.map((ch) => {
                const statusLabel =
                  ch.status === 'active'
                    ? 'Active'
                    : ch.status === 'upcoming'
                      ? 'Upcoming'
                      : 'Completed';
                const subText =
                  ch.submission_count === 1
                    ? '1 submission'
                    : `${ch.submission_count} submissions`;
                const pendingNote =
                  ch.pending_count > 0 ? ` · ${ch.pending_count} awaiting review` : '';

                return (
                  <li key={ch.id} className="dash-list-item">
                    <div className="dash-list-main">
                      <span className={`dash-item-kicker is-${ch.status}`}>{statusLabel}</span>
                      <Link
                        href={`/dashboard/curator/challenges/${ch.id}`}
                        className="dash-item-title dash-item-title-link"
                      >
                        {formatEditorialTitle(ch.title)}
                      </Link>
                      <span className="dash-item-meta">
                        {subText}
                        {pendingNote} · Ends {formatShortDate(ch.end_date)}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/curator/challenges/${ch.id}/submissions`}
                      className="dash-row-link"
                    >
                      Submissions →
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
