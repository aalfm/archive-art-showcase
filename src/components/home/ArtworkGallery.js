'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ArtworkImage from '@/components/ui/ArtworkImage';
import { ChevronDown, Heart, Menu } from '@/components/ui/Icons';

function formatCategoryLabel(name) {
  if (!name) return '';
  const cleaned = name.replace(/\s*\barchitecture\b/gi, '').trim();
  return cleaned || name;
}

export default function ArtworkGallery({ popularArtworks, latestArtworks, categories }) {
  const [activeCategory, setActiveCategory] = useState('SEMUA');
  const [activeTab, setActiveTab] = useState('latest');
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const mobileCatRef = useRef(null);
  const mobileCatTriggerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (mobileCatRef.current && !mobileCatRef.current.contains(e.target)) {
        setMobileCatOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape' && mobileCatOpen) {
        setMobileCatOpen(false);
        mobileCatTriggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [mobileCatOpen]);

  const handleMobileMenuKeyDown = (e) => {
    const options = Array.from(
      mobileCatRef.current?.querySelectorAll('[role="option"]') || []
    );
    if (options.length === 0) return;

    const currentIndex = options.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      options[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      options[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      options[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      options[options.length - 1]?.focus();
    }
  };

  const activeCategoryLabel =
    activeCategory === 'SEMUA'
      ? 'All Categories'
      : formatCategoryLabel(
        categories.find((c) => c.name.toUpperCase() === activeCategory)?.name || activeCategory
      );

  const displayArtworks = activeTab === 'popular' ? popularArtworks : latestArtworks;

  const filtered = activeCategory === 'SEMUA'
    ? displayArtworks
    : displayArtworks.filter(a =>
      a.category_name?.toUpperCase() === activeCategory.toUpperCase()
    );

  const gridModifier =
    filtered.length === 1
      ? 'gallery-grid--single'
      : filtered.length === 2 || filtered.length === 4
        ? 'gallery-grid--two'
        : '';

  return (
    <section className="showcase-section" id="galeri">
      <div className="showcase-container">
        <div className="showcase-header">
          <div className="showcase-title-area">
            <h2 className="showcase-heading">ARTWORK GALLERY</h2>
            <p className="showcase-subtitle">
              Explore curated architectural works from creators on ARCHIVE
            </p>
          </div>

          {/* Tab: Latest / Popular */}
          <div className="gallery-sort-tabs">
            <button
              type="button"
              className={`gallery-sort-btn ${activeTab === 'latest' ? 'active' : ''}`}
              onClick={() => setActiveTab('latest')}
              aria-pressed={activeTab === 'latest'}
            >
              Latest
            </button>
            <button
              type="button"
              className={`gallery-sort-btn ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
              aria-pressed={activeTab === 'popular'}
            >
              Popular
            </button>
          </div>
        </div>

        {/* Mobile Single-Row Controls: Left (Latest | Popular) + Right (All Categories Dropdown) */}
        <div className="mobile-gallery-controls">
          <div className="gallery-sort-tabs mobile-sort-tabs" role="group" aria-label="Sort artworks">
            <button
              type="button"
              className={`gallery-sort-btn ${activeTab === 'latest' ? 'active' : ''}`}
              onClick={() => setActiveTab('latest')}
              aria-pressed={activeTab === 'latest'}
            >
              Latest
            </button>
            <button
              type="button"
              className={`gallery-sort-btn ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
              aria-pressed={activeTab === 'popular'}
            >
              Popular
            </button>
          </div>

          <div className={`mobile-cat-dropdown ${mobileCatOpen ? 'is-open' : ''}`} ref={mobileCatRef}>
            <button
              ref={mobileCatTriggerRef}
              type="button"
              className={`mobile-cat-trigger ${mobileCatOpen ? 'active' : ''}`}
              onClick={() => setMobileCatOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={mobileCatOpen}
              aria-label="Filter gallery by category"
            >
              <Menu size={15} className="mobile-cat-icon" />
              <span className="mobile-cat-label">{activeCategoryLabel}</span>
              <ChevronDown
                size={15}
                className={`mobile-cat-chevron ${mobileCatOpen ? 'rotated' : ''}`}
              />
            </button>

            {mobileCatOpen && (
              <div
                className="mobile-cat-menu"
                role="listbox"
                aria-label="Gallery categories"
                onKeyDown={handleMobileMenuKeyDown}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={activeCategory === 'SEMUA'}
                  className={`mobile-cat-option ${activeCategory === 'SEMUA' ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveCategory('SEMUA');
                    setMobileCatOpen(false);
                  }}
                >
                  <span>All Categories</span>
                </button>

                {categories.map((cat) => {
                  const keyUpper = cat.name.toUpperCase();
                  const isSelected = activeCategory === keyUpper;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`mobile-cat-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setActiveCategory(keyUpper);
                        setMobileCatOpen(false);
                      }}
                    >
                      <span>{formatCategoryLabel(cat.name)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="filter-tabs" role="tablist" aria-label="Category filter">
          <button
            type="button"
            className={`filter-tab-btn ${activeCategory === 'SEMUA' ? 'active' : ''}`}
            onClick={() => setActiveCategory('SEMUA')}
            role="tab"
            aria-selected={activeCategory === 'SEMUA'}
            data-filter="SEMUA"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              className={`filter-tab-btn ${activeCategory === cat.name.toUpperCase() ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.name.toUpperCase())}
              role="tab"
              aria-selected={activeCategory === cat.name.toUpperCase()}
              data-filter={cat.name.toUpperCase()}
            >
              {formatCategoryLabel(cat.name)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={`masonry-grid ${gridModifier}`.trim()} id="masonry-grid">
          {filtered.length === 0 ? (
            <div className="gallery-empty-state">
              <p className="gallery-empty-title">
                NO WORKS IN THIS CATEGORY YET
              </p>
              <Link href="/dashboard/member/artworks/create" className="btn-primary">
                Be the first to upload
              </Link>
            </div>
          ) : (
            filtered.map((artwork, idx) => (
              <ArtworkGridCard key={artwork.id} artwork={artwork} priority={idx < 3} />
            ))
          )}
        </div>

        <div className="gallery-footer-action">
          <Link href="/explore" className="btn-secondary" id="btn-load-more">
            View All Works
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArtworkGridCard({ artwork, priority }) {
  return (
    <article className="project-card artwork-card" data-id={artwork.id}>
      <Link href={`/artworks/${artwork.id}`} className="project-image-wrap" aria-label={artwork.title}>
        <ArtworkImage
          src={artwork.image_url}
          alt={artwork.title}
          fill
          className="project-image"
          sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
          priority={priority}
        />
      </Link>

      <div className="card-top-bar">
        <span className="card-tag-typology">{formatCategoryLabel(artwork.category_name) || 'Architecture'}</span>
        <div className="card-actions-top">
          <span className="card-like-count">
            <Heart size={16} className="card-like-icon" />
            <span className="card-like-num">{artwork.like_count || 0}</span>
          </span>
        </div>
      </div>

      <div className="card-bottom-info">
        <Link href={`/artworks/${artwork.id}`}>
          <h3 className="card-title">{artwork.title}</h3>
        </Link>
        <div className="card-meta-reveal">
          <span>
            {artwork.tags?.split(',').slice(0, 2).map(t => t.trim()).join(' · ')}
          </span>
          <Link href={`/artworks/${artwork.id}`} className="card-view-btn">
            <span>VIEW WORK</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
