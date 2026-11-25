'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateChallenge } from '@/lib/actions/challenge.actions';
import ChallengeTitleField, {
  useChallengeTitleValidation,
} from '@/components/dashboard/ChallengeTitleField';
import ImageUpload from '@/components/ui/ImageUpload';

function formatDatetimeLocal(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function EditChallengeForm({ challenge, existingChallenges = [] }) {
  const router = useRouter();
  const [bannerUrl, setBannerUrl] = useState(challenge.banner_url || '');
  const [prize, setPrize] = useState(challenge.prize || '');
  const [startDate, setStartDate] = useState(() => formatDatetimeLocal(challenge.start_date));
  const [endDate, setEndDate] = useState(() => formatDatetimeLocal(challenge.end_date));
  const [description, setDescription] = useState(challenge.description || '');
  const [rules, setRules] = useState(challenge.rules || '');

  const {
    title,
    setTitle,
    isDuplicate,
    titleError,
    markServerDuplicate,
  } = useChallengeTitleValidation({
    initialTitle: challenge.title || '',
    existingChallenges,
    excludeChallengeId: challenge.id,
  });

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await updateChallenge(prevState, formData);
    if (res?.code === 'DUPLICATE_CHALLENGE_NAME') {
      markServerDuplicate(formData.get('title')?.toString() || '');
    }
    if (res?.success) {
      router.push(`/dashboard/curator/challenges/${challenge.id}`);
      router.refresh();
    }
    return res;
  }, null);

  const handleFormSubmit = (e) => {
    if (isDuplicate) {
      e.preventDefault();
      document.getElementById('title')?.focus();
    }
  };

  return (
    <div className="dashboard-form-panel curator-form-card">
      {state?.error && state?.code !== 'DUPLICATE_CHALLENGE_NAME' && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} onSubmit={handleFormSubmit} className="dashboard-form">
        <input type="hidden" name="challenge_id" value={challenge.id} />

        <div className="form-group">
          <label className="form-label">Challenge Banner *</label>
          <ImageUpload
            currentImage={bannerUrl}
            onUpload={(url) => setBannerUrl(url)}
            name="banner_url"
            label="challenge banner"
          />
        </div>

        <div className="dashboard-form-grid-2">
          <ChallengeTitleField
            value={title}
            onChange={setTitle}
            error={titleError}
          />

          <div className="form-group">
            <label htmlFor="prize" className="form-label">Prize / Award *</label>
            <input
              id="prize"
              name="prize"
              type="text"
              className="form-input"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rules" className="form-label">Rules (One Rule Per Line) *</label>
            <textarea
              id="rules"
              name="rules"
              rows={6}
              className="form-textarea"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="dashboard-form-actions">
          <button
            type="submit"
            className="btn-primary dashboard-submit-btn"
            disabled={isPending || !bannerUrl || isDuplicate}
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
