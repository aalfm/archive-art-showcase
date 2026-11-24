import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="auth-page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 520, textAlign: 'center', padding: 32 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.2em', color: 'var(--sand-deep)', marginBottom: 12 }}>
          ERROR 404
        </p>
        <h1 className="auth-title" style={{ fontSize: '2.4rem', marginBottom: 14 }}>
          PAGE NOT FOUND
        </h1>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
          The artwork, challenge, or page you are looking for may have been moved or removed.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/explore" className="btn-secondary">
            Explore Works
          </Link>
        </div>
      </div>
    </div>
  );
}
