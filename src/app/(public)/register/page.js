'use client';

import { useActionState, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/actions/auth.actions';
import PasswordInput from '@/components/ui/PasswordInput';
import {
  CURATOR_REQUIREMENTS_BODY,
  CURATOR_REQUIREMENTS_NOTE,
  CURATOR_REQUIREMENTS_TITLE,
  CV_FILE_ACCEPT,
  MAX_BACKGROUND_LENGTH,
  MAX_CV_FILE_SIZE_MB,
  formatFileSize,
  validateCuratorCvRequirement,
  validateCvFileMeta,
  validateCvUrl,
  validatePortfolioUrl,
} from '@/lib/curator';

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'curator' ? 'curator' : 'member';
  const [state, formAction, isPending] = useActionState(registerUser, null);
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioError, setPortfolioError] = useState('');
  const [portfolioTouched, setPortfolioTouched] = useState(false);

  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState('');
  const [cvError, setCvError] = useState('');
  const [cvUrlTouched, setCvUrlTouched] = useState(false);
  const cvFileInputRef = useRef(null);

  const portfolioValidation = validatePortfolioUrl(portfolioUrl, { required: true });
  const cvUrlValidation = validateCvUrl(cvUrl);
  const cvRequirementCheck = validateCuratorCvRequirement({
    hasCvFile: Boolean(cvFile),
    cvUrl,
  });

  const handlePortfolioBlur = () => {
    setPortfolioTouched(true);
    const result = validatePortfolioUrl(portfolioUrl, { required: true });
    setPortfolioError(result.valid ? '' : result.error);
  };

  const handleCvFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setCvFile(null);
      return;
    }

    const check = validateCvFileMeta(file);
    if (!check.valid) {
      setCvFile(null);
      setCvError(check.error);
      if (cvFileInputRef.current) {
        cvFileInputRef.current.value = '';
      }
      return;
    }

    setCvFile(file);
    // Keep any cvUrl format error if an invalid link is currently typed
    const urlCheck = validateCvUrl(cvUrl);
    setCvError(urlCheck.valid ? '' : urlCheck.error);
  };

  const handleRemoveCvFile = () => {
    setCvFile(null);
    if (cvFileInputRef.current) {
      cvFileInputRef.current.value = '';
    }
    if (cvUrlTouched) {
      const check = validateCuratorCvRequirement({ hasCvFile: false, cvUrl });
      setCvError(check.valid ? '' : check.error);
    }
  };

  const handleCvUrlBlur = () => {
    setCvUrlTouched(true);
    if (cvUrl.trim()) {
      const check = validateCvUrl(cvUrl);
      setCvError(check.valid ? '' : check.error);
    } else if (!cvFile) {
      const reqCheck = validateCuratorCvRequirement({ hasCvFile: false, cvUrl: '' });
      setCvError(reqCheck.error);
    } else {
      setCvError('');
    }
  };

  const handleFormSubmit = (e) => {
    if (selectedRole !== 'curator') return;

    let firstInvalidId = null;

    const pCheck = validatePortfolioUrl(portfolioUrl, { required: true });
    setPortfolioTouched(true);
    if (!pCheck.valid) {
      setPortfolioError(pCheck.error);
      firstInvalidId = 'register-portfolio';
    } else {
      setPortfolioError('');
    }

    const cCheck = validateCuratorCvRequirement({
      hasCvFile: Boolean(cvFile),
      cvUrl,
    });
    setCvUrlTouched(true);
    if (!cCheck.valid) {
      setCvError(cCheck.error);
      if (!firstInvalidId) {
        firstInvalidId = cvUrl.trim() ? 'register-cv-url' : 'register-cv-file';
      }
    } else {
      setCvError('');
    }

    if (firstInvalidId) {
      e.preventDefault();
      document.getElementById(firstInvalidId)?.focus();
    }
  };

  const showPortfolioValid =
    selectedRole === 'curator' &&
    portfolioUrl.trim().length > 0 &&
    portfolioValidation.valid &&
    !portfolioError;

  const showCvValid =
    selectedRole === 'curator' &&
    cvRequirementCheck.valid &&
    !cvError &&
    (Boolean(cvFile) || (cvUrl.trim().length > 0 && cvUrlValidation.valid));

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <h1 className="auth-title">ARCHIVE</h1>
          <p className="auth-subtitle">Join the digital art community</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-heading">Create Account</h2>

          <div className="role-selector" role="group" aria-label="Choose account type">
            <button
              type="button"
              className={`role-option ${selectedRole === 'member' ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole('member');
                setPortfolioError('');
                setCvError('');
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
              <label htmlFor="register-name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="register-name"
                name="name"
                className="form-input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">Email Address *</label>
              <input
                type="email"
                id="register-email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">Password *</label>
              <PasswordInput
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
                <div className="portfolio-recommendation-box" id="curator-requirements-box" role="note">
                  <p className="portfolio-recommendation-title">
                    {CURATOR_REQUIREMENTS_TITLE}
                  </p>
                  <p className="portfolio-recommendation-body">
                    {CURATOR_REQUIREMENTS_BODY}
                  </p>
                  <p className="portfolio-recommendation-note">
                    {CURATOR_REQUIREMENTS_NOTE}
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="register-portfolio" className="form-label">
                    Portfolio Link <span className="form-required-mark" aria-hidden="true">*</span>
                    <span className="form-required-badge">Required</span>
                  </label>
                  <input
                    type="text"
                    inputMode="url"
                    id="register-portfolio"
                    name="external_link"
                    className={`form-input${portfolioError ? ' is-invalid' : showPortfolioValid ? ' is-valid' : ''}`}
                    placeholder="https://behance.net/username or https://your-portfolio.com"
                    value={portfolioUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPortfolioUrl(val);
                      if (portfolioTouched || portfolioError) {
                        const res = validatePortfolioUrl(val, { required: true });
                        setPortfolioError(res.valid ? '' : res.error);
                      }
                    }}
                    onBlur={handlePortfolioBlur}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(portfolioError)}
                    aria-describedby="register-portfolio-feedback"
                  />
                  {portfolioError ? (
                    <p id="register-portfolio-feedback" className="form-field-error" role="alert">
                      {portfolioError}
                    </p>
                  ) : showPortfolioValid ? (
                    <p id="register-portfolio-feedback" className="form-field-valid" role="status">
                      ✓ Valid portfolio link ready for review.
                    </p>
                  ) : null}
                </div>

                <div className="form-group curator-cv-group" id="curator-cv-section">
                  <label htmlFor="register-cv-file" className="form-label">
                    Curriculum Vitae (CV) <span className="form-required-mark" aria-hidden="true">*</span>
                    <span className="form-required-badge">Required (file or link)</span>
                  </label>
                  <p className="curator-cv-helper">
                    Upload a CV document (PDF, DOC, or DOCX, max {MAX_CV_FILE_SIZE_MB} MB) or provide a CV URL below. At least one option is required.
                  </p>

                  <div className={`curator-cv-upload-box${cvFile ? ' has-file' : ''}${cvError && !cvFile && !cvUrl.trim() ? ' is-invalid' : ''}`}>
                    <input
                      ref={cvFileInputRef}
                      type="file"
                      id="register-cv-file"
                      name="cv_file"
                      accept={CV_FILE_ACCEPT}
                      onChange={handleCvFileChange}
                      className="curator-cv-file-input"
                      aria-describedby="register-cv-feedback"
                    />
                    {cvFile ? (
                      <div className="curator-cv-file-chip">
                        <div className="curator-cv-file-info">
                          <span className="curator-cv-file-name" title={cvFile.name}>
                            {cvFile.name}
                          </span>
                          <span className="curator-cv-file-size">
                            {formatFileSize(cvFile.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary curator-cv-remove-btn"
                          onClick={handleRemoveCvFile}
                          id="btn-remove-register-cv"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="register-cv-file" className="curator-cv-upload-trigger">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>Choose CV file (PDF, DOC, DOCX)</span>
                      </label>
                    )}
                  </div>

                  <div className="curator-cv-divider" aria-hidden="true">
                    <span>or provide a CV link</span>
                  </div>

                  <input
                    type="text"
                    inputMode="url"
                    id="register-cv-url"
                    name="cv_url"
                    className={`form-input${cvError && (cvUrl.trim() || !cvFile) ? ' is-invalid' : cvUrl.trim() && cvUrlValidation.valid ? ' is-valid' : ''}`}
                    placeholder="https://drive.google.com/file/d/... or https://linkedin.com/in/..."
                    value={cvUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCvUrl(val);
                      if (cvUrlTouched || cvError) {
                        const res = validateCuratorCvRequirement({
                          hasCvFile: Boolean(cvFile),
                          cvUrl: val,
                        });
                        setCvError(res.valid ? '' : res.error);
                      }
                    }}
                    onBlur={handleCvUrlBlur}
                    aria-invalid={Boolean(cvError)}
                    aria-describedby="register-cv-feedback"
                  />

                  {cvError ? (
                    <p id="register-cv-feedback" className="form-field-error" role="alert">
                      {cvError}
                    </p>
                  ) : showCvValid ? (
                    <p id="register-cv-feedback" className="form-field-valid" role="status">
                      ✓{' '}
                      {cvFile && cvUrl.trim()
                        ? `CV file (${cvFile.name}) and CV link ready for review.`
                        : cvFile
                          ? `CV file attached (${cvFile.name}).`
                          : 'Valid CV link ready for review.'}
                    </p>
                  ) : null}
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
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your curatorial experience, architectural practice, or art institution..."
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
              disabled={isPending}
              id="btn-register-submit"
            >
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner-sm"></span>
                  Registering...
                </span>
              ) : selectedRole === 'curator' ? 'Register as Curator' : 'Register as Member'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--surface)', fontSize: '0.88rem' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
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
