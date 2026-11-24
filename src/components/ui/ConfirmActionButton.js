'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Toast, useToast } from '@/components/ui/Toast';

export default function ConfirmActionButton({
  label,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = true,
  buttonClass = 'btn-danger',
  buttonStyle = { padding: '6px 12px', fontSize: '0.78rem' },
  buttonTitle,
  onConfirm,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await onConfirm();
      if (res?.error) {
        showToast(res.error, 'error');
      } else {
        router.refresh();
      }
    } catch {
      showToast('An error occurred while processing the action.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className={buttonClass}
        style={buttonStyle}
        title={buttonTitle || label}
      >
        {loading ? '...' : label}
      </button>

      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        danger={danger}
      />

      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </>
  );
}
