'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Folder from '@/components/ui/Folder';
import { UserRound } from '@/components/ui/Icons';

const CREAM_FOLDER_VARS = {
  '--folder-base': '#F2EEE6',
  '--folder-front-top': '#F6F3EC',
  '--folder-front-bottom': '#ECE6DC',
  '--folder-inside-top': '#EAE3D8',
  '--folder-inside-bottom': '#E3DCD0',
  '--folder-tab-ink': '#55514B',
};

function normalizeImageSrc(src) {
  if (!src || typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === 'images.pexels.com' && !parsed.search) {
      parsed.search = '?auto=compress&cs=tinysrgb&w=720';
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return trimmed;
}

function ArtistCoverAvatar({ src, name }) {
  const cleanSrc = normalizeImageSrc(src);
  const [failedSrc, setFailedSrc] = useState('');
  const hasImage = Boolean(cleanSrc) && failedSrc !== cleanSrc;

  return (
    <div className={`artist-cover-avatar-frame${hasImage ? '' : ' is-fallback'}`}>
      {hasImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={cleanSrc}
          alt={name || 'Artist profile'}
          draggable={false}
          className="artist-cover-avatar-img"
          onError={() => setFailedSrc(cleanSrc)}
        />
      ) : (
        <UserRound className="artist-cover-avatar-icon" aria-hidden="true" />
      )}
    </div>
  );
}

function ArtistArtworkSheet({ artwork }) {
  const src = normalizeImageSrc(artwork?.image_url);
  const [failedSrc, setFailedSrc] = useState('');
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div className="artist-dossier-sheet">
      <div className="artist-dossier-sheet-media">
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={artwork?.title || 'Artwork preview'}
            draggable={false}
            className="artist-dossier-sheet-img"
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <div className="artist-dossier-sheet-fallback" aria-hidden="true">
            <span>ARTHIVE</span>
          </div>
        )}
      </div>
      <div className="artist-dossier-sheet-footer">
        <span className="artist-dossier-sheet-title">{artwork?.title || 'Untitled Work'}</span>
      </div>
    </div>
  );
}

function ArtistFolderCover({ artist }) {
  const workCount = Number(artist.artwork_count || 0);
  const specialization = artist.primary_category || 'Architectural Creator';
  const shortBio = typeof artist.bio === 'string' ? artist.bio.trim() : '';

  return (
    <div className="artist-cover">
      <div className="artist-cover-corner">
        <span className="artist-cover-count">
          <span aria-hidden="true" />
          {String(workCount).padStart(2, '0')} {workCount === 1 ? 'Work' : 'Works'}
        </span>
      </div>

      <div className="artist-cover-body">
        <ArtistCoverAvatar src={artist.profile_image} name={artist.name} />

        <div className="artist-cover-info">
          <span className="artist-cover-spec">{specialization}</span>
          <span className="artist-cover-name">{artist.name}</span>
          {shortBio && <span className="artist-cover-desc">{shortBio}</span>}
        </div>
      </div>
    </div>
  );
}

