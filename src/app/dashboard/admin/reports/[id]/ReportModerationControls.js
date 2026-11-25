'use client';

import { useState } from 'react';
import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { dismissReport, takeDownArtwork } from '@/lib/actions/admin.actions';

export default function ReportModerationControls({
  reportId,
  reportStatus,
  artworkId,
  artworkTitle,
  artworkStatus,
  existingNote = '',
}) {
  const [adminNote, setAdminNote] = useState(existingNote || '');
  const isPending = reportStatus === 'pending';
  const canTakeDown = Boolean(artworkId) && artworkStatus !== 'taken_down';

  if (!isPending && !canTakeDown) {
    return (
      <div className="admin-moderation-resolved">
        <p className="admin-moderation-resolved-text">
          This report has been finalized ({reportStatus === 'taken_down' ? 'Artwork taken down' : 'Report dismissed'}) and the artwork is currently removed from public visibility. All moderation records are preserved.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-moderation-controls">
      <div className="admin-moderation-note-field">
        <label htmlFor="admin-moderation-note" className="form-label">
          Moderation note <span className="admin-optional-tag">(optional)</span>
        </label>
        <textarea
          id="admin-moderation-note"
          className="form-input admin-moderation-textarea"
          rows={3}
          maxLength={500}
          placeholder="Add an internal note documenting your moderation decision..."
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />
      </div>

      <div className="admin-moderation-actions-row">
        {isPending && (
          <ConfirmActionButton
            label="Dismiss report"
            title="Dismiss report"
            message={`Dismiss report #${reportId} for "${artworkTitle}"? The artwork will remain published in the gallery and the report will be recorded as dismissed.`}
            confirmLabel="Confirm dismiss"
            danger={false}
            buttonClass="btn-secondary"
            buttonTitle="Dismiss report"
            onConfirm={() => dismissReport(reportId, adminNote)}
          />
        )}

        {canTakeDown && (
          <ConfirmActionButton
            label="Take down artwork"
            title="Take down reported artwork"
            message={`Take down "${artworkTitle}"? This artwork will immediately be removed from public visibility and any pending reports for it will be marked as taken down.`}
            confirmLabel="Yes, take down artwork"
            danger={true}
            buttonClass="btn-danger"
            buttonTitle="Take down artwork"
            onConfirm={() => takeDownArtwork(reportId, artworkId, adminNote)}
          />
        )}
      </div>
    </div>
  );
}
