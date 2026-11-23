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
          <h1 className="dashboard-title">ACCOUNT SETTINGS</h1>
          <p className="dashboard-subtitle">Manage the security and credentials of your ARCHIVE account.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'start' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 20 }}>
            CHANGE PASSWORD
          </h2>
          <SettingsForm />
        </div>

        <div style={{ background: '#141618', border: '1px solid var(--bg-secondary)', borderRadius: 8, padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 16 }}>
            ACCOUNT INFORMATION
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
