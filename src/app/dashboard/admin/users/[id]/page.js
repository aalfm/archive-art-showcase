import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { applyAvatarPolicy } from '@/lib/avatar';
import { query } from '@/lib/db';
import { formatEditorialTitle, formatRoleLabel, toId } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import UserStatusButton from '../UserStatusButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Member Details — ARCHIVE Admin',
};

const RANK_LABELS = {
  1: '1st Place',
  2: '2nd Place',
  3: '3rd Place',
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getSafeExternalUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export default async function AdminMemberDetailPage(props) {
  const currentAdmin = await requireRole('admin');
  const params = await props.params;
  const memberId = toId(params.id);
  if (!memberId) notFound();

  const userRes = await query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.curator_status,
      u.is_active,
      CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END AS profile_image,
      u.bio,
      u.external_link,
      u.created_at
    FROM users u
    WHERE u.id = $1
    `,
    [memberId]
  );

  if (userRes.rows.length === 0) notFound();

  const member = applyAvatarPolicy(userRes.rows[0]);
  const isActive = member.is_active !== false;
  const safeExternalLink = getSafeExternalUrl(member.external_link);

  const [statsRes, artworksRes, submissionsRes, reportsRes] = await Promise.all([
    query(
      `
      SELECT
        (SELECT COUNT(*)::int FROM artworks WHERE user_id = $1) AS total_artworks,
        (SELECT COUNT(*)::int FROM artworks WHERE user_id = $1 AND status = 'active') AS active_artworks,
        (SELECT COUNT(*)::int FROM artworks WHERE user_id = $1 AND status = 'taken_down') AS taken_down_artworks,
        (SELECT COALESCE(SUM(like_count), 0)::int FROM artworks WHERE user_id = $1) AS total_likes_received,
        (SELECT COUNT(*)::int
         FROM favorites f
         JOIN artworks a ON f.artwork_id = a.id
         WHERE a.user_id = $1) AS total_favorites_received,
        (SELECT COUNT(*)::int FROM submissions WHERE member_id = $1) AS total_submissions,
        (SELECT COUNT(*)::int FROM submissions WHERE member_id = $1 AND winner_rank IS NOT NULL) AS total_wins,
        (SELECT COUNT(*)::int FROM favorites WHERE user_id = $1) AS saved_favorites,
        (SELECT COUNT(*)::int FROM comments WHERE user_id = $1) AS total_comments,
        (SELECT COUNT(*)::int
         FROM reports r
         JOIN artworks a ON r.artwork_id = a.id
         WHERE a.user_id = $1) AS total_reports_received
      `,
      [memberId]
    ),
    query(
      `
      SELECT
        a.id,
        a.title,
        a.image_url,
        a.status,
        a.like_count,
        a.created_at,
        c.name AS category_name,
        (SELECT COUNT(*)::int FROM favorites f WHERE f.artwork_id = a.id) AS favorite_count,
        (SELECT COUNT(*)::int FROM reports r WHERE r.artwork_id = a.id AND r.status = 'pending') AS pending_reports
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      `,
      [memberId]
    ),
    query(
      `
      SELECT
        s.id AS submission_id,
        s.winner_rank,
        s.winner_note,
        s.created_at,
        c.id AS challenge_id,
        c.title AS challenge_title,
        a.id AS artwork_id,
        a.title AS artwork_title,
        a.status AS artwork_status
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      JOIN artworks a ON s.artwork_id = a.id
      WHERE s.member_id = $1
      ORDER BY s.created_at DESC
      `,
      [memberId]
    ),
    query(
      `
      SELECT
        r.id AS report_id,
        r.reason,
        r.status,
        r.created_at,
        a.id AS artwork_id,
        a.title AS artwork_title,
        COALESCE(rep.name, 'Deleted User') AS reporter_name
      FROM reports r
      JOIN artworks a ON r.artwork_id = a.id
      LEFT JOIN users rep ON r.user_id = rep.id
      WHERE a.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 15
      `,
      [memberId]
    ),
  ]);

  const stats = statsRes.rows[0] || {
    total_artworks: 0,
    active_artworks: 0,
    taken_down_artworks: 0,
    total_likes_received: 0,
    total_favorites_received: 0,
    total_submissions: 0,
    total_wins: 0,
    saved_favorites: 0,
    total_comments: 0,
    total_reports_received: 0,
  };
  const artworks = artworksRes.rows;
  const submissions = submissionsRes.rows;
  const receivedReports = reportsRes.rows;

  return (
    <div className="admin-detail-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'User Management', href: '/dashboard/admin/users' },
          { label: member.name },
        ]}
      />

      {/* Header + Member Actions */}
      <div className="dashboard-header admin-detail-header">
        <div>
          <h1 className="dashboard-title">Member details</h1>
          <p className="dashboard-subtitle">
            Complete account profile, uploaded artworks, challenge participation, and moderation history.
          </p>
        </div>
        <div className="admin-detail-header-actions">
          <Link href="/dashboard/admin/users" className="btn-secondary">
            ← Back to users
          </Link>
          <UserStatusButton
            userId={member.id}
            userName={member.name}
            userRole={member.role}
            isActive={isActive}
            currentAdminId={currentAdmin.id}
          />
        </div>
      </div>

      {/* A. Member Profile Card */}
      <section className="admin-detail-card admin-member-profile-card" aria-labelledby="member-profile-heading">
        <div className="admin-member-identity-top">
          <UserAvatar
            src={member.profile_image}
            role={member.role}
            name={member.name}
            size={68}
            className="admin-member-avatar"
          />
          <div className="admin-member-identity-info">
            <div className="admin-detail-title-row">
              <h2 id="member-profile-heading" className="admin-member-name">
                {member.name}
              </h2>
              <span className={`badge badge-role-${member.role}`}>
                {formatRoleLabel(member.role)}
              </span>
              <span className={`badge ${isActive ? 'badge-approved' : 'badge-rejected'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="admin-member-email">{member.email}</p>
            <p className="admin-member-joined">
              Registered on {formatDate(member.created_at)}
            </p>
          </div>
        </div>

        <div className="admin-meta-grid admin-member-meta-grid">
          <div className="admin-meta-item admin-meta-item--wide">
            <span className="admin-meta-label">Biography</span>
            <p className="admin-meta-paragraph">
              {member.bio?.trim() ? member.bio : 'No biography provided by this member.'}
            </p>
          </div>
          <div className="admin-meta-item">
            <span className="admin-meta-label">External portfolio / website</span>
            {safeExternalLink ? (
              <a
                href={safeExternalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="dash-inline-link admin-external-link"
              >
                {safeExternalLink} ↗
              </a>
            ) : (
              <span className="admin-meta-muted">Not provided</span>
            )}
          </div>
          <div className="admin-meta-item">
            <span className="admin-meta-label">Additional activity</span>
            <span className="admin-meta-value">
              {stats.saved_favorites} saved {stats.saved_favorites === 1 ? 'favorite' : 'favorites'} · {stats.total_comments} {stats.total_comments === 1 ? 'comment' : 'comments'} · {stats.total_reports_received} content {stats.total_reports_received === 1 ? 'report' : 'reports'}
            </span>
          </div>
        </div>
      </section>

      {/* B. Member Statistics */}
      <section className="admin-stats-grid" aria-label="Member statistics">
        <div className="admin-stat-box">
          <span className="admin-stat-label">Uploaded artworks</span>
          <span className="admin-stat-value">{stats.total_artworks}</span>
          <span className="admin-stat-sub">
            {stats.active_artworks} active · {stats.taken_down_artworks} taken down
          </span>
        </div>
        <div className="admin-stat-box">
          <span className="admin-stat-label">Favorites received</span>
          <span className="admin-stat-value">{stats.total_favorites_received}</span>
          <span className="admin-stat-sub">Across all uploaded works</span>
        </div>
        <div className="admin-stat-box">
          <span className="admin-stat-label">Likes received</span>
          <span className="admin-stat-value">{stats.total_likes_received}</span>
          <span className="admin-stat-sub">Total appreciation count</span>
        </div>
        <div className="admin-stat-box">
          <span className="admin-stat-label">Challenge submissions</span>
          <span className="admin-stat-value">{stats.total_submissions}</span>
          <span className="admin-stat-sub">
            {stats.total_wins > 0
              ? `${stats.total_wins} ${stats.total_wins === 1 ? 'winning entry' : 'winning entries'}`
              : 'Competition entries'}
          </span>
        </div>
      </section>

      {/* C. Member Artworks */}
      <section className="dash-section" aria-labelledby="member-artworks-heading">
        <div className="dash-section-head">
          <div>
            <h2 id="member-artworks-heading" className="dash-section-title">
              Uploaded artworks ({artworks.length})
            </h2>
            <p className="dash-section-desc">
              Click any artwork to inspect its full details, moderation status, and preview.
            </p>
          </div>
        </div>

        {artworks.length === 0 ? (
          <div className="dash-empty">
            <p>This member has not uploaded any artworks yet.</p>
          </div>
        ) : (
          <div className="admin-member-artworks-grid">
            {artworks.map((art) => {
              const title = formatEditorialTitle(art.title);
              return (
                <Link
                  key={art.id}
                  href={`/dashboard/admin/artworks/${art.id}`}
                  className="admin-artwork-card"
                >
                  <div className="admin-artwork-card-media">
                    <Image
                      src={art.image_url}
                      alt={title}
                      fill
                      unoptimized
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="admin-artwork-card-badges">
                      <span className={`badge ${art.status === 'active' ? 'badge-active' : 'badge-taken_down'}`}>
                        {art.status === 'active' ? 'Published' : 'Taken down'}
                      </span>
                      {art.pending_reports > 0 && (
                        <span className="badge badge-pending">
                          {art.pending_reports} pending {art.pending_reports === 1 ? 'report' : 'reports'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="admin-artwork-card-body">
                    <h3 className="admin-artwork-card-title">{title}</h3>
                    <div className="admin-artwork-card-meta">
                      <span>{art.category_name || 'Uncategorized'}</span>
                      <span>·</span>
                      <span>{formatShortDate(art.created_at)}</span>
                    </div>
                    <div className="admin-artwork-card-foot">
                      <span>{art.like_count || 0} likes · {art.favorite_count || 0} favorites</span>
                      <span className="admin-artwork-card-cta">Inspect →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* D. Challenge Submissions */}
      <section className="dash-section" aria-labelledby="member-submissions-heading">
        <div className="dash-section-head">
          <div>
            <h2 id="member-submissions-heading" className="dash-section-title">
              Challenge submissions ({submissions.length})
            </h2>
            <p className="dash-section-desc">
              Competition entries submitted by this member across platform challenges.
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="dash-empty">
            <p>This member has not submitted any entries to challenges.</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table dashboard-responsive-table">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Submitted artwork</th>
                  <th>Placement</th>
                  <th>Submitted date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submission_id}>
                    <td data-label="Challenge" data-cell="primary">
                      <Link
                        href={`/dashboard/admin/challenges/${sub.challenge_id}`}
                        className="dashboard-table-link"
                      >
                        {formatEditorialTitle(sub.challenge_title)}
                      </Link>
                    </td>
                    <td data-label="Submitted artwork">
                      <Link
                        href={`/dashboard/admin/artworks/${sub.artwork_id}`}
                        className="dashboard-table-link"
                      >
                        {formatEditorialTitle(sub.artwork_title)}
                      </Link>
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
                    <td data-label="Submitted date" className="table-cell-meta">
                      {formatShortDate(sub.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Moderation History for this Member's Artworks */}
      <section className="dash-section" aria-labelledby="member-reports-heading">
        <div className="dash-section-head">
          <div>
            <h2 id="member-reports-heading" className="dash-section-title">
              Content report history ({receivedReports.length})
            </h2>
            <p className="dash-section-desc">
              Moderation reports filed against artworks uploaded by this member.
            </p>
          </div>
        </div>

        {receivedReports.length === 0 ? (
          <div className="dash-empty">
            <p>No moderation reports have been filed against this member&apos;s artworks.</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table dashboard-responsive-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Artwork</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reported date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {receivedReports.map((rep) => (
                  <tr key={rep.report_id}>
                    <td data-label="Report" className="table-cell-meta">
                      #{rep.report_id}
                    </td>
                    <td data-label="Artwork" data-cell="primary">
                      <Link
                        href={`/dashboard/admin/artworks/${rep.artwork_id}`}
                        className="dashboard-table-link"
                      >
                        {formatEditorialTitle(rep.artwork_title)}
                      </Link>
                    </td>
                    <td data-label="Reason">
                      <span className="badge badge-neutral">{rep.reason}</span>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`badge ${
                          rep.status === 'taken_down'
                            ? 'badge-rejected'
                            : rep.status === 'dismissed'
                              ? 'badge-approved'
                              : 'badge-pending'
                        }`}
                      >
                        {rep.status === 'taken_down'
                          ? 'Artwork taken down'
                          : rep.status === 'dismissed'
                            ? 'Dismissed'
                            : 'Pending'}
                      </span>
                    </td>
                    <td data-label="Reported date" className="table-cell-meta">
                      {formatShortDate(rep.created_at)}
                    </td>
                    <td data-label="Action" data-cell="actions">
                      <Link
                        href={`/dashboard/admin/reports/${rep.report_id}`}
                        className="btn-secondary table-action-btn"
                      >
                        View report
                      </Link>
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
