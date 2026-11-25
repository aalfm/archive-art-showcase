'use client';

import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clearWinner, selectWinner } from '@/lib/actions/challenge.actions';
import { Toast, useToast } from '@/components/ui/Toast';

export default function WinnerSelectControl({
  challengeId,
  submissionId,
  currentRank,
  currentNote = '',
  hasEnded,
  artworkStatus = 'active',
}) {
  const router = useRouter();
  const [selectedRank, setSelectedRank] = useState(currentRank ? String(currentRank) : '');
  const [winnerNote, setWinnerNote] = useState(currentNote || '');
  const [isClearing, startClearTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await selectWinner(prevState, formData);
    if (res?.error) {
      showToast(res.error, 'error');
    } else if (res?.success) {
      showToast('Winner result updated.', 'success');
      router.refresh();
    }
    return res;
  }, null);

  if (!hasEnded) {
    return (
      <span className="table-cell-meta">
        Awaiting completion
      </span>
    );
  }

  if (artworkStatus !== 'active') {
    return (
      <span className="table-cell-meta">
        Artwork unavailable
      </span>
    );
  }

  const handleClear = () => {
    startClearTransition(async () => {
      const res = await clearWinner(challengeId, submissionId);
      if (res?.error) {
        showToast(res.error, 'error');
      } else if (res?.success) {
        setSelectedRank('');
        setWinnerNote('');
        showToast('Winner assignment removed.', 'success');
        router.refresh();
      }
    });
  };

  return (
    <>
      <form action={formAction} className="winner-select-form">
        <input type="hidden" name="challenge_id" value={challengeId} />
        <input type="hidden" name="submission_id" value={submissionId} />

        <div className="winner-select-row">
          <select
            name="rank"
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="form-select winner-select-input"
            aria-label="Winner placement"
            required
          >
            <option value="">Select place...</option>
            <option value="1">1st Place</option>
            <option value="2">2nd Place</option>
            <option value="3">3rd Place</option>
          </select>

          <button
            type="submit"
            className="btn-primary table-action-btn"
            disabled={isPending || isClearing || !selectedRank}
          >
            {isPending ? 'Saving...' : currentRank ? 'Update' : 'Assign'}
          </button>

          {currentRank && (
            <button
              type="button"
              className="btn-secondary table-action-btn"
              onClick={handleClear}
              disabled={isPending || isClearing}
            >
              {isClearing ? '...' : 'Clear'}
            </button>
          )}
        </div>

        <input
          type="text"
          name="winner_note"
          value={winnerNote}
          onChange={(e) => setWinnerNote(e.target.value)}
          maxLength={400}
          placeholder="Selection note (optional)..."
          aria-label="Winner selection note"
          className="form-input winner-note-input"
        />

        {state?.error && (
          <span className="form-error" style={{ fontSize: '0.74rem', marginTop: 0 }}>
            {state.error}
          </span>
        )}
      </form>

      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </>
  );
}
