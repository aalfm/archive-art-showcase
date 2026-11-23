'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserRound } from '@/components/ui/Icons';

function normalizeAvatarSrc(src) {
  if (typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

export default function UserAvatar({
  src,
  name = 'User',
  size = 40,
  iconSize,
  className = '',
  alt,
}) {
  const cleanSrc = normalizeAvatarSrc(src);
  const [failedSrc, setFailedSrc] = useState('');

  const hasValidImage = Boolean(cleanSrc) && failedSrc !== cleanSrc;
  const resolvedIconSize = iconSize || Math.max(14, Math.round(size * 0.48));

  return (
    <div
      className={`user-avatar ${hasValidImage ? 'user-avatar--image' : 'user-avatar--fallback'} ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      {hasValidImage ? (
        <Image
          src={cleanSrc}
          alt={alt || name}
          fill
          unoptimized
          sizes={`${size}px`}
          style={{ objectFit: 'cover', borderRadius: '50%' }}
          onError={() => setFailedSrc(cleanSrc)}
        />
      ) : (
        <UserRound size={resolvedIconSize} className="user-avatar-icon" />
      )}
    </div>
  );
}
