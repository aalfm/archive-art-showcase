import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { applyAvatarPolicy } from '@/lib/avatar';
import { query } from '@/lib/db';
import { formatEditorialTitle, formatRoleLabel, toId } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AdminArtworkPreview from '@/components/dashboard/AdminArtworkPreview';
import ReportModerationControls from './ReportModerationControls';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Report Details — ARCHIVE Admin',
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getReportStatusMeta(status) {
  if (status === 'taken_down') {
    return { label: 'Artwork taken down', badgeClass: 'badge-rejected' };
  }
  if (status === 'dismissed') {
    return { label: 'Dismissed', badgeClass: 'badge-approved' };
  }
  return { label: 'Pending review', badgeClass: 'badge-pending' };
}

export default async function AdminReportDetailPage(props) {
  await requireRole('admin');
  const params = await props.params;
  const reportId = toId(params.id);
  if (!reportId) notFound();

  const reportRes = await query(
    `
    SELECT
      r.id AS report_id,
      r.reason,
      r.details,
      r.status AS report_status,
      r.admin_note,
      r.created_at AS reported_at,

      reporter.id AS reporter_id,
      reporter.name AS reporter_name,
      reporter.email AS reporter_email,
      reporter.role AS reporter_role,
      reporter.is_active AS reporter_is_active,
      reporter.created_at AS reporter_created_at,
      CASE WHEN LOWER(reporter.role) = 'member' THEN reporter.profile_image ELSE NULL END AS reporter_image,

      a.id AS artwork_id,
      a.title AS artwork_title,
      a.description AS artwork_description,
      a.image_url AS artwork_image,
      a.tags AS artwork_tags,
      a.status AS artwork_status,
      a.like_count AS artwork_like_count,
      a.created_at AS artwork_created_at,
      c.name AS category_name,
      (SELECT COUNT(*)::int FROM favorites f WHERE f.artwork_id = a.id) AS artwork_favorite_count,
      (SELECT COUNT(*)::int FROM comments cm WHERE cm.artwork_id = a.id) AS artwork_comment_count,
      (SELECT COUNT(*)::int FROM reports r2 WHERE r2.artwork_id = a.id) AS total_artwork_reports,

      owner.id AS owner_id,
      owner.name AS owner_name,
      owner.email AS owner_email,
      owner.role AS owner_role,
      owner.is_active AS owner_is_active,
      owner.created_at AS owner_created_at,
      CASE WHEN LOWER(owner.role) = 'member' THEN owner.profile_image ELSE NULL END AS owner_image,
      (SELECT COUNT(*)::int FROM artworks oa WHERE oa.user_id = owner.id) AS owner_total_artworks,
      (SELECT COUNT(*)::int FROM artworks oa WHERE oa.user_id = owner.id AND oa.status = 'active') AS owner_active_artworks
    FROM reports r
    LEFT JOIN users reporter ON r.user_id = reporter.id
    LEFT JOIN artworks a ON r.artwork_id = a.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users owner ON a.user_id = owner.id
    WHERE r.id = $1
    `,
    [reportId]
  );

  if (reportRes.rows.length === 0) notFound();

  const row = reportRes.rows[0];

  const otherReportsRes = row.artwork_id
    ? await query(
        `
        SELECT r.id, r.reason, r.status, r.created_at,
               COALESCE(u.name, 'Deleted User') AS reporter_name
        FROM reports r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.artwork_id = $1 AND r.id <> $2
        ORDER BY r.created_at DESC
        `,
        [row.artwork_id, reportId]
      )
    : { rows: [] };

  const statusMeta = getReportStatusMeta(row.report_status);
  const reporterAvatar = row.reporter_id
    ? applyAvatarPolicy({ role: row.reporter_role, profile_image: row.reporter_image })
    : null;
  const ownerAvatar = row.owner_id
    ? applyAvatarPolicy({ role: row.owner_role, profile_image: row.owner_image })
    : null;

  const tagList = row.artwork_tags
    ? row.artwork_tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const artworkTitle = row.artwork_title ? formatEditorialTitle(row.artwork_title) : 'Deleted artwork';

  return (
    <div className="admin-detail-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Content Moderation', href: '/dashboard/admin/reports' },
          { label: `Report #${row.report_id}` },
        ]}
      />

      <div className="dashboard-header admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="dashboard-title">Report #{row.report_id}</h1>
            <span className={`badge ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
          </div>
          <p className="dashboard-subtitle">
            Submitted on {formatDateTime(row.reported_at)} · Category: {row.reason}
          </p>
        </div>
        <div className="admin-detail-header-actions">
          <Link href="/dashboard/admin/reports" className="btn-secondary">
            ← Back to reports
          </Link>
        </div>
      </div>

      <div className="admin-detail-layout">
        <div className="admin-detail-main">
          <section className="admin-detail-card" aria-labelledby="reported-artwork-heading">
            <div className="admin-detail-card-head">
              <div>
                <h2 id="reported-artwork-heading" className="admin-detail-card-title">
                  Reported artwork
                </h2>
                <p className="admin-detail-card-desc">
                  Inspect the full artwork, description, and publication metadata before deciding.
                </p>
              </div>
              {row.artwork_id && (
                <span className={`badge ${row.artwork_status === 'active' ? 'badge-active' : 'badge-taken_down'}`}>
                  {row.artwork_status === 'active' ? 'Published' : 'Taken down'}
                </span>
              )}
            </div>

            {row.artwork_id ? (
              <>
                <AdminArtworkPreview
                  src={row.artwork_image}
                  title={artworkTitle}
                  status={row.artwork_status}
                  categoryName={row.category_name}
                />

                <div className="admin-artwork-info-block">
                  <div className="admin-artwork-title-bar">
                    <h3 className="admin-artwork-title">{artworkTitle}</h3>
                    <Link
                      href={`/dashboard/admin/artworks/${row.artwork_id}`}
                      className="dash-inline-link"
                    >
                      Full artwork view →
                    </Link>
                  </div>

                  <p className="admin-artwork-description">
                    {row.artwork_description || 'No description provided.'}
                  </p>

                  <div className="admin-meta-grid">
                    <div className="admin-meta-item">
                      <span className="admin-meta-label">Category</span>
                      <span className="admin-meta-value">{row.category_name || 'Uncategorized'}</span>
                    </div>
                    <div className="admin-meta-item">
                      <span className="admin-meta-label">Upload date</span>
                      <span className="admin-meta-value">{formatDate(row.artwork_created_at)}</span>
                    </div>
                    <div className="admin-meta-item">
                      <span className="admin-meta-label">Publication status</span>
                      <span className="admin-meta-value">
                        {row.artwork_status === 'active' ? 'Active (Public)' : 'Taken down (Hidden)'}
                      </span>
                    </div>
                    <div className="admin-meta-item">
                      <span className="admin-meta-label">Engagement</span>
                      <span className="admin-meta-value">
                        {row.artwork_like_count || 0} likes · {row.artwork_favorite_count || 0} favorites · {row.artwork_comment_count || 0} comments
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
              </>
            ) : (
              <div className="dash-empty">
                <p>The artwork referenced by this report has been permanently deleted from the platform.</p>
              </div>
            )}
          </section>

          <section className="admin-detail-card" aria-labelledby="moderation-actions-heading">
            <div className="admin-detail-card-head">
              <div>
                <h2 id="moderation-actions-heading" className="admin-detail-card-title">
                  Moderation decision
                </h2>
                <p className="admin-detail-card-desc">
                  Dismiss this report or take down the reported artwork. All report history is preserved.
                </p>
              </div>
            </div>

            {row.admin_note && (
              <div className="admin-note-box">
                <span className="admin-meta-label">Recorded moderation note</span>
                <p className="admin-note-text">{row.admin_note}</p>
              </div>
            )}

            <ReportModerationControls
              reportId={row.report_id}
              reportStatus={row.report_status}
              artworkId={row.artwork_id}
              artworkTitle={artworkTitle}
              artworkStatus={row.artwork_status}
              existingNote={row.admin_note || ''}
            />
          </section>
        </div>

        <aside className="admin-detail-side">
          <section className="admin-detail-card" aria-labelledby="report-info-heading">
            <h2 id="report-info-heading" className="admin-detail-card-title">
              Report information
            </h2>

            <dl className="admin-kv-list">
              <div className="admin-kv-row">
                <dt>Report ID</dt>
                <dd>#{row.report_id}</dd>
              </div>
              <div className="admin-kv-row">
                <dt>Reported date</dt>
                <dd>{formatDateTime(row.reported_at)}</dd>
              </div>
              <div className="admin-kv-row">
                <dt>Status</dt>
                <dd>
                  <span className={`badge ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
                </dd>
              </div>
              <div className="admin-kv-row">
                <dt>Reason</dt>
                <dd>
                  <span className="badge badge-neutral">{row.reason}</span>
                </dd>
              </div>
              {row.artwork_id && (
                <div className="admin-kv-row">
                  <dt>Total reports on artwork</dt>
                  <dd>
                    <strong>{row.total_artwork_reports}</strong>{' '}
                    {Number(row.total_artwork_reports) === 1 ? 'report' : 'reports'}
                  </dd>
                </div>
              )}
            </dl>

            <div className="admin-explanation-box">
              <span className="admin-meta-label">Reporter explanation</span>
              <p className="admin-explanation-text">
                {row.details?.trim()
                  ? row.details
                  : 'No additional written explanation was submitted by the reporter.'}
              </p>
            </div>
          </section>

          <section className="admin-detail-card" aria-labelledby="reporter-info-heading">
            <h2 id="reporter-info-heading" className="admin-detail-card-title">
              Submitted by
            </h2>
            {row.reporter_id ? (
              <>
                <div className="admin-person-card">
                  <UserAvatar
                    src={reporterAvatar?.profile_image}
                    role={row.reporter_role}
                    name={row.reporter_name}
                    size={42}
                  />
                  <div className="admin-person-meta">
                    <span className="admin-person-name">{row.reporter_name}</span>
                    <span className="admin-person-sub">{row.reporter_email}</span>
                    <div className="admin-person-badges">
                      <span className={`badge badge-role-${row.reporter_role}`}>
                        {formatRoleLabel(row.reporter_role)}
                      </span>
                      <span className={`badge ${row.reporter_is_active !== false ? 'badge-approved' : 'badge-rejected'}`}>
                        {row.reporter_is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <dl className="admin-kv-list admin-kv-list--compact">
                  <div className="admin-kv-row">
                    <dt>Registered</dt>
                    <dd>{formatDate(row.reporter_created_at)}</dd>
                  </div>
                </dl>
                {row.reporter_role === 'member' && (
                  <Link
                    href={`/dashboard/admin/users/${row.reporter_id}`}
                    className="btn-secondary admin-full-btn"
                  >
                    Inspect reporter profile
                  </Link>
                )}
              </>
            ) : (
              <p className="admin-muted-note">Reporter account is no longer available.</p>
            )}
          </section>

          <section className="admin-detail-card" aria-labelledby="owner-info-heading">
            <h2 id="owner-info-heading" className="admin-detail-card-title">
              Artwork owner
            </h2>
            {row.owner_id ? (
              <>
                <div className="admin-person-card">
                  <UserAvatar
                    src={ownerAvatar?.profile_image}
                    role={row.owner_role}
                    name={row.owner_name}
                    size={46}
                  />
                  <div className="admin-person-meta">
                    <span className="admin-person-name">{row.owner_name}</span>
                    <span className="admin-person-sub">{row.owner_email}</span>
                    <div className="admin-person-badges">
                      <span className={`badge ${row.owner_is_active !== false ? 'badge-approved' : 'badge-rejected'}`}>
                        {row.owner_is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <dl className="admin-kv-list admin-kv-list--compact">
                  <div className="admin-kv-row">
                    <dt>Registered</dt>
                    <dd>{formatDate(row.owner_created_at)}</dd>
                  </div>
                  <div className="admin-kv-row">
                    <dt>Uploaded artworks</dt>
                    <dd>
                      {row.owner_total_artworks} total ({row.owner_active_artworks} active)
                    </dd>
                  </div>
                </dl>

                <Link
                  href={`/dashboard/admin/users/${row.owner_id}`}
                  className="btn-primary admin-full-btn"
                  id="btn-view-owner-member-detail"
                >
                  View member details →
                </Link>
              </>
            ) : (
              <p className="admin-muted-note">Owner account information is unavailable.</p>
            )}
          </section>

          {otherReportsRes.rows.length > 0 && (
            <section className="admin-detail-card" aria-labelledby="related-reports-heading">
              <h2 id="related-reports-heading" className="admin-detail-card-title">
                Other reports on this artwork ({otherReportsRes.rows.length})
              </h2>
              <ul className="admin-related-list">
                {otherReportsRes.rows.map((other) => {
                  const meta = getReportStatusMeta(other.status);
                  return (
                    <li key={other.id} className="admin-related-item">
                      <Link href={`/dashboard/admin/reports/${other.id}`} className="admin-related-link">
                        <div>
                          <span className="admin-related-title">
                            Report #{other.id} · {other.reason}
                          </span>
                          <span className="admin-related-meta">
                            By {other.reporter_name} · {formatDate(other.created_at)}
                          </span>
                        </div>
                        <span className={`badge ${meta.badgeClass}`}>{meta.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
