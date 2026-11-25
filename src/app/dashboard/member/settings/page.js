import { requireRole } from '@/lib/auth';
import { formatRoleLabel } from '@/lib/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Account Settings — ARCHIVE',
};

export default async function MemberSettingsPage() {
  const user = await requireRole('member');

  return (
    <div className="member-form-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/member' },
          { label: 'Settings' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Account Settings</h1>
          <p className="dashboard-subtitle">Manage the security and credentials of your ARCHIVE account.</p>
        </div>
      </div>

      <div className="member-settings-grid">
        <section className="member-settings-card">
          <h2 className="dash-section-title member-settings-card-title">
            Change Password
          </h2>
          <SettingsForm />
        </section>

        <section className="member-settings-card">
          <h2 className="dash-section-title member-settings-card-title">
            Account Information
          </h2>
          <div className="member-settings-meta-list">
            <div className="member-settings-meta-item">
              <span className="member-settings-meta-label">Email</span>
              <p className="member-settings-meta-value">{user.email}</p>
            </div>
            <div className="member-settings-meta-item">
              <span className="member-settings-meta-label">Role</span>
              <p className="member-settings-meta-value is-accent">{formatRoleLabel(user.role)}</p>
            </div>
            <div className="member-settings-meta-item">
              <span className="member-settings-meta-label">Member Since</span>
              <p className="member-settings-meta-value">
                {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
