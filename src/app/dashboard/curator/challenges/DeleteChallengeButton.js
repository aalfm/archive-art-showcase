'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { deleteChallenge } from '@/lib/actions/challenge.actions';

export default function DeleteChallengeButton({ challengeId, challengeTitle }) {
  return (
    <ConfirmActionButton
      label="Delete"
      title="Delete Challenge"
      message={`Delete challenge "${challengeTitle}" along with all its submissions? This action cannot be undone.`}
      confirmLabel="Delete Challenge"
      buttonClass="btn-secondary curator-table-btn curator-delete-btn"
      buttonStyle={{}}
      onConfirm={() => deleteChallenge(challengeId)}
    />
  );
}
