import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatEditorialTitle, toId } from '@/lib/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Challenge Details — ARCHIVE Admin',
};

const RANK_LABELS = {
  1: '1st Place',
  2: '2nd Place',
  3: '3rd Place',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function AdminChallengeDetailPage(props) {
  await requireRole('admin');
  const params = await props.params;
  if (!toId(params.id)) notFound();

  const [chalRes, subsRes] = await Promise.all([
    query(
      `
      SELECT c.*, u.name AS curator_name,
             CASE
               WHEN NOW() < c.start_date THEN 'upcoming'
               WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
               ELSE 'completed'
             END AS status
      FROM challenges c
      LEFT JOIN users u ON u.id = c.curator_id
      WHERE c.id = $1
      `,
      [params.id]
    ),
    query(
      `
      SELECT s.id AS submission_id,
             s.winner_rank,
             s.winner_note,
             s.created_at,
             a.id AS artwork_id,
             a.title AS artwork_title,
             a.image_url,
             a.description,
             a.status AS artwork_status,
             u.id AS artist_id,
             u.name AS artist_name,
             u.email AS artist_email
      FROM submissions s
      JOIN artworks a ON s.artwork_id = a.id
      JOIN users u ON s.member_id = u.id
      WHERE s.challenge_id = $1
      ORDER BY
        CASE WHEN s.winner_rank IS NOT NULL THEN s.winner_rank ELSE 99 END ASC,
        s.created_at ASC
      `,
      [params.id]
    ),
  ]);

  if (chalRes.rows.length === 0) notFound();

  const challenge = chalRes.rows[0];
  const submissions = subsRes.rows;
  const hasEnded = challenge.status === 'completed';
  const statusLabel =
    challenge.status === 'active'
      ? 'Active'
      : challenge.status === 'upcoming'
        ? 'Upcoming'
        : 'Completed';
  const badgeClass =
    challenge.status === 'active'
      ? 'badge-active'
      : challenge.status === 'upcoming'
        ? 'badge-upcoming'
        : 'badge-ended';

  const winnersByRank = new Map();
  for (const sub of submissions) {
    if (sub.winner_rank && sub.artwork_status === 'active') {
      winnersByRank.set(Number(sub.winner_rank), sub);
    }
  }

  const challengeTitle = formatEditorialTitle(challenge.title);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Challenges', href: '/dashboard/admin/challenges' },
          { label: challengeTitle },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <Link href="/dashboard/admin/challenges" className="dash-inline-link">
              ← Back to Challenges
            </Link>
            <span className={`badge ${badgeClass}`}>{statusLabel}</span>
          </div>
          <h1 className="dashboard-title">{challengeTitle}</h1>
          <p className="dashboard-subtitle">
            Curated by {challenge.curator_name || 'ARCHIVE Curator'} · {formatDate(challenge.start_date)} – {formatDate(challenge.end_date)} · Prize: {challenge.prize}
          </p>
        </div>
      </div>

      {!hasEnded && (
        <div className="form-alert form-alert-info" style={{ marginBottom: 24 }}>
          This competition is {challenge.status === 'upcoming' ? 'upcoming' : 'currently active'}. Winners will be selected by the challenge curator after it ends on {formatDate(challenge.end_date)}.
        </div>
      )}

      {/* Current Winner Announcement Overview (Read-Only) */}
      {hasEnded && (
        <section className="dash-section" aria-labelledby="admin-winners-summary-heading">
          <div className="dash-section-head">
            <div>
              <h2 id="admin-winners-summary-heading" className="dash-section-title">
                Published winner placements
              </h2>
              <p className="dash-section-desc">
                Official 1st, 2nd, and 3rd Place results selected by the challenge curator (read-only).
              </p>
            </div>
          </div>

          <div className="admin-winner-slots-grid">
            {[1, 2, 3].map((rank) => {
              const winner = winnersByRank.get(rank);
              return (
                <div key={rank} className={`admin-winner-slot-card${winner ? ' is-filled' : ''}`}>
                  <span className="admin-winner-slot-rank">{RANK_LABELS[rank]}</span>
                  {winner ? (
                    <div className="admin-winner-slot-content">
                      <div className="admin-winner-slot-top">
                        <Link href={`/dashboard/admin/artworks/${winner.artwork_id}`} className="table-thumb-link">
                          <div className="table-thumb-square table-thumb-square--sm">
                            <Image
                              src={winner.image_url}
                              alt={winner.artwork_title}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="48px"
                            />
                          </div>
                        </Link>
                        <div className="admin-winner-slot-meta">
                          <Link
                            href={`/dashboard/admin/artworks/${winner.artwork_id}`}
                            className="dashboard-table-link"
                          >
                            {winner.artwork_title}
                          </Link>
                          <span className="table-cell-submeta">by {winner.artist_name}</span>
                        </div>
                      </div>
                      {winner.winner_note && (
                        <p className="admin-winner-slot-note">{winner.winner_note}</p>
                      )}
                    </div>
                  ) : (
                    <p className="admin-winner-slot-empty">Not assigned yet</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Submissions Read-Only Overview Table */}
      <section className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">
              Submitted artworks ({submissions.length})
            </h2>
            <p className="dash-section-desc">
              Read-only overview of participant submissions and curator evaluation results.
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="dash-empty">
            <p>No submissions were received for this challenge.</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table dashboard-responsive-table admin-challenge-submissions-table">
              <colgroup>
                <col className="admin-sub-col-thumb" />
                <col className="admin-sub-col-title" />
                <col className="admin-sub-col-artist" />
                <col className="admin-sub-col-status" />
                <col className="admin-sub-col-date" />
              </colgroup>
              <thead>
                <tr>
                  <th>Artwork</th>
                  <th>Title &amp; description</th>
                  <th>Artist</th>
                  <th>Placement</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submission_id}>
                    <td data-label="Artwork" data-cell="thumb">
                      <Link href={`/dashboard/admin/artworks/${sub.artwork_id}`} className="table-thumb-link">
                        <div className="table-thumb-square">
                          <Image
                            src={sub.image_url}
                            alt={sub.artwork_title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="64px"
                          />
                        </div>
                      </Link>
                    </td>
                    <td data-label="Title & description" data-cell="primary">
                      <Link href={`/dashboard/admin/artworks/${sub.artwork_id}`} className="dashboard-table-link">
                        {sub.artwork_title}
                      </Link>
                      {sub.description && (
                        <p className="table-cell-desc">{sub.description}</p>
                      )}
                    </td>
                    <td data-label="Artist">
                      <Link href={`/dashboard/admin/users/${sub.artist_id}`} className="dashboard-user-link">
                        {sub.artist_name}
                      </Link>
                      <div className="table-cell-submeta">{sub.artist_email}</div>
                    </td>
                    <td data-label="Placement">
                      {sub.artwork_status !== 'active' ? (
                        <span className="table-cell-muted">Artwork unavailable</span>
                      ) : sub.winner_rank ? (
                        <div className="admin-challenge-winners-cell">
                          <span className="badge badge-approved">
                            {RANK_LABELS[sub.winner_rank] || `Rank #${sub.winner_rank}`}
                          </span>
                          {sub.winner_note && (
                            <p className="table-cell-submeta">{sub.winner_note}</p>
                          )}
                        </div>
                      ) : (
                        <span className="table-cell-muted">Participant</span>
                      )}
                    </td>
                    <td data-label="Submitted" className="table-cell-meta">
                      {new Date(sub.created_at).toLocaleDateString('en-US')}
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
