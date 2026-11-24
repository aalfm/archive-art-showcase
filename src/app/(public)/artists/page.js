import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { query } from '@/lib/db';
import { applyAvatarPolicy } from '@/lib/avatar';
import PublicPageContainer from '@/components/layout/PublicPageContainer';
import ArtistDirectoryCard from '@/components/artists/ArtistDirectoryCard';
import ArtistsFilters from './ArtistsFilters';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Artists — ARCHIVE',
  description: 'Discover and explore active architects and digital artists on ARCHIVE.',
};

async function getArtistsDirectoryData(searchParams) {
  noStore();
  const search = (searchParams?.search || '').trim();
  const category = (searchParams?.category || '').trim();

  const whereConditions = ["u.role = 'member'"];
  const params = [];
  let paramCount = 0;

  if (search) {
    paramCount++;
    whereConditions.push(`(
      u.name ILIKE $${paramCount}
      OR COALESCE(u.bio, '') ILIKE $${paramCount}
      OR EXISTS (
        SELECT 1
        FROM artworks asrc
        JOIN categories csrc ON asrc.category_id = csrc.id
        WHERE asrc.user_id = u.id
          AND asrc.status = 'active'
          AND csrc.name ILIKE $${paramCount}
      )
    )`);
    params.push(`%${search}%`);
  }

  if (category && /^\d+$/.test(category)) {
    paramCount++;
    whereConditions.push(`EXISTS (
      SELECT 1
      FROM artworks ac
      WHERE ac.user_id = u.id
        AND ac.status = 'active'
        AND ac.category_id = $${paramCount}
    )`);
    params.push(parseInt(category, 10));
  }

  const whereClause = whereConditions.join(' AND ');

  try {
    const [artistsRes, categoriesRes] = await Promise.all([
      query(
        `
        SELECT u.id, u.name, u.bio, u.role,
               CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END as profile_image,
               u.created_at, u.is_active,
               COUNT(a.id)::int as artwork_count,
               COALESCE(SUM(a.like_count), 0)::int as total_likes,
               (
                 SELECT c2.name
                 FROM artworks a2
                 JOIN categories c2 ON a2.category_id = c2.id
                 WHERE a2.user_id = u.id AND a2.status = 'active'
                 GROUP BY c2.id, c2.name
                 ORDER BY COUNT(*) DESC, MAX(a2.created_at) DESC
                 LIMIT 1
               ) as primary_category
        FROM users u
        LEFT JOIN artworks a ON a.user_id = u.id AND a.status = 'active'
        WHERE ${whereClause}
        GROUP BY u.id
        ORDER BY total_likes DESC, artwork_count DESC, u.created_at ASC
        LIMIT 48
        `,
        params
      ),
      query('SELECT id, name FROM categories ORDER BY name ASC'),
    ]);

    const artists = artistsRes.rows.map((row) =>
      applyAvatarPolicy({
        ...row,
        is_active: row.is_active !== false,
      })
    );

    return {
      artists,
      categories: categoriesRes.rows,
      hasFilters: Boolean(search || category),
      error: '',
    };
  } catch (err) {
    console.error('[ArtistsPage] Data fetch error:', err);
    return {
      artists: [],
      categories: [],
      hasFilters: Boolean(search || category),
      error: 'Unable to load artists right now. Please try again later.',
    };
  }
}

export default async function ArtistsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const { artists, categories, hasFilters, error } = await getArtistsDirectoryData(resolvedParams);

  return (
    <PublicPageContainer>
      <div className="showcase-header">
        <div className="showcase-title-area">
          <span className="editorial-eyebrow">CREATOR DIRECTORY</span>
          <h1 className="showcase-heading">Artists</h1>
          <p className="showcase-subtitle">
            Discover architects, spatial designers, and digital visual creators on ARCHIVE.
          </p>
        </div>
      </div>

      <ArtistsFilters categories={categories} />

      <div className="masonry-grid">
        {error ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--ink-primary)' }}>
              UNABLE TO LOAD ARTISTS
            </p>
            <p style={{ marginTop: 8, color: 'var(--ink-secondary)', fontSize: '0.88rem' }}>
              {error}
            </p>
          </div>
        ) : artists.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--surface)' }}>
              {hasFilters ? 'NO MATCHING ARTISTS' : 'NO ARTISTS AVAILABLE'}
            </p>
            <p style={{ marginTop: 8, color: 'var(--surface)', fontSize: '0.88rem' }}>
              {hasFilters
                ? 'Try adjusting your filters or search keywords.'
                : 'Artists will appear here once they publish active works.'}
            </p>
            {hasFilters && (
              <Link href="/artists" className="btn-secondary" style={{ marginTop: 18 }}>
                Reset Filters
              </Link>
            )}
          </div>
        ) : (
          artists.map((artist) => (
            <ArtistDirectoryCard key={artist.id} artist={artist} />
          ))
        )}
      </div>
    </PublicPageContainer>
  );
}
