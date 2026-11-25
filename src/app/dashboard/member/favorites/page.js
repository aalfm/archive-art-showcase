import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { buildMemberDetailHref } from '@/lib/member-navigation';
import ArtworkImage from '@/components/ui/ArtworkImage';
import RemoveFavoriteButton from './RemoveFavoriteButton';
import { Bookmark } from '@/components/ui/Icons';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

function formatSavedDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const metadata = {
  title: 'Favorite Collection — ARCHIVE',
};

export default async function MemberFavoritesPage(props) {
  const [user, searchParams] = await Promise.all([
    requireRole('member'),
    props?.searchParams,
  ]);

  const res = await query(`
    SELECT f.id as favorite_id, f.created_at as favorited_at,
           a.id as artwork_id, a.title, a.image_url, a.like_count,
           c.name as category_name,
           u.id as creator_id, u.name as creator_name
    FROM favorites f
    JOIN artworks a ON f.artwork_id = a.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE f.user_id = $1 AND a.status = 'active'
    ORDER BY f.created_at DESC
  `, [user.id]);

  const favorites = res.rows;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/member' },
          { label: 'Favorites' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Favorites</h1>
          <p className="dashboard-subtitle">Artworks you have saved to your collection ({favorites.length} total).</p>
        </div>
        <Link href="/explore" className="btn-secondary">
          Explore More
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div style={{ padding: 48, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)', textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
          <p style={{ color: 'var(--surface)', fontSize: '0.95rem', marginBottom: 20 }}>
            You haven&apos;t saved any favorite artworks yet.
          </p>
          <Link href="/explore" className="btn-primary">
            Explore Artworks
          </Link>
        </div>
      ) : (
        <div className="masonry-grid">
          {favorites.map((fav) => {
            const artworkHref = buildMemberDetailHref(`/artworks/${fav.artwork_id}`, 'favorites', searchParams);
            const artistHref = buildMemberDetailHref(`/artists/${fav.creator_id}`, 'favorites', searchParams);

            return (
              <article key={fav.favorite_id} className="project-card aspect-square">
                <Link
                  href={artworkHref}
                  className="project-image-wrap"
                  aria-label={`View artwork: ${fav.title}`}
                >
                  <ArtworkImage
                    src={fav.image_url}
                    alt={fav.title}
                    fill
                    className="project-image"
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 639px) 100vw, (max-width: 1079px) 50vw, 33vw"
                  />
                </Link>
                <div className="card-editorial-body">
                  <div className="card-top-bar">
                    <span className="card-tag-typology">{fav.category_name}</span>
                    <span
                      className="card-favorite-badge"
                      title={`Saved to favorites on ${formatSavedDate(fav.favorited_at)}`}
                    >
                      <Bookmark size={13} filled className="card-favorite-icon" />
                      <span>Favorited</span>
                    </span>
                  </div>
                  <div className="card-bottom-info">
                    <Link href={artworkHref}>
                      <h3 className="card-title">{fav.title}</h3>
                    </Link>
                    <span className="card-favorite-date">
                      Saved {formatSavedDate(fav.favorited_at)}
                    </span>
                    <div className="card-favorite-footer">
                      <Link href={artistHref} className="card-author">
                        by {fav.creator_name}
                      </Link>
                      <RemoveFavoriteButton artworkId={fav.artwork_id} artworkTitle={fav.title} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
