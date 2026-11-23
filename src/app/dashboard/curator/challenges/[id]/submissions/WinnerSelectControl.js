'use client';

import { useActionState, useState } from 'react';
import { selectWinner } from '@/lib/actions/challenge.actions';

export default function WinnerSelectControl({ challengeId, submissionId, currentRank, hasEnded }) {
  const [selectedRank, setSelectedRank] = useState(currentRank || '');

  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await selectWinner(prevState, formData);
    return res;
  }, null);

  if (!hasEnded) {
    return (
      <span style={{ fontSize: '0.78rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>
        Awaiting Period End
      </span>
    );
  }

  return (
    <form action={formAction} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <input type="hidden" name="challenge_id" value={challengeId} />
      <input type="hidden" name="submission_id" value={submissionId} />

      <select
        name="rank"
        value={selectedRank}
        onChange={(e) => setSelectedRank(e.target.value)}
        className="form-select"
        style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
        required
      >
        <option value="">Select Rank...</option>
        <option value="1">🥇 1st Place</option>
        <option value="2">🥈 2nd Place</option>
        <option value="3">🥉 3rd Place</option>
      </select>

      <button
        type="submit"
        className="btn-primary"
        disabled={isPending || !selectedRank}
        style={{ padding: '5px 12px', fontSize: '0.76rem' }}
      >
        {isPending ? '...' : 'Assign'}
      </button>

      {state?.error && (
        <span className="form-error" style={{ fontSize: '0.74rem', marginTop: 0 }}>{state.error}</span>
      )}
    </form>
  );
}
