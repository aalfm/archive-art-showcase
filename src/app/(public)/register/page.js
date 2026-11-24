'use client';

import { useActionState, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/actions/auth.actions';
import {
  MAX_BACKGROUND_LENGTH,
  PORTFOLIO_RECOMMENDATION_BODY,
  PORTFOLIO_RECOMMENDATION_NOTE,
  PORTFOLIO_RECOMMENDATION_TITLE,
  validatePortfolioUrl,
} from '@/lib/curator';

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'curator' ? 'curator' : 'member';
  const [state, formAction, isPending] = useActionState(registerUser, null);
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioError, setPortfolioError] = useState('');

  const handlePortfolioBlur = () => {
    const result = validatePortfolioUrl(portfolioUrl);
    setPortfolioError(result.valid ? '' : result.error);
  };

  const handleFormSubmit = (e) => {
    if (selectedRole === 'curator') {
      const result = validatePortfolioUrl(portfolioUrl);
      if (!result.valid) {
        e.preventDefault();
        setPortfolioError(result.error);
        document.getElementById('register-portfolio')?.focus();
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1 className="auth-title">ARCHIVE</h1>
          <p className="auth-subtitle">Join the digital art community</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-heading">Create Account</h2>

          {/* Role Selector */}
          <div className="role-selector" role="group" aria-label="Choose account type">
            <button
              type="button"
              className={`role-option ${selectedRole === 'member' ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole('member');
                setPortfolioError('');
              }}
              aria-pressed={selectedRole === 'member'}
              id="role-member"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <div>
                <strong>Member</strong>
                <small>Upload artworks &amp; join challenges</small>
              </div>
            </button>
            <button
              type="button"
              className={`role-option ${selectedRole === 'curator' ? 'active' : ''}`}
              onClick={() => setSelectedRole('curator')}
              aria-pressed={selectedRole === 'curator'}
              id="role-curator"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
              <div>
                <strong>Curator</strong>
                <small>Host challenges &amp; curate artworks</small>
              </div>
            </button>
          </div>

          {selectedRole === 'curator' && (
            <div className="form-alert form-alert-info" role="note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Curator accounts require admin approval before full access is granted.
            </div>
          )}

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

          <form action={formAction} onSubmit={handleFormSubmit} className="auth-form">
            <input type="hidden" name="role" value={selectedRole} />

            <div className="form-group">
              <label htmlFor="register-name" className="form-label">Full Name</label>
              <input
                type="text"
                id="register-name"
                name="name"
                className="form-input"
                placeholder="Your full name"
                required
                minLength={2}
                maxLength={100}
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">Email</label>
              <input
                type="email"
                id="register-email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">Password</label>
              <input
                type="password"
                id="register-password"
                name="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                aria-required="true"
              />
            </div>

            {selectedRole === 'curator' && (
              <>
                <div className="form-group">
                  <div className="portfolio-recommendation-box" id="curator-portfolio-recommendation" role="note">
                    <p className="portfolio-recommendation-title">
                      {PORTFOLIO_RECOMMENDATION_TITLE}
                    </p>
                    <p className="portfolio-recommendation-body">
                      {PORTFOLIO_RECOMMENDATION_BODY}
                    </p>
                    <p className="portfolio-recommendation-note">
                      {PORTFOLIO_RECOMMENDATION_NOTE}
                    </p>
                  </div>

                  <label htmlFor="register-portfolio" className="form-label">
                    Curatorial Portfolio Link (Optional)
                  </label>
                  <input
                    type="text"
                    inputMode="url"
                    id="register-portfolio"
                    name="external_link"
                    className={`form-input${portfolioError ? ' is-invalid' : ''}`}
                    placeholder="https://behance.net/username or https://your-portfolio.com"
                    value={portfolioUrl}
                    onChange={(e) => {
                      setPortfolioUrl(e.target.value);
                      if (portfolioError) setPortfolioError('');
                    }}
                    onBlur={handlePortfolioBlur}
                    aria-invalid={Boolean(portfolioError)}
                    aria-describedby="curator-portfolio-recommendation register-portfolio-error"
                  />
                  {portfolioError && (
                    <p id="register-portfolio-error" className="form-field-error" role="alert">
                      {portfolioError}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="register-bio" className="form-label">
                    Curatorial Background (Optional)
                  </label>
                  <textarea
                    id="register-bio"
                    name="bio"
                    rows={3}
                    maxLength={MAX_BACKGROUND_LENGTH}
                    className="form-textarea"
                    placeholder="Tell us about your curatorial experience, architectural practice, or art institution..."
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', letterSpacing: '0.08em' }}
              disabled={isPending}
              id="btn-register-submit"
            >
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner-sm"></span>
                  Registering...
                </span>
              ) : `REGISTER AS ${selectedRole.toUpperCase()}`}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--surface)', fontSize: '0.88rem' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="loading-page">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
