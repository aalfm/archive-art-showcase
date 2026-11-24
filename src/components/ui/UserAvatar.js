'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Award, Shield, UserRound } from '@/components/ui/Icons';
import {
  getAvatarVariant,
  getDefaultAvatarLabel,
  resolveUserAvatarSrc,
} from '@/lib/avatar';

export default function UserAvatar({
  src,
  role = 'member',
  name = 'User',
  size = 40,
  iconSize,
  className = '',
  alt,
}) {
  const variant = getAvatarVariant(role);
  const cleanSrc = resolveUserAvatarSrc({ role: variant, src }) || '';
  const [failedSrc, setFailedSrc] = useState('');

  const hasValidImage = Boolean(cleanSrc) && failedSrc !== cleanSrc;
  const resolvedIconSize = iconSize || Math.max(12, Math.round(size * 0.5));
  const strokeWidth = size <= 28 ? 2 : 1.75;

  const renderRoleIcon = () => {
    if (variant === 'admin') {
      return (
        <Shield
          size={resolvedIconSize}
          strokeWidth={strokeWidth}
          className="user-avatar-icon user-avatar-icon--admin"
        />
      );
    }
    if (variant === 'curator') {
      return (
        <Award
          size={resolvedIconSize}
          strokeWidth={strokeWidth}
          className="user-avatar-icon user-avatar-icon--curator"
        />
      );
    }
    return (
      <UserRound
        size={resolvedIconSize}
        strokeWidth={strokeWidth}
        className="user-avatar-icon user-avatar-icon--member"
      />
    );
  };

  return (
    <div
      className={`user-avatar ${hasValidImage ? 'user-avatar--image' : 'user-avatar--fallback'} user-avatar--${variant} ${className}`.trim()}
      data-avatar-variant={variant}
      data-avatar-mode={hasValidImage ? 'image' : 'fallback'}
      style={{ width: size, height: size }}
      aria-label={!hasValidImage ? alt || `${name} (${getDefaultAvatarLabel(variant)})` : undefined}
    >
      {hasValidImage ? (
        <Image
          src={cleanSrc}
          alt={alt || name}
          fill
          unoptimized
          sizes={`${size}px`}
          className="user-avatar-img"
          style={{ objectFit: 'cover', borderRadius: '50%' }}
          onError={() => setFailedSrc(cleanSrc)}
        />
      ) : (
        renderRoleIcon()
      )}
    </div>
  );
}
