'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ArtworkImage from '@/components/ui/ArtworkImage';
import { ArrowRight, Clock3, FileText, Search, Trophy, X } from '@/components/ui/Icons';

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

export default function ChallengesGallery({
  initialChallenges,
  initialNow,
  userRole,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [nowMs, setNowMs] = useState(initialNow);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) return;
    const controller = new AbortController();
    let active = true;

    async function runSearch() {
      setIsSearching(true);
      setSearchError('');
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          status: statusFilter,
        });
        const res = await fetch(`/api/challenges/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Search request failed');
        const data = await res.json();
        if (active) {
          setSearchResults(Array.isArray(data.challenges) ? data.challenges : []);
          if (typeof data.serverNow === 'number') setNowMs(data.serverNow);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && active) {
          setSearchError('Unable to search challenges right now.');
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }

    runSearch();
    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedQuery, statusFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setDebouncedQuery('');
      setSearchResults(null);
      setIsSearching(false);
      setSearchError('');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults(null);
    setIsSearching(false);
    setSearchError('');
    searchInputRef.current?.focus();
  };

  const handleResetAll = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults(null);
    setIsSearching(false);
    setSearchError('');
    setStatusFilter('all');
  };

  const isSearchActive = Boolean(debouncedQuery);

  const displayedChallenges = useMemo(() => {
    if (isSearchActive) return searchResults ?? [];
    if (statusFilter === 'all') return initialChallenges;
    return initialChallenges.filter((ch) => ch.challenge_status === statusFilter);
  }, [isSearchActive, searchResults, statusFilter, initialChallenges]);

  return (
    <>
      <div className="explore-filters">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="explore-search-form"
          role="search"
        >
          <div className="explore-search-wrap">
            <Search size={16} />
            <input
              ref={searchInputRef}
              type="search"
              className="form-input explore-search-input"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoComplete="off"
              aria-label="Search challenges"
              id="challenges-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="challenge-search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
                id="btn-challenges-search-clear"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </form>

        <div className="explore-filter-row">
          <div className="challenge-status-tabs" role="tablist" aria-label="Challenge status filter">
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'all'}
              className={`challenge-status-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
              id="filter-challenges-all"
            >
              <span>All</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'active'}
              className={`challenge-status-tab ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
              id="filter-challenges-active"
            >
              <span>Active</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'upcoming'}
              className={`challenge-status-tab ${statusFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setStatusFilter('upcoming')}
              id="filter-challenges-upcoming"
            >
              <span>Upcoming</span>
            </button>
          </div>
        </div>
      </div>

      {(isSearchActive || isSearching || searchError) && (
        <p className="gallery-search-status" style={{ marginBottom: '1rem' }} aria-live="polite">
          {searchError
            ? searchError
            : isSearching
              ? 'Searching challenges...'
              : `${displayedChallenges.length} ${displayedChallenges.length === 1 ? 'challenge' : 'challenges'} found for "${debouncedQuery}"`}
        </p>
      )}

      <div className="masonry-grid">
        {displayedChallenges.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--surface)' }}>
              {isSearchActive
                ? 'NO MATCHING CHALLENGES'
                : statusFilter === 'upcoming'
                  ? 'NO UPCOMING CHALLENGES'
                  : statusFilter === 'active'
                    ? 'NO ACTIVE CHALLENGES'
                    : 'NO CHALLENGES AVAILABLE'}
            </p>
            <p style={{ marginTop: 8, color: 'var(--surface)', fontSize: '0.88rem' }}>
              {isSearchActive
                ? 'Try adjusting your search keyword or status filter.'
                : statusFilter === 'upcoming'
                  ? 'Check back soon for new architectural challenges.'
                  : 'All active challenges have closed or none are currently running.'}
            </p>
            {(isSearchActive || statusFilter !== 'all') && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetAll}
                style={{ marginTop: 18 }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          displayedChallenges.map((ch) => {
            const statusText =
              ch.challenge_status === 'active'
                ? 'Active'
                : ch.challenge_status === 'upcoming'
                  ? 'Upcoming'
                  : 'Ended';
            const daysText = getDaysLeft(ch.start_date, ch.end_date, ch.challenge_status, nowMs);
            const scheduleText = formatSchedule(ch.start_date, ch.end_date);

            return (
              <article key={ch.id} className="project-card challenge-dir-card" data-id={ch.id}>
                <Link
                  href={`/challenges/${ch.id}`}
                  className="challenge-dir-card-link"
                  aria-label={`View challenge: ${ch.title}`}
                >
                  <div className="project-image-wrap challenge-dir-media">
                    {ch.banner_url ? (
                      <ArtworkImage
                        src={ch.banner_url}
                        alt={ch.title}
                        fill
                        className="project-image"
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="challenge-dir-fallback" aria-hidden="true">
                        <span>ARCHIVE</span>
                      </div>
                    )}
                  </div>

                  <div className="card-editorial-body challenge-dir-body">
                    <div className="card-top-bar">
                      <span className={`challenge-dir-status is-${ch.challenge_status}`}>
                        {statusText}
                      </span>
                      <span className="challenge-dir-deadline">{daysText}</span>
                    </div>

                    <div className="card-bottom-info challenge-dir-info">
                      <h2 className="card-title challenge-dir-title">{ch.title}</h2>
                      {ch.description && (
                        <p className="challenge-dir-desc">{ch.description}</p>
                      )}
                    </div>

                    <div className="challenge-dir-meta">
                      {ch.prize && (
                        <span className="challenge-dir-meta-item">
                          <Trophy size={13} className="challenge-dir-meta-icon" />
                          <span>{ch.prize}</span>
                        </span>
                      )}
                      {scheduleText && (
                        <span className="challenge-dir-meta-item">
                          <Clock3 size={13} className="challenge-dir-meta-icon" />
                          <span>{scheduleText}</span>
                        </span>
                      )}
                      <span className="challenge-dir-meta-item">
                        <FileText size={13} className="challenge-dir-meta-icon" />
                        <span>
                          {ch.submission_count}{' '}
                          {ch.submission_count === 1 ? 'submission' : 'submissions'}
                        </span>
                      </span>
                    </div>

                    <span className="challenge-dir-cta">
                      <span>
                        {userRole === 'member' && ch.challenge_status === 'active'
                          ? 'Enter Challenge'
                          : 'View Challenge'}
                      </span>
                      <ArrowRight size={14} strokeWidth={1.75} className="challenge-dir-cta-arrow" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })
        )}
      </div>
    </>
  );
}
