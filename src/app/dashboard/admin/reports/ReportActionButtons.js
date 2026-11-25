'use client';

import Link from 'next/link';
import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { dismissReport, takeDownArtwork } from '@/lib/actions/admin.actions';

export default function ReportActionButtons({
  reportId,
  artworkId,
  artworkTitle,
}) {
  return (
    <div className="moderation-actions-stack">
      <Link
        href={`/dashboard/admin/reports/${reportId}`}
        className="btn-secondary moderation-action-btn"
        id={`btn-view-report-details-${reportId}`}
      >
        View details
      </Link>
      <ConfirmActionButton
        label="Dismiss"
        title="Dismiss report"
        message={`Dismiss report for artwork "${artworkTitle}"? The artwork will remain visible in the public gallery.`}
        confirmLabel="Dismiss"
        danger={false}
        buttonClass="btn-secondary moderation-action-btn"
        buttonStyle={undefined}
        buttonTitle="Dismiss report"
        onConfirm={() => dismissReport(reportId)}
      />
      <ConfirmActionButton
        label="Take down"
        title="Take down artwork"
        message={`Take down artwork "${artworkTitle}"? This work will be removed from the public gallery.`}
        confirmLabel="Yes, take down"
        buttonClass="btn-danger moderation-action-btn"
        buttonStyle={undefined}
        buttonTitle="Take down artwork"
        onConfirm={() => takeDownArtwork(reportId, artworkId)}
      />
    </div>
  );
}
