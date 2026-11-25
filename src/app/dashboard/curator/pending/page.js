import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { logoutUser } from '@/lib/actions/auth.actions';
import { Hourglass, X } from '@/components/ui/Icons';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CuratorReapplyPanel from './CuratorReapplyPanel';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curator Verification — ARCHIVE',
};

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function CuratorPendingPage() {
  const user = await requireAuth();

  if (user.role !== 'curator') {
    redirect('/dashboard');
  }
  if (user.curator_status === 'approved') {
    redirect('/dashboard/curator');
  }

  const appsRes = await query(
    `SELECT ca.id, ca.attempt_number, ca.portfolio_url, ca.background,
            ca.supporting_notes, ca.status, ca.rejection_reason,
            ca.submitted_at, ca.reviewed_at,
            adm.name AS reviewed_by_name
     FROM curator_applications ca
     LEFT JOIN users adm ON adm.id = ca.reviewed_by
     WHERE ca.user_id = $1
     ORDER BY ca.attempt_number DESC`,
    [user.id]
  );

  const applications = appsRes.rows.map((row) => ({
    ...row,
    submitted_at: row.submitted_at instanceof Date ? row.submitted_at.toISOString() : row.submitted_at,
    reviewed_at: row.reviewed_at instanceof Date ? row.reviewed_at.toISOString() : row.reviewed_at,
  }));

  const isRejected = user.curator_status === 'rejected';
  const latestApplication = applications[0] || null;
  const previousApplications = applications.slice(1);
  const nextAttemptNumber = (latestApplication?.attempt_number || 0) + 1;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Verification Status' }]} />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Verification status</h1>
          <p className="dashboard-subtitle">
            {isRejected
              ? 'Review administrative feedback on your Curator application and submit an updated reapplication.'
              : 'Track your Curator account verification progress and submitted credentials.'}
          </p>
        </div>
      </div>

      <div className="curator-status-shell">
        <div className={`curator-pending-wrap curator-status-panel ${isRejected ? 'is-rejected' : 'is-pending'}`}>
          <div className="curator-status-header">
            <div className={`curator-pending-icon ${isRejected ? 'is-rejected' : 'is-pending'}`}>
              {isRejected ? <X size={28} /> : <Hourglass size={28} />}
            </div>

            <span className={`curator-status-kicker ${isRejected ? 'is-rejected' : 'is-pending'}`}>
              {isRejected ? 'APPLICATION REJECTED' : 'PENDING REVIEW'}
              {latestApplication ? ` · APPLICATION #${latestApplication.attempt_number}` : ''}
            </span>

            <h2 className="curator-pending-title" id="curator-status-heading">
              {isRejected ? 'Curator Application Rejected' : 'Awaiting curator verification'}
            </h2>

            <p className="curator-pending-desc">
              {isRejected
                ? 'Unfortunately, your application to become an ARTHIVE Curator was not approved.'
                : 'Your Curator application is currently under review by the ARTHIVE Admin team. You will receive full curation access once approved.'}
            </p>
          </div>

        {isRejected ? (
          <>
            <div className="curator-rejection-box" id="curator-rejection-reason-box" role="region" aria-labelledby="rejection-reason-heading">
              <div className="curator-rejection-head">
                <h2 id="rejection-reason-heading" className="curator-rejection-heading">
                  Reason for rejection
                </h2>
                {latestApplication?.reviewed_at && (
                  <span className="curator-rejection-date">
                    Reviewed {formatDateTime(latestApplication.reviewed_at)}
                  </span>
                )}
              </div>
              <p className="curator-rejection-text" id="curator-rejection-reason-text">
                {latestApplication?.rejection_reason ||
                  'No detailed rejection reason was recorded for this application.'}
              </p>
            </div>

            <p className="curator-rejection-guidance">
              You can review the feedback, improve your application, and submit a new application.
            </p>

            <div className="curator-reapply-slot">
              <CuratorReapplyPanel
                user={{
                  id: user.id,
                  name: user.name,
                  bio: user.bio,
                  external_link: user.external_link,
                }}
                latestApplication={latestApplication}
                nextAttemptNumber={nextAttemptNumber}
              />
            </div>
          </>
        ) : (
          <div className="curator-submission-summary" id="curator-pending-summary">
            <div className="curator-summary-grid">
              <div className="curator-summary-item">
                <span className="curator-summary-label">Submitted</span>
                <span className="curator-summary-value">
                  {formatDateTime(latestApplication?.submitted_at || user.created_at)}
                </span>
              </div>
              <div className="curator-summary-item">
                <span className="curator-summary-label">Portfolio link</span>
                {latestApplication?.portfolio_url || user.external_link ? (
                  <a
                    href={latestApplication?.portfolio_url || user.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="curator-summary-link"
                  >
                    {latestApplication?.portfolio_url || user.external_link} ↗
                  </a>
                ) : (
                  <span className="curator-summary-muted">Not provided</span>
                )}
              </div>
            </div>

            {(latestApplication?.background || user.bio) && (
              <div className="curator-summary-block">
                <span className="curator-summary-label">Curatorial background</span>
                <p className="curator-summary-text">
                  {latestApplication?.background || user.bio}
                </p>
              </div>
            )}

            {latestApplication?.supporting_notes && (
              <div className="curator-summary-block">
                <span className="curator-summary-label">Supporting information</span>
                <p className="curator-summary-text">
                  {latestApplication.supporting_notes}
                </p>
              </div>
            )}

            <p className="curator-pending-lock-note">
              Your application is currently in queue. Duplicate submissions cannot be made while a review is pending.
            </p>
          </div>
        )}

        <div className="curator-pending-actions">
          <form action={logoutUser}>
            <button type="submit" className="btn-secondary curator-pending-btn">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Preserved Application History (visible for multi-attempt applicants) */}
      {previousApplications.length > 0 && (
        <section className="curator-history-panel" id="curator-application-history" aria-labelledby="curator-history-heading">
          <div className="curator-history-head">
            <h2 id="curator-history-heading" className="curator-history-title">
              Previous application history
            </h2>
            <span className="curator-history-count">
              {previousApplications.length} prior {previousApplications.length === 1 ? 'submission' : 'submissions'}
            </span>
          </div>

          <div className="curator-history-list">
            {previousApplications.map((app) => (
              <article key={app.id} className="curator-history-item">
                <div className="curator-history-item-top">
                  <span className="curator-history-attempt">
                    Application #{app.attempt_number}
                  </span>
                  <span className={`badge badge-${app.status}`}>
                    {app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                  <span className="curator-history-date">
                    Submitted {formatDateTime(app.submitted_at)}
                    {app.reviewed_at ? ` · Reviewed ${formatDateTime(app.reviewed_at)}` : ''}
                  </span>
                </div>

                {app.rejection_reason && (
                  <div className="curator-history-reason">
                    <span className="curator-summary-label">Reason for rejection</span>
                    <p>{app.rejection_reason}</p>
                  </div>
                )}

                {app.portfolio_url && (
                  <div className="curator-history-meta">
                    <span className="curator-summary-label">Submitted portfolio: </span>
                    <a
                      href={app.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="curator-summary-link"
                    >
                      {app.portfolio_url} ↗
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
