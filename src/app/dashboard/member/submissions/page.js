import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
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
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Challenge Submissions</h1>
          <p className="dashboard-subtitle">Track the status of your entries across curated challenges.</p>
        </div>
        <Link href="/challenges" className="btn-primary">
          Explore Challenges
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div style={{ padding: 48, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)', textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
          <p style={{ color: 'var(--surface)', fontSize: '0.95rem', marginBottom: 20 }}>
            You haven&apos;t submitted to any challenges yet.
          </p>
          <Link href="/challenges" className="btn-primary">
            View Open Challenges
          </Link>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Artwork</th>
                <th>Artwork Title</th>
                <th>Challenge</th>
                <th>Prize</th>
                <th>Judging Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const canWithdraw = sub.challenge_status === 'active';
                return (
                  <tr key={sub.submission_id}>
                    <td>
                      <div style={{ position: 'relative', width: 50, height: 50, borderRadius: 6, overflow: 'hidden' }}>
                        <Image src={sub.artwork_image} alt={sub.artwork_title} fill style={{ objectFit: 'cover' }} sizes="50px" />
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/artworks/${sub.artwork_id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {sub.artwork_title}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/challenges/${sub.challenge_id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {sub.challenge_title}
                      </Link>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {sub.prize}
                    </td>
                    <td>
                      {sub.winner_rank ? (
                        <span className="badge badge-approved">
                          {rankLabels[sub.winner_rank]}
                        </span>
                      ) : sub.challenge_status === 'ended' ? (
                        <span className="badge badge-rejected">Not Selected</span>
                      ) : (
                        <span className="badge badge-pending">Under Review</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--surface)' }}>
                      {new Date(sub.end_date).toLocaleDateString('en-US')}
                    </td>
                    <td>
                      {canWithdraw ? (
                        <WithdrawButton submissionId={sub.submission_id} challengeTitle={sub.challenge_title} />
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>
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
