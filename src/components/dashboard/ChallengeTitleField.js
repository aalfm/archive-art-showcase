'use client';

import { useEffect, useState } from 'react';
import {
  DUPLICATE_CHALLENGE_NAME_ERROR,
  findDuplicateChallengeMatch,
  normalizeChallengeName,
} from '@/lib/challenge-validation';

/**
 * Shared client hook for normalizing and validating challenge title uniqueness
 * synchronously against SSR-loaded titles and asynchronously via live API check.
 */
export function useChallengeTitleValidation({
  initialTitle = '',
  existingChallenges = [],
  excludeChallengeId = null,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [liveCheck, setLiveCheck] = useState({ normalizedTitle: '', duplicate: false });
  const [serverDuplicateTitle, setServerDuplicateTitle] = useState('');

  useEffect(() => {
    const normalized = normalizeChallengeName(title);
    if (!normalized || normalized.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ title });
        if (excludeChallengeId) {
          params.set('excludeId', String(excludeChallengeId));
        }
        const res = await fetch(`/api/challenges/check-name?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setLiveCheck({
          normalizedTitle: data.normalizedTitle || normalized,
          duplicate: Boolean(data.duplicate),
        });
      } catch {
        // Ignore abort/network errors; authoritative server validation handles submit.
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [title, excludeChallengeId]);

  const normalizedTitle = normalizeChallengeName(title);
  const matchesLocal = Boolean(
    findDuplicateChallengeMatch(title, existingChallenges, excludeChallengeId)
  );
  const matchesLive = Boolean(
    normalizedTitle &&
      liveCheck.normalizedTitle === normalizedTitle &&
      liveCheck.duplicate
  );
  const matchesServer = Boolean(
    normalizedTitle && serverDuplicateTitle === normalizedTitle
  );

  const isDuplicate = matchesLocal || matchesLive || matchesServer;
  const titleError = isDuplicate ? DUPLICATE_CHALLENGE_NAME_ERROR : '';

  const handleTitleChange = (nextTitle) => {
    setTitle(nextTitle);
    if (serverDuplicateTitle && normalizeChallengeName(nextTitle) !== serverDuplicateTitle) {
      setServerDuplicateTitle('');
    }
  };

  const markServerDuplicate = (failedTitle) => {
    const normalized = normalizeChallengeName(failedTitle);
    if (normalized) {
      setServerDuplicateTitle(normalized);
      setLiveCheck({ normalizedTitle: normalized, duplicate: true });
    }
  };

  return {
    title,
    setTitle: handleTitleChange,
    isDuplicate,
    titleError,
    markServerDuplicate,
  };
}

export default function ChallengeTitleField({
  value,
  onChange,
  error = '',
  placeholder = 'e.g., Architectural Speculations 2026',
}) {
  const hasError = Boolean(error);

  return (
    <div className="form-group">
      <label htmlFor="title" className="form-label">Challenge Title *</label>
      <input
        id="title"
        name="title"
        type="text"
        className={`form-input${hasError ? ' is-invalid' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={3}
        maxLength={200}
        aria-required="true"
        aria-invalid={hasError}
        aria-describedby={hasError ? 'title-feedback' : undefined}
      />
      {hasError && (
        <p id="title-feedback" className="form-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
