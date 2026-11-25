'use client';

import { useState } from 'react';
import { toggleFavorite } from '@/lib/actions/artwork.actions';
import { Bookmark } from '@/components/ui/Icons';

export default function RemoveFavoriteButton({ artworkId, artworkTitle = '' }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    await toggleFavorite(artworkId);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={loading}
      className="btn-secondary favorite-remove-btn"
      aria-label={artworkTitle ? `Remove "${artworkTitle}" from favorites` : 'Remove from favorites'}
      title="Remove from favorites"
    >
      <Bookmark size={13} className="favorite-remove-icon" />
      <span>{loading ? 'Removing...' : 'Remove'}</span>
    </button>
  );
}
