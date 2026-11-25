'use client';

import { useState } from 'react';
import Image from 'next/image';

function normalizeImageSrc(src) {
  if (!src || typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';

  // Request a web-sized Pexels rendition when no query params are present so multi-megabyte originals don't stall mobile/proxy loads
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === 'images.pexels.com' && !parsed.search) {
      parsed.search = '?auto=compress&cs=tinysrgb&w=1200';
      return parsed.toString();
    }
  } catch {
  }

  return trimmed;
}

function ArtworkImageInner({ src, alt, fill, className, sizes, priority, style }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="artwork-image-fallback" role="img" aria-label={alt || 'Artwork image unavailable'}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span>Image unavailable</span>
      </div>
    );
  }

  const shouldSkipOptimization = /^https?:\/\//i.test(src) || src.startsWith('/uploads/');

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      style={style}
      unoptimized={shouldSkipOptimization}
      onError={() => setFailed(true)}
    />
  );
}

export default function ArtworkImage({
  src,
  alt = '',
  fill = true,
  className = '',
  sizes,
  priority = false,
  style,
}) {
  const resolvedSrc = normalizeImageSrc(src);

  return (
    <ArtworkImageInner
      key={resolvedSrc}
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      style={style}
    />
  );
}
