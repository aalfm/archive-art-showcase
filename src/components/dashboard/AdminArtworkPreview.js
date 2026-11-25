'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AdminArtworkPreview({
  src,
  title,
  status = 'active',
  categoryName,
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen]);

  if (!src || imgError) {
    return (
      <div className="admin-artwork-preview-empty" role="img" aria-label={title || 'Artwork preview unavailable'}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>Artwork image unavailable</span>
      </div>
    );
  }

  return (
    <>
      <div className="admin-artwork-preview-frame">
        <button
          type="button"
          className="admin-artwork-preview-trigger"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View larger preview of ${title}`}
          id="btn-artwork-large-preview"
        >
          <Image
            src={src}
            alt={title || 'Reported artwork'}
            width={1200}
            height={900}
            unoptimized
            className="admin-artwork-preview-img"
            onError={() => setImgError(true)}
          />
          {status === 'taken_down' && (
            <span className="admin-artwork-preview-banner">Taken down from public gallery</span>
          )}
        </button>

        <div className="admin-artwork-preview-toolbar">
          <span className="admin-artwork-preview-caption">
            {categoryName ? `${categoryName} · Click image to inspect full size` : 'Click image to inspect full size'}
          </span>
          <button
            type="button"
            className="btn-secondary admin-preview-expand-btn"
            onClick={() => setLightboxOpen(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span>View Larger Preview</span>
          </button>
        </div>
      </div>

      {lightboxOpen && (
        <div
          className="admin-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Full preview: ${title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          <div className="admin-lightbox-panel">
            <div className="admin-lightbox-header">
              <div className="admin-lightbox-title-wrap">
                <h2 className="admin-lightbox-title">{title}</h2>
                {categoryName && (
                  <span className="admin-lightbox-subtitle">{categoryName}</span>
                )}
              </div>
              <button
                type="button"
                className="admin-lightbox-close"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close full preview"
                id="btn-close-artwork-lightbox"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-lightbox-stage">
              <Image
                src={src}
                alt={title || 'Artwork full preview'}
                width={1600}
                height={1200}
                unoptimized
                className="admin-lightbox-img"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
