import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import UserAvatar from '@/components/ui/UserAvatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CuratorActionButtons from './CuratorActionButtons';
import CuratorHistoryModal from './CuratorHistoryModal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curator Verification — ARCHIVE',
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function AdminCuratorsPage() {
  await requireRole('admin');

  const [pendingRes, historyRes, appsRes] = await Promise.all([
    query(`
      SELECT u.id, u.name, u.email, u.role, u.bio, u.external_link, u.created_at,
             COALESCE(la.submitted_at, u.created_at) AS latest_submitted_at
      FROM users u
      LEFT JOIN LATERAL (
        SELECT submitted_at
        FROM curator_applications
        WHERE user_id = u.id
        ORDER BY attempt_number DESC
        LIMIT 1
      ) la ON TRUE
      WHERE u.role = 'curator' AND u.curator_status = 'pending'
      ORDER BY COALESCE(la.submitted_at, u.created_at) ASC
    `),
    query(`
      SELECT u.id, u.name, u.email, u.role, u.curator_status, u.bio, u.external_link, u.created_at,
             COALESCE(la.reviewed_at, u.created_at) AS latest_reviewed_at
      FROM users u
      LEFT JOIN LATERAL (
        SELECT reviewed_at
        FROM curator_applications
        WHERE user_id = u.id
        ORDER BY attempt_number DESC
        LIMIT 1
      ) la ON TRUE
      WHERE u.role = 'curator' AND u.curator_status != 'pending'
      ORDER BY COALESCE(la.reviewed_at, u.created_at) DESC
    `),
    query(`
      SELECT ca.id, ca.user_id, ca.attempt_number, ca.portfolio_url, ca.background,
             ca.supporting_notes, ca.status, ca.rejection_reason,
             ca.submitted_at, ca.reviewed_at,
             adm.name AS reviewed_by_name
      FROM curator_applications ca
      LEFT JOIN users adm ON adm.id = ca.reviewed_by
      ORDER BY ca.user_id ASC, ca.attempt_number DESC
    `),
  ]);

  const appsByUser = new Map();
  for (const row of appsRes.rows) {
    const serialized = {
      ...row,
      submitted_at: row.submitted_at instanceof Date ? row.submitted_at.toISOString() : row.submitted_at,
      reviewed_at: row.reviewed_at instanceof Date ? row.reviewed_at.toISOString() : row.reviewed_at,
    };
    if (!appsByUser.has(row.user_id)) {
      appsByUser.set(row.user_id, []);
    }
    appsByUser.get(row.user_id).push(serialized);
  }

  const pendingCurators = pendingRes.rows;
  const historyCurators = historyRes.rows;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Curator Verification' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Curator verification</h1>
          <p className="dashboard-subtitle">
            Review curator applications, portfolios, and prior decision history before granting curation authorization.
          </p>
        </div>
      </div>

      {/* Pending Section */}
      <div className="dash-section">
        <h2 className="dash-section-title" style={{ marginBottom: 14 }}>
          Awaiting approval ({pendingCurators.length})
        </h2>

        {pendingCurators.length === 0 ? (
          <div className="dash-empty">
            <p>No curator applications awaiting approval right now.</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table dashboard-responsive-table admin-curators-table admin-curators-pending-table">
              <colgroup>
                <col className="admin-curators-col-name" />
                <col className="admin-curators-col-email" />
                <col className="admin-curators-col-app" />
                <col className="admin-curators-col-date" />
                <col className="admin-curators-col-decision" />
              </colgroup>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Portfolio &amp; application</th>
                  <th>Submitted</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingCurators.map((c) => {
                  const history = appsByUser.get(c.id) || [];
                  const latestApp = history[0] || null;
                  const attemptNumber = latestApp?.attempt_number || 1;
                  const portfolioUrl = latestApp?.portfolio_url || c.external_link || null;
                  const background = latestApp?.background || c.bio || '';
                  const isReapplication = attemptNumber > 1;

                  return (
                    <tr key={c.id}>
                      <td data-label="Applicant" data-cell="primary">
                        <div className="dashboard-user-cell">
                          <UserAvatar src={null} role={c.role} name={c.name} size={28} />
                          <div className="admin-curator-name-col">
                            <span className="dashboard-user-cell-name" style={{ fontWeight: 600 }}>
                              {c.name}
                            </span>
                            {isReapplication && (
                              <span className="admin-curator-attempt-note">
                                Reapplication · Attempt #{attemptNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="Email" className="table-cell-break">
                        {c.email}
                      </td>
                      <td data-label="Portfolio & application">
                        <div className="admin-curator-app-cell">
                          {portfolioUrl ? (
                            <a
                              href={portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-curator-portfolio-link"
                            >
                              View portfolio
                            </a>
                          ) : (
                            <span className="admin-curator-no-portfolio">No portfolio provided</span>
                          )}
                          {background && (
                            <p className="admin-curator-bio-snippet" title={background}>
                              {background}
                            </p>
                          )}
                          <CuratorHistoryModal
                            curatorName={c.name}
                            curatorEmail={c.email}
                            applications={history}
                            buttonLabel={
                              history.length > 1
                                ? `View history (${history.length})`
                                : 'View details'
                            }
                          />
                        </div>
                      </td>
                      <td data-label="Submitted" className="table-cell-meta">
                        {formatDate(latestApp?.submitted_at || c.created_at)}
                      </td>
                      <td data-label="Decision" data-cell="actions">
                        <CuratorActionButtons
                          curatorId={c.id}
                          curatorName={c.name}
                          attemptNumber={attemptNumber}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verified / Rejected History Section */}
      <div className="dash-section">
        <div className="dash-section-head" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="dash-section-title">
              Verification history ({historyCurators.length})
            </h2>
            <p className="dash-section-desc">
              Past approval and rejection decisions. Rejected applicants must reapply before they can be reviewed again.
            </p>
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table dashboard-responsive-table admin-curators-table admin-curators-history-table">
            <colgroup>
              <col className="admin-curators-hist-col-name" />
              <col className="admin-curators-hist-col-email" />
              <col className="admin-curators-hist-col-status" />
              <col className="admin-curators-hist-col-summary" />
              <col className="admin-curators-hist-col-history" />
            </colgroup>
            <thead>
              <tr>
                <th>Curator</th>
                <th>Email</th>
                <th>Status</th>
                <th>Decision summary</th>
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              {historyCurators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="data-table-empty-cell">
                    No verification history yet.
                  </td>
                </tr>
              ) : (
                historyCurators.map((c) => {
                  const history = appsByUser.get(c.id) || [];
                  const latestApp = history[0] || null;
                  const attemptCount = history.length || 1;

                  return (
                    <tr key={c.id}>
                      <td data-label="Curator" data-cell="primary">
                        <div className="dashboard-user-cell">
                          <UserAvatar src={null} role={c.role} name={c.name} size={28} />
                          <div className="admin-curator-name-col">
                            <span className="dashboard-user-cell-name" style={{ fontWeight: 600 }}>
                              {c.name}
                            </span>
                            {attemptCount > 1 && (
                              <span className="admin-curator-attempt-note">
                                {attemptCount} attempts
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="Email" className="table-cell-break">
                        {c.email}
                      </td>
                      <td data-label="Status">
                        <div className="admin-curator-status-col">
                          <span className={`badge badge-${c.curator_status}`}>
                            {c.curator_status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                          <span className="admin-curator-review-meta">
                            {formatDate(latestApp?.reviewed_at || c.created_at)}
                            {latestApp?.reviewed_by_name ? ` · ${latestApp.reviewed_by_name}` : ''}
                          </span>
                        </div>
                      </td>
                      <td data-label="Decision summary">
                        {c.curator_status === 'rejected' && latestApp?.rejection_reason ? (
                          <p className="admin-curator-reason-snippet" title={latestApp.rejection_reason}>
                            {latestApp.rejection_reason}
                          </p>
                        ) : c.curator_status === 'approved' ? (
                          <span className="admin-curator-approved-note">
                            Verified curator access granted
                          </span>
                        ) : (
                          <span className="admin-curator-no-portfolio">—</span>
                        )}
                      </td>
                      <td data-label="History" data-cell="actions">
                        <div className="table-actions-group">
                          <CuratorHistoryModal
                            curatorName={c.name}
                            curatorEmail={c.email}
                            applications={history}
                            buttonLabel={
                              attemptCount > 1 ? `History (${attemptCount})` : 'View record'
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
