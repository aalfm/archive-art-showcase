'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { withdrawSubmission } from '@/lib/actions/challenge.actions';

export default function WithdrawButton({ submissionId, challengeTitle }) {
  return (
    <ConfirmActionButton
      label="Withdraw"
      title="Withdraw Submission"
      message={`Are you sure you want to withdraw your submission for "${challengeTitle}"?`}
      confirmLabel="Yes, Withdraw"
      onConfirm={() => withdrawSubmission(submissionId)}
    />
  );
}
