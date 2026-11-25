import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ReportActionButtons from './ReportActionButtons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Content Moderation — ARCHIVE',
};

export default async function AdminReportsPage() {
  await requireRole('admin');

  const [pendingRes, historyRes] = await Promise.all([
    query(`
      SELECT r.id as report_id, r.reason, r.details, r.status, r.created_at,
             a.id as artwork_id, a.title as artwork_title, a.image_url, a.status as artwork_status,
             creator.id as creator_id, COALESCE(creator.name, 'Deleted Creator') as creator_name,
             COALESCE(reporter.name, 'Deleted User') as reporter_name,
             (SELECT COUNT(*) FROM reports WHERE artwork_id = a.id) as total_artwork_reports
      FROM reports r
      JOIN artworks a ON r.artwork_id = a.id
      LEFT JOIN users creator ON a.user_id = creator.id
      LEFT JOIN users reporter ON r.user_id = reporter.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `),
    query(`
      SELECT r.id as report_id, r.reason, r.details, r.status, r.created_at,
             a.id as artwork_id, COALESCE(a.title, 'Deleted Artwork') as artwork_title, a.image_url, a.status as artwork_status,
             creator.id as creator_id, COALESCE(creator.name, '—') as creator_name,
             COALESCE(reporter.name, 'Deleted User') as reporter_name
      FROM reports r
      LEFT JOIN artworks a ON r.artwork_id = a.id
      LEFT JOIN users creator ON a.user_id = creator.id
      LEFT JOIN users reporter ON r.user_id = reporter.id
      WHERE r.status != 'pending'
      ORDER BY r.created_at DESC
      LIMIT 20
    `),
  ]);

  const pendingReports = pendingRes.rows.map((r) => ({
    ...r,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  }));
  const historyReports = historyRes.rows.map((r) => ({
    ...r,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  }));

  return (
    <div className="moderation-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Content Moderation' },
        ]}
      />
      <div className="dashboard-header moderation-page-header">
        <div>
          <h1 className="dashboard-title">Content Moderation</h1>
          <p className="dashboard-subtitle">Review community guideline violation reports and take moderation action.</p>
        </div>
      </div>

      {/* Pending Reports */}
      <section className="moderation-section">
        <h2 className="dash-section-title" style={{ marginBottom: 14 }}>
          Pending Reports ({pendingReports.length})
        </h2>

        {pendingReports.length === 0 ? (
          <div className="moderation-empty-state">
            <p>No content reports require moderation right now. All content is clear!</p>
          </div>
        ) : (
          <div className="data-table-wrap moderation-table-wrap">
            <table className="data-table dashboard-responsive-table moderation-table moderation-pending-table">
              <colgroup>
                <col className="col-thumb" />
                <col className="col-title" />
                <col className="col-creator" />
                <col className="col-reporter" />
                <col className="col-reason" />
                <col className="col-total" />
                <col className="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Artwork</th>
                  <th>Artwork Title</th>
                  <th>Creator</th>
                  <th>Reporter</th>
                  <th>Report Reason</th>
                  <th>Total Reports</th>
                  <th>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.map((r) => {
                  const totalReports = parseInt(r.total_artwork_reports, 10) || 1;
                  return (
                    <tr key={r.report_id}>
                      <td data-label="Artwork" data-cell="thumb">
                        <Link href={`/dashboard/admin/reports/${r.report_id}`} className="moderation-thumb-link">
                          <div className="moderation-thumb">
                            <Image src={r.image_url} alt={r.artwork_title} fill style={{ objectFit: 'cover' }} sizes="88px" />
                          </div>
                        </Link>
                      </td>
                      <td data-label="Artwork title" data-cell="primary">
                        <Link href={`/dashboard/admin/reports/${r.report_id}`} className="moderation-artwork-link dashboard-table-link">
                          {r.artwork_title}
                        </Link>
                      </td>
                      <td data-label="Creator">
                        {r.creator_id ? (
                          <Link href={`/dashboard/admin/users/${r.creator_id}`} className="moderation-creator-link dashboard-user-link">
                            {r.creator_name}
                          </Link>
                        ) : (
                          <span className="moderation-creator-text">{r.creator_name}</span>
                        )}
                      </td>
                      <td data-label="Reporter" className="moderation-muted-cell">{r.reporter_name}</td>
                      <td data-label="Report reason">
                        <span className="badge badge-neutral moderation-badge">{r.reason}</span>
                      </td>
                      <td data-label="Total reports" className="moderation-total-cell">
                        <span className={totalReports > 1 ? 'moderation-count-highlight' : ''}>
                          {totalReports} {totalReports === 1 ? 'report' : 'reports'}
                        </span>
                      </td>
                      <td data-label="Moderation actions" data-cell="actions">
                        <ReportActionButtons
                          reportId={r.report_id}
                          artworkId={r.artwork_id}
                          artworkTitle={r.artwork_title}
                          reporterName={r.reporter_name}
                          reason={r.reason}
                          details={r.details}
                          createdAt={r.created_at}
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

      {/* Moderation History */}
      <section className="moderation-section">
        <h2 className="dash-section-title" style={{ marginBottom: 14 }}>
          Moderation History ({historyReports.length})
        </h2>

        <div className="data-table-wrap moderation-table-wrap">
          <table className="data-table dashboard-responsive-table moderation-table moderation-history-table">
            <colgroup>
              <col className="col-history-artwork" />
              <col className="col-history-creator" />
              <col className="col-history-reason" />
              <col className="col-history-status" />
              <col className="col-history-date" />
              <col className="col-history-details" />
            </colgroup>
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Creator</th>
                <th>Reason</th>
                <th>Decision / Status</th>
                <th>Reported At</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {historyReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="moderation-history-empty data-table-empty-cell">
                    No moderation history yet.
                  </td>
                </tr>
              ) : (
                historyReports.map((r) => (
                  <tr key={r.report_id}>
                    <td data-label="Artwork" data-cell="primary">
                      <Link href={`/dashboard/admin/reports/${r.report_id}`} className="moderation-artwork-link dashboard-table-link">
                        {r.artwork_title}
                      </Link>
                    </td>
                    <td data-label="Creator">
                      {r.creator_id ? (
                        <Link href={`/dashboard/admin/users/${r.creator_id}`} className="moderation-creator-link dashboard-user-link">
                          {r.creator_name}
                        </Link>
                      ) : (
                        <span className="moderation-creator-text">{r.creator_name}</span>
                      )}
                    </td>
                    <td data-label="Reason">
                      <span className="badge badge-neutral moderation-badge">
                        {r.reason}
                      </span>
                    </td>
                    <td data-label="Decision / status">
                      <span className={`badge moderation-badge ${r.status === 'taken_down' ? 'badge-rejected' : 'badge-approved'}`}>
                        {r.status === 'taken_down' ? 'Artwork taken down' : 'Report dismissed'}
                      </span>
                    </td>
                    <td data-label="Reported at" className="moderation-date-cell">
                      {new Date(r.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td data-label="Details" data-cell="actions">
                      <div className="table-actions-group">
                        <Link
                          href={`/dashboard/admin/reports/${r.report_id}`}
                          className="btn-secondary moderation-action-btn"
                          id={`btn-history-view-report-${r.report_id}`}
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
