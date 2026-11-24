import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import CuratorActionButtons from './CuratorActionButtons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curator Verification — ARCHIVE',
};

export default async function AdminCuratorsPage() {
  await requireRole('admin');

  const [pendingRes, historyRes] = await Promise.all([
    query(`
      SELECT id, name, email, bio, external_link, created_at
      FROM users
      WHERE role = 'curator' AND curator_status = 'pending'
      ORDER BY created_at ASC
    `),
    query(`
      SELECT id, name, email, curator_status, bio, external_link, created_at
      FROM users
      WHERE role = 'curator' AND curator_status != 'pending'
      ORDER BY created_at DESC
    `),
  ]);

  const pendingCurators = pendingRes.rows;
  const historyCurators = historyRes.rows;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Curator Verification</h1>
          <p className="dashboard-subtitle">Review curator applicant portfolios and grant program curation authorization.</p>
        </div>
      </div>

      {/* Pending Section */}
      <div className="dash-section">
        <h2 className="dash-section-title" style={{ marginBottom: 14 }}>
          Awaiting Approval ({pendingCurators.length})
        </h2>

        {pendingCurators.length === 0 ? (
          <div className="dash-empty">
            <p>No curator applications awaiting approval right now.</p>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Email</th>
                  <th>Profile &amp; Portfolio</th>
                  <th>Applied Date</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingCurators.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--surface)' }}>{c.email}</td>
                    <td>
                      {c.external_link ? (
                        <a href={c.external_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.8rem', textDecoration: 'none' }}>
                          View Portfolio ↗
                        </a>
                      ) : (
                        <span style={{ color: 'var(--surface)', fontSize: '0.78rem' }}>{c.bio || 'No additional info'}</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--surface)' }}>
                      {new Date(c.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td>
                      <CuratorActionButtons curatorId={c.id} curatorName={c.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verified / Rejected History Section */}
      <div className="dash-section">
        <h2 className="dash-section-title" style={{ marginBottom: 14 }}>
          Verification History ({historyCurators.length})
        </h2>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Curator Name</th>
                <th>Email</th>
                <th>Authorization Status</th>
                <th>Registered Date</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {historyCurators.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--surface)' }}>{c.email}</td>
                  <td>
                    <span className={`badge badge-${c.curator_status}`}>
                      {c.curator_status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--surface)' }}>
                    {new Date(c.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td>
                    <CuratorActionButtons curatorId={c.id} curatorName={c.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
