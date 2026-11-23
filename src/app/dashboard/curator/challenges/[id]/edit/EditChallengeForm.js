'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateChallenge } from '@/lib/actions/challenge.actions';
import ImageUpload from '@/components/ui/ImageUpload';

export default function EditChallengeForm({ challenge }) {
  const router = useRouter();
  const [bannerUrl, setBannerUrl] = useState(challenge.banner_url || '');

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await updateChallenge(prevState, formData);
    if (res?.success) {
      router.push('/dashboard/curator/challenges');
    }
    return res;
  }, null);

  // Format dates for input datetime-local: YYYY-MM-DDTHH:MM
  const formatDatetimeLocal = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="dashboard-form-panel">
      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="dashboard-form">
        <input type="hidden" name="challenge_id" value={challenge.id} />

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
              defaultValue={challenge.title}
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
              defaultValue={challenge.prize}
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
              defaultValue={formatDatetimeLocal(challenge.start_date)}
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
              defaultValue={formatDatetimeLocal(challenge.end_date)}
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
              defaultValue={challenge.description}
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
              defaultValue={challenge.rules}
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
            {isPending ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
