import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import WinnerSelectControl from './WinnerSelectControl';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Challenge Submissions — ARCHIVE',
};

export default async function ChallengeSubmissionsPage(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const user = await requireRole('curator');

  const [chalRes, subsRes] = await Promise.all([
    query('SELECT * FROM challenges WHERE id = $1', [params.id]),
    query(`
      SELECT s.id as submission_id, s.winner_rank, s.created_at,
             a.id as artwork_id, a.title as artwork_title, a.image_url, a.description,
             u.id as artist_id, u.name as artist_name, u.email as artist_email
      FROM submissions s
      JOIN artworks a ON s.artwork_id = a.id
      JOIN users u ON s.member_id = u.id
      WHERE s.challenge_id = $1
      ORDER BY 
        CASE WHEN s.winner_rank IS NOT NULL THEN s.winner_rank ELSE 99 END ASC,
        s.created_at ASC
    `, [params.id]),
  ]);

  if (chalRes.rows.length === 0) {
    notFound();
  }

  const challenge = chalRes.rows[0];

  if (challenge.curator_id !== user.id && user.role !== 'admin') {
    redirect('/dashboard/curator/challenges');
  }

  const submissions = subsRes.rows;
  const hasEnded = new Date(challenge.end_date) <= new Date();

  return (
    <div className="curator-overview-page">
      <div className="dashboard-header curator-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Link href="/dashboard/curator/challenges" style={{ color: 'var(--accent)', fontSize: '0.8rem', textDecoration: 'none' }}>
              ← Back to Challenges
            </Link>
            <span className={`badge ${hasEnded ? 'badge-rejected' : 'badge-approved'}`}>
              {hasEnded ? 'Period Ended' : 'Ongoing'}
            </span>
          </div>
          <h1 className="curator-page-title">SUBMISSIONS: {challenge.title}</h1>
          <p className="curator-page-subtitle">
            {submissions.length} artworks submitted. Prize: {challenge.prize}.
          </p>
        </div>
      </div>

      {!hasEnded && (
        <div className="form-alert form-alert-info" style={{ marginBottom: 28 }}>
          ℹ️ Curator Note: Winners (1st, 2nd, 3rd Place) can only be selected after the competition period ends on {new Date(challenge.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
        </div>
      )}

      {submissions.length === 0 ? (
        <div style={{ padding: 48, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)', textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
          <p style={{ color: 'var(--surface)', fontSize: '0.95rem' }}>
            No submissions have been received for this challenge yet.
          </p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Artwork</th>
                <th>Title &amp; Description</th>
                <th>Artist</th>
                <th>Award Status</th>
                <th>Submitted At</th>
                <th>Winner Selection</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.submission_id}>
                  <td>
                    <Link href={`/artworks/${sub.artwork_id}`} target="_blank">
                      <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 6, overflow: 'hidden' }}>
                        <Image src={sub.image_url} alt={sub.artwork_title} fill style={{ objectFit: 'cover' }} sizes="64px" />
                      </div>
                    </Link>
                  </td>
                  <td>
                    <Link href={`/artworks/${sub.artwork_id}`} target="_blank" style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {sub.artwork_title} ↗
                    </Link>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.description}
                    </p>
                  </td>
                  <td>
                    <Link href={`/artists/${sub.artist_id}`} target="_blank" className="dashboard-user-link">
                      {sub.artist_name}
                    </Link>
                    <div style={{ fontSize: '0.72rem', color: 'var(--surface)' }}>{sub.artist_email}</div>
                  </td>
                  <td>
                    {sub.winner_rank ? (
                      <span className="badge badge-approved">
                        {sub.winner_rank === 1 ? '🥇 1st Place' : sub.winner_rank === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--surface)', fontSize: '0.8rem' }}>Participant</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--surface)' }}>
                    {new Date(sub.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td>
                    <WinnerSelectControl
                      challengeId={challenge.id}
                      submissionId={sub.submission_id}
                      currentRank={sub.winner_rank}
                      hasEnded={hasEnded}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
