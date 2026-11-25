'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reapplyCurator } from '@/lib/actions/curator.actions';
import {
  MAX_BACKGROUND_LENGTH,
  MAX_SUPPORTING_NOTES_LENGTH,
  PORTFOLIO_RECOMMENDATION_BODY,
  PORTFOLIO_RECOMMENDATION_NOTE,
  PORTFOLIO_RECOMMENDATION_TITLE,
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

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await reapplyCurator(prevState, formData);
    if (res?.success) {
      setShowForm(false);
      router.refresh();
    }
    return res;
  }, null);

  const handleSubmit = (e) => {
    const check = validatePortfolioUrl(portfolioUrl);
    if (!check.valid) {
      e.preventDefault();
      setPortfolioError(check.error);
      document.getElementById('reapply-portfolio')?.focus();
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
        Reapply as curator
      </button>
    );
  }

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
            Reapply as curator
          </h2>
          <p className="curator-reapply-subtitle">
            Update your curatorial profile, portfolio link, and supporting information using your existing account. Your previous review history remains preserved for reference.
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
        <div className="form-group">
          <label htmlFor="reapply-name" className="form-label">Full name *</label>
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

        <div className="form-group">
          <div className="portfolio-recommendation-box" role="note">
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

          <label htmlFor="reapply-portfolio" className="form-label">
            Portfolio link (optional)
          </label>
          <input
            type="text"
            inputMode="url"
            id="reapply-portfolio"
            name="portfolio_url"
            className={`form-input${portfolioError ? ' is-invalid' : ''}`}
            placeholder="https://behance.net/username or https://your-portfolio.com"
            value={portfolioUrl}
            onChange={(e) => {
              setPortfolioUrl(e.target.value);
              if (portfolioError) setPortfolioError('');
            }}
            onBlur={() => {
              const check = validatePortfolioUrl(portfolioUrl);
              setPortfolioError(check.valid ? '' : check.error);
            }}
            aria-invalid={Boolean(portfolioError)}
          />
          {portfolioError && (
            <p className="form-field-error" role="alert">
              {portfolioError}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reapply-background" className="form-label">
            Curatorial background &amp; experience *
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
            Supporting information / improvements made (optional)
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
            {isPending ? 'Submitting...' : 'Submit reapplication'}
          </button>
        </div>
      </form>
    </section>
  );
}
