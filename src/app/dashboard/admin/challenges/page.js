import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatEditorialTitle } from '@/lib/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Challenge Management — ARCHIVE',
};

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

export default async function AdminChallengesPage(props) {
  await requireRole('admin');
  const searchParams = await props.searchParams;
  const rawStatus = (searchParams?.status || 'all').toString().toLowerCase();
  const statusFilter = ['all', 'active', 'upcoming', 'completed'].includes(rawStatus)
    ? rawStatus
    : 'all';

  const res = await query(`
    SELECT c.id, c.title, c.prize, c.start_date, c.end_date, c.created_at,
           u.name AS curator_name,
           COUNT(DISTINCT s.id)::int AS submission_count,
           COUNT(DISTINCT CASE WHEN s.winner_rank IS NOT NULL AND a.status = 'active' THEN s.id END)::int AS winner_count,
           COALESCE(
             (
               SELECT STRING_AGG(
                 CONCAT(
                   CASE s2.winner_rank WHEN 1 THEN '1st' WHEN 2 THEN '2nd' ELSE '3rd' END,
                   ': ',
                   wu.name
                 ),
                 ' · '
                 ORDER BY s2.winner_rank ASC
               )
               FROM submissions s2
               JOIN artworks a2 ON a2.id = s2.artwork_id AND a2.status = 'active'
               JOIN users wu ON wu.id = s2.member_id
               WHERE s2.challenge_id = c.id AND s2.winner_rank IS NOT NULL
             ),
             ''
           ) AS winner_summary,
           CASE
             WHEN NOW() < c.start_date THEN 'upcoming'
             WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
             ELSE 'completed'
           END AS status
    FROM challenges c
    LEFT JOIN users u ON u.id = c.curator_id
    LEFT JOIN submissions s ON s.challenge_id = c.id
    LEFT JOIN artworks a ON a.id = s.artwork_id
    GROUP BY c.id, u.name
    ORDER BY
      CASE
        WHEN NOW() > c.end_date THEN 1
        WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 2
        ELSE 3
      END ASC,
      c.end_date DESC
  `);

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
    { key: 'all', label: 'All', href: '/dashboard/admin/challenges' },
    { key: 'completed', label: 'Completed', href: '/dashboard/admin/challenges?status=completed' },
    { key: 'active', label: 'Active', href: '/dashboard/admin/challenges?status=active' },
    { key: 'upcoming', label: 'Upcoming', href: '/dashboard/admin/challenges?status=upcoming' },
  ];

  const statusLabelMap = {
    completed: 'Completed',
    active: 'Active',
    upcoming: 'Upcoming',
  };
  const breadcrumbItems =
    statusFilter !== 'all' && statusLabelMap[statusFilter]
      ? [
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Challenges', href: '/dashboard/admin/challenges' },
          { label: statusLabelMap[statusFilter] },
        ]
      : [
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Challenges' },
        ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Challenge Management</h1>
          <p className="dashboard-subtitle">
            Review architecture challenges, oversee submissions, and publish official competition winners ({allChallenges.length} total).
          </p>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="admin-challenges-filter-tabs" role="tablist" aria-label="Filter challenges by status">
        {filterTabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            role="tab"
            aria-selected={statusFilter === tab.key}
            className={`admin-challenges-filter-tab ${statusFilter === tab.key ? 'active' : ''}`}
            id={`admin-filter-challenges-${tab.key}`}
          >
            <span>{tab.label}</span>
            <span className="admin-challenges-filter-count">{counts[tab.key]}</span>
          </Link>
        ))}
      </div>

      <div className="data-table-wrap">
        <table className="data-table dashboard-responsive-table admin-challenges-table">
          <colgroup>
            <col className="admin-chal-col-title" />
            <col className="admin-chal-col-curator" />
            <col className="admin-chal-col-schedule" />
            <col className="admin-chal-col-submissions" />
            <col className="admin-chal-col-winners" />
            <col className="admin-chal-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Challenge</th>
              <th>Curator</th>
              <th>Schedule</th>
              <th>Entries</th>
              <th>Winner Results</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {challenges.length === 0 ? (
              <tr>
                <td colSpan={6} className="data-table-empty-cell">
                  No challenges found in this category.
                </td>
              </tr>
            ) : (
              challenges.map((ch) => {
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
                const isCompleted = ch.status === 'completed';

                return (
                  <tr key={ch.id}>
                    <td data-label="Challenge" data-cell="primary">
                      <div className="admin-challenge-title-cell">
                        <Link
                          href={`/dashboard/admin/challenges/${ch.id}`}
                          className="dashboard-table-link"
                        >
                          {formatEditorialTitle(ch.title)}
                        </Link>
                        <div>
                          <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Curator" className="table-cell-break">
                      {ch.curator_name || '—'}
                    </td>
                    <td data-label="Schedule" className="table-cell-meta">
                      {formatSchedule(ch.start_date, ch.end_date)}
                    </td>
                    <td data-label="Entries" className="table-cell-num">
                      {ch.submission_count}{' '}
                      {ch.submission_count === 1 ? 'entry' : 'entries'}
                    </td>
                    <td data-label="Winner results">
                      {ch.winner_count > 0 ? (
                        <div className="admin-challenge-winners-cell">
                          <span className="admin-challenge-winners-count">
                            {ch.winner_count}{' '}
                            {ch.winner_count === 1 ? 'winner announced' : 'winners announced'}
                          </span>
                          {ch.winner_summary && (
                            <span className="table-cell-submeta">{ch.winner_summary}</span>
                          )}
                        </div>
                      ) : isCompleted ? (
                        <span className="badge badge-pending">Not Announced</span>
                      ) : (
                        <span className="table-cell-muted">—</span>
                      )}
                    </td>
                    <td data-label="Actions" data-cell="actions">
                      <div className="table-actions-group">
                        <Link
                          href={`/dashboard/admin/challenges/${ch.id}`}
                          className={isCompleted ? 'btn-primary table-action-btn' : 'btn-secondary table-action-btn'}
                        >
                          {isCompleted ? 'Manage Winners' : 'View Entries'}
                        </Link>
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
