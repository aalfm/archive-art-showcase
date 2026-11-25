import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { applyAvatarPolicy } from '@/lib/avatar';
import { query } from '@/lib/db';
import { formatEditorialTitle, toId } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AdminArtworkPreview from '@/components/dashboard/AdminArtworkPreview';
import ArtworkTakeDownButton from './ArtworkTakeDownButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Artwork Details — ARCHIVE Admin',
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

export default async function AdminArtworkDetailPage(props) {
  await requireRole('admin');
  const params = await props.params;
  const artworkId = toId(params.id);
  if (!artworkId) notFound();

  const [artworkRes, reportsRes, submissionsRes, commentsRes] = await Promise.all([
    query(
      `
      SELECT
        a.id,
        a.title,
        a.description,
        a.image_url,
        a.tags,
        a.status,
        a.like_count,
        a.created_at,
        c.name AS category_name,
        (SELECT COUNT(*)::int FROM favorites f WHERE f.artwork_id = a.id) AS favorite_count,
        (SELECT COUNT(*)::int FROM comments cm WHERE cm.artwork_id = a.id) AS comment_count,

        u.id AS owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        u.role AS owner_role,
        u.is_active AS owner_is_active,
        u.created_at AS owner_created_at,
        CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END AS owner_image,
        (SELECT COUNT(*)::int FROM artworks oa WHERE oa.user_id = u.id) AS owner_total_artworks
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
      `,
      [artworkId]
    ),
    query(
      `
      SELECT
        r.id AS report_id,
        r.reason,
        r.details,
        r.status,
        r.created_at,
        COALESCE(rep.name, 'Deleted User') AS reporter_name
      FROM reports r
      LEFT JOIN users rep ON r.user_id = rep.id
      WHERE r.artwork_id = $1
      ORDER BY r.created_at DESC
      `,
      [artworkId]
    ),
    query(
      `
      SELECT
        s.id AS submission_id,
        s.winner_rank,
        s.created_at,
        c.id AS challenge_id,
        c.title AS challenge_title
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.artwork_id = $1
      ORDER BY s.created_at DESC
      `,
      [artworkId]
    ),
    query(
      `
      SELECT
        cm.id,
        cm.content,
        cm.created_at,
        COALESCE(u.name, 'Deleted User') AS author_name,
        u.role AS author_role
      FROM comments cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.artwork_id = $1
      ORDER BY cm.created_at DESC
      LIMIT 10
      `,
      [artworkId]
    ),
  ]);

  if (artworkRes.rows.length === 0) notFound();

  const artwork = artworkRes.rows[0];
  const reports = reportsRes.rows;
  const submissions = submissionsRes.rows;
  const comments = commentsRes.rows;
  const ownerAvatar = artwork.owner_id
    ? applyAvatarPolicy({ role: artwork.owner_role, profile_image: artwork.owner_image })
    : null;

  const title = formatEditorialTitle(artwork.title);
  const tagList = artwork.tags
    ? artwork.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'User Management', href: '/dashboard/admin/users' },
    ...(artwork.owner_id
      ? [{ label: artwork.owner_name, href: `/dashboard/admin/users/${artwork.owner_id}` }]
      : []),
    { label: title },
  ];

  return (
    <div className="admin-detail-page">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="dashboard-header admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="dashboard-title">{title}</h1>
            <span className={`badge ${artwork.status === 'active' ? 'badge-active' : 'badge-taken_down'}`}>
              {artwork.status === 'active' ? 'Published' : 'Taken Down'}
            </span>
          </div>
          <p className="dashboard-subtitle">
            {artwork.category_name || 'Uncategorized'} · Uploaded on {formatDate(artwork.created_at)}
          </p>
        </div>
        <div className="admin-detail-header-actions">
          {artwork.owner_id && (
            <Link href={`/dashboard/admin/users/${artwork.owner_id}`} className="btn-secondary">
              ← Back to Member
            </Link>
          )}
          {artwork.status === 'active' && (
            <ArtworkTakeDownButton artworkId={artwork.id} artworkTitle={title} />
          )}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="admin-detail-layout">
        <div className="admin-detail-main">
          <section className="admin-detail-card" aria-labelledby="artwork-preview-heading">
            <h2 id="artwork-preview-heading" className="admin-detail-card-title">
              Artwork inspection
            </h2>

            <AdminArtworkPreview
              src={artwork.image_url}
              title={title}
              status={artwork.status}
              categoryName={artwork.category_name}
            />

            <div className="admin-artwork-info-block">
              <h3 className="admin-artwork-title">Description</h3>
              <p className="admin-artwork-description">
                {artwork.description || 'No description provided.'}
              </p>

              <div className="admin-meta-grid">
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Category</span>
                  <span className="admin-meta-value">{artwork.category_name || 'Uncategorized'}</span>
                </div>
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Upload date</span>
                  <span className="admin-meta-value">{formatDate(artwork.created_at)}</span>
                </div>
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Publication status</span>
                  <span className="admin-meta-value">
                    {artwork.status === 'active' ? 'Active (Public)' : 'Taken down (Hidden)'}
                  </span>
                </div>
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Engagement</span>
                  <span className="admin-meta-value">
                    {artwork.like_count || 0} likes · {artwork.favorite_count || 0} favorites · {artwork.comment_count || 0} comments
                  </span>
                </div>
              </div>

              {tagList.length > 0 && (
                <div className="admin-tags-block">
                  <span className="admin-meta-label">Tags</span>
                  <div className="admin-tags-list">
                    {tagList.map((tag) => (
                      <span key={tag} className="admin-tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Recent Comments for Moderation Context */}
          <section className="admin-detail-card" aria-labelledby="artwork-comments-heading">
            <h2 id="artwork-comments-heading" className="admin-detail-card-title">
              Recent comments ({artwork.comment_count || 0})
            </h2>
            {comments.length === 0 ? (
              <p className="admin-muted-note">No comments have been posted on this artwork.</p>
            ) : (
              <ul className="admin-comments-list">
                {comments.map((cm) => (
                  <li key={cm.id} className="admin-comment-item">
                    <div className="admin-comment-head">
                      <span className="admin-comment-author">{cm.author_name}</span>
                      <span className="admin-comment-date">{formatShortDate(cm.created_at)}</span>
                    </div>
                    <p className="admin-comment-body">{cm.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Side Column: Owner, Reports, Submissions */}
        <aside className="admin-detail-side">
          <section className="admin-detail-card" aria-labelledby="artwork-owner-heading">
            <h2 id="artwork-owner-heading" className="admin-detail-card-title">
              Artwork owner
            </h2>
            {artwork.owner_id ? (
              <>
                <div className="admin-person-card">
                  <UserAvatar
                    src={ownerAvatar?.profile_image}
                    role={artwork.owner_role}
                    name={artwork.owner_name}
                    size={46}
                  />
                  <div className="admin-person-meta">
                    <span className="admin-person-name">{artwork.owner_name}</span>
                    <span className="admin-person-sub">{artwork.owner_email}</span>
                    <div className="admin-person-badges">
                      <span className={`badge ${artwork.owner_is_active !== false ? 'badge-approved' : 'badge-rejected'}`}>
                        {artwork.owner_is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <dl className="admin-kv-list admin-kv-list--compact">
                  <div className="admin-kv-row">
                    <dt>Registered</dt>
                    <dd>{formatDate(artwork.owner_created_at)}</dd>
                  </div>
                  <div className="admin-kv-row">
                    <dt>Uploaded artworks</dt>
                    <dd>{artwork.owner_total_artworks}</dd>
                  </div>
                </dl>
                <Link
                  href={`/dashboard/admin/users/${artwork.owner_id}`}
                  className="btn-primary admin-full-btn"
                >
                  View member details →
                </Link>
              </>
            ) : (
              <p className="admin-muted-note">Owner account unavailable.</p>
            )}
          </section>

          <section className="admin-detail-card" aria-labelledby="artwork-reports-heading">
            <h2 id="artwork-reports-heading" className="admin-detail-card-title">
              Moderation reports ({reports.length})
            </h2>
            {reports.length === 0 ? (
              <p className="admin-muted-note">No reports have been filed for this artwork.</p>
            ) : (
              <ul className="admin-related-list">
                {reports.map((rep) => (
                  <li key={rep.report_id} className="admin-related-item">
                    <Link href={`/dashboard/admin/reports/${rep.report_id}`} className="admin-related-link">
                      <div>
                        <span className="admin-related-title">
                          Report #{rep.report_id} · {rep.reason}
                        </span>
                        <span className="admin-related-meta">
                          By {rep.reporter_name} · {formatShortDate(rep.created_at)}
                        </span>
                      </div>
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
                          ? 'Taken down'
                          : rep.status === 'dismissed'
                            ? 'Dismissed'
                            : 'Pending'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-detail-card" aria-labelledby="artwork-submissions-heading">
            <h2 id="artwork-submissions-heading" className="admin-detail-card-title">
              Challenge entries ({submissions.length})
            </h2>
            {submissions.length === 0 ? (
              <p className="admin-muted-note">This artwork has not been entered in any challenge.</p>
            ) : (
              <ul className="admin-related-list">
                {submissions.map((sub) => (
                  <li key={sub.submission_id} className="admin-related-item">
                    <Link href={`/dashboard/admin/challenges/${sub.challenge_id}`} className="admin-related-link">
                      <div>
                        <span className="admin-related-title">
                          {formatEditorialTitle(sub.challenge_title)}
                        </span>
                        <span className="admin-related-meta">
                          Entered {formatShortDate(sub.created_at)}
                        </span>
                      </div>
                      {sub.winner_rank && (
                        <span className="badge badge-approved">
                          {RANK_LABELS[sub.winner_rank] || `#${sub.winner_rank}`}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
