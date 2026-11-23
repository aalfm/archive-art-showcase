'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { updateCuratorStatus } from '@/lib/actions/admin.actions';

export default function CuratorActionButtons({ curatorId, curatorName }) {
  return (
    <div style={{ display: 'inline-flex', gap: 8 }}>
      <ConfirmActionButton
        label="Approve"
        title="Approve Curator"
        message={`Confirm approval for curator account "${curatorName}"? The curator will receive full access to create challenges.`}
        confirmLabel="Approve"
        danger={false}
        buttonClass="btn-primary"
        buttonStyle={{ padding: '5px 12px', fontSize: '0.74rem' }}
        onConfirm={() => updateCuratorStatus(curatorId, 'approved')}
      />
      <ConfirmActionButton
        label="Reject"
        title="Reject Curator"
        message={`Confirm rejection for curator account "${curatorName}"?`}
        confirmLabel="Reject"
        buttonStyle={{ padding: '5px 12px', fontSize: '0.74rem' }}
        onConfirm={() => updateCuratorStatus(curatorId, 'rejected')}
      />
    </div>
  );
}
