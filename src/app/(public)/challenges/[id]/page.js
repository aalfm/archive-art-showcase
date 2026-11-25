import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { resolveUserAvatarSrc } from '@/lib/avatar';
import { resolveRoleReturnContext } from '@/lib/member-navigation';
import UserAvatar from '@/components/ui/UserAvatar';
import ArtworkImage from '@/components/ui/ArtworkImage';
import DetailContextBar from '@/components/ui/DetailContextBar';
import { ArrowRight } from '@/components/ui/Icons';
import ChallengeSubmitForm from './ChallengeSubmitForm';
import { formatEditorialTitle, toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const RANK_LABELS = {
  1: '1st Place',
  2: '2nd Place',
  3: '3rd Place',
};

async function getChallenge(id) {
  const [chalRes, winnersRes] = await Promise.all([
    query(
      `
      SELECT c.*,
             u.name AS curator_name,
             u.id AS curator_id,
             u.bio AS curator_bio,
             u.role AS curator_role,
             COUNT(DISTINCT s.id)::int AS submission_count,
             CASE
               WHEN NOW() < c.start_date THEN 'upcoming'
               WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
               ELSE 'completed'
             END AS challenge_status
      FROM challenges c
      LEFT JOIN users u ON c.curator_id = u.id
      LEFT JOIN submissions s ON s.challenge_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, u.name, u.id, u.bio, u.role
      `,
      [id]
    ),
    query(
      `
      SELECT s.id AS submission_id,
             s.winner_rank,
             s.winner_note,
             a.id AS artwork_id,
             a.title AS artwork_title,
             a.image_url,
             cat.name AS category_name,
             u.id AS creator_id,
             u.name AS creator_name,
             u.role AS creator_role,
             CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END AS creator_image
      FROM submissions s
      JOIN artworks a ON s.artwork_id = a.id
      LEFT JOIN categories cat ON a.category_id = cat.id
      JOIN users u ON s.member_id = u.id
      WHERE s.challenge_id = $1
        AND s.winner_rank IS NOT NULL
        AND a.status = 'active'
      ORDER BY s.winner_rank ASC
      `,
      [id]
    ),
  ]);

  if (chalRes.rows.length === 0) return null;

  const winners = winnersRes.rows.map((w) => ({
    ...w,
    creator_image: resolveUserAvatarSrc({
      role: w.creator_role,
      profile_image: w.creator_image,
    }),
  }));

  return { challenge: chalRes.rows[0], winners };
}

export async function generateMetadata(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const data = await getChallenge(params.id);
  if (!data) return { title: 'Challenge not found — ARTHIVE' };
  return {
    title: `${formatEditorialTitle(data.challenge.title)} — ARTHIVE`,
    description: data.challenge.description?.substring(0, 160) || 'Architectural challenge on ARTHIVE.',
  };
}

export default async function ChallengeDetailPage(props) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  if (!toId(params.id)) notFound();
  const [data, session] = await Promise.all([
    getChallenge(params.id),
    getSession(),
  ]);

  if (!data) notFound();
  const { challenge, winners } = data;
  const user = session?.user || null;
  const memberContext = resolveRoleReturnContext(searchParams, user);
  const withContext = (href) => (memberContext ? memberContext.appendContext(href) : href);
  const isCompleted = challenge.challenge_status === 'completed';
  const isActive = challenge.challenge_status === 'active';
  const isUpcoming = challenge.challenge_status === 'upcoming';

  const canManageWinners =
    user?.role === 'admin' ||
    (user?.role === 'curator' &&
      user.curator_status === 'approved' &&
      Number(challenge.curator_id) === Number(user.id));

  const manageHref =
    user?.role === 'admin'
      ? `/dashboard/admin/challenges/${challenge.id}`
      : `/dashboard/curator/challenges/${challenge.id}/submissions`;

  // Check if member has already submitted
  let userSubmission = null;
  let memberArtworks = [];
  if (user?.role === 'member' && isActive) {
    const [subRes, artsRes] = await Promise.all([
      query('SELECT id FROM submissions WHERE challenge_id = $1 AND member_id = $2', [challenge.id, user.id]),
      query(`SELECT id, title FROM artworks WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC`, [user.id]),
    ]);
    userSubmission = subRes.rows[0] || null;
    memberArtworks = artsRes.rows;
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const statusText = isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed';
  const formattedTitle = formatEditorialTitle(challenge.title);

  const firstPlaceWinner = winners.find((w) => Number(w.winner_rank) === 1) || null;
  const otherWinners = firstPlaceWinner
    ? winners.filter((w) => w.submission_id !== firstPlaceWinner.submission_id)
    : winners;

  const breadcrumbItems = memberContext
    ? memberContext.buildBreadcrumbs(formattedTitle)
    : [
        { label: 'Home', href: '/' },
        { label: 'Challenges', href: '/challenges' },
        { label: statusText, href: `/challenges?status=${challenge.challenge_status}` },
        { label: formattedTitle },
      ];

  return (
    <div className="challenge-detail-page">
      <DetailContextBar
        breadcrumbItems={breadcrumbItems}
        returnHref={memberContext?.returnHref}
        backLabel={memberContext?.backLabel}
      />

      {/* Banner */}
      <div className="challenge-detail-banner">
        {challenge.banner_url && (
          <Image
            src={challenge.banner_url}
            alt={formattedTitle}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
            priority
          />
        )}
        <div className="challenge-detail-banner-overlay">
          <div className="challenge-detail-banner-content">
            <span className={`challenge-detail-status-pill is-${challenge.challenge_status}`}>
              {statusText}
            </span>
            <h1 className="challenge-detail-title">{formattedTitle}</h1>
            <p className="challenge-detail-banner-meta">
              Curated by {challenge.curator_name || 'ARTHIVE Curator'} · {challenge.submission_count}{' '}
              {Number(challenge.submission_count) === 1 ? 'entry' : 'entries'}
              {isCompleted && winners.length > 0
                ? ` · ${winners.length} ${winners.length === 1 ? 'winner' : 'winners'}`
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Winners Showcase (for Completed Challenges or any announced winners) */}
      {(isCompleted || winners.length > 0) && (
        <section className="challenge-winners-section" aria-labelledby="challenge-winners-heading">
          <div className="challenge-winners-head">
            <div>
              <span className="challenge-winners-eyebrow">Official results</span>
              <h2 id="challenge-winners-heading" className="challenge-winners-heading">
                Challenge Winners
              </h2>
            </div>
            <div className="challenge-winners-head-right">
              <span className="challenge-winners-count">
                {winners.length > 0
                  ? `${winners.length} ${winners.length === 1 ? 'winning entry' : 'winning entries'}`
                  : 'Results Pending'}
              </span>
              {canManageWinners && (
                <Link href={manageHref} className="btn-secondary challenge-manage-winners-btn">
                  Manage Winners
                </Link>
              )}
            </div>
          </div>

          {winners.length === 0 ? (
            <div className="challenge-winners-pending" role="status">
              <p className="challenge-winners-pending-title">
                Results have not been announced yet
              </p>
              <p className="challenge-winners-pending-desc">
                The competition period for this challenge has concluded. Winning artworks and artists will appear here once the results are officially announced.
              </p>
            </div>
          ) : (
            <div className="challenge-winners-showcase">
              {/* Featured 1st Place Winner */}
              {firstPlaceWinner && (
                <article className="winner-editorial-card is-lead" data-rank={firstPlaceWinner.winner_rank}>
                  <Link
                    href={withContext(`/artworks/${firstPlaceWinner.artwork_id}`)}
                    className="winner-editorial-media"
                    aria-label={`View winning artwork: ${firstPlaceWinner.artwork_title}`}
                  >
                    <ArtworkImage
                      src={firstPlaceWinner.image_url}
                      alt={firstPlaceWinner.artwork_title}
                      fill
                      className="winner-editorial-img"
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 900px) 100vw, 56vw"
                    />
                  </Link>

                  <div className="winner-editorial-body">
                    <div className="winner-editorial-top">
                      <span className="winner-editorial-rank is-first">
                        {RANK_LABELS[firstPlaceWinner.winner_rank] || `Rank #${firstPlaceWinner.winner_rank}`}
                      </span>
                      {firstPlaceWinner.category_name && (
                        <span className="winner-editorial-category">
                          {firstPlaceWinner.category_name}
                        </span>
                      )}
                    </div>

                    <h3 className="winner-editorial-title">
                      <Link
                        href={withContext(`/artworks/${firstPlaceWinner.artwork_id}`)}
                        className="winner-editorial-title-link"
                      >
                        {firstPlaceWinner.artwork_title}
                      </Link>
                    </h3>

                    <Link
                      href={withContext(`/artists/${firstPlaceWinner.creator_id}`)}
                      className="winner-editorial-artist"
                    >
                      <UserAvatar
                        src={firstPlaceWinner.creator_image}
                        role={firstPlaceWinner.creator_role}
                        name={firstPlaceWinner.creator_name}
                        size={32}
                      />
                      <div className="winner-editorial-artist-info">
                        <span className="winner-editorial-artist-label">Winner</span>
                        <span className="winner-editorial-artist-name">
                          {firstPlaceWinner.creator_name}
                        </span>
                      </div>
                    </Link>

                    {firstPlaceWinner.winner_note && (
                      <p className="winner-editorial-note">
                        {firstPlaceWinner.winner_note}
                      </p>
                    )}

                    <Link
                      href={withContext(`/artworks/${firstPlaceWinner.artwork_id}`)}
                      className="winner-editorial-cta"
                    >
                      <span>View Artwork</span>
                      <ArrowRight size={14} strokeWidth={1.75} />
                    </Link>
                  </div>
                </article>
              )}

              {/* Additional Ranked Winners (2nd / 3rd Place) */}
              {otherWinners.length > 0 && (
                <div className="winners-secondary-grid">
                  {otherWinners.map((w) => {
                    const winnerArtworkHref = withContext(`/artworks/${w.artwork_id}`);
                    const winnerArtistHref = withContext(`/artists/${w.creator_id}`);
                    return (
                      <article key={w.submission_id} className="winner-editorial-card" data-rank={w.winner_rank}>
                        <Link
                          href={winnerArtworkHref}
                          className="winner-editorial-media"
                          aria-label={`View winning artwork: ${w.artwork_title}`}
                        >
                          <ArtworkImage
                            src={w.image_url}
                            alt={w.artwork_title}
                            fill
                            className="winner-editorial-img"
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 767px) 100vw, 45vw"
                          />
                        </Link>

                        <div className="winner-editorial-body">
                          <div className="winner-editorial-top">
                            <span className="winner-editorial-rank">
                              {RANK_LABELS[w.winner_rank] || `Rank #${w.winner_rank}`}
                            </span>
                            {w.category_name && (
                              <span className="winner-editorial-category">
                                {w.category_name}
                              </span>
                            )}
                          </div>

                          <h3 className="winner-editorial-title">
                            <Link
                              href={winnerArtworkHref}
                              className="winner-editorial-title-link"
                            >
                              {w.artwork_title}
                            </Link>
                          </h3>

                          <Link
                            href={winnerArtistHref}
                            className="winner-editorial-artist"
                          >
                            <UserAvatar
                              src={w.creator_image}
                              role={w.creator_role}
                              name={w.creator_name}
                              size={28}
                            />
                            <div className="winner-editorial-artist-info">
                              <span className="winner-editorial-artist-label">Artist</span>
                              <span className="winner-editorial-artist-name">
                                {w.creator_name}
                              </span>
                            </div>
                          </Link>

                          {w.winner_note && (
                            <p className="winner-editorial-note">
                              {w.winner_note}
                            </p>
                          )}

                          <Link
                            href={winnerArtworkHref}
                            className="winner-editorial-cta"
                          >
                            <span>View Artwork</span>
                            <ArrowRight size={14} strokeWidth={1.75} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <div className="challenge-detail-layout">
        {/* Main Content */}
        <div className="challenge-detail-main">
          {/* Description */}
          <div className="challenge-detail-section">
            <h2 className="challenge-section-title">About This Challenge</h2>
            <p className="challenge-section-text">{challenge.description}</p>
          </div>

          {/* Rules */}
          <div className="challenge-detail-section">
            <h2 className="challenge-section-title">Guidelines &amp; Rules</h2>
            <div className="challenge-rules">
              {challenge.rules
                .split('\n')
                .filter((r) => r.trim())
                .map((rule, i) => (
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
            <h3 className="challenge-sidebar-title">Prize</h3>
            <p className="challenge-prize-text">{challenge.prize}</p>
          </div>

          {/* Schedule & Status */}
          <div className="challenge-sidebar-card">
            <h3 className="challenge-sidebar-title">Schedule</h3>
            <div className="challenge-dates">
              <div>
                <label>Status</label>
                <span>{statusText}</span>
              </div>
              <div>
                <label>Starts</label>
                <span>{formatDate(challenge.start_date)}</span>
              </div>
              <div>
                <label>Ends</label>
                <span>{formatDate(challenge.end_date)}</span>
              </div>
              <div>
                <label>Submissions</label>
                <span>
                  {challenge.submission_count}{' '}
                  {Number(challenge.submission_count) === 1 ? 'artwork' : 'artworks'}
                </span>
              </div>
            </div>
          </div>

          {/* Curator Organizer */}
          {challenge.curator_name && (
            <div className="challenge-sidebar-card">
              <h3 className="challenge-sidebar-title">Organized By</h3>
              <div className="challenge-curator-card">
                <UserAvatar
                  src={null}
                  role={challenge.curator_role || 'curator'}
                  name={challenge.curator_name}
                  size={36}
                />
                <div className="challenge-curator-info">
                  <span className="challenge-curator-name">{challenge.curator_name}</span>
                  <span className="challenge-curator-role">Curator</span>
                </div>
              </div>
              {challenge.curator_bio && (
                <p className="challenge-curator-bio">{challenge.curator_bio}</p>
              )}
            </div>
          )}

          {/* Submit Form (Active only) */}
          {user?.role === 'member' && isActive && (
            <ChallengeSubmitForm
              challengeId={challenge.id}
              memberArtworks={memberArtworks}
              userSubmission={userSubmission}
            />
          )}

          {!user && isActive && (
            <div className="challenge-sidebar-card">
              <h3 className="challenge-sidebar-title">Join Challenge</h3>
              <p className="challenge-sidebar-note">
                Sign in as a member to submit an artwork.
              </p>
              <Link
                href={`/login?redirect=/challenges/${challenge.id}`}
                className="btn-primary challenge-sidebar-cta"
                id="btn-challenge-sign-in"
              >
                Sign In
              </Link>
            </div>
          )}

          {isUpcoming && (
            <div className="challenge-sidebar-card">
              <h3 className="challenge-sidebar-title">Submissions</h3>
              <p className="challenge-sidebar-note">
                Entries open on {formatDate(challenge.start_date)}.
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="challenge-sidebar-card">
              <h3 className="challenge-sidebar-title">Archive Status</h3>
              <p className="challenge-sidebar-note">
                This competition ended on {formatDate(challenge.end_date)} and is preserved in the ARTHIVE archive.
              </p>
              {canManageWinners && (
                <Link
                  href={manageHref}
                  className="btn-secondary challenge-sidebar-cta challenge-sidebar-cta--spaced"
                >
                  Manage Winners
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
