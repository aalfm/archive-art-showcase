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
      <span className="table-cell-protected">
        Protected
      </span>
    );
  }

  if (isActive) {
    return (
      <ConfirmActionButton
        label="Deactivate"
        title="Deactivate account"
        message={`Deactivate "${userName}" (${userRole})? This user will no longer be able to sign in or access authenticated features, while all artworks and activity data will remain preserved.`}
        confirmLabel="Deactivate account"
        danger={true}
        buttonClass="btn-danger table-action-btn"
        buttonStyle={undefined}
        buttonTitle={`Deactivate ${userName}`}
        onConfirm={() => setUserActiveStatus(userId, false)}
      />
    );
  }

  return (
    <ConfirmActionButton
      label="Activate"
      title="Activate account"
      message={`Reactivate "${userName}" (${userRole})? This user will regain sign-in access with all existing data and history intact.`}
      confirmLabel="Activate account"
      danger={false}
      buttonClass="btn-secondary table-action-btn"
      buttonStyle={undefined}
      buttonTitle={`Activate ${userName}`}
      onConfirm={() => setUserActiveStatus(userId, true)}
    />
  );
}
