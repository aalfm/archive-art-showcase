import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { toId } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CuratorActionButtons from '../CuratorActionButtons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curator Application Details — ARCHIVE Admin',
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
    month: 'short',
    day: 'numeric',
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

export default async function AdminCuratorApplicationDetailPage(props) {
  await requireRole('admin');
  const params = await props.params;
  const curatorId = toId(params?.id);
  if (!curatorId) notFound();

  const [userRes, appsRes] = await Promise.all([
    query(
      `SELECT id, name, email, role, curator_status, is_active, bio, external_link, created_at
       FROM users
       WHERE id = $1 AND role = 'curator'`,
      [curatorId]
    ),
    query(
      `SELECT ca.id, ca.attempt_number, ca.portfolio_url,
              ca.cv_file_path, ca.cv_file_name, ca.cv_url,
              ca.background, ca.supporting_notes, ca.status, ca.rejection_reason,
              ca.submitted_at, ca.reviewed_at,
              adm.name AS reviewed_by_name
       FROM curator_applications ca
       LEFT JOIN users adm ON adm.id = ca.reviewed_by
       WHERE ca.user_id = $1
       ORDER BY ca.attempt_number DESC`,
      [curatorId]
    ),
  ]);

  if (userRes.rows.length === 0) {
    notFound();
  }

  const applicant = userRes.rows[0];
  const applications = appsRes.rows;
  const latestApp = applications[0] || null;
  const previousApplications = applications.slice(1);
  const attemptNumber = latestApp?.attempt_number || 1;
  const status = applicant.curator_status || latestApp?.status || 'pending';
  const statusLabel =
    status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';

  const latestPortfolioUrl = getSafeExternalUrl(latestApp?.portfolio_url || applicant.external_link);
  const latestCvUrl = getSafeExternalUrl(latestApp?.cv_url);
  const latestHasCvFile = Boolean(latestApp?.cv_file_path);
  const latestCvFileName = latestApp?.cv_file_name || 'Curator CV';
  const latestBackground = latestApp?.background || applicant.bio || '';

  return (
    <div className="admin-detail-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Curator Verification', href: '/dashboard/admin/curators' },
          { label: applicant.name },
        ]}
      />

      <div className="dashboard-header admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="dashboard-title">Curator Application</h1>
            <span className={`badge badge-${status}`}>{statusLabel}</span>
          </div>
          <p className="dashboard-subtitle">
            Review submitted CV, portfolio, curatorial credentials, and application history before deciding.
          </p>
        </div>

        <div className="admin-detail-header-actions">
          <Link href="/dashboard/admin/curators" className="btn-secondary">
            ← Back to Verification
          </Link>
          {status === 'pending' && (
            <CuratorActionButtons
              curatorId={applicant.id}
              curatorName={applicant.name}
              attemptNumber={attemptNumber}
            />
          )}
        </div>
      </div>

      <section className="admin-detail-card admin-member-profile-card" aria-labelledby="curator-applicant-heading">
        <div className="admin-member-identity-top">
          <UserAvatar src={null} role="curator" name={applicant.name} size={64} />
          <div className="admin-member-identity-info">
            <div className="admin-detail-title-row">
              <h2 id="curator-applicant-heading" className="admin-member-name">
                {applicant.name}
              </h2>
              <span className="badge badge-role-curator">Curator</span>
              <span className={`badge badge-${status}`}>{statusLabel}</span>
            </div>
            <p className="admin-member-email">{applicant.email}</p>
            <p className="admin-member-joined">
              Application #{attemptNumber} · Submitted {formatDate(latestApp?.submitted_at || applicant.created_at)}
              {latestApp?.reviewed_at
                ? ` · Reviewed ${formatDate(latestApp.reviewed_at)}${latestApp.reviewed_by_name ? ` by ${latestApp.reviewed_by_name}` : ''}`
                : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="admin-detail-card" aria-labelledby="curator-documents-heading">
        <div className="dash-section-head" style={{ marginBottom: 16 }}>
          <div>
            <h2 id="curator-documents-heading" className="dash-section-title">
              Submitted documents &amp; links
            </h2>
            <p className="dash-section-desc">
              Verify the applicant&apos;s Portfolio and Curriculum Vitae (CV) prior to approval.
            </p>
          </div>
        </div>

        <div className="admin-curator-doc-grid">
          <div className="admin-curator-doc-card" id="admin-curator-portfolio-card">
            <div className="admin-curator-doc-head">
              <span className="admin-meta-label">Portfolio link</span>
              <span className={`badge ${latestPortfolioUrl ? 'badge-approved' : 'badge-rejected'}`}>
                {latestPortfolioUrl ? 'Provided' : 'Missing'}
              </span>
            </div>

            {latestPortfolioUrl ? (
              <>
                <a
                  href={latestPortfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="curator-summary-link admin-curator-doc-url"
                >
                  {latestPortfolioUrl} ↗
                </a>
                <div className="admin-curator-doc-actions">
                  <a
                    href={latestPortfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary table-action-btn"
                    id="btn-admin-open-portfolio"
                  >
                    Open portfolio ↗
                  </a>
                </div>
              </>
            ) : (
              <p className="curator-summary-muted">
                No portfolio link was recorded for this historical application.
              </p>
            )}
          </div>

          <div className="admin-curator-doc-card" id="admin-curator-cv-card">
            <div className="admin-curator-doc-head">
              <span className="admin-meta-label">Curriculum Vitae (CV)</span>
              <span className={`badge ${latestHasCvFile || latestCvUrl ? 'badge-approved' : 'badge-rejected'}`}>
                {latestHasCvFile || latestCvUrl ? 'Provided' : 'Missing'}
              </span>
            </div>

            {latestHasCvFile || latestCvUrl ? (
              <div className="admin-curator-cv-body">
                {latestHasCvFile && latestApp && (
                  <div className="admin-curator-cv-file-block">
                    <span className="admin-curator-cv-filename" title={latestCvFileName}>
                      {latestCvFileName}
                    </span>
                    <div className="admin-curator-doc-actions">
                      <a
                        href={`/api/curator-applications/${latestApp.id}/cv`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary table-action-btn"
                        id="btn-admin-open-cv-file"
                      >
                        Open CV ↗
                      </a>
                      <a
                        href={`/api/curator-applications/${latestApp.id}/cv?download=1`}
                        className="btn-secondary table-action-btn"
                        id="btn-admin-download-cv-file"
                      >
                        Download CV
                      </a>
                    </div>
                  </div>
                )}

                {latestCvUrl && (
                  <div className="admin-curator-cv-link-block">
                    <span className="curator-summary-label">CV link</span>
                    <a
                      href={latestCvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="curator-summary-link admin-curator-doc-url"
                    >
                      {latestCvUrl} ↗
                    </a>
                    <div className="admin-curator-doc-actions">
                      <a
                        href={latestCvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary table-action-btn"
                        id="btn-admin-open-cv-link"
                      >
                        Open CV link ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="curator-summary-muted">
                No CV document or CV link was recorded for this historical application.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-detail-card" aria-labelledby="curator-background-heading">
        <h2 id="curator-background-heading" className="dash-section-title" style={{ marginBottom: 14 }}>
          Application details
        </h2>

        <div className="admin-meta-grid">
          <div className="admin-meta-item admin-meta-item--wide">
            <span className="admin-meta-label">Curatorial background</span>
            <p className="admin-meta-paragraph">
              {latestBackground?.trim()
                ? latestBackground
                : 'No curatorial background provided.'}
            </p>
          </div>

          {latestApp?.supporting_notes && (
            <div className="admin-meta-item admin-meta-item--wide">
              <span className="admin-meta-label">Supporting information</span>
              <p className="admin-meta-paragraph">{latestApp.supporting_notes}</p>
            </div>
          )}

          {latestApp?.rejection_reason && (
            <div className="admin-meta-item admin-meta-item--wide">
              <div className="curator-history-reason">
                <span className="curator-summary-label">Reason for rejection</span>
                <p>{latestApp.rejection_reason}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {previousApplications.length > 0 && (
        <section className="dash-section" aria-labelledby="curator-prev-history-heading">
          <div className="dash-section-head">
            <div>
              <h2 id="curator-prev-history-heading" className="dash-section-title">
                Previous attempts ({previousApplications.length})
              </h2>
              <p className="dash-section-desc">
                Preserved review records and rejection reasons from earlier applications.
              </p>
            </div>
          </div>

          <div className="curator-history-list">
            {previousApplications.map((app) => {
              const prevPortfolio = getSafeExternalUrl(app.portfolio_url);
              const prevCvUrl = getSafeExternalUrl(app.cv_url);
              return (
                <article key={app.id} className="curator-history-item">
                  <div className="curator-history-item-top">
                    <span className="curator-history-attempt">
                      Application #{app.attempt_number}
                    </span>
                    <span className={`badge badge-${app.status}`}>
                      {app.status === 'approved'
                        ? 'Approved'
                        : app.status === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                    </span>
                    <span className="curator-history-date">
                      Submitted {formatShortDate(app.submitted_at)}
                      {app.reviewed_at ? ` · Reviewed ${formatShortDate(app.reviewed_at)}` : ''}
                      {app.reviewed_by_name ? ` by ${app.reviewed_by_name}` : ''}
                    </span>
                  </div>

                  <div className="admin-history-fields">
                    <div>
                      <span className="curator-summary-label">Portfolio link</span>
                      {prevPortfolio ? (
                        <div>
                          <a
                            href={prevPortfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="curator-summary-link"
                          >
                            {prevPortfolio} ↗
                          </a>
                        </div>
                      ) : (
                        <p className="curator-summary-muted">Not provided</p>
                      )}
                    </div>

                    <div>
                      <span className="curator-summary-label">Curriculum Vitae (CV)</span>
                      {app.cv_file_path || prevCvUrl ? (
                        <div className="curator-cv-links-stack">
                          {app.cv_file_path && (
                            <div className="curator-cv-file-actions">
                              <a
                                href={`/api/curator-applications/${app.id}/cv`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="curator-summary-link"
                              >
                                {app.cv_file_name || 'Open CV file'} ↗
                              </a>
                              <a
                                href={`/api/curator-applications/${app.id}/cv?download=1`}
                                className="curator-cv-download-inline"
                              >
                                Download
                              </a>
                            </div>
                          )}
                          {prevCvUrl && (
                            <div>
                              <a
                                href={prevCvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="curator-summary-link"
                              >
                                {prevCvUrl} ↗
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="curator-summary-muted">Not provided</p>
                      )}
                    </div>

                    {app.background && (
                      <div>
                        <span className="curator-summary-label">Curatorial background</span>
                        <p className="curator-summary-text">{app.background}</p>
                      </div>
                    )}

                    {app.rejection_reason && (
                      <div className="curator-history-reason">
                        <span className="curator-summary-label">Reason for rejection</span>
                        <p>{app.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
