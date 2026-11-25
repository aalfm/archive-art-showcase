import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PublicPageContainer from '@/components/layout/PublicPageContainer';
import ArtworkCard from '@/components/ui/ArtworkCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ExploreFilters from './ExploreFilters';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Explore Artworks — ARCHIVE',
  description: 'Discover the finest digital artworks from ARCHIVE artists.',
};

async function getArtworks(searchParams) {
  const search = searchParams?.search || '';
  const category = searchParams?.category || '';
  const sort = searchParams?.sort || 'latest';

  const sortClause = sort === 'popular' ? 'a.like_count DESC' : 'a.created_at DESC';

  let whereConditions = ["a.status = 'active'"];
  const params = [];
  let paramCount = 0;

  if (search) {
    paramCount++;
    whereConditions.push(`(a.title ILIKE $${paramCount} OR u.name ILIKE $${paramCount})`);
    params.push(`%${search}%`);
  }

  if (category && /^\d+$/.test(category)) {
    paramCount++;
    whereConditions.push(`c.id = $${paramCount}`);
    params.push(parseInt(category));
  }

  const whereClause = whereConditions.join(' AND ');

  const [artworksRes, categoriesRes] = await Promise.all([
    query(`
      SELECT a.id, a.title, a.image_url, a.tags, a.like_count, a.created_at,
             c.name as category_name, c.id as category_id,
             u.id as creator_id, u.name as creator_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ${whereClause}
      ORDER BY ${sortClause}
      LIMIT 48
    `, params),
    query('SELECT id, name FROM categories ORDER BY name ASC'),
  ]);

  return {
    artworks: artworksRes.rows,
    categories: categoriesRes.rows,
    total: artworksRes.rows.length,
  };
}

async function getLikedArtworkIds(userId) {
  if (!userId) return new Set();
  const res = await query('SELECT artwork_id FROM artwork_likes WHERE user_id = $1', [userId]);
  return new Set(res.rows.map((row) => row.artwork_id));
}

export default async function ExplorePage({ searchParams }) {
  const resolvedParams = await searchParams;
  const [session, data] = await Promise.all([
    getSession(),
    getArtworks(resolvedParams),
  ]);
  const isAdmin = session?.user?.role === 'admin';
  const isCurator = session?.user?.role === 'curator';
  const isReadOnly = isAdmin || isCurator;
  const likedIds = isReadOnly ? new Set() : await getLikedArtworkIds(session?.user?.id);
  const selectedCategory = resolvedParams?.category
    ? data.categories.find((c) => String(c.id) === String(resolvedParams.category))
    : null;
  const breadcrumbItems = selectedCategory
    ? [
        { label: 'Home', href: '/' },
        { label: 'Explore', href: '/explore' },
        { label: selectedCategory.name },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Explore' },
      ];

  return (
    <PublicPageContainer>
      <Breadcrumb items={breadcrumbItems} className="archive-breadcrumb--public" />
      <div className="showcase-header">
        <div className="showcase-title-area">
          <span className="editorial-eyebrow">ARCHIVE COLLECTION</span>
          <h1 className="showcase-heading">Explore Artworks</h1>
          <p className="showcase-subtitle">
            Discover curated architectural works from creators on ARCHIVE.
          </p>
        </div>
      </div>

      <ExploreFilters categories={data.categories} />

      <div className="masonry-grid">
        {data.artworks.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
              No matching artworks
            </p>
            <p style={{ marginTop: 8, color: 'var(--surface)', fontSize: '0.88rem' }}>
              Try adjusting your filters or search keywords.
            </p>
          </div>
        ) : (
          data.artworks.map((artwork, idx) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              priority={idx < 6}
              isLoggedIn={Boolean(session?.user)}
              isAdmin={isAdmin}
              isReadOnly={isReadOnly}
              initialLiked={likedIds.has(artwork.id)}
            />
          ))
        )}
      </div>
    </PublicPageContainer>
  );
}
