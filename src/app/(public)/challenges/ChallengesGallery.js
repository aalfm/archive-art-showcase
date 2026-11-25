'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ArtworkImage from '@/components/ui/ArtworkImage';
import { ArrowRight, Award, Clock3, FileText, Search, Trophy, X } from '@/components/ui/Icons';
import { formatEditorialTitle } from '@/lib/utils';

function getDaysLeft(startDate, endDate, status, nowMs) {
  if (status === 'completed' || status === 'ended') {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      return `Ended ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'Completed';
  }
  if (status === 'upcoming') {
    const diff = new Date(startDate).getTime() - nowMs;
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  const diff = new Date(endDate).getTime() - nowMs;
  if (diff <= 0) return 'Completed';
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
  initialCounts,
  initialStatus = 'all',
  initialNow,
  userRole,
}) {
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchCounts, setSearchCounts] = useState(null);
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
          if (data.counts) setSearchCounts(data.counts);
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
      setSearchCounts(null);
      setIsSearching(false);
      setSearchError('');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults(null);
    setSearchCounts(null);
    setIsSearching(false);
    setSearchError('');
    searchInputRef.current?.focus();
  };

  const handleResetAll = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults(null);
    setSearchCounts(null);
    setIsSearching(false);
    setSearchError('');
    setStatusFilter('all');
  };

  const isSearchActive = Boolean(debouncedQuery);

  const counts = useMemo(() => {
    if (isSearchActive && searchCounts) return searchCounts;
    if (initialCounts) return initialCounts;
    return {
      all: initialChallenges.length,
      active: initialChallenges.filter((c) => c.challenge_status === 'active').length,
      upcoming: initialChallenges.filter((c) => c.challenge_status === 'upcoming').length,
      completed: initialChallenges.filter(
        (c) => c.challenge_status === 'completed' || c.challenge_status === 'ended'
      ).length,
    };
  }, [isSearchActive, searchCounts, initialCounts, initialChallenges]);

  const displayedChallenges = useMemo(() => {
    if (isSearchActive) return searchResults ?? [];
    if (statusFilter === 'all') return initialChallenges;
    return initialChallenges.filter((ch) => {
      const normalized = ch.challenge_status === 'ended' ? 'completed' : ch.challenge_status;
      return normalized === statusFilter;
    });
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
              <span className="challenge-status-tab-count">{counts.all}</span>
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
              <span className="challenge-status-tab-count">{counts.active}</span>
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
              <span className="challenge-status-tab-count">{counts.upcoming}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'completed'}
              className={`challenge-status-tab ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
              id="filter-challenges-completed"
            >
              <span>Completed</span>
              <span className="challenge-status-tab-count">{counts.completed}</span>
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
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
              {isSearchActive
                ? 'No matching challenges'
                : statusFilter === 'upcoming'
                  ? 'No upcoming challenges'
                  : statusFilter === 'completed'
                    ? 'No completed challenges yet'
                    : statusFilter === 'active'
                      ? 'No active challenges'
                      : 'No challenges available'}
            </p>
            <p style={{ marginTop: 8, color: 'var(--surface)', fontSize: '0.88rem' }}>
              {isSearchActive
                ? 'Try adjusting your search keyword or status filter.'
                : statusFilter === 'upcoming'
                  ? 'Check back soon for new architectural challenges.'
                  : statusFilter === 'completed'
                    ? 'Completed challenges and their winning entries will appear in this archive.'
                    : 'No challenges are currently active in this category.'}
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
            const normalizedStatus =
              ch.challenge_status === 'ended' ? 'completed' : ch.challenge_status;
            const statusText =
              normalizedStatus === 'active'
                ? 'Active'
                : normalizedStatus === 'upcoming'
                  ? 'Upcoming'
                  : 'Completed';
            const isCompleted = normalizedStatus === 'completed';
            const winnerCount = Number(ch.winner_count || 0);
            const daysText = getDaysLeft(ch.start_date, ch.end_date, normalizedStatus, nowMs);
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
                      <span className={`challenge-dir-status is-${normalizedStatus}`}>
                        {statusText}
                      </span>
                      <span className="challenge-dir-deadline">{daysText}</span>
                    </div>

                    <div className="card-bottom-info challenge-dir-info">
                      <h2 className="card-title challenge-dir-title">{formatEditorialTitle(ch.title)}</h2>
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
                      {isCompleted && (
                        <span className={`challenge-dir-meta-item challenge-dir-winner-summary ${winnerCount > 0 ? 'has-winners' : 'is-pending'}`}>
                          <Award size={13} className="challenge-dir-meta-icon" />
                          <span>
                            {winnerCount > 0
                              ? `${winnerCount} ${winnerCount === 1 ? 'winner' : 'winners'} announced${ch.top_winner_name ? ` · 1st: ${ch.top_winner_name}` : ''}`
                              : 'Results not yet announced'}
                          </span>
                        </span>
                      )}
                    </div>

                    <span className="challenge-dir-cta">
                      <span>
                        {isCompleted
                          ? winnerCount > 0
                            ? 'View Winners'
                            : 'View Archive'
                          : userRole === 'member' && normalizedStatus === 'active'
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
