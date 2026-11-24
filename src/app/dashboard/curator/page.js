import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DeleteChallengeButton from './challenges/DeleteChallengeButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curator Overview — ARCHIVE',
};

export default async function CuratorOverviewPage() {
  const user = await requireRole('curator');

  const [statsRes, challengesRes] = await Promise.all([
    query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_challenges,
        COUNT(DISTINCT CASE WHEN NOW() BETWEEN c.start_date AND c.end_date THEN c.id END) as active_challenges,
        COUNT(DISTINCT s.id) as total_submissions,
        COUNT(DISTINCT CASE WHEN s.winner_rank IS NOT NULL THEN s.id END) as total_winners
      FROM challenges c
      LEFT JOIN submissions s ON s.challenge_id = c.id
      WHERE c.curator_id = $1
    `, [user.id]),
    query(`
      SELECT c.id, c.title, c.prize, c.start_date, c.end_date,
             COUNT(DISTINCT s.id) as submission_count,
             COUNT(DISTINCT CASE WHEN s.winner_rank IS NOT NULL THEN s.id END) as winner_count,
             CASE
               WHEN NOW() < c.start_date THEN 'upcoming'
               WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
               ELSE 'ended'
             END as status
      FROM challenges c
      LEFT JOIN submissions s ON s.challenge_id = c.id
      WHERE c.curator_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `, [user.id]),
  ]);

  const stats = statsRes.rows[0];
  const challenges = challengesRes.rows;

  return (
    <div className="curator-overview-page">
      <div className="dashboard-header curator-page-header">
        <div>
          <h1 className="curator-page-title">Curator Overview</h1>
          <p className="curator-page-subtitle">Manage architectural challenges and curate submissions.</p>
        </div>
        <Link href="/dashboard/curator/challenges/create" className="btn-primary curator-cta-btn">
          + Create New Challenge
        </Link>
      </div>

      {/* Stats */}
      <div className="curator-stats-grid">
        <div className="curator-stat-card">
          <span className="curator-stat-label">Total Challenges</span>
          <span className="curator-stat-value">{stats.total_challenges}</span>
        </div>
        <div className="curator-stat-card">
          <span className="curator-stat-label">Active Challenges</span>
          <span className="curator-stat-value">{stats.active_challenges}</span>
        </div>
        <div className="curator-stat-card">
          <span className="curator-stat-label">Submissions Received</span>
          <span className="curator-stat-value">{stats.total_submissions}</span>
        </div>
        <div className="curator-stat-card">
          <span className="curator-stat-label">Winners Selected</span>
          <span className="curator-stat-value">{stats.total_winners}</span>
        </div>
      </div>

      {/* Recent Challenges Table */}
      <section className="curator-challenges-section">
        <div className="curator-section-header">
          <h2 className="curator-section-title">Your Challenges</h2>
          <Link href="/dashboard/curator/challenges" className="curator-view-all">
            View All →
          </Link>
        </div>

        {challenges.length === 0 ? (
          <div className="curator-empty-state">
            <p className="curator-empty-text">
              You haven&apos;t created any art challenges yet.
            </p>
            <Link href="/dashboard/curator/challenges/create" className="btn-primary curator-cta-btn">
              Create Your First Challenge
            </Link>
          </div>
        ) : (
          <div className="data-table-wrap curator-table-wrap">
            <table className="data-table curator-challenges-table">
              <colgroup>
                <col className="curator-col-title" />
                <col className="curator-col-prize" />
                <col className="curator-col-status" />
                <col className="curator-col-submissions" />
                <col className="curator-col-period" />
                <col className="curator-col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Challenge Title</th>
                  <th>Prize</th>
                  <th>Status</th>
                  <th>Submissions</th>
                  <th>Period</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((ch) => (
                  <tr key={ch.id}>
                    <td>
                      <Link href={`/challenges/${ch.id}`} className="curator-challenge-link">
                        {ch.title}
                      </Link>
                    </td>
                    <td className="curator-prize-cell">{ch.prize}</td>
                    <td>
                      <span className={`badge curator-status-badge badge-${ch.status}`}>
                        {ch.status === 'active' ? 'Active' : ch.status === 'upcoming' ? 'Upcoming' : 'Ended'}
                      </span>
                    </td>
                    <td className="curator-submissions-cell">
                      <span>{ch.submission_count} submissions</span>
                      {ch.winner_count > 0 && (
                        <span className="curator-winners-note">({ch.winner_count} winners)</span>
                      )}
                    </td>
                    <td className="curator-period-cell">
                      {new Date(ch.start_date).toLocaleDateString('en-US')} — {new Date(ch.end_date).toLocaleDateString('en-US')}
                    </td>
                    <td className="td-right">
                      <div className="curator-5col-actions-wrap">
                        <Link
                          href={`/dashboard/curator/challenges/${ch.id}/submissions`}
                          className="btn-primary curator-table-btn curator-submissions-btn"
                        >
                          Submissions ({ch.submission_count})
                        </Link>
                        <div className="curator-secondary-actions-row">
                          <Link
                            href={`/dashboard/curator/challenges/${ch.id}/edit`}
                            className="btn-secondary curator-table-btn"
                          >
                            Edit
                          </Link>
                          <DeleteChallengeButton challengeId={ch.id} challengeTitle={ch.title} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
