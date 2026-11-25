'use client';

import { useActionState, useRef } from 'react';
import { changePassword } from '@/lib/actions/auth.actions';

export default function SettingsForm() {
  const formRef = useRef(null);
  const [state, formAction, isPending] = useActionState(async (prevState, formData) => {
    const res = await changePassword(prevState, formData);
    if (res?.success) {
      formRef.current?.reset();
    }
    return res;
  }, null);

  return (
    <div className="member-settings-form-wrap">
      {state?.error && (
        <div className="form-alert form-alert-error" role="alert">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="form-alert form-alert-success" role="alert">
          Password updated successfully!
        </div>
      )}

      <form ref={formRef} action={formAction} className="dashboard-form member-profile-form">
        <div className="form-group">
          <label htmlFor="current_password" className="form-label">Current Password *</label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            className="form-input"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="new_password" className="form-label">New Password *</label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            className="form-input"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <span className="member-field-hint">
            Minimum 8 characters.
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="confirm_password" className="form-label">Confirm New Password *</label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            className="form-input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="dashboard-form-actions">
          <button
            type="submit"
            className="btn-primary dashboard-submit-btn"
            disabled={isPending}
          >
            {isPending ? 'Updating Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
