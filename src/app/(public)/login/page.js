'use client';

import { Suspense, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/actions/auth.actions';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const [state, formAction, isPending] = useActionState(loginUser, null);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1 className="auth-title">ARCHIVE</h1>
          <p className="auth-subtitle">Digital art showcase platform</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-desc">Sign in to your ARCHIVE account</p>

          {state?.error && (
            <div className="form-alert form-alert-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {state.error}
            </div>
          )}

          <form action={formAction} className="auth-form">
            {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <input
                type="email"
                id="login-email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input
                type="password"
                id="login-password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
              disabled={isPending}
              id="btn-login-submit"
            >
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner-sm"></span>
                  Verifying...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-links">
            <p>Don&apos;t have an account?</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/register?role=member" className="btn-secondary" style={{ flex: 1 }}>
                Register as member
              </Link>
              <Link href="/register?role=curator" className="btn-secondary" style={{ flex: 1 }}>
                Register as curator
              </Link>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="auth-demo-hint">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--surface)', textAlign: 'center', marginTop: 20, lineHeight: 1.8 }}>
              Demo: admin@arthive.com / Admin@123<br/>
              kurator@arthive.com / Curator@123<br/>
              member@arthive.com / Member@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading-page">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
