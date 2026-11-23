'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import ReportDetailsButton from './ReportDetailsButton';
import { dismissReport, takeDownArtwork } from '@/lib/actions/admin.actions';

export default function ReportActionButtons({
  reportId,
  artworkId,
  artworkTitle,
  reporterName,
  reason,
  details,
  createdAt,
}) {
  return (
    <div className="moderation-actions-stack">
      {reason === 'Other' && (
        <ReportDetailsButton
          reportId={reportId}
          artworkId={artworkId}
          artworkTitle={artworkTitle}
          reporterName={reporterName}
          reason={reason}
          details={details}
          createdAt={createdAt}
        />
      )}
      <ConfirmActionButton
        label="Dismiss"
        title="Dismiss Report"
        message={`Dismiss report for artwork "${artworkTitle}"? The artwork will remain visible in the public gallery.`}
        confirmLabel="Dismiss"
        danger={false}
        buttonClass="btn-secondary moderation-action-btn"
        buttonStyle={undefined}
        buttonTitle="Dismiss report"
        onConfirm={() => dismissReport(reportId)}
      />
      <ConfirmActionButton
        label="Take Down"
        title="Take Down Artwork"
        message={`WARNING: Take down artwork "${artworkTitle}"? This work will be removed from the public gallery.`}
        confirmLabel="Yes, Take Down"
        buttonClass="btn-danger moderation-action-btn"
        buttonStyle={undefined}
        buttonTitle="Take down artwork"
        onConfirm={() => takeDownArtwork(reportId, artworkId)}
      />
    </div>
  );
}
