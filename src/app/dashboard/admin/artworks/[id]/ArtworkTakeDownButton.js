'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { takeDownArtwork } from '@/lib/actions/admin.actions';

export default function ArtworkTakeDownButton({ artworkId, artworkTitle }) {
  return (
    <ConfirmActionButton
      label="Take down artwork"
      title="Take down artwork"
      message={`Take down "${artworkTitle}"? This artwork will be removed from public visibility and any pending reports for it will be marked as taken down.`}
      confirmLabel="Yes, take down"
      danger={true}
      buttonClass="btn-danger"
      buttonTitle="Take down artwork"
      onConfirm={() => takeDownArtwork(null, artworkId)}
    />
  );
}
