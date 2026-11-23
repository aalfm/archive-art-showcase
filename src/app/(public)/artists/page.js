import Link from 'next/link';
import { query } from '@/lib/db';
import PublicPageContainer from '@/components/layout/PublicPageContainer';
import UserAvatar from '@/components/ui/UserAvatar';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Artists — ARCHIVE',
  description: 'Discover and explore top digital artists on ARCHIVE.',
};

async function getArtists() {
  const res = await query(`
    SELECT u.id, u.name, u.bio, u.profile_image, u.external_link, u.created_at,
           COUNT(a.id) as artwork_count,
           COALESCE(SUM(a.like_count), 0) as total_likes
    FROM users u
    LEFT JOIN artworks a ON a.user_id = u.id AND a.status = 'active'
    WHERE u.role = 'member'
    GROUP BY u.id
    HAVING COUNT(a.id) > 0
    ORDER BY total_likes DESC, u.created_at ASC
    LIMIT 48
  `);
  return res.rows;
}

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <PublicPageContainer>
      <div className="showcase-header">
        <div className="showcase-title-area">
          <h1 className="showcase-heading">ARTISTS</h1>
          <p className="showcase-subtitle">
            Discover active artists and architects on ARCHIVE.
          </p>
        </div>
      </div>

      {artists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--surface)' }}>
            NO REGISTERED ARTISTS YET
          </p>
        </div>
      ) : (
        <div className="artists-grid">
            {artists.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`} className="artist-card">
                <UserAvatar
                  src={artist.profile_image}
                  name={artist.name}
                  size={60}
                  className="artist-card-avatar"
                />
                <div className="artist-card-info">
                  <h3 className="artist-card-name">{artist.name}</h3>
                  {artist.bio && (
                    <p className="artist-card-bio">{artist.bio.substring(0, 80)}{artist.bio.length > 80 ? '...' : ''}</p>
                  )}
                  <div className="artist-card-stats">
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      {artist.artwork_count} artworks
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {artist.total_likes} likes
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </PublicPageContainer>
  );
}
