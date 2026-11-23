'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from '@/components/ui/Icons';

export default function FilterDropdown({
  id,
  ariaLabel,
  value,
  options,
  onSelect,
  placeholder,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const handleMenuKeyDown = (e) => {
    const items = Array.from(containerRef.current?.querySelectorAll('[role="option"]') || []);
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div className={`explore-category-dropdown ${className} ${isOpen ? 'is-open' : ''}`.trim()} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`category-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="category-dropdown-label">{selectedOption?.label || placeholder}</span>
        <ChevronDown
          size={16}
          className={isOpen ? 'rotated' : ''}
        />
      </button>

      {isOpen && (
        <div
          className="category-dropdown-menu"
          role="listbox"
          aria-label={ariaLabel}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((opt) => {
            const isSelected = String(value) === String(opt.value);
            return (
              <button
                type="button"
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                className={`category-dropdown-option ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
