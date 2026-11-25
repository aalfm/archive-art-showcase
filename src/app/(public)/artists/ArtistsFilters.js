'use client';

import { Suspense, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterDropdown from '@/components/ui/FilterDropdown';
import { Search, X } from '@/components/ui/Icons';

function ArtistsFiltersInner({ categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const paramSearch = searchParams.get('search') || '';
  const paramCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(paramSearch);
  const [prevParamSearch, setPrevParamSearch] = useState(paramSearch);

  if (prevParamSearch !== paramSearch) {
    setPrevParamSearch(paramSearch);
    setSearch(paramSearch);
  }

  const categoryOptions = [
    { value: '', label: 'All specializations' },
    ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
  ];

  const applyFilters = useCallback(
    (nextSearch, nextCategory) => {
      const params = new URLSearchParams();
      const trimmed = nextSearch.trim();
      if (trimmed) params.set('search', trimmed);
      if (nextCategory) params.set('category', nextCategory);
      const qs = params.toString();
      const targetUrl = qs ? `/artists?${qs}` : '/artists';
      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    },
    [router]
  );

  useEffect(() => {
    const refreshLatestStatus = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };
    const handlePageShow = (event) => {
      if (event.persisted) {
        router.refresh();
      }
    };
    document.addEventListener('visibilitychange', refreshLatestStatus);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      document.removeEventListener('visibilitychange', refreshLatestStatus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [router]);

  useEffect(() => {
    const trimmed = search.trim();
    const currentParam = paramSearch.trim();
    if (trimmed === currentParam) return undefined;

    debounceTimerRef.current = setTimeout(() => {
      applyFilters(trimmed, paramCategory);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search, paramSearch, paramCategory, applyFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    applyFilters(search, paramCategory);
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSearch('');
    if (paramSearch) {
      applyFilters('', paramCategory);
    }
    searchInputRef.current?.focus();
  };

  return (
    <div className="explore-filters">
      <form onSubmit={handleSubmit} className="explore-search-form" role="search">
        <div className="explore-search-wrap">
          <Search size={16} />
          <input
            ref={searchInputRef}
            type="search"
            className="form-input explore-search-input"
            placeholder="Search artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            aria-label="Search artists"
            id="artists-search-input"
          />
          {search && (
            <button
              type="button"
              className="challenge-search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
              id="btn-artists-search-clear"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>

      {categories.length > 0 && (
        <div className="explore-filter-row">
          <FilterDropdown
            id="artists-category-filter"
            className="explore-dropdown-category"
            ariaLabel="Filter by specialization"
            value={paramCategory}
            options={categoryOptions}
            placeholder="All specializations"
            onSelect={(val) => {
              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
              applyFilters(search, val);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ArtistsFilters({ categories = [] }) {
  return (
    <Suspense fallback={null}>
      <ArtistsFiltersInner categories={categories} />
    </Suspense>
  );
}
