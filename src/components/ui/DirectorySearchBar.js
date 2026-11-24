'use client';

import { Search, X } from '@/components/ui/Icons';

export default function DirectorySearchBar({
  inputRef,
  id,
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder,
  ariaLabel,
  clearButtonId,
  clearAriaLabel = 'Clear search',
}) {
  return (
    <form onSubmit={onSubmit} className="explore-search-form" role="search">
      <div className="explore-search-wrap">
        <Search size={16} />
        <input
          ref={inputRef}
          type="search"
          className="form-input explore-search-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          aria-label={ariaLabel}
          id={id}
        />
        {value && (
          <button
            type="button"
            className="challenge-search-clear"
            onClick={onClear}
            aria-label={clearAriaLabel}
            id={clearButtonId}
          >
            <X size={15} />
          </button>
        )}
      </div>
    </form>
  );
}
