'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ArtworkImage from '@/components/ui/ArtworkImage';
import { ArrowLeft, ArrowRight, ChevronDown } from '@/components/ui/Icons';

function formatPlateNumber(num) {
  return String(num).padStart(2, '0');
}

export default function ArtworkGallery({
  artworks = [],
  latestArtworks = [],
  categories = [],
  userRole = null,
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [catOpen, setCatOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDir, setSlideDir] = useState('next');
  const [transitionTick, setTransitionTick] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const sectionRef = useRef(null);
  const cardViewportRef = useRef(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const navLockRef = useRef(false);
  const navTimerRef = useRef(null);
  const lastPointerTypeRef = useRef('mouse');
  const touchSwipeRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      const rafId = requestAnimationFrame(() => {
        setIsInView(true);
        setIsGalleryVisible(true);
      });
      return () => cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsInView(true);
        }
        setIsGalleryVisible(entry.intersectionRatio >= 0.25);
      },
      { threshold: [0.12, 0.25, 0.5] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape' && catOpen) {
        setCatOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [catOpen]);

  const handleMenuKeyDown = (e) => {
    const options = Array.from(
      dropdownRef.current?.querySelectorAll('[role="option"]') || []
    );
    if (options.length === 0) return;

    const focusedIdx = options.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = focusedIdx < options.length - 1 ? focusedIdx + 1 : 0;
      options[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = focusedIdx > 0 ? focusedIdx - 1 : options.length - 1;
      options[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      options[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      options[options.length - 1]?.focus();
    }
  };

  const sourceList = useMemo(
    () => (latestArtworks.length ? latestArtworks : artworks),
    [latestArtworks, artworks]
  );

  const filtered = useMemo(() => {
    if (selectedCategory === 'ALL') return sourceList;
    return sourceList.filter((item) => {
      if (item.category_id != null && /^\d+$/.test(String(selectedCategory))) {
        return String(item.category_id) === String(selectedCategory);
      }
      return item.category_name?.toLowerCase() === String(selectedCategory).toLowerCase();
    });
  }, [sourceList, selectedCategory]);

  const safeIndex = filtered.length > 0 ? Math.min(currentIndex, filtered.length - 1) : 0;
  const activeArtwork = filtered[safeIndex] || null;

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'ALL') return 'All Categories';
    const match = categories.find(
      (c) => String(c.id) === String(selectedCategory) || c.name === selectedCategory
    );
    return match?.name || 'All Categories';
  }, [selectedCategory, categories]);

  const resetCardTilt = useCallback(() => {
    const el = cardViewportRef.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  }, []);

  const navigateArtwork = useCallback(
    (direction) => {
      if (filtered.length === 0) return;
      if (navLockRef.current) return;

      navLockRef.current = true;
      if (navTimerRef.current) clearTimeout(navTimerRef.current);

      setSlideDir(direction);
      setIsRevealed(false);
      resetCardTilt();
      setTransitionTick((t) => t + 1);

      setCurrentIndex((prev) => {
        const len = filtered.length;
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
    [filtered.length, resetCardTilt]
  );

  const goToPrev = useCallback(() => navigateArtwork('prev'), [navigateArtwork]);
  const goToNext = useCallback(() => navigateArtwork('next'), [navigateArtwork]);

  const goToIndex = useCallback(
    (targetIdx) => {
      if (filtered.length <= 1 || targetIdx === safeIndex) return;
      if (navLockRef.current) return;

      navLockRef.current = true;
      if (navTimerRef.current) clearTimeout(navTimerRef.current);

      setSlideDir(targetIdx > safeIndex ? 'next' : 'prev');
      setIsRevealed(false);
      resetCardTilt();
      setTransitionTick((t) => t + 1);
      setCurrentIndex(targetIdx);

      navTimerRef.current = setTimeout(() => {
        navLockRef.current = false;
      }, 360);
    },
    [filtered.length, safeIndex, resetCardTilt]
  );

  useEffect(() => {
    if (!isGalleryVisible) return;
    const handleWindowKeyDown = (e) => {
      if (catOpen) return;
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
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [isGalleryVisible, catOpen, goToPrev, goToNext]);

  const handleSelectCategory = (val) => {
    setSelectedCategory(val);
    setCurrentIndex(0);
    setSlideDir('next');
    setIsRevealed(false);
    resetCardTilt();
    setTransitionTick((t) => t + 1);
    setCatOpen(false);
  };

  const handleCardPointerEnter = (e) => {
    lastPointerTypeRef.current = e.pointerType || 'mouse';
    if (e.pointerType === 'mouse') {
      setIsRevealed(true);
    }
  };

  const handleCardPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = cardViewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    el.style.setProperty('--tilt-x', `${(-ny * 2.2).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(nx * 2.8).toFixed(2)}deg`);
  };

  const handleCardPointerLeave = (e) => {
    if (e.pointerType === 'mouse') {
      setIsRevealed(false);
      resetCardTilt();
    }
  };

  const handleCardPointerDown = (e) => {
    lastPointerTypeRef.current = e.pointerType || 'touch';
    if (e.pointerType === 'mouse') return;
    touchSwipeRef.current = { x: e.clientX, y: e.clientY, active: true };
  };

  const handleCardPointerUp = (e) => {
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

  const handleCardClick = (e) => {
    if (e.target instanceof Element && e.target.closest('a, button')) return;
    if (lastPointerTypeRef.current !== 'mouse') {
      setIsRevealed((prev) => !prev);
    }
  };

  const shortDescription = activeArtwork?.description
    ? activeArtwork.description.length > 220
      ? `${activeArtwork.description.slice(0, 217).trim()}...`
      : activeArtwork.description
    : '';

  return (
    <section
      ref={sectionRef}
      className={`editorial-gallery-section ${isInView ? 'is-in-view' : ''}`}
      id="galeri"
      aria-label="Curated Architectural Exhibition"
    >
      <div className="editorial-container">
        <header className="editorial-gallery-header">
          <div className="editorial-section-title-group">
            <span className="editorial-eyebrow">CURATED EXHIBITION</span>
            <h2 className="editorial-section-heading">Artwork Gallery</h2>
          </div>

          <div className="editorial-gallery-controls">
            <div
              className={`editorial-cat-dropdown ${catOpen ? 'is-open' : ''}`}
              ref={dropdownRef}
            >
              <button
                ref={triggerRef}
                type="button"
                id="gallery-category-filter"
                className={`editorial-cat-trigger ${catOpen ? 'active' : ''}`}
                onClick={() => setCatOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={catOpen}
                aria-label="Filter gallery by architecture category"
              >
                <span className="editorial-cat-label">{selectedCategoryLabel}</span>
                <ChevronDown
                  size={15}
                  className={`editorial-cat-chevron ${catOpen ? 'rotated' : ''}`}
                />
              </button>

              {catOpen && (
                <div
                  className="editorial-cat-menu"
                  role="listbox"
                  aria-label="Architecture categories"
                  onKeyDown={handleMenuKeyDown}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedCategory === 'ALL'}
                    className={`editorial-cat-option ${selectedCategory === 'ALL' ? 'selected' : ''}`}
                    onClick={() => handleSelectCategory('ALL')}
                  >
                    <span>All Categories</span>
                  </button>
                  {categories.map((cat) => {
                    const isSelected = String(selectedCategory) === String(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        role="option"
                        aria-selected={isSelected}
                        className={`editorial-cat-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectCategory(String(cat.id))}
                      >
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </header>

        {!activeArtwork ? (
          <div className="editorial-empty-state">
            <p className="editorial-empty-title">
              No works exhibited in this category yet.
            </p>
            <div className="editorial-empty-actions">
              <button
                type="button"
                className="btn-editorial-outline"
                onClick={() => handleSelectCategory('ALL')}
              >
                Show All Categories
              </button>
              {userRole !== 'curator' && userRole !== 'admin' && (
                <Link href="/dashboard/member/artworks/create" className="btn-editorial-solid">
                  Submit Artwork
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="tilted-showcase-shell">
            <div
              key={`plate-${activeArtwork.id}-${transitionTick}`}
              className={`tilted-slide-stage tilted-slide-${slideDir}`}
            >
              <div
                ref={cardViewportRef}
                className={`tilted-card-viewport ${isRevealed ? 'is-revealed' : ''}`}
                onPointerEnter={handleCardPointerEnter}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
                onPointerDown={handleCardPointerDown}
                onPointerUp={handleCardPointerUp}
                onClick={handleCardClick}
                aria-label={`${activeArtwork.title} — hover or tap to view curatorial details`}
              >
                <div className="tilted-card-inner">
                  <div className="tilted-face tilted-face-front" aria-hidden={isRevealed}>
                    <ArtworkImage
                      src={activeArtwork.image_url}
                      alt={activeArtwork.title}
                      fill
                      className="tilted-artwork-image"
                      sizes="(max-width: 767px) 100vw, (max-width: 1200px) 90vw, 1080px"
                      priority
                    />
                  </div>

                  <div className="tilted-face tilted-face-back" aria-hidden={!isRevealed}>
                    <div className="tilted-back-content">
                      <div className="tilted-back-header">
                        <span className="tilted-back-category">
                          {activeArtwork.category_name || 'Architecture'}
                        </span>
                      </div>

                      <div className="tilted-back-body">
                        <h4 className="tilted-back-title">
                          <Link
                            href={`/artworks/${activeArtwork.id}`}
                            className="tilted-back-title-link"
                            tabIndex={isRevealed ? 0 : -1}
                          >
                            {activeArtwork.title}
                          </Link>
                        </h4>

                        <p className="tilted-back-artist">
                          <span className="tilted-back-by">By </span>
                          {activeArtwork.creator_id ? (
                            <Link
                              href={`/artists/${activeArtwork.creator_id}`}
                              className="tilted-back-artist-link"
                              tabIndex={isRevealed ? 0 : -1}
                            >
                              {activeArtwork.creator_name || 'ARCHIVE Creator'}
                            </Link>
                          ) : (
                            <span className="tilted-back-artist-name">
                              {activeArtwork.creator_name || 'ARCHIVE Creator'}
                            </span>
                          )}
                        </p>

                        {shortDescription && (
                          <p className="tilted-back-description">{shortDescription}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tilted-caption-bar">
                <div className="tilted-title-wrap">
                  <h3 className="tilted-artwork-title">
                    <Link
                      href={`/artworks/${activeArtwork.id}`}
                      className="tilted-title-link"
                    >
                      {activeArtwork.title}
                    </Link>
                  </h3>
                </div>

                <button
                  type="button"
                  className={`tilted-flip-toggle ${isRevealed ? 'active' : ''}`}
                  onClick={() => {
                    setIsRevealed((prev) => !prev);
                    resetCardTilt();
                  }}
                  aria-pressed={isRevealed}
                >
                  {isRevealed ? 'View Artwork' : 'Artwork Info'}
                </button>
              </div>
            </div>

            <div className="exhibition-nav-bar">
              <div
                className="artist-dossier-nav exhibition-dossier-nav"
                role="navigation"
                aria-label="Artwork gallery navigation"
              >
                <button
                  type="button"
                  className="artist-dossier-nav-btn exhibition-icon-nav-btn"
                  onClick={goToPrev}
                  disabled={filtered.length <= 1}
                  aria-label="Previous artwork"
                  id="btn-gallery-prev"
                >
                  Prev
                </button>

                {filtered.length > 1 && (
                  <div className="artist-dossier-nav-center">
                    <div className="artist-dossier-dots" role="tablist" aria-label="Select featured artwork">
                      {filtered.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={idx === safeIndex}
                          aria-label={`View artwork ${idx + 1} of ${filtered.length}: ${item.title}`}
                          className={`artist-dossier-dot${idx === safeIndex ? ' is-active' : ''}`}
                          onClick={() => goToIndex(idx)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="artist-dossier-nav-btn exhibition-icon-nav-btn"
                  onClick={goToNext}
                  disabled={filtered.length <= 1}
                  aria-label="Next artwork"
                  id="btn-gallery-next"
                >
                  Next
                </button>
              </div>

              <Link href="/explore" className="exhibition-archive-link" id="btn-load-more">
                <span>View All Artworks</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
