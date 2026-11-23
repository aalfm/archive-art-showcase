'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createChallenge } from '@/lib/actions/challenge.actions';
import ImageUpload from '@/components/ui/ImageUpload';

export default function CreateChallengeForm() {
  const router = useRouter();
  const [bannerUrl, setBannerUrl] = useState('');

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await createChallenge(prevState, formData);
    if (res?.success) {
      router.push('/dashboard/curator/challenges');
    }
    return res;
  }, null);

  return (
    <div className="dashboard-form-panel">
      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="dashboard-form">
        <div className="form-group">
          <label className="form-label">Challenge Banner *</label>
          <ImageUpload
            currentImage={bannerUrl}
            onUpload={(url) => setBannerUrl(url)}
            name="banner_url"
          />
        </div>

        <div className="dashboard-form-grid-2">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Challenge Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g., ARCHITECTURAL SPECULATIONS 2026"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prize" className="form-label">Prize / Award *</label>
            <input
              id="prize"
              name="prize"
              type="text"
              className="form-input"
              placeholder="e.g., $1,500 + Basel Exhibition"
              required
            />
          </div>
        </div>

        <div className="dashboard-form-grid-2">
          <div className="form-group">
            <label htmlFor="start_date" className="form-label">Start Date *</label>
            <input
              id="start_date"
              name="start_date"
              type="datetime-local"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="end_date" className="form-label">End Date *</label>
            <input
              id="end_date"
              name="end_date"
              type="datetime-local"
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="dashboard-form-grid-2">
          <div className="form-group">
            <label htmlFor="description" className="form-label">Challenge Description *</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              className="form-textarea"
              placeholder="Describe the background, curatorial theme, and general criteria of the challenge..."
              required
              minLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rules" className="form-label">Rules (One rule per line) *</label>
            <textarea
              id="rules"
              name="rules"
              rows={6}
              className="form-textarea"
              placeholder="Work must be original and never have won another competition.&#10;Minimum resolution 4K (3840x2160).&#10;Include a concept statement of at least 100 words."
              required
            />
          </div>
        </div>

        <div className="dashboard-form-actions">
          <button
            type="submit"
            className="btn-primary dashboard-submit-btn"
            disabled={isPending || !bannerUrl}
          >
            {isPending ? 'Publishing Challenge...' : 'Publish Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
}
