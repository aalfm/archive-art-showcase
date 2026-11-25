'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import ArtworkImage from '@/components/ui/ArtworkImage';

const emptySubscribe = () => () => {};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=85',
];

export default function HeroSection({ artworks, userRole = null }) {
  const displayItems = artworks.length >= 4
    ? artworks.slice(0, 4)
    : [...artworks, ...Array(4 - artworks.length).fill(null)].map((item, i) =>
      item || {
        id: `fallback-${i}`,
        title: 'ARCHIVE Work',
        image_url: FALLBACK_IMAGES[i],
        creator_name: 'ARCHIVE Architect',
        category_name: 'Architecture',
      }
    );

  const stageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasLoopClones = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const count = displayItems.length;
  const activeIndexRef = useRef(0);
  const trackSlotRef = useRef(0);
  const transitionFallbackRef = useRef(null);
  const lastWidthRef = useRef(0);
  const suppressLinkClickUntilRef = useRef(0);
  const swipeRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    dx: 0,
    locked: false,
    isHorizontal: false,
  });
  const dragStart = useRef({ x: 0, rot: 0 });
  const isMouseDownRef = useRef(false);
  const didDragRef = useRef(false);
  const idleRef = useRef(0);
  const rafRef = useRef(null);
  const targetRotY = useRef(0);
  const currentRotY = useRef(0);
  const targetMouseX = useRef(0);
  const targetMouseY = useRef(0);
  const currentMouseX = useRef(0);
  const currentMouseY = useRef(0);

  const getTrackMetrics = useCallback(() => {
    if (typeof window === 'undefined' || window.innerWidth > 900 || !stageRef.current) {
      return null;
    }
    const el = stageRef.current;
    const styles = getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap) || 18;
    const firstCard = el.firstElementChild;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 300;
    if (!cardWidth) return null;
    return { el, step: cardWidth + gap };
  }, []);

  const setTrackTransform = useCallback((el, translateX, animate = false) => {
    el.style.transition = animate ? 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    el.style.transform = `translate3d(${translateX}px, 0, 0)`;
  }, []);

  const wrapBoundaryIfNeeded = useCallback(() => {
    if (!hasLoopClones || count <= 1) return;
    const metrics = getTrackMetrics();
    if (!metrics) return;
    const { el, step } = metrics;

    if (trackSlotRef.current <= 0) {
      trackSlotRef.current = count;
      activeIndexRef.current = count - 1;
      setTrackTransform(el, -(count * step), false);
      void el.offsetWidth;
    } else if (trackSlotRef.current >= count + 1) {
      trackSlotRef.current = 1;
      activeIndexRef.current = 0;
      setTrackTransform(el, -step, false);
      void el.offsetWidth;
    }
  }, [hasLoopClones, count, getTrackMetrics, setTrackTransform]);

  useLayoutEffect(() => {
    if (!hasLoopClones || count <= 1) return;
    lastWidthRef.current = window.innerWidth;
    const metrics = getTrackMetrics();
    if (!metrics) return;
    const initialSlot = activeIndexRef.current + 1;
    trackSlotRef.current = initialSlot;
    setTrackTransform(metrics.el, -(initialSlot * metrics.step), false);
  }, [hasLoopClones, count, getTrackMetrics, setTrackTransform]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !hasLoopClones) return;

    const handleTransitionEnd = (e) => {
      if (e.target !== el || e.propertyName !== 'transform') return;
      if (transitionFallbackRef.current) {
        clearTimeout(transitionFallbackRef.current);
        transitionFallbackRef.current = null;
      }
      wrapBoundaryIfNeeded();
    };

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth === lastWidthRef.current) return;
      lastWidthRef.current = currentWidth;

      if (currentWidth > 900) {
        el.style.transition = '';
        return;
      }
      if (!hasLoopClones || count <= 1) return;
      const metrics = getTrackMetrics();
      if (!metrics) return;
      const targetSlot = activeIndexRef.current + 1;
      trackSlotRef.current = targetSlot;
      setTrackTransform(metrics.el, -(targetSlot * metrics.step), false);
    };

    el.addEventListener('transitionend', handleTransitionEnd);
    window.addEventListener('resize', handleResize);

    return () => {
      el.removeEventListener('transitionend', handleTransitionEnd);
      window.removeEventListener('resize', handleResize);
      if (transitionFallbackRef.current) clearTimeout(transitionFallbackRef.current);
    };
  }, [hasLoopClones, count, getTrackMetrics, setTrackTransform, wrapBoundaryIfNeeded]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth <= 900) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      targetMouseX.current = normX * 10;
      targetMouseY.current = -normY * 6;
      idleRef.current = 0;

      if (isMouseDownRef.current) {
        const deltaX = e.clientX - dragStart.current.x;
        if (!didDragRef.current && Math.abs(deltaX) > 6) {
          didDragRef.current = true;
          setIsDragging(true);
        }
        if (didDragRef.current) {
          targetRotY.current = dragStart.current.rot + deltaX * 0.08;
        }
      }
    };

    const handleMouseUp = () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      if (didDragRef.current) {
        suppressLinkClickUntilRef.current = performance.now() + 250;
        didDragRef.current = false;
        setIsDragging(false);
      }
    };

    const handleKeyDown = (e) => {
      if (window.innerWidth <= 900) return;
      if (e.key === 'ArrowLeft') targetRotY.current += 10;
      if (e.key === 'ArrowRight') targetRotY.current -= 10;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    function loop() {
      if (window.innerWidth > 900 && stageRef.current) {
        idleRef.current += 0.016;
        const ambientFloat = Math.sin(idleRef.current * 1.2) * 2.5;
        const ambientRot = Math.sin(idleRef.current * 0.6) * 1.5;

        currentRotY.current += (targetRotY.current - currentRotY.current) * 0.08;
        currentMouseX.current += (targetMouseX.current - currentMouseX.current) * 0.06;
        currentMouseY.current += (targetMouseY.current - currentMouseY.current) * 0.06;

        const netRotY = currentRotY.current + currentMouseX.current + ambientRot;
        const netRotX = currentMouseY.current;

        stageRef.current.style.transform = `
          translate3d(0, ${ambientFloat}px, 0)
          rotateX(${netRotX.toFixed(2)}deg)
          rotateY(${netRotY.toFixed(2)}deg)
        `;
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) return;
    if (e.button !== 0) return;
    if (e.target instanceof Element && e.target.closest('.carousel-controls')) return;
    isMouseDownRef.current = true;
    didDragRef.current = false;
    dragStart.current = { x: e.clientX, rot: targetRotY.current };
  };

  const navigateSlide = useCallback((direction) => {
    const metrics = getTrackMetrics();
    if (!metrics) {
      targetRotY.current += direction === -1 ? 12 : -12;
      idleRef.current = 0;
      return;
    }

    const { el, step } = metrics;
    if (count <= 1 || !hasLoopClones) return;

    if (transitionFallbackRef.current) {
      clearTimeout(transitionFallbackRef.current);
      transitionFallbackRef.current = null;
    }

    if (direction === 1 && trackSlotRef.current >= count + 1) {
      trackSlotRef.current = 1;
      activeIndexRef.current = 0;
      setTrackTransform(el, -step, false);
      void el.offsetWidth;
    } else if (direction === -1 && trackSlotRef.current <= 0) {
      trackSlotRef.current = count;
      activeIndexRef.current = count - 1;
      setTrackTransform(el, -(count * step), false);
      void el.offsetWidth;
    }

    const nextIndex =
      direction === 1
        ? (activeIndexRef.current + 1) % count
        : (activeIndexRef.current - 1 + count) % count;

    const nextSlot = trackSlotRef.current + direction;
    activeIndexRef.current = nextIndex;
    trackSlotRef.current = nextSlot;

    setTrackTransform(el, -(nextSlot * step), true);
    transitionFallbackRef.current = setTimeout(wrapBoundaryIfNeeded, 420);
  }, [count, hasLoopClones, getTrackMetrics, setTrackTransform, wrapBoundaryIfNeeded]);

  const handleTrackPointerDown = (e) => {
    if (typeof window === 'undefined' || window.innerWidth > 900) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!hasLoopClones || count <= 1) return;

    if (transitionFallbackRef.current) {
      clearTimeout(transitionFallbackRef.current);
      transitionFallbackRef.current = null;
    }
    wrapBoundaryIfNeeded();

    swipeRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      locked: false,
      isHorizontal: false,
    };
  };

  const handleTrackPointerMove = (e) => {
    const swipe = swipeRef.current;
    if (!swipe.active || swipe.pointerId !== e.pointerId) return;

    const dx = e.clientX - swipe.startX;
    const dy = e.clientY - swipe.startY;

    if (!swipe.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      swipe.locked = true;
      if (Math.abs(dy) >= Math.abs(dx)) {
        swipe.active = false;
        swipe.isHorizontal = false;
        return;
      }
      swipe.isHorizontal = true;
    }

    const metrics = getTrackMetrics();
    if (!metrics) return;
    swipe.dx = dx;
    setTrackTransform(metrics.el, -(trackSlotRef.current * metrics.step) + dx, false);
  };

  const handleTrackPointerEnd = (e) => {
    const swipe = swipeRef.current;
    if (!swipe.active || swipe.pointerId !== e.pointerId) return;
    swipe.active = false;

    if (!swipe.isHorizontal) return;
    suppressLinkClickUntilRef.current = performance.now() + 250;

    const metrics = getTrackMetrics();
    if (!metrics) return;
    const threshold = Math.min(64, metrics.step * 0.16);

    if (swipe.dx < -threshold) {
      navigateSlide(1);
    } else if (swipe.dx > threshold) {
      navigateSlide(-1);
    } else {
      setTrackTransform(metrics.el, -(trackSlotRef.current * metrics.step), true);
    }
  };

  const handlePrev = () => navigateSlide(-1);
  const handleNext = () => navigateSlide(1);

  const trackItems = hasLoopClones && count > 1
    ? [
        { item: displayItems[count - 1], realIdx: count - 1, key: `clone-prev-${displayItems[count - 1].id}`, isClone: true },
        ...displayItems.map((item, idx) => ({ item, realIdx: idx, key: item.id, isClone: false })),
        { item: displayItems[0], realIdx: 0, key: `clone-next-${displayItems[0].id}`, isClone: true },
      ]
    : displayItems.map((item, idx) => ({ item, realIdx: idx, key: item.id, isClone: false }));

  return (
    <section className="hero-section" aria-label="Hero — Featured Works">
      <div className="hero-atmosphere"></div>
      <div className="hero-header">
        <div className="hero-sub-label">
          <span className="line"></span>
          DIGITAL ARCHITECTURE SHOWCASE PLATFORM
          <span className="line"></span>
        </div>
        <h1 className="hero-title-line2">ARCHIVE</h1>
        <p className="hero-curatorial-quote">
          Discover new perspectives in architecture and spatial design. Explore curated works, share ideas, and inspire the ARCHIVE community.
        </p>
        <div className="hero-cta-row">
          <Link href="/explore" className="btn-primary">Explore Works</Link>
          {userRole !== 'curator' && (
            <Link href="/register" className="btn-secondary">Join Now</Link>
          )}
        </div>
      </div>

      <div
        className="carousel-viewport"
        id="carousel-viewport"
        role="region"
        aria-label="Featured works gallery — drag to rotate"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="carousel-stage"
          id="carousel-stage"
        >
          <div
            className="carousel-cylinder"
            id="carousel-cylinder"
            ref={stageRef}
            onPointerDown={handleTrackPointerDown}
            onPointerMove={handleTrackPointerMove}
            onPointerUp={handleTrackPointerEnd}
            onPointerCancel={handleTrackPointerEnd}
          >
            {trackItems.map(({ item, realIdx, key, isClone }) => {
              const href = String(item.id).startsWith('fallback-') ? '/explore' : `/artworks/${item.id}`;
              return (
                <article
                  key={key}
                  className={isClone ? 'fragment-card fragment-card-clone' : 'fragment-card'}
                  data-index={realIdx}
                  data-id={item.id}
                  aria-hidden={isClone || undefined}
                >
                  <Link
                    href={href}
                    className="fragment-card-link"
                    tabIndex={isClone ? -1 : undefined}
                    aria-label={isClone ? undefined : `${item.title} by ${item.creator_name}`}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={(e) => {
                      if (performance.now() < suppressLinkClickUntilRef.current) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="fragment-image-wrap">
                      <ArtworkImage
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="fragment-image"
                        style={{ objectPosition: 'center center' }}
                        sizes="(max-width: 767px) 82vw, (max-width: 900px) 296px, 264px"
                        priority={realIdx < 2 || isClone}
                      />
                    </div>
                    <div className="fragment-meta-top">
                      <span className="fragment-typology">{item.category_name || 'ART'}</span>
                    </div>
                    <div className="fragment-meta-bottom">
                      <h3 className="fragment-title">{item.title}</h3>
                      <p className="fragment-sub">{item.creator_name}</p>
                      <span className="fragment-action-pill">
                        <span>{String(item.id).startsWith('fallback-') ? 'Explore Gallery' : 'View Work'}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="carousel-controls">
          <span className="carousel-indicator" id="carousel-angle-indicator">
            Curated architectural plates
          </span>
        </div>
      </div>

      <div className="hero-editorial-rule" aria-hidden="true"></div>
    </section>
  );
}
