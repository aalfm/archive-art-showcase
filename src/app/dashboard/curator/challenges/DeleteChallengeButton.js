'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { deleteChallenge } from '@/lib/actions/challenge.actions';

export default function DeleteChallengeButton({ challengeId, challengeTitle }) {
  return (
    <ConfirmActionButton
      label="Delete"
      title="Delete challenge"
      message={`Delete challenge "${challengeTitle}" along with all its submissions? This action cannot be undone.`}
      confirmLabel="Delete challenge"
      buttonClass="btn-secondary table-action-btn curator-delete-btn"
      buttonStyle={{}}
      onConfirm={() => deleteChallenge(challengeId)}
    />
  );
}
