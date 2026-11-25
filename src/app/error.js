'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  return (
    <div className="auth-page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 540, textAlign: 'center', padding: 32 }}>
        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9A342D', marginBottom: 12 }}>
          Something went wrong
        </p>
        <h1 className="auth-title" style={{ fontSize: '2rem', marginBottom: 14 }}>
          Service unavailable
        </h1>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: 24 }}>
          An error occurred while processing this request. Ensure the PostgreSQL database connection is active and try again.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#991b1b', background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.35)', borderRadius: 2, padding: 12, marginBottom: 24, wordBreak: 'break-word' }}>
            {error.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
