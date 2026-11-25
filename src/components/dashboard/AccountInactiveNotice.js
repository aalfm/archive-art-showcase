import Link from 'next/link';
import { logoutUser } from '@/lib/actions/auth.actions';

export default function AccountInactiveNotice({ user }) {
  return (
    <section
      className="account-inactive-page"
      aria-labelledby="account-inactive-heading"
      role="alert"
    >
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Account Status</h1>
          <p className="dashboard-subtitle">
            Informasi status keaktifan akun ARCHIVE Anda.
          </p>
        </div>
      </div>

      <div className="account-inactive-card" id="member-account-inactive-notice">
        <div className="account-inactive-head">
          <div className="account-inactive-icon" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>

          <span className="account-inactive-badge" id="account-inactive-label">
            <span className="account-inactive-dot" aria-hidden="true" />
            <span>ACCOUNT INACTIVE</span>
          </span>
        </div>

        <h2 id="account-inactive-heading" className="account-inactive-title">
          Akses Akun Dinonaktifkan
        </h2>

        <p className="account-inactive-desc" id="account-inactive-message">
          Akun Anda saat ini dinonaktifkan oleh administrator. Anda tidak dapat menggunakan fitur
          yang memerlukan autentikasi selama status akun masih nonaktif.
        </p>

        <div className="account-inactive-meta">
          <div className="account-inactive-meta-item">
            <span className="account-inactive-meta-label">Account</span>
            <span className="account-inactive-meta-value">{user.name}</span>
          </div>
          <div className="account-inactive-meta-item">
            <span className="account-inactive-meta-label">Email</span>
            <span className="account-inactive-meta-value">{user.email}</span>
          </div>
          <div className="account-inactive-meta-item">
            <span className="account-inactive-meta-label">Status</span>
            <span className="account-inactive-meta-value is-inactive">Inactive</span>
          </div>
        </div>

        <p className="account-inactive-note">
          Seluruh karya, profil, dan riwayat aktivitas Anda tetap tersimpan dengan aman. Pengaktifan
          kembali akun hanya dapat dilakukan oleh administrator ARCHIVE.
        </p>

        <div className="account-inactive-actions">
          {user.role !== 'admin' && user.role !== 'curator' && (
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          )}
          <form action={logoutUser}>
            <button type="submit" className="btn-primary">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
