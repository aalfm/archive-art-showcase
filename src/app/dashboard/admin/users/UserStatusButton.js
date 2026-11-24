'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { setUserActiveStatus } from '@/lib/actions/admin.actions';

export default function UserStatusButton({
  userId,
  userName,
  userRole,
  isActive = true,
  currentAdminId,
}) {
  if (userRole === 'admin' || userId === currentAdminId) {
    return (
      <span style={{ fontSize: '0.74rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>
        Protected
      </span>
    );
  }

  if (isActive) {
    return (
      <ConfirmActionButton
        label="Deactivate"
        title="Deactivate Account"
        message={`Deactivate "${userName}" (${userRole})? This user will no longer be able to sign in or access authenticated features, while all artworks and activity data will remain preserved.`}
        confirmLabel="Deactivate Account"
        danger={true}
        buttonClass="btn-danger"
        buttonStyle={{ padding: '5px 12px', fontSize: '0.74rem' }}
        buttonTitle={`Deactivate ${userName}`}
        onConfirm={() => setUserActiveStatus(userId, false)}
      />
    );
  }

  return (
    <ConfirmActionButton
      label="Activate"
      title="Activate Account"
      message={`Reactivate "${userName}" (${userRole})? This user will regain sign-in access with all existing data and history intact.`}
      confirmLabel="Activate Account"
      danger={false}
      buttonClass="btn-secondary"
      buttonStyle={{ padding: '5px 12px', fontSize: '0.74rem' }}
      buttonTitle={`Activate ${userName}`}
      onConfirm={() => setUserActiveStatus(userId, true)}
    />
  );
}
