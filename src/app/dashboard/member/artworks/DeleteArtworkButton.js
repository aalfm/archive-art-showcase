'use client';

import ConfirmActionButton from '@/components/ui/ConfirmActionButton';
import { deleteArtwork } from '@/lib/actions/artwork.actions';

export default function DeleteArtworkButton({ artworkId, artworkTitle }) {
  return (
    <ConfirmActionButton
      label="Delete"
      title="Delete Artwork"
      message={`Are you sure you want to delete "${artworkTitle}"? This action cannot be undone.`}
      confirmLabel="Delete Artwork"
      buttonTitle="Delete Artwork"
      onConfirm={() => deleteArtwork(artworkId)}
    />
  );
}
