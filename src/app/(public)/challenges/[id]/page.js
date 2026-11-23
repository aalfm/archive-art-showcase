import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ChallengeSubmitForm from './ChallengeSubmitForm';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getChallenge(id) {
  const [chalRes, winnersRes] = await Promise.all([
    query(`
      SELECT c.*, u.name as curator_name, u.id as curator_id,
             COUNT(DISTINCT s.id) as submission_count,
             CASE
               WHEN NOW() < c.start_date THEN 'upcoming'
               WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
               ELSE 'ended'
             END as challenge_status
      FROM challenges c
      LEFT JOIN users u ON c.curator_id = u.id
      LEFT JOIN submissions s ON s.challenge_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, u.name, u.id
    `, [id]),
    query(`
      SELECT s.winner_rank, a.id as artwork_id, a.title as artwork_title, a.image_url,
             u.name as creator_name, u.id as creator_id
      FROM submissions s
      JOIN artworks a ON s.artwork_id = a.id
      JOIN users u ON s.member_id = u.id
      WHERE s.challenge_id = $1 AND s.winner_rank IS NOT NULL
      ORDER BY s.winner_rank ASC
    `, [id]),
  ]);

  if (chalRes.rows.length === 0) return null;
  return { challenge: chalRes.rows[0], winners: winnersRes.rows };
}

export default async function ChallengeDetailPage(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const [data, session] = await Promise.all([
    getChallenge(params.id),
    getSession(),
  ]);

  if (!data) notFound();
  const { challenge, winners } = data;
  const user = session?.user || null;

  // Check if member has already submitted
  let userSubmission = null;
  let memberArtworks = [];
  if (user?.role === 'member') {
    const [subRes, artsRes] = await Promise.all([
      query('SELECT id FROM submissions WHERE challenge_id=$1 AND member_id=$2', [challenge.id, user.id]),
      query(`SELECT id, title FROM artworks WHERE user_id=$1 AND status='active' ORDER BY created_at DESC`, [user.id]),
    ]);
    userSubmission = subRes.rows[0] || null;
    memberArtworks = artsRes.rows;
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const rankLabel = { 1: '🥇 First Place', 2: '🥈 Second Place', 3: '🥉 Third Place' };

  return (
    <div className="challenge-detail-page">
      {/* Banner */}
      <div className="challenge-detail-banner">
        {challenge.banner_url && (
          <Image src={challenge.banner_url} alt={challenge.title} fill style={{ objectFit: 'cover' }} sizes="100vw" priority />
        )}
        <div className="challenge-detail-banner-overlay">
          <div className="challenge-detail-banner-content">
            <span className={`challenge-status-badge ${challenge.challenge_status}`} style={{ fontSize: '0.8rem' }}>
              {challenge.challenge_status === 'active' ? 'ACTIVE' :
               challenge.challenge_status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
            </span>
            <h1 className="challenge-detail-title">{challenge.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              By {challenge.curator_name} · {challenge.submission_count} Entries
            </p>
          </div>
        </div>
      </div>

      <div className="challenge-detail-layout">
        {/* Main Content */}
        <div className="challenge-detail-main">
          {/* Winners (if ended) */}
          {winners.length > 0 && (
            <div className="challenge-winners">
              <h2 className="showcase-heading" style={{ fontSize: '1.4rem' }}>WINNERS</h2>
              <div className="winners-grid">
                {winners.map(w => (
                  <div key={w.winner_rank} className="winner-card">
                    <div className="winner-rank-badge">{rankLabel[w.winner_rank]}</div>
                    <Link href={`/artworks/${w.artwork_id}`} className="winner-artwork-link">
                      <div className="winner-artwork-preview">
                        <Image src={w.image_url} alt={w.artwork_title} fill style={{ objectFit: 'cover' }} sizes="200px" />
                      </div>
                      <span className="winner-artwork-title">{w.artwork_title}</span>
                    </Link>
                    <Link href={`/artists/${w.creator_id}`} className="winner-creator">
                      by {w.creator_name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="challenge-detail-section">
            <h2 className="challenge-section-title">DESCRIPTION</h2>
            <p className="challenge-section-text">{challenge.description}</p>
          </div>

          {/* Rules */}
          <div className="challenge-detail-section">
            <h2 className="challenge-section-title">RULES</h2>
            <div className="challenge-rules">
              {challenge.rules.split('\n').filter(r => r.trim()).map((rule, i) => (
                <div key={i} className="challenge-rule-item">
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="challenge-detail-sidebar">
          {/* Prize */}
          <div className="challenge-sidebar-card">
            <h3 className="challenge-sidebar-title">PRIZE</h3>
            <p className="challenge-prize-text">{challenge.prize}</p>
          </div>

          {/* Dates */}
          <div className="challenge-sidebar-card">
            <h3 className="challenge-sidebar-title">SCHEDULE</h3>
            <div className="challenge-dates">
              <div>
                <label>Starts</label>
                <span>{formatDate(challenge.start_date)}</span>
              </div>
              <div>
                <label>Ends</label>
                <span>{formatDate(challenge.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Submit Form */}
          {user?.role === 'member' && challenge.challenge_status === 'active' && (
            <ChallengeSubmitForm
              challengeId={challenge.id}
              memberArtworks={memberArtworks}
              userSubmission={userSubmission}
            />
          )}

          {!user && challenge.challenge_status === 'active' && (
            <div className="challenge-sidebar-card">
              <h3 className="challenge-sidebar-title">JOIN CHALLENGE</h3>
              <p style={{ color: 'var(--surface)', fontSize: '0.88rem', marginBottom: 12 }}>
                Sign in as a member to submit an artwork.
              </p>
              <Link href={`/login?redirect=/challenges/${challenge.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
