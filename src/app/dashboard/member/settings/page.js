import { requireRole } from '@/lib/auth';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Account Settings — ARCHIVE',
};

export default async function MemberSettingsPage() {
  const user = await requireRole('member');

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Account Settings</h1>
          <p className="dashboard-subtitle">Manage the security and credentials of your ARCHIVE account.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 36, alignItems: 'start' }}>
        <div>
          <h2 className="dash-section-title" style={{ marginBottom: 16 }}>
            Change Password
          </h2>
          <SettingsForm />
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--bg-secondary)', borderRadius: 'var(--radius-xs)', padding: 24 }}>
          <h2 className="dash-section-title" style={{ marginBottom: 16 }}>
            Account Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Email
              </span>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{user.email}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Role
              </span>
              <p style={{ fontWeight: 600, color: 'var(--accent)', marginTop: 2, textTransform: 'uppercase' }}>{user.role}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Member Since
              </span>
              <p style={{ color: 'var(--text-primary)', marginTop: 2 }}>
                {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
