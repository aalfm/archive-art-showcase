'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  return (
    <div className="auth-page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, textAlign: 'center', padding: 32 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.2em', color: '#fc8181', marginBottom: 12 }}>
          SOMETHING WENT WRONG
        </p>
        <h1 className="dashboard-title" style={{ fontSize: '2rem', marginBottom: 14 }}>
          SERVICE UNAVAILABLE
        </h1>
        <p style={{ color: '#b3aea3', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: 24 }}>
          An error occurred while processing this request. Ensure the PostgreSQL database connection is active and try again.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#feb2b2', background: 'rgba(197,48,48,0.15)', border: '1px solid #c53030', borderRadius: 6, padding: 12, marginBottom: 24, wordBreak: 'break-word' }}>
            {error.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => reset()} className="btn-primary">
            Try Again
          </button>
          <Link href="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
