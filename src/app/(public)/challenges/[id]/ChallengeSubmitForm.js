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
        <h3 className="challenge-sidebar-title">Your Submission</h3>
        <div className="challenge-submit-success" role="status">
          <span className="challenge-submit-success-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <div className="challenge-submit-success-body">
            <span className="challenge-submit-success-title">Successfully Submitted</span>
            <span className="challenge-submit-success-text">
              Your artwork has been entered into this challenge.
            </span>
          </div>
        </div>
        <form action={async () => { await withdrawSubmission(userSubmission.id); }}>
          <button
            type="submit"
            className="btn-secondary challenge-sidebar-cta challenge-sidebar-cta--spaced"
            id="btn-withdraw-submission"
          >
            Withdraw Submission
          </button>
        </form>
      </div>
    );
  }

  if (memberArtworks.length === 0) {
    return (
      <div className="challenge-sidebar-card">
        <h3 className="challenge-sidebar-title">Join Challenge</h3>
        <p className="challenge-sidebar-note challenge-sidebar-note--spaced">
          You don&apos;t have any artworks yet. Upload an artwork first to join this challenge.
        </p>
        <a href="/dashboard/member/artworks/create" className="btn-primary challenge-sidebar-cta">
          Upload Artwork
        </a>
      </div>
    );
  }

  return (
    <div className="challenge-sidebar-card">
      <h3 className="challenge-sidebar-title">Join Challenge</h3>

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
          <label htmlFor="submit-artwork-select" className="form-label">Select Artwork</label>
          <FilterDropdown
            id="submit-artwork-select"
            className="challenge-artwork-dropdown"
            ariaLabel="Select Artwork"
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
          className="btn-primary challenge-sidebar-cta"
          disabled={submitPending}
          id="btn-submit-challenge"
        >
          {submitPending ? 'Submitting...' : 'Submit Artwork'}
        </button>
      </form>
    </div>
  );
}
