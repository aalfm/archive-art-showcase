'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ArtistProfile from './ArtistProfile';
import ArtistNavigation from './ArtistNavigation';
import ArtistCollection from './ArtistCollection';

export default function ArtistShowcase({
  artists = [],
  artworks = [],
  error = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDir, setSlideDir] = useState('next');
  const [transitionTick, setTransitionTick] = useState(0);

  const navLockRef = useRef(false);
  const navTimerRef = useRef(null);
  const touchSwipeRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const safeIndex = artists.length > 0 ? Math.min(currentIndex, artists.length - 1) : 0;
  const activeArtist = artists[safeIndex] || null;

  const activeCollection = useMemo(() => {
    if (!activeArtist) return [];
    return artworks.filter((art) => Number(art.user_id) === Number(activeArtist.id));
  }, [artworks, activeArtist]);

  const navigateArtist = useCallback(
    (direction) => {
      if (artists.length === 0) return;
      if (navLockRef.current) return;

      navLockRef.current = true;
      if (navTimerRef.current) clearTimeout(navTimerRef.current);

      setSlideDir(direction);
      setTransitionTick((t) => t + 1);

      setCurrentIndex((prev) => {
        const len = artists.length;
        if (len <= 1) return 0;
        const normalized = ((prev % len) + len) % len;
        return direction === 'next'
          ? (normalized + 1) % len
          : (normalized - 1 + len) % len;
      });

      navTimerRef.current = setTimeout(() => {
        navLockRef.current = false;
      }, 360);
    },
    [artists.length]
  );

  const goToPrev = useCallback(() => navigateArtist('prev'), [navigateArtist]);
  const goToNext = useCallback(() => navigateArtist('next'), [navigateArtist]);

  useEffect(() => {
    if (artists.length === 0) return;
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [artists.length, goToPrev, goToNext]);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    touchSwipeRef.current = { x: e.clientX, y: e.clientY, active: true };
  };

  const handlePointerUp = (e) => {
    const swipe = touchSwipeRef.current;
    if (!swipe.active) return;
    touchSwipeRef.current.active = false;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) goToNext();
      else goToPrev();
    }
  };

  if (error) {
    return (
      <div className="editorial-empty-state" role="alert">
        <p className="editorial-empty-title">{error}</p>
      </div>
    );
  }

  if (!activeArtist) {
    return (
      <div className="editorial-empty-state">
        <p className="editorial-empty-title">No registered artists with published works yet.</p>
      </div>
    );
  }

  return (
    <div
      className="artist-showcase-shell"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        key={`artist-${activeArtist.id}-${transitionTick}`}
        className={`artist-showcase-stage tilted-slide-${slideDir}`}
      >
        <ArtistProfile
          artist={activeArtist}
          index={safeIndex}
          total={artists.length}
        />

        <ArtistNavigation
          currentIndex={safeIndex}
          total={artists.length}
          onPrev={goToPrev}
          onNext={goToNext}
        />

        <ArtistCollection
          artist={activeArtist}
          artworks={activeCollection}
        />
      </div>
    </div>
  );
}
