'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, useTransition, Suspense } from 'react';
import FilterDropdown from '@/components/ui/FilterDropdown';
import { Search, X } from '@/components/ui/Icons';

function ExploreFiltersInner({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const applyFilters = (newSearch, newCategory, newSort) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCategory) params.set('category', newCategory);
    if (newSort && newSort !== 'latest') params.set('sort', newSort);
    startTransition(() => {
      router.push(`/explore?${params.toString()}`);
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters(search, category, sort);
  };

  const handleClearSearch = () => {
    setSearch('');
    if (searchParams.get('search')) {
      applyFilters('', category, sort);
    }
    searchInputRef.current?.focus();
  };

  return (
    <div className="explore-filters">
      <form onSubmit={handleSearch} className="explore-search-form" role="search">
        <div className="explore-search-wrap">
          <Search size={16} />
          <input
            ref={searchInputRef}
            type="search"
            className="form-input explore-search-input"
            placeholder="Search artworks or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            aria-label="Search artworks"
            id="explore-search"
          />
          {search && (
            <button
              type="button"
              className="explore-search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search keyword"
              id="btn-explore-search-clear"
            >
              <X size={15} />
            </button>
          )}
          <button type="submit" className="btn-primary explore-search-btn" id="btn-explore-search">
            {isPending ? '...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="explore-filter-row explore-filter-row--pair">
        {/* Category filter */}
        <FilterDropdown
          id="explore-material-filter"
          className="explore-dropdown-category"
          ariaLabel="Filter by category"
          value={category}
          options={categoryOptions}
          placeholder="All Categories"
          onSelect={(val) => {
            setCategory(val);
            applyFilters(search, val, sort);
          }}
        />

        {/* Sort */}
        <FilterDropdown
          id="explore-era-filter"
          className="explore-dropdown-sort"
          ariaLabel="Sort order"
          value={sort}
          options={sortOptions}
          placeholder="Latest"
          onSelect={(val) => {
            setSort(val);
            applyFilters(search, category, val);
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
