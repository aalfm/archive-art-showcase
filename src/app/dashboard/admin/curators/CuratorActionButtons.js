'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { Toast, useToast } from '@/components/ui/Toast';
import { updateCuratorStatus } from '@/lib/actions/admin.actions';
import {
  MAX_REJECTION_REASON_LENGTH,
  REJECTION_REASON_EXAMPLES,
  validateRejectionReason,
} from '@/lib/curator';

export default function CuratorActionButtons({
  curatorId,
  curatorName,
  attemptNumber = 1,
}) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleOpenReject = () => {
    setReason('');
    setReasonError('');
    setRejectOpen(true);
  };

  const handleCloseReject = () => {
    if (submitting) return;
    setRejectOpen(false);
    setReasonError('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    const check = validateRejectionReason(reason);
    if (!check.valid) {
      setReasonError(check.error);
      document.getElementById(`reject-reason-input-${curatorId}`)?.focus();
      return;
    }

    setSubmitting(true);
    setReasonError('');
    try {
      const res = await updateCuratorStatus(curatorId, 'rejected', check.value);
      if (res?.error) {
        setReasonError(res.error);
        showToast(res.error, 'error');
      } else {
        setRejectOpen(false);
        setReason('');
        showToast(`Application for ${curatorName} has been rejected.`, 'success');
        router.refresh();
      }
    } catch {
      setReasonError('An error occurred while rejecting this application.');
      showToast('An error occurred while rejecting this application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <ConfirmActionButton
        label="Approve"
        title="Approve Curator Application"
        message={`Approve "${curatorName}" (Application #${attemptNumber})? The user will immediately gain full Curator access to create and manage challenges.`}
        confirmLabel="Approve"
        danger={false}
        buttonClass="btn-primary"
        buttonStyle={{ padding: '6px 12px', fontSize: '0.74rem' }}
        onConfirm={() => updateCuratorStatus(curatorId, 'approved')}
      />

      <button
        type="button"
        className="btn-danger"
        style={{ padding: '6px 12px', fontSize: '0.74rem' }}
        onClick={handleOpenReject}
        id={`btn-reject-curator-${curatorId}`}
      >
        Reject
      </button>

      <Modal
        isOpen={rejectOpen}
        onClose={handleCloseReject}
        title="Reject Curator Application"
        size="md"
      >
        <form onSubmit={handleConfirmReject} noValidate className="reject-curator-form">
          <p className="reject-curator-intro">
            You are rejecting the curator application for <strong>{curatorName}</strong> (Application #{attemptNumber}).
            Please enter a clear reason so the applicant understands what to improve if they reapply.
          </p>

          <div className="form-group">
            <div className="reject-reason-label-row">
              <label htmlFor={`reject-reason-input-${curatorId}`} className="form-label">
                Reason for Rejection *
              </label>
              <span className="reject-reason-counter">
                {reason.length}/{MAX_REJECTION_REASON_LENGTH}
              </span>
            </div>

            <textarea
              id={`reject-reason-input-${curatorId}`}
              name="rejection_reason"
              rows={4}
              maxLength={MAX_REJECTION_REASON_LENGTH}
              className={`form-textarea${reasonError ? ' is-invalid' : ''}`}
              placeholder="Write specific, constructive feedback explaining why this application was not approved..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError('');
              }}
              aria-required="true"
              aria-invalid={Boolean(reasonError)}
            />

            {reasonError && (
              <p className="form-field-error" id={`reject-reason-error-${curatorId}`} role="alert">
                {reasonError}
              </p>
            )}
          </div>

          <div className="reject-reason-examples">
            <span className="reject-reason-examples-label">Example templates (click to insert &amp; customize):</span>
            <div className="reject-reason-chips">
              {REJECTION_REASON_EXAMPLES.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="reject-reason-chip"
                  onClick={() => {
                    setReason(example);
                    setReasonError('');
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="reject-curator-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCloseReject}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger"
              id={`btn-confirm-reject-curator-${curatorId}`}
              disabled={submitting}
            >
              {submitting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  );
}
