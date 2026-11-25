'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { deleteArtwork } from '@/lib/actions/artwork.actions';

export default function DeleteArtworkButton({ artworkId, artworkTitle }) {
  return (
    <ConfirmActionButton
      label="Delete"
      title="Delete artwork"
      message={`Are you sure you want to delete "${artworkTitle}"? This action cannot be undone.`}
      confirmLabel="Delete artwork"
      buttonClass="btn-danger table-action-btn"
      buttonStyle={undefined}
      buttonTitle="Delete artwork"
      onConfirm={() => deleteArtwork(artworkId)}
    />
  );
}
