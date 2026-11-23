'use client';

import { useState } from 'react';
import { toggleFavorite } from '@/lib/actions/artwork.actions';

export default function RemoveFavoriteButton({ artworkId }) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    await toggleFavorite(artworkId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="btn-danger"
      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
    >
      {loading ? '...' : 'Remove Favorite'}
    </button>
  );
}
