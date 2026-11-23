import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DeleteChallengeButton from './DeleteChallengeButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manage Challenges — ARCHIVE',
};

function parsePrize(prize) {
  if (!prize) return { primary: '—', secondary: null };
  const parts = prize.split(/\s*\+\s*/);
  if (parts.length > 1) {
    return {
      primary: parts[0].trim(),
      secondary: parts.slice(1).join(' + ').trim(),
    };
  }
  return { primary: prize, secondary: null };
}

function formatSchedule(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startStr} – ${endStr}`;
}

export default async function CuratorChallengesPage() {
  const user = await requireRole('curator');

  const res = await query(`
    SELECT c.id, c.title, c.prize, c.start_date, c.end_date, c.created_at,
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
  `, [user.id]);

  const challenges = res.rows;

  return (
    <div className="curator-overview-page">
      <div className="dashboard-header curator-page-header">
        <div>
          <h1 className="curator-page-title">MY CHALLENGES</h1>
          <p className="curator-page-subtitle">Manage curatorial programs, review submissions, and select winners.</p>
        </div>
        <Link href="/dashboard/curator/challenges/create" className="btn-primary curator-cta-btn">
          + Create New Challenge
        </Link>
      </div>

      {challenges.length === 0 ? (
        <div className="curator-empty-state">
          <p className="curator-empty-text">
            You haven&apos;t created any challenges yet.
          </p>
          <Link href="/dashboard/curator/challenges/create" className="btn-primary curator-cta-btn">
            Create First Challenge
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet 5-Column Table */}
          <div className="data-table-wrap curator-table-wrap curator-table-desktop-wrap">
            <table className="data-table curator-challenges-5col-table">
              <colgroup>
                <col className="curator-5col-challenge" />
                <col className="curator-5col-prize" />
                <col className="curator-5col-participation" />
                <col className="curator-5col-schedule" />
                <col className="curator-5col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Prize</th>
                  <th>Participation</th>
                  <th>Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((ch) => {
                  const subCount = parseInt(ch.submission_count, 10) || 0;
                  const winnerCount = parseInt(ch.winner_count, 10) || 0;
                  const prizeInfo = parsePrize(ch.prize);
                  const scheduleText = formatSchedule(ch.start_date, ch.end_date);
                  const statusLabel = ch.status === 'active' ? 'Active' : ch.status === 'upcoming' ? 'Upcoming' : 'Ended';

                  return (
                    <tr key={ch.id}>
                      <td>
                        <div className="curator-cell-challenge">
                          <Link href={`/challenges/${ch.id}`} className="curator-challenge-title-link">
                            {ch.title}
                          </Link>
                          <span className={`badge curator-status-badge badge-${ch.status}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="curator-cell-prize">
                          <span className="curator-prize-main">{prizeInfo.primary}</span>
                          {prizeInfo.secondary && (
                            <span className="curator-prize-sub">{prizeInfo.secondary}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="curator-cell-participation">
                          <span className="curator-participation-count">
                            {subCount} {subCount === 1 ? 'Submission' : 'Submissions'}
                          </span>
                          <span className={winnerCount > 0 ? 'curator-participation-winners is-selected' : 'curator-participation-winners'}>
                            {winnerCount > 0 ? `Winners: ${winnerCount} selected` : 'Winners: Not selected'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="curator-schedule-text">{scheduleText}</span>
                      </td>
                      <td className="td-right">
                        <div className="curator-5col-actions-wrap">
                          <Link
                            href={`/dashboard/curator/challenges/${ch.id}/submissions`}
                            className="btn-primary curator-table-btn curator-submissions-btn"
                          >
                            Submissions ({subCount})
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Card Layout */}
          <div className="curator-cards-mobile-list">
            {challenges.map((ch) => {
              const subCount = parseInt(ch.submission_count, 10) || 0;
              const winnerCount = parseInt(ch.winner_count, 10) || 0;
              const prizeInfo = parsePrize(ch.prize);
              const scheduleText = formatSchedule(ch.start_date, ch.end_date);
              const statusLabel = ch.status === 'active' ? 'Active' : ch.status === 'upcoming' ? 'Upcoming' : 'Ended';

              return (
                <article key={ch.id} className="curator-mobile-card">
                  <div className="curator-mobile-card-head">
                    <Link href={`/challenges/${ch.id}`} className="curator-challenge-title-link">
                      {ch.title}
                    </Link>
                    <span className={`badge curator-status-badge badge-${ch.status}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="curator-mobile-card-meta">
                    <div className="curator-mobile-meta-item">
                      <span className="curator-mobile-meta-label">Prize</span>
                      <span className="curator-prize-main">{prizeInfo.primary}</span>
                      {prizeInfo.secondary && (
                        <span className="curator-prize-sub">{prizeInfo.secondary}</span>
                      )}
                    </div>
                    <div className="curator-mobile-meta-item">
                      <span className="curator-mobile-meta-label">Participation</span>
                      <span className="curator-participation-count">
                        {subCount} {subCount === 1 ? 'Submission' : 'Submissions'}
                      </span>
                      <span className={winnerCount > 0 ? 'curator-participation-winners is-selected' : 'curator-participation-winners'}>
                        {winnerCount > 0 ? `Winners: ${winnerCount} selected` : 'Winners: Not selected'}
                      </span>
                    </div>
                    <div className="curator-mobile-meta-item">
                      <span className="curator-mobile-meta-label">Schedule</span>
                      <span className="curator-schedule-text">{scheduleText}</span>
                    </div>
                  </div>

                  <div className="curator-mobile-card-actions">
                    <Link
                      href={`/dashboard/curator/challenges/${ch.id}/submissions`}
                      className="btn-primary curator-table-btn curator-submissions-btn"
                    >
                      Submissions ({subCount})
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
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
