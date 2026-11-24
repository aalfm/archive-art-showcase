'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition, Suspense } from 'react';
import DirectorySearchBar from '@/components/ui/DirectorySearchBar';
import FilterDropdown from '@/components/ui/FilterDropdown';

function ExploreFiltersInner({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const paramSearch = searchParams.get('search') || '';
  const paramCategory = searchParams.get('category') || '';
  const paramSort = searchParams.get('sort') || 'latest';

  const [search, setSearch] = useState(paramSearch);
  const [prevParamSearch, setPrevParamSearch] = useState(paramSearch);

  if (prevParamSearch !== paramSearch) {
    setPrevParamSearch(paramSearch);
    setSearch(paramSearch);
  }

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const applyFilters = useCallback(
    (newSearch, newCategory, newSort) => {
      const params = new URLSearchParams();
      const trimmed = (newSearch || '').trim();
      if (trimmed) params.set('search', trimmed);
      if (newCategory) params.set('category', String(newCategory));
      if (newSort && newSort !== 'latest') params.set('sort', newSort);
      const qs = params.toString();
      const targetUrl = qs ? `/explore?${qs}` : '/explore';
      startTransition(() => {
        router.replace(targetUrl, { scroll: false });
      });
    },
    [router]
  );

  useEffect(() => {
    const trimmed = search.trim();
    const currentParam = paramSearch.trim();
    if (trimmed === currentParam) return undefined;

    debounceTimerRef.current = setTimeout(() => {
      applyFilters(trimmed, paramCategory, paramSort);
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search, paramSearch, paramCategory, paramSort, applyFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    applyFilters(search, paramCategory, paramSort);
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSearch('');
    if (paramSearch) {
      applyFilters('', paramCategory, paramSort);
    }
    searchInputRef.current?.focus();
  };

  return (
    <div className="explore-filters">
      <DirectorySearchBar
        inputRef={searchInputRef}
        id="explore-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSubmit={handleSearch}
        onClear={handleClearSearch}
        placeholder="Search artworks or artists..."
        ariaLabel="Search artworks"
        clearButtonId="btn-explore-search-clear"
        clearAriaLabel="Clear search keyword"
      />

      <div className="explore-filter-row explore-filter-row--pair">
        {/* Category filter */}
        <FilterDropdown
          id="explore-material-filter"
          className="explore-dropdown-category"
          ariaLabel="Filter by category"
          value={paramCategory}
          options={categoryOptions}
          placeholder="All Categories"
          onSelect={(val) => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            applyFilters(search, val, paramSort);
          }}
        />

        {/* Sort */}
        <FilterDropdown
          id="explore-era-filter"
          className="explore-dropdown-sort"
          ariaLabel="Sort order"
          value={paramSort}
          options={sortOptions}
          placeholder="Latest"
          onSelect={(val) => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            applyFilters(search, paramCategory, val);
          }}
        />
      </div>
    </div>
  );
}

export default function ExploreFilters({ categories }) {
  return (
    <Suspense fallback={null}>
      <ExploreFiltersInner categories={categories} />
    </Suspense>
  );
}
