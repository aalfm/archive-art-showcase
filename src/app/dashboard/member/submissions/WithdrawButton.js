'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { withdrawSubmission } from '@/lib/actions/challenge.actions';

export default function WithdrawButton({ submissionId, challengeTitle }) {
  return (
    <ConfirmActionButton
      label="Withdraw"
      title="Withdraw submission"
      message={`Are you sure you want to withdraw your submission for "${challengeTitle}"?`}
      confirmLabel="Yes, withdraw"
      buttonClass="btn-danger table-action-btn"
      buttonStyle={undefined}
      onConfirm={() => withdrawSubmission(submissionId)}
    />
  );
}
