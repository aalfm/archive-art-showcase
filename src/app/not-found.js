import Link from 'next/link';
import { getCuratorDashboardPath, getSession } from '@/lib/auth';

export default async function NotFound() {
  const session = await getSession();
  const role = session?.user?.role;
  const isAdmin = role === 'admin';
  const isCurator = role === 'curator';

  return (
    <div className="auth-page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 520, textAlign: 'center', padding: 32 }}>
        <p style={{ fontSize: '0.76rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--sand-deep)', marginBottom: 12 }}>
          ERROR 404
        </p>
        <h1 className="auth-title" style={{ fontSize: '2.4rem', marginBottom: 14 }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
          The artwork, challenge, or page you are looking for may have been moved or removed.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <Link href="/dashboard/admin" className="btn-primary">
              Back to Admin Dashboard
            </Link>
          ) : isCurator ? (
            <Link href={getCuratorDashboardPath(session.user)} className="btn-primary">
              Back to Curator Dashboard
            </Link>
          ) : (
            <>
              <Link href="/" className="btn-primary">
                Back to home
              </Link>
              <Link href="/explore" className="btn-secondary">
                Explore works
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
