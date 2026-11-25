import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatEditorialTitle } from '@/lib/utils';
import ArtworkImage from '@/components/ui/ArtworkImage';
import Breadcrumb from '@/components/ui/Breadcrumb';
import WithdrawButton from './WithdrawButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Submissions — ARCHIVE',
};

export default async function MemberSubmissionsPage() {
  const user = await requireRole('member');

  const res = await query(`
    SELECT s.id as submission_id, s.winner_rank, s.created_at as submitted_at,
           c.id as challenge_id, c.title as challenge_title, c.prize, c.end_date,
           CASE
             WHEN NOW() < c.start_date THEN 'upcoming'
             WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
             ELSE 'ended'
           END as challenge_status,
           a.id as artwork_id, a.title as artwork_title, a.image_url as artwork_image
    FROM submissions s
    JOIN challenges c ON s.challenge_id = c.id
    JOIN artworks a ON s.artwork_id = a.id
    WHERE s.member_id = $1
    ORDER BY s.created_at DESC
  `, [user.id]);

  const submissions = res.rows;
  const rankLabels = { 1: '1st Place', 2: '2nd Place', 3: '3rd Place' };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/member' },
          { label: 'Submissions' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Challenge submissions</h1>
          <p className="dashboard-subtitle">Track the status of your entries across curated challenges.</p>
        </div>
        <Link href="/challenges" className="btn-primary">
          Explore challenges
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div style={{ padding: 48, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)', textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
          <p style={{ color: 'var(--surface)', fontSize: '0.95rem', marginBottom: 20 }}>
            You haven&apos;t submitted to any challenges yet.
          </p>
          <Link href="/challenges" className="btn-primary">
            View open challenges
          </Link>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table dashboard-responsive-table member-submissions-table">
            <colgroup>
              <col className="member-sub-col-thumb" />
              <col className="member-sub-col-artwork" />
              <col className="member-sub-col-challenge" />
              <col className="member-sub-col-prize" />
              <col className="member-sub-col-status" />
              <col className="member-sub-col-deadline" />
              <col className="member-sub-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Artwork title</th>
                <th>Challenge</th>
                <th>Prize</th>
                <th>Judging status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const canWithdraw = sub.challenge_status === 'active';
                const artworkHref = `/artworks/${sub.artwork_id}?from=submissions`;
                const challengeHref = `/challenges/${sub.challenge_id}?from=submissions`;
                const challengeLabel = formatEditorialTitle(sub.challenge_title);

                return (
                  <tr key={sub.submission_id}>
                    <td data-label="Artwork" data-cell="thumb">
                      <Link
                        href={artworkHref}
                        className="table-thumb-link"
                        aria-label={`View artwork: ${sub.artwork_title}`}
                        title={sub.artwork_title}
                      >
                        <div className="table-thumb-square table-thumb-square--sm">
                          <ArtworkImage
                            src={sub.artwork_image}
                            alt={sub.artwork_title}
                            fill
                            className="table-thumb-img"
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 767px) 72px, 52px"
                          />
                        </div>
                      </Link>
                    </td>
                    <td data-label="Artwork title" data-cell="primary">
                      <Link href={artworkHref} className="dashboard-table-link">
                        {sub.artwork_title}
                      </Link>
                    </td>
                    <td data-label="Challenge">
                      <Link href={challengeHref} className="dashboard-table-link dashboard-table-link--accent">
                        {challengeLabel}
                      </Link>
                    </td>
                    <td data-label="Prize" className="table-cell-break">
                      {sub.prize}
                    </td>
                    <td data-label="Judging status">
                      {sub.winner_rank ? (
                        <span className="badge badge-approved">
                          {rankLabels[sub.winner_rank]}
                        </span>
                      ) : sub.challenge_status === 'ended' ? (
                        <span className="badge badge-rejected">Not selected</span>
                      ) : (
                        <span className="badge badge-pending">Under review</span>
                      )}
                    </td>
                    <td data-label="Deadline" className="table-cell-meta">
                      {new Date(sub.end_date).toLocaleDateString('en-US')}
                    </td>
                    <td data-label="Actions" data-cell="actions">
                      {canWithdraw ? (
                        <div className="table-actions-group">
                          <WithdrawButton submissionId={sub.submission_id} challengeTitle={sub.challenge_title} />
                        </div>
                      ) : (
                        <span className="table-cell-protected">
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