function GalleryPreviewImage({ src, alt }) {
  const cleanSrc = normalizeImageSrc(src);
  const [failedSrc, setFailedSrc] = useState('');
  const showImage = Boolean(cleanSrc) && failedSrc !== cleanSrc;

  if (!showImage) {
    return (
      <div className="artist-dossier-work-fallback" aria-hidden="true">
        <span>Preview Unavailable</span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={cleanSrc}
      alt={alt}
      className="artist-dossier-work-img"
      loading="lazy"
      onError={() => setFailedSrc(cleanSrc)}
    />
  );
}

export default function ArtistsSection({ artists = [] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderSize, setFolderSize] = useState(1.48);

  const safeArtists = useMemo(
    () =>
      (Array.isArray(artists) ? artists : []).map((artist) => ({
        ...artist,
        artworks: Array.isArray(artist.artworks) ? artist.artworks : [],
      })),
    [artists]
  );

  const totalArtists = safeArtists.length;
  const currentIndex = totalArtists > 0 ? activeIndex % totalArtists : 0;
  const activeArtist = safeArtists[currentIndex] || null;

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 380) {
        setFolderSize(0.76);
      } else if (width < 460) {
        setFolderSize(0.88);
      } else if (width < 640) {
        setFolderSize(1.04);
      } else if (width < 860) {
        setFolderSize(1.24);
      } else if (width < 1080) {
        setFolderSize(1.38);
      } else {
        setFolderSize(1.52);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!folderOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setFolderOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [folderOpen]);

  const handlePrevious = useCallback(() => {
    if (totalArtists <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalArtists) % totalArtists);
  }, [totalArtists]);

  const handleNext = useCallback(() => {
    if (totalArtists <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalArtists);
  }, [totalArtists]);

  const artistArtworks = useMemo(
    () => (activeArtist ? activeArtist.artworks : []),
    [activeArtist]
  );

  const folderItems = useMemo(
    () =>
      artistArtworks.slice(0, 6).map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        href: `/artworks/${artwork.id}`,
        content: <ArtistArtworkSheet key={artwork.id} artwork={artwork} />,
      })),
    [artistArtworks]
  );

  const handleFolderItemClick = useCallback(
    (item) => {
      if (item?.href) {
        router.push(item.href);
      }
    },
    [router]
  );

  if (!activeArtist) return null;

  const galleryCols =
    artistArtworks.length === 1 ? 'single' : artistArtworks.length === 2 ? 'double' : 'triple';

  return (
    <section
      className="editorial-artists-section"
      aria-label="Featured Architects and Artists"
    >
      <div className="editorial-container">
        <header className="editorial-section-header">
          <div className="editorial-section-title-group">
            <span className="editorial-eyebrow">CREATOR DOSSIER</span>
            <h2 className="editorial-section-heading">Featured Artists</h2>
            <p className="editorial-section-subtitle">
              Open an artist&apos;s portfolio dossier to inspect their architectural works curated on ARTHIVE.
            </p>
          </div>
          <Link href="/artists" className="editorial-header-link">
            <span>View All Artists</span>
          </Link>
        </header>

        <div className={`artist-dossier-stage${folderOpen ? ' is-open' : ''}`}>
          {/* Primary Single Visual Focus: Warm Cream Landscape React Bits Folder */}
          <div className="artist-dossier-folder-area">
            <Folder
              mode="flap"
              orientation="landscape"
              variant="solid"
              color="#F2EEE6"
              paperColor="#FCFBF8"
              theme="light"
              tabPosition="left"
              layout="row"
              label={`DOSSIER ${String(currentIndex + 1).padStart(2, '0')}`}
              style={CREAM_FOLDER_VARS}
              items={folderItems}
              cover={<ArtistFolderCover key={activeArtist.id} artist={activeArtist} />}
              size={folderSize}
              open={folderOpen}
              onOpenChange={setFolderOpen}
              draggable={false}
              zoomOnClick={false}
              closeOnOutsideClick={false}
              peek={true}
              tilt={0.38}
              bounce={0.24}
              speed={0.95}
              onItemClick={handleFolderItemClick}
            />
          </div>

          {/* Smoothly Revealed Artist Works Preview Gallery */}
          <div
            className="artist-dossier-drawer"
            data-open={folderOpen ? 'true' : 'false'}
            aria-hidden={!folderOpen}
          >
            <div className="artist-dossier-drawer-inner">
              <div className="artist-dossier-drawer-head">
                <div className="artist-dossier-drawer-identity">
                  <span className="artist-dossier-drawer-kicker">
                    {activeArtist.primary_category || 'Selected Works'}
                  </span>
                  <h3 className="artist-dossier-drawer-title">
                    {activeArtist.name}
                    <span className="artist-dossier-drawer-count">
                      {artistArtworks.length} {artistArtworks.length === 1 ? 'Work' : 'Works'}
                    </span>
                  </h3>
                </div>

                <div className="artist-dossier-drawer-controls">
                  <Link
                    href={`/artists/${activeArtist.id}`}
                    className="artist-dossier-profile-link"
                    tabIndex={folderOpen ? 0 : -1}
                  >
                    <span>Artist Profile</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </Link>

                  <button
                    type="button"
                    className="artist-dossier-close-btn"
                    onClick={() => setFolderOpen(false)}
                    tabIndex={folderOpen ? 0 : -1}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span>Back to Folder</span>
                  </button>
                </div>
              </div>

              {artistArtworks.length > 0 ? (
                <div
                  key={activeArtist.id}
                  className={`artist-dossier-gallery artist-dossier-gallery--${galleryCols}`}
                >
                  {artistArtworks.map((artwork, idx) => (
                    <Link
                      key={artwork.id}
                      href={`/artworks/${artwork.id}`}
                      className="artist-dossier-work"
                      tabIndex={folderOpen ? 0 : -1}
                    >
                      <div className="artist-dossier-work-media">
                        <GalleryPreviewImage
                          src={artwork.image_url}
                          alt={artwork.title || 'Artwork'}
                        />
                      </div>
                      <div className="artist-dossier-work-caption">
                        <span className="artist-dossier-work-idx">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="artist-dossier-work-title">
                          {artwork.title}
                        </span>
                        <span className="artist-dossier-work-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="artist-dossier-empty">No published works available for this artist yet.</p>
              )}
            </div>
          </div>

          {/* Minimal Inter-Artist Navigation */}
          <div className="artist-dossier-nav" role="navigation" aria-label="Featured artist dossier navigation">
            <button
              type="button"
              className="artist-dossier-nav-btn"
              onClick={handlePrevious}
              disabled={totalArtists <= 1}
              aria-label="Previous artist"
            >
              <span>Prev</span>
            </button>

            {totalArtists > 1 && (
              <div className="artist-dossier-nav-center">
                <div className="artist-dossier-dots" role="tablist" aria-label="Select featured artist">
                  {safeArtists.map((artist, idx) => (
                    <button
                      key={artist.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === currentIndex}
                      aria-label={`View dossier ${idx + 1} of ${totalArtists}: ${artist.name}`}
                      className={`artist-dossier-dot${idx === currentIndex ? ' is-active' : ''}`}
                      onClick={() => setActiveIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="artist-dossier-nav-btn"
              onClick={handleNext}
              disabled={totalArtists <= 1}
              aria-label="Next artist"
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
