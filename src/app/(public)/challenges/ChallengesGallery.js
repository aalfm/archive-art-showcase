'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock3, FileText, Search, Trophy, X } from '@/components/ui/Icons';

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

export default function ChallengesGallery({
  initialChallenges,
  initialCounts,
  initialNow,
  userRole,
}) {
  const [statusFilter, setStatusFilter] = useState('active');
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

  const isSearchActive = Boolean(debouncedQuery);
  const counts = isSearchActive && searchCounts ? searchCounts : initialCounts;

  const displayedChallenges = isSearchActive
    ? (searchResults ?? [])
    : initialChallenges.filter((ch) => ch.challenge_status === statusFilter);

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

      <div className="challenges-full-grid">
        {displayedChallenges.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--surface)' }}>
              {isSearchActive
                ? 'NO MATCHING CHALLENGES'
                : statusFilter === 'upcoming'
                  ? 'NO UPCOMING CHALLENGES'
                  : 'NO ACTIVE CHALLENGES'}
            </p>
            <p style={{ marginTop: 8, color: 'var(--surface)', fontSize: '0.88rem' }}>
              {isSearchActive
                ? 'No challenges found. Try adjusting your search keyword or status filter.'
                : statusFilter === 'upcoming'
                  ? 'Check back soon for new architectural challenges.'
                  : 'All active challenges have closed or none are currently running.'}
            </p>
            {isSearchActive && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClearSearch}
                style={{ marginTop: 18 }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          displayedChallenges.map((ch) => (
            <article key={ch.id} className="challenge-full-card">
              <div className="challenge-banner-wrap">
                {ch.banner_url && (
                  <Image
                    src={ch.banner_url}
                    alt={ch.title}
                    fill
                    className="challenge-banner-img"
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                )}
                <div className="challenge-banner-overlay"></div>
                <span className={`challenge-status-badge ${ch.challenge_status}`}>
                  {ch.challenge_status === 'active'
                    ? 'ACTIVE'
                    : ch.challenge_status === 'upcoming'
                      ? 'UPCOMING'
                      : 'ENDED'}
                </span>
              </div>
              <div className="challenge-card-body">
                <div className="challenge-card-curator">By {ch.curator_name}</div>
                <h3 className="challenge-card-title">{ch.title}</h3>
                <p className="challenge-card-desc">
                  {ch.description?.length > 150
                    ? `${ch.description.substring(0, 150)}...`
                    : ch.description}
                </p>
                <div className="challenge-card-meta">
                  <span>
                    <Trophy size={16} className="challenge-meta-icon" />
                    <span>{ch.prize}</span>
                  </span>
                  <span>
                    <FileText size={16} className="challenge-meta-icon" />
                    <span>{ch.submission_count} submissions</span>
                  </span>
                  <span>
                    <Clock3 size={16} className="challenge-meta-icon" />
                    <span>{getDaysLeft(ch.start_date, ch.end_date, ch.challenge_status, nowMs)}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <Link href={`/challenges/${ch.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                    View Details
                  </Link>
                  {userRole === 'member' && ch.challenge_status === 'active' && (
                    <Link href={`/challenges/${ch.id}`} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                      Enter Now
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
