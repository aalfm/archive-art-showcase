'use client';

import Link from 'next/link';

function formatIndex(num) {
  return String(num).padStart(2, '0');
}

export default function ArtistNavigation({
  currentIndex = 0,
  total = 0,
  onPrev,
  onNext,
}) {
  if (total <= 0) return null;

  const progressPercent = ((currentIndex + 1) / total) * 100;

  return (
    <nav className="artist-nav-bar" aria-label="Artist showcase navigation">
      <div className="exhibition-progress-track" aria-hidden="true">
        <div
          className="exhibition-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="exhibition-nav-controls">
        <div className="exhibition-arrows">
          <button
            type="button"
            className="exhibition-arrow-btn"
            onClick={onPrev}
            aria-label="Previous artist"
            id="btn-artist-prev"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span className="exhibition-arrow-text">Prev</span>
          </button>

          <span className="exhibition-counter" aria-live="polite">
            {formatIndex(currentIndex + 1)} <span className="exhibition-counter-sep">/</span> {formatIndex(total)}
          </span>

          <button
            type="button"
            className="exhibition-arrow-btn"
            onClick={onNext}
            aria-label="Next artist"
            id="btn-artist-next"
          >
            <span className="exhibition-arrow-text">Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <Link href="/explore" className="exhibition-archive-link">
          <span>Explore all works</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </nav>
  );
}
