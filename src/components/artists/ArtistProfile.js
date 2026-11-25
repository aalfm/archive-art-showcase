import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';

function formatIndex(num) {
  return String(num).padStart(2, '0');
}

function formatJoinDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function ArtistProfile({ artist, index = 0, total = 1 }) {
  if (!artist) return null;

  return (
    <div className="artist-showcase-profile">
      <div className="artist-profile-identity">
        <UserAvatar
          src={artist.profile_image}
          role={artist.role || 'member'}
          name={artist.name}
          size={72}
          className="artist-showcase-avatar"
        />

        <div className="artist-profile-heading-block">
          <div className="artist-profile-kicker">
            <span className="artist-profile-index">
              ARCHITECT / ARTIST {formatIndex(index + 1)} OF {formatIndex(total)}
            </span>
          </div>

          <h2 className="artist-showcase-name">
            <Link href={`/artists/${artist.id}`} className="artist-showcase-name-link">
              {artist.name}
            </Link>
          </h2>

          {artist.bio && (
            <p className="artist-showcase-bio">{artist.bio}</p>
          )}

          <div className="artist-showcase-links">
            <Link href={`/artists/${artist.id}`} className="editorial-inline-cta">
              <span>View artist page</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            {artist.external_link && (
              <a
                href={artist.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-showcase-external"
              >
                <span>Portfolio</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="artist-showcase-stats">
        <div className="artist-stat-item">
          <span className="artist-stat-label">Published works</span>
          <span className="artist-stat-value">{artist.artwork_count ?? 0}</span>
        </div>
        <div className="artist-stat-item">
          <span className="artist-stat-label">Total likes</span>
          <span className="artist-stat-value">{artist.total_likes ?? 0}</span>
        </div>
        <div className="artist-stat-item">
          <span className="artist-stat-label">Member since</span>
          <span className="artist-stat-value">{formatJoinDate(artist.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
