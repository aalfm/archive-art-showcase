'use client';

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import DepthCarousel from '@/components/ui/DepthCarousel';
import { Clock3, Trophy } from '@/components/ui/Icons';

function subscribeViewport(callback) {
  const mobileMq = window.matchMedia('(max-width: 639px)');
  const tabletMq = window.matchMedia('(max-width: 1023px)');
  mobileMq.addEventListener?.('change', callback);
  tabletMq.addEventListener?.('change', callback);
  return () => {
    mobileMq.removeEventListener?.('change', callback);
    tabletMq.removeEventListener?.('change', callback);
  };
}

function getViewportSnapshot() {
  if (window.matchMedia('(max-width: 639px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
  return 'desktop';
}

function getViewportServerSnapshot() {
  return 'desktop';
}

function getDaysLeft(startDate, endDate, status, nowMs) {
  if (status === 'ended') return 'Ended';
  if (status === 'upcoming') {
    const diff = new Date(startDate).getTime() - nowMs;
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  const diff = new Date(endDate).getTime() - nowMs;
  if (diff <= 0) return 'Ended';
  const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return `${days} ${days === 1 ? 'day' : 'days'} left`;
}

function formatSchedule(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const endLabel = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startLabel} – ${endLabel}`;
}

const CAROUSEL_PRESETS = {
  desktop: { cardWidth: 480, cardHeight: 300, depth: 220, spread: 90, visibleCards: 4 },
  tablet: { cardWidth: 420, cardHeight: 276, depth: 185, spread: 72, visibleCards: 4 },
  mobile: { cardWidth: 276, cardHeight: 196, depth: 145, spread: 44, visibleCards: 3 },
};

export default function ChallengesSection({ challenges = [], initialNow }) {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportMode = useSyncExternalStore(
    subscribeViewport,
    getViewportSnapshot,
    getViewportServerSnapshot
  );

  const carouselItems = useMemo(
    () =>
      challenges.map((ch) => ({
        id: ch.id,
        image: ch.banner_url || '',
        alt: ch.title,
        challenge: ch,
      })),
    [challenges]
  );

  const handleCarouselChange = useCallback((idx) => {
    setActiveIndex(idx);
  }, []);

  if (!challenges.length) return null;

  const safeIndex = Math.min(Math.max(activeIndex, 0), challenges.length - 1);
  const activeChallenge = challenges[safeIndex];
  const preset = CAROUSEL_PRESETS[viewportMode] || CAROUSEL_PRESETS.desktop;
  const referenceNow = typeof initialNow === 'number' && initialNow > 0 ? initialNow : 0;

  const statusLabel =
    activeChallenge.challenge_status === 'active'
      ? 'Active'
      : activeChallenge.challenge_status === 'upcoming'
        ? 'Upcoming'
        : 'Ended';

  return (
    <section className="challenges-preview-section" aria-label="Active Challenges">
      <div className="editorial-container">
        <header className="editorial-section-header">
          <div className="editorial-section-title-group">
            <span className="editorial-eyebrow">OPEN CALLS &amp; COMPETITIONS</span>
            <h2 className="editorial-section-heading">Active Challenges</h2>
            <p className="editorial-section-subtitle">
              Join curatorial challenges and present spatial concepts to the ARCHIVE community.
            </p>
          </div>
          <Link href="/challenges" className="editorial-header-link">
            <span>View All Challenges</span>
          </Link>
        </header>

        <div className="challenges-depth-showcase">
          <div className="challenges-depth-stage">
            <DepthCarousel
              ref={carouselRef}
              items={carouselItems}
              cardWidth={preset.cardWidth}
              cardHeight={preset.cardHeight}
              radius={2}
              tint="#EFECE6"
              depth={preset.depth}
              spread={preset.spread}
              tilt={22}
              tiltDirection="right"
              perspective={1400}
              visibleCards={preset.visibleCards}
              falloff={0.2}
              blur={6}
              autoplay
              autoplayDelay={4200}
              loop
              showControls={false}
              showIndicators={false}
              onChange={handleCarouselChange}
              ariaLabel="Active architecture challenges carousel"
              className={
                challenges.length > 1
                  ? 'challenges-depth-carousel has-stack'
                  : 'challenges-depth-carousel'
              }
            />
          </div>

          {challenges.length > 1 && (
            <div
              className="artist-dossier-nav challenges-dossier-nav"
              role="navigation"
              aria-label="Active challenges navigation"
            >
              <button
                type="button"
                className="artist-dossier-nav-btn"
                onClick={() => carouselRef.current?.prev()}
                aria-label="Previous challenge"
                id="home-challenge-prev"
              >
                Prev
              </button>

              <div className="artist-dossier-nav-center">
                <div
                  className="artist-dossier-dots"
                  role="tablist"
                  aria-label="Select active challenge"
                >
                  {challenges.map((ch, idx) => (
                    <button
                      key={ch.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === safeIndex}
                      aria-label={`View challenge ${idx + 1} of ${challenges.length}: ${ch.title}`}
                      className={`artist-dossier-dot${idx === safeIndex ? ' is-active' : ''}`}
                      onClick={() => carouselRef.current?.goTo(idx)}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="artist-dossier-nav-btn"
                onClick={() => carouselRef.current?.next()}
                aria-label="Next challenge"
                id="home-challenge-next"
              >
                Next
              </button>
            </div>
          )}

          {activeChallenge && (
            <div
              key={activeChallenge.id}
              className="challenges-active-panel"
              aria-live="polite"
            >
              <div className="challenges-active-topline">
                <span className={`challenges-active-status is-${activeChallenge.challenge_status}`}>
                  {statusLabel}
                </span>
                {activeChallenge.curator_name && (
                  <span className="challenges-active-curator">
                    Curated by {activeChallenge.curator_name}
                  </span>
                )}
              </div>

              <h3 className="challenges-active-title" id="home-challenge-title">
                {activeChallenge.title}
              </h3>

              {activeChallenge.description && (
                <p className="challenges-active-desc" id="home-challenge-desc">
                  {activeChallenge.description.length > 200
                    ? `${activeChallenge.description.substring(0, 200).trimEnd()}...`
                    : activeChallenge.description}
                </p>
              )}

              <div className="challenges-active-meta">
                <div className="challenges-active-meta-item">
                  <Clock3 size={15} className="challenges-active-meta-icon" />
                  <span>
                    {formatSchedule(activeChallenge.start_date, activeChallenge.end_date)}
                    {referenceNow > 0 && (
                      <>
                        {' · '}
                        <strong>
                          {getDaysLeft(
                            activeChallenge.start_date,
                            activeChallenge.end_date,
                            activeChallenge.challenge_status,
                            referenceNow
                          )}
                        </strong>
                      </>
                    )}
                  </span>
                </div>

                {activeChallenge.prize && (
                  <div className="challenges-active-meta-item">
                    <Trophy size={15} className="challenges-active-meta-icon" />
                    <span>{activeChallenge.prize}</span>
                  </div>
                )}
              </div>

              <div className="challenges-active-actions">
                <Link
                  href={`/challenges/${activeChallenge.id}`}
                  className="btn-primary challenges-view-btn"
                  id="home-btn-view-challenge"
                >
                  <span>View Detail</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
