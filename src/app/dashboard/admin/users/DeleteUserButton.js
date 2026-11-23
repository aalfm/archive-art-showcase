'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { deleteUser } from '@/lib/actions/admin.actions';

export default function DeleteUserButton({ userId, userName, userRole, currentAdminId }) {
  if (userRole === 'admin' || userId === currentAdminId) {
    return (
      <span style={{ fontSize: '0.74rem', color: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>
        Protected
      </span>
    );
  }

  return (
    <ConfirmActionButton
      label="Delete User"
      title="Delete User"
      message={`Delete user "${userName}" (${userRole})? All artworks and activity for this user will be permanently deleted.`}
      confirmLabel="Delete Permanently"
      buttonStyle={{ padding: '5px 12px', fontSize: '0.74rem' }}
      onConfirm={() => deleteUser(userId)}
    />
  );
}
