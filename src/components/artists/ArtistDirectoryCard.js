'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, UserRound } from '@/components/ui/Icons';
import { resolveUserAvatarSrc } from '@/lib/avatar';

export default function ArtistDirectoryCard({ artist }) {
  const cleanSrc =
    resolveUserAvatarSrc({
      role: artist?.role || 'member',
      profile_image: artist?.profile_image,
    }) || '';
  const [failedSrc, setFailedSrc] = useState('');
  const hasImage = Boolean(cleanSrc) && failedSrc !== cleanSrc;

  if (!artist) return null;

  const workCount = Number(artist.artwork_count || 0);
  const specialization = artist.primary_category || 'Architectural Creator';
  const shortBio = typeof artist.bio === 'string' ? artist.bio.trim() : '';
  const isInactive =
    artist.is_active === false || artist.is_active === 'false' || artist.is_active === 0;

  return (
    <article className="project-card artist-dir-card" data-id={artist.id}>
      <Link
        href={`/artists/${artist.id}`}
        className="artist-dir-card-link"
        aria-label={`View profile of ${artist.name}`}
      >
        <div className="project-image-wrap artist-dir-media">
          {hasImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cleanSrc}
              alt={artist.name}
              className="project-image artist-dir-photo"
              loading="lazy"
              onError={() => setFailedSrc(cleanSrc)}
            />
          ) : (
            <div className="artist-dir-fallback" aria-hidden="true">
              <div className="artist-dir-fallback-circle">
                <UserRound size={38} strokeWidth={1.5} className="artist-dir-fallback-icon" />
              </div>
            </div>
          )}
        </div>

        <div className="card-editorial-body artist-dir-body">
          <div className="card-top-bar">
            <span className="card-tag-typology">{specialization}</span>
            <span className="artist-dir-works">
              {String(workCount).padStart(2, '0')} {workCount === 1 ? 'Work' : 'Works'}
            </span>
          </div>

          <div className="card-bottom-info artist-dir-info">
            <div className="artist-dir-name-row">
              <h2 className="card-title artist-dir-name">{artist.name}</h2>
              {isInactive && (
                <span className="artist-dir-status-inactive" aria-label="Account status: Inactive">
                  <span className="artist-dir-status-dot" aria-hidden="true" />
                  <span>INACTIVE</span>
                </span>
              )}
            </div>
            <p className="artist-dir-bio">
              {shortBio || `${specialization} creator publishing curated works on ARCHIVE.`}
            </p>
          </div>

          <span className="artist-dir-cta">
            <span>View Profile</span>
            <ArrowRight size={14} strokeWidth={1.75} className="artist-dir-cta-arrow" />
          </span>
        </div>
      </Link>
    </article>
  );
}
