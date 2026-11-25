import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatEditorialTitle } from '@/lib/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';
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

export default async function CuratorChallengesPage(props) {
  const user = await requireRole('curator');
  const searchParams = await props.searchParams;
  const rawStatus = (searchParams?.status || 'all').toString().toLowerCase();
  const statusFilter = ['all', 'active', 'upcoming', 'completed'].includes(rawStatus)
    ? rawStatus
    : 'all';

  const res = await query(
    `
    SELECT c.id, c.title, c.prize, c.start_date, c.end_date, c.created_at,
           COUNT(DISTINCT s.id)::int AS submission_count,
           COUNT(DISTINCT CASE WHEN s.winner_rank IS NOT NULL THEN s.id END)::int AS winner_count,
           CASE
             WHEN NOW() < c.start_date THEN 'upcoming'
             WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
             ELSE 'completed'
           END AS status
    FROM challenges c
    LEFT JOIN submissions s ON s.challenge_id = c.id
    WHERE c.curator_id = $1
    GROUP BY c.id
    ORDER BY c.created_at DESC
    `,
    [user.id]
  );

  const allChallenges = res.rows;
  const counts = {
    all: allChallenges.length,
    active: allChallenges.filter((c) => c.status === 'active').length,
    upcoming: allChallenges.filter((c) => c.status === 'upcoming').length,
    completed: allChallenges.filter((c) => c.status === 'completed').length,
  };

  const challenges =
    statusFilter === 'all'
      ? allChallenges
      : allChallenges.filter((c) => c.status === statusFilter);

  const filterTabs = [
    { key: 'all', label: 'All', href: '/dashboard/curator/challenges' },
    { key: 'active', label: 'Active', href: '/dashboard/curator/challenges?status=active' },
    { key: 'upcoming', label: 'Upcoming', href: '/dashboard/curator/challenges?status=upcoming' },
    { key: 'completed', label: 'Completed', href: '/dashboard/curator/challenges?status=completed' },
  ];

  const statusLabelMap = {
    active: 'Active',
    upcoming: 'Upcoming',
    completed: 'Completed',
  };
  const breadcrumbItems =
    statusFilter !== 'all' && statusLabelMap[statusFilter]
      ? [
          { label: 'Dashboard', href: '/dashboard/curator' },
          { label: 'My Challenges', href: '/dashboard/curator/challenges' },
          { label: statusLabelMap[statusFilter] },
        ]
      : [
          { label: 'Dashboard', href: '/dashboard/curator' },
          { label: 'My Challenges' },
        ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Challenges</h1>
          <p className="dashboard-subtitle">
            Manage curatorial programs, review submissions, and select winners ({allChallenges.length} total).
          </p>
        </div>
        <Link href="/dashboard/curator/challenges/create" className="btn-primary">
          + Create Challenge
        </Link>
      </div>

      {allChallenges.length === 0 ? (
        <div className="dash-empty dash-empty--with-cta">
          <p>You haven&apos;t created any challenges yet.</p>
          <Link href="/dashboard/curator/challenges/create" className="btn-primary">
            Create Your First Challenge
          </Link>
        </div>
      ) : (
        <>
          {/* Status Filter Bar (reused from Admin Challenges) */}
          <div className="admin-challenges-filter-tabs" role="tablist" aria-label="Filter challenges by status">
            {filterTabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                role="tab"
                aria-selected={statusFilter === tab.key}
                className={`admin-challenges-filter-tab ${statusFilter === tab.key ? 'active' : ''}`}
                id={`curator-filter-challenges-${tab.key}`}
              >
                <span>{tab.label}</span>
                <span className="admin-challenges-filter-count">{counts[tab.key]}</span>
              </Link>
            ))}
          </div>

          <div className="data-table-wrap">
            <table className="data-table dashboard-responsive-table curator-challenges-list-table">
              <colgroup>
                <col className="curator-chal-col-title" />
                <col className="curator-chal-col-prize" />
                <col className="curator-chal-col-participation" />
                <col className="curator-chal-col-schedule" />
                <col className="curator-chal-col-actions" />
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
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="data-table-empty-cell">
                      No challenges found in this category.
                    </td>
                  </tr>
                ) : (
                  challenges.map((ch) => {
                    const subCount = Number(ch.submission_count) || 0;
                    const winnerCount = Number(ch.winner_count) || 0;
                    const prizeInfo = parsePrize(ch.prize);
                    const scheduleText = formatSchedule(ch.start_date, ch.end_date);
                    const statusLabel =
                      ch.status === 'active'
                        ? 'Active'
                        : ch.status === 'upcoming'
                          ? 'Upcoming'
                          : 'Completed';
                    const badgeClass =
                      ch.status === 'active'
                        ? 'badge-active'
                        : ch.status === 'upcoming'
                          ? 'badge-upcoming'
                          : 'badge-ended';

                    return (
                      <tr key={ch.id}>
                        <td data-label="Challenge" data-cell="primary">
                          <div className="admin-challenge-title-cell">
                            <Link
                              href={`/dashboard/curator/challenges/${ch.id}`}
                              className="dashboard-table-link"
                            >
                              {formatEditorialTitle(ch.title)}
                            </Link>
                            <div>
                              <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                            </div>
                          </div>
                        </td>
                        <td data-label="Prize">
                          <div className="curator-prize-stack">
                            <span className="table-cell-num">{prizeInfo.primary}</span>
                            {prizeInfo.secondary && (
                              <span className="table-cell-submeta">{prizeInfo.secondary}</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Participation">
                          <div className="admin-challenge-winners-cell">
                            <span className="table-cell-num">
                              {subCount} {subCount === 1 ? 'submission' : 'submissions'}
                            </span>
                            {winnerCount > 0 ? (
                              <span className="admin-challenge-winners-count">
                                {winnerCount} {winnerCount === 1 ? 'winner selected' : 'winners selected'}
                              </span>
                            ) : (
                              <span className="table-cell-submeta">No winners selected</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Schedule" className="table-cell-meta">
                          {scheduleText}
                        </td>
                        <td data-label="Actions" data-cell="actions">
                          <div className="table-actions-group">
                            <Link
                              href={`/dashboard/curator/challenges/${ch.id}/submissions`}
                              className="btn-primary table-action-btn"
                            >
                              Submissions ({subCount})
                            </Link>
                            <Link
                              href={`/dashboard/curator/challenges/${ch.id}`}
                              className="btn-secondary table-action-btn"
                              id={`btn-curator-view-challenge-${ch.id}`}
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/dashboard/curator/challenges/${ch.id}/edit`}
                              className="btn-secondary table-action-btn"
                            >
                              Edit
                            </Link>
                            <DeleteChallengeButton challengeId={ch.id} challengeTitle={ch.title} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
