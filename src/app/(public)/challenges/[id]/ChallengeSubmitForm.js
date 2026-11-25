'use client';

import { useActionState, useState } from 'react';
import { submitToChallenge, withdrawSubmission } from '@/lib/actions/challenge.actions';
import FilterDropdown from '@/components/ui/FilterDropdown';

export default function ChallengeSubmitForm({ challengeId, memberArtworks, userSubmission }) {
  const [submitState, submitAction, submitPending] = useActionState(submitToChallenge, null);
  const [selectedArtworkId, setSelectedArtworkId] = useState('');
  const [selectError, setSelectError] = useState('');

  const artworkOptions = memberArtworks.map((art) => ({
    value: art.id,
    label: art.title,
  }));

  if (userSubmission) {
    return (
      <div className="challenge-sidebar-card">
        <h3 className="challenge-sidebar-title">Your submission</h3>
        <div className="form-alert form-alert-success">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Your artwork has been submitted!
        </div>
        <form action={async () => { await withdrawSubmission(userSubmission.id); }}>
          <button type="submit" className="btn-secondary" style={{ width: '100%', marginTop: 12 }}
            id="btn-withdraw-submission">
            Withdraw submission
          </button>
        </form>
      </div>
    );
  }

  if (memberArtworks.length === 0) {
    return (
      <div className="challenge-sidebar-card">
        <h3 className="challenge-sidebar-title">Join challenge</h3>
        <p style={{ color: 'var(--surface)', fontSize: '0.88rem', marginBottom: 12 }}>
          You don&apos;t have any artworks yet. Upload an artwork first to join this challenge.
        </p>
        <a href="/dashboard/member/artworks/create" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
          Upload artwork
        </a>
      </div>
    );
  }

  return (
    <div className="challenge-sidebar-card">
      <h3 className="challenge-sidebar-title">Submit artwork</h3>

      {submitState?.error && (
        <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: 12 }}>
          {submitState.error}
        </div>
      )}

      <form
        action={(formData) => {
          if (!selectedArtworkId) {
            setSelectError('Please select your artwork.');
            document.getElementById('submit-artwork-select')?.focus();
            return;
          }
          submitAction(formData);
        }}
        className="auth-form"
      >
        <input type="hidden" name="challenge_id" value={challengeId} />
        <input type="hidden" name="artwork_id" value={selectedArtworkId} />
        <div className="form-group">
          <label htmlFor="submit-artwork-select" className="form-label">Select artwork</label>
          <FilterDropdown
            id="submit-artwork-select"
            className="challenge-artwork-dropdown"
            ariaLabel="Select artwork"
            value={selectedArtworkId}
            options={artworkOptions}
            placeholder="Select your artwork..."
            onSelect={(val) => {
              setSelectedArtworkId(String(val));
              setSelectError('');
            }}
          />
          {selectError && <p className="form-error">{selectError}</p>}
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={submitPending}
          id="btn-submit-challenge"
        >
          {submitPending ? 'Submitting...' : 'Submit artwork'}
        </button>
      </form>
    </div>
  );
}
