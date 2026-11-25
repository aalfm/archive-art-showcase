'use client';

import { useActionState, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reapplyCurator } from '@/lib/actions/curator.actions';
import {
  CURATOR_REQUIREMENTS_BODY,
  CURATOR_REQUIREMENTS_NOTE,
  CURATOR_REQUIREMENTS_TITLE,
  CV_FILE_ACCEPT,
  MAX_BACKGROUND_LENGTH,
  MAX_CV_FILE_SIZE_MB,
  MAX_SUPPORTING_NOTES_LENGTH,
  formatFileSize,
  validateCuratorCvRequirement,
  validateCvFileMeta,
  validateCvUrl,
  validatePortfolioUrl,
} from '@/lib/curator';

export default function CuratorReapplyPanel({
  user,
  latestApplication,
  nextAttemptNumber = 2,
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const [portfolioUrl, setPortfolioUrl] = useState(
    latestApplication?.portfolio_url || user?.external_link || ''
  );
  const [portfolioError, setPortfolioError] = useState('');
  const [portfolioTouched, setPortfolioTouched] = useState(false);

  const hasPreviousCvFile = Boolean(latestApplication?.cv_file_path);
  const [keepPreviousCv, setKeepPreviousCv] = useState(hasPreviousCvFile);
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState(latestApplication?.cv_url || '');
  const [cvError, setCvError] = useState('');
  const [cvTouched, setCvTouched] = useState(false);
  const cvFileInputRef = useRef(null);

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await reapplyCurator(prevState, formData);
    if (res?.success) {
      setShowForm(false);
      router.refresh();
    }
    return res;
  }, null);

  const hasAnyCvFile = Boolean(cvFile || (keepPreviousCv && hasPreviousCvFile));
  const portfolioCheck = validatePortfolioUrl(portfolioUrl, { required: true });
  const cvUrlCheck = validateCvUrl(cvUrl);
  const cvRequirementCheck = validateCuratorCvRequirement({
    hasCvFile: hasAnyCvFile,
    cvUrl,
  });

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
    setKeepPreviousCv(false);
    const urlRes = validateCvUrl(cvUrl);
    setCvError(urlRes.valid ? '' : urlRes.error);
  };

  const handleRemoveCvFile = () => {
    setCvFile(null);
    setKeepPreviousCv(false);
    if (cvFileInputRef.current) {
      cvFileInputRef.current.value = '';
    }
    if (cvTouched) {
      const check = validateCuratorCvRequirement({ hasCvFile: false, cvUrl });
      setCvError(check.valid ? '' : check.error);
    }
  };

  const handleSubmit = (e) => {
    let firstInvalidId = null;

    const pCheck = validatePortfolioUrl(portfolioUrl, { required: true });
    setPortfolioTouched(true);
    if (!pCheck.valid) {
      setPortfolioError(pCheck.error);
      firstInvalidId = 'reapply-portfolio';
    } else {
      setPortfolioError('');
    }

    const cCheck = validateCuratorCvRequirement({
      hasCvFile: hasAnyCvFile,
      cvUrl,
    });
    setCvTouched(true);
    if (!cCheck.valid) {
      setCvError(cCheck.error);
      if (!firstInvalidId) {
        firstInvalidId = cvUrl.trim() ? 'reapply-cv-url' : 'reapply-cv-file';
      }
    } else {
      setCvError('');
    }

    if (firstInvalidId) {
      e.preventDefault();
      document.getElementById(firstInvalidId)?.focus();
    }
  };

  if (!showForm) {
    return (
      <button
        type="button"
        id="btn-reapply-curator"
        className="btn-primary curator-pending-btn"
        onClick={() => setShowForm(true)}
      >
        Reapply as Curator
      </button>
    );
  }

  const showPortfolioValid = portfolioUrl.trim().length > 0 && portfolioCheck.valid && !portfolioError;
  const showCvValid =
    cvRequirementCheck.valid &&
    !cvError &&
    (hasAnyCvFile || (cvUrl.trim().length > 0 && cvUrlCheck.valid));

  return (
    <section
      className="curator-reapply-card"
      id="curator-reapply-form-section"
      aria-labelledby="curator-reapply-heading"
    >
      <div className="curator-reapply-head">
        <div>
          <span className="curator-status-kicker">APPLICATION #{nextAttemptNumber}</span>
          <h2 id="curator-reapply-heading" className="curator-reapply-title">
            Reapply as Curator
          </h2>
          <p className="curator-reapply-subtitle">
            Update your curatorial profile, portfolio link, CV, and supporting information using your existing account. Your previous review history remains preserved for reference.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary curator-reapply-cancel-top"
          onClick={() => setShowForm(false)}
          disabled={isPending}
        >
          Cancel
        </button>
      </div>

      {state?.error && (
        <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: 18 }}>
          {state.error}
        </div>
      )}

      <form action={formAction} onSubmit={handleSubmit} className="dashboard-form">
        <input type="hidden" name="keep_previous_cv" value={keepPreviousCv && !cvFile ? '1' : '0'} />

        <div className="form-group">
          <label htmlFor="reapply-name" className="form-label">Full Name *</label>
          <input
            type="text"
            id="reapply-name"
            name="name"
            className="form-input"
            defaultValue={user?.name || ''}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="portfolio-recommendation-box" role="note">
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
          <label htmlFor="reapply-portfolio" className="form-label">
            Portfolio Link <span className="form-required-mark" aria-hidden="true">*</span>
            <span className="form-required-badge">Required</span>
          </label>
          <input
            type="text"
            inputMode="url"
            id="reapply-portfolio"
            name="portfolio_url"
            className={`form-input${portfolioError ? ' is-invalid' : showPortfolioValid ? ' is-valid' : ''}`}
            placeholder="https://behance.net/username or https://your-portfolio.com"
            value={portfolioUrl}
            onChange={(e) => {
              const val = e.target.value;
              setPortfolioUrl(val);
              if (portfolioTouched || portfolioError) {
                const check = validatePortfolioUrl(val, { required: true });
                setPortfolioError(check.valid ? '' : check.error);
              }
            }}
            onBlur={() => {
              setPortfolioTouched(true);
              const check = validatePortfolioUrl(portfolioUrl, { required: true });
              setPortfolioError(check.valid ? '' : check.error);
            }}
            required
            aria-required="true"
            aria-invalid={Boolean(portfolioError)}
          />
          {portfolioError ? (
            <p className="form-field-error" role="alert">
              {portfolioError}
            </p>
          ) : showPortfolioValid ? (
            <p className="form-field-valid" role="status">
              ✓ Valid portfolio link ready for review.
            </p>
          ) : null}
        </div>

        <div className="form-group curator-cv-group">
          <label htmlFor="reapply-cv-file" className="form-label">
            Curriculum Vitae (CV) <span className="form-required-mark" aria-hidden="true">*</span>
            <span className="form-required-badge">Required (file or link)</span>
          </label>
          <p className="curator-cv-helper">
            Upload a CV document (PDF, DOC, or DOCX, max {MAX_CV_FILE_SIZE_MB} MB) or provide a CV URL below. At least one option is required.
          </p>

          <div className={`curator-cv-upload-box${hasAnyCvFile ? ' has-file' : ''}${cvError && !hasAnyCvFile && !cvUrl.trim() ? ' is-invalid' : ''}`}>
            <input
              ref={cvFileInputRef}
              type="file"
              id="reapply-cv-file"
              name="cv_file"
              accept={CV_FILE_ACCEPT}
              onChange={handleCvFileChange}
              className="curator-cv-file-input"
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
                >
                  Remove
                </button>
              </div>
            ) : keepPreviousCv && hasPreviousCvFile ? (
              <div className="curator-cv-file-chip">
                <div className="curator-cv-file-info">
                  <span className="curator-cv-file-name" title={latestApplication.cv_file_name || 'Previously uploaded CV'}>
                    {latestApplication.cv_file_name || 'Previously uploaded CV'}
                  </span>
                  <span className="curator-cv-file-size">From previous attempt</span>
                </div>
                <div className="curator-cv-chip-actions">
                  <label htmlFor="reapply-cv-file" className="btn-secondary curator-cv-remove-btn">
                    Replace
                  </label>
                  <button
                    type="button"
                    className="btn-secondary curator-cv-remove-btn"
                    onClick={handleRemoveCvFile}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="reapply-cv-file" className="curator-cv-upload-trigger">
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
            id="reapply-cv-url"
            name="cv_url"
            className={`form-input${cvError && (cvUrl.trim() || !hasAnyCvFile) ? ' is-invalid' : cvUrl.trim() && cvUrlCheck.valid ? ' is-valid' : ''}`}
            placeholder="https://drive.google.com/file/d/... or https://linkedin.com/in/..."
            value={cvUrl}
            onChange={(e) => {
              const val = e.target.value;
              setCvUrl(val);
              if (cvTouched || cvError) {
                const res = validateCuratorCvRequirement({
                  hasCvFile: hasAnyCvFile,
                  cvUrl: val,
                });
                setCvError(res.valid ? '' : res.error);
              }
            }}
            onBlur={() => {
              setCvTouched(true);
              const res = validateCuratorCvRequirement({
                hasCvFile: hasAnyCvFile,
                cvUrl,
              });
              setCvError(res.valid ? '' : res.error);
            }}
            aria-invalid={Boolean(cvError)}
          />

          {cvError ? (
            <p className="form-field-error" role="alert">
              {cvError}
            </p>
          ) : showCvValid ? (
            <p className="form-field-valid" role="status">
              ✓ CV requirement satisfied.
            </p>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="reapply-background" className="form-label">
            Curatorial Background &amp; Experience *
          </label>
          <textarea
            id="reapply-background"
            name="background"
            rows={4}
            required
            minLength={10}
            maxLength={MAX_BACKGROUND_LENGTH}
            className="form-textarea"
            defaultValue={latestApplication?.background || user?.bio || ''}
            placeholder="Describe your architectural curation experience, exhibitions, publications, or relevant background..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="reapply-supporting-notes" className="form-label">
            Supporting Information / Improvements Made (Optional)
          </label>
          <textarea
            id="reapply-supporting-notes"
            name="supporting_notes"
            rows={3}
            maxLength={MAX_SUPPORTING_NOTES_LENGTH}
            className="form-textarea"
            defaultValue=""
            placeholder="Explain what you updated based on the feedback, or include additional references and exhibition credentials..."
          />
        </div>

        <div className="curator-reapply-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowForm(false)}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            id="btn-submit-reapply"
            className="btn-primary"
            disabled={isPending}
          >
            {isPending ? 'Submitting...' : 'Submit Reapplication'}
          </button>
        </div>
      </form>
    </section>
  );
}
