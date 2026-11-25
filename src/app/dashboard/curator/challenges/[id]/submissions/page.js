import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { isChallengeOwnerCurator } from '@/lib/challenge-auth';
import { query } from '@/lib/db';
import WinnerSelectControl from './WinnerSelectControl';
import { formatEditorialTitle, toId } from '@/lib/utils';
import { buildRoleDetailHref } from '@/lib/member-navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Challenge Submissions — ARCHIVE',
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

export default async function ChallengeSubmissionsPage(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const user = await requireRole('curator');

  const [chalRes, subsRes] = await Promise.all([
    query(
      `
      SELECT c.*,
             CASE
               WHEN NOW() < c.start_date THEN 'upcoming'
               WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
               ELSE 'completed'
             END AS status
      FROM challenges c
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

  if (chalRes.rows.length === 0) {
    notFound();
  }

  const challenge = chalRes.rows[0];
  const canManageWinners = isChallengeOwnerCurator(user, challenge);

  if (!canManageWinners) {
    redirect('/dashboard/curator/challenges');
  }

  const submissions = subsRes.rows;
  const title = formatEditorialTitle(challenge.title);
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

  return (
    <div className="admin-detail-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/curator' },
          { label: 'My Challenges', href: '/dashboard/curator/challenges' },
          { label: title, href: `/dashboard/curator/challenges/${challenge.id}` },
          { label: 'Submissions' },
        ]}
      />

      <div className="dashboard-header admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="dashboard-title">{title}</h1>
            <span className={`badge ${badgeClass}`}>{statusLabel}</span>
          </div>
          <p className="dashboard-subtitle">
            {formatDate(challenge.start_date)} – {formatDate(challenge.end_date)} · Prize: {challenge.prize}
          </p>
        </div>

        <div className="admin-detail-header-actions">
          <Link href="/dashboard/curator/challenges" className="btn-secondary">
            ← Back to Challenges
          </Link>
          <Link href={`/dashboard/curator/challenges/${challenge.id}`} className="btn-secondary">
            View Challenge Details
          </Link>
        </div>
      </div>

      {!hasEnded && (
        <div className="form-alert form-alert-info">
          Winners (1st, 2nd, and 3rd Place) can be selected after the competition period ends on{' '}
          {new Date(challenge.end_date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          .
        </div>
      )}

      {hasEnded && (
        <section className="dash-section" aria-labelledby="curator-winners-summary-heading">
          <div className="dash-section-head">
            <div>
              <h2 id="curator-winners-summary-heading" className="dash-section-title">
                Published Winner Placements
              </h2>
              <p className="dash-section-desc">
                Assign or update 1st, 2nd, and 3rd Place below. Changes publish immediately.
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
                        <div className="table-thumb-square table-thumb-square--sm">
                          <Image
                            src={winner.image_url}
                            alt={winner.artwork_title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="48px"
                          />
                        </div>
                        <div className="admin-winner-slot-meta">
                          <span className="table-cell-title">{winner.artwork_title}</span>
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

      <section className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2 className="dash-section-title">
              Submitted Artworks ({submissions.length})
            </h2>
            <p className="dash-section-desc">
              Review submitted works and assign placements once the submission period closes.
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="dash-empty">
            <p>No submissions have been received for this challenge yet.</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table dashboard-responsive-table curator-submissions-table">
              <colgroup>
                <col className="curator-sub-col-thumb" />
                <col className="curator-sub-col-title" />
                <col className="curator-sub-col-artist" />
                <col className="curator-sub-col-status" />
                <col className="curator-sub-col-date" />
                <col className="curator-sub-col-winner" />
              </colgroup>
              <thead>
                <tr>
                  <th>Artwork</th>
                  <th>Title &amp; Description</th>
                  <th>Artist</th>
                  <th>Placement</th>
                  <th>Submitted</th>
                  <th>Winner Selection</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const returnPath = `/dashboard/curator/challenges/${challenge.id}/submissions`;
                  const artworkHref =
                    sub.artwork_status === 'active'
                      ? buildRoleDetailHref(`/artworks/${sub.artwork_id}`, 'curator-challenges', returnPath)
                      : null;
                  const artistHref = buildRoleDetailHref(`/artists/${sub.artist_id}`, 'curator-challenges', returnPath);

                  return (
                    <tr key={sub.submission_id}>
                      <td data-label="Artwork" data-cell="thumb">
                        {artworkHref ? (
                          <Link
                            href={artworkHref}
                            className="table-thumb-link"
                            aria-label={`View artwork: ${sub.artwork_title}`}
                            title={sub.artwork_title}
                          >
                            <div className="table-thumb-square">
                              <Image
                                src={sub.image_url}
                                alt={sub.artwork_title}
                                fill
                                className="table-thumb-img"
                                style={{ objectFit: 'cover' }}
                                sizes="64px"
                              />
                            </div>
                          </Link>
                        ) : (
                          <div className="table-thumb-square">
                            <Image
                              src={sub.image_url}
                              alt={sub.artwork_title}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="64px"
                            />
                          </div>
                        )}
                      </td>
                      <td data-label="Title & description" data-cell="primary">
                        {artworkHref ? (
                          <Link href={artworkHref} className="dashboard-table-link">
                            {sub.artwork_title}
                          </Link>
                        ) : (
                          <span className="table-cell-title">
                            {sub.artwork_title}
                          </span>
                        )}
                        {sub.description && (
                          <p className="table-cell-desc">
                            {sub.description}
                          </p>
                        )}
                      </td>
                      <td data-label="Artist">
                        <Link href={artistHref} className="dashboard-table-link">
                          {sub.artist_name}
                        </Link>
                        <div className="table-cell-submeta">{sub.artist_email}</div>
                      </td>
                      <td data-label="Placement">
                        {sub.winner_rank ? (
                          <span className="badge badge-approved">
                            {RANK_LABELS[sub.winner_rank] || `Rank #${sub.winner_rank}`}
                          </span>
                        ) : (
                          <span className="table-cell-muted">Participant</span>
                        )}
                      </td>
                      <td data-label="Submitted" className="table-cell-meta">
                        {new Date(sub.created_at).toLocaleDateString('en-US')}
                      </td>
                      <td data-label="Winner selection" data-cell="actions">
                        <WinnerSelectControl
                          key={`${sub.submission_id}-${sub.winner_rank || 'none'}-${sub.winner_note || ''}`}
                          challengeId={challenge.id}
                          submissionId={sub.submission_id}
                          currentRank={sub.winner_rank}
                          currentNote={sub.winner_note}
                          hasEnded={hasEnded}
                          artworkStatus={sub.artwork_status}
                          canManage={canManageWinners}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
