import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import RemoveFavoriteButton from './RemoveFavoriteButton';
import { Heart } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Favorite Collection — ARCHIVE',
};

export default async function MemberFavoritesPage() {
  const user = await requireRole('member');

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
        <div style={{ padding: 48, background: '#141618', borderRadius: 8, textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
          <p style={{ color: 'var(--surface)', fontSize: '0.95rem', marginBottom: 20 }}>
            You haven&apos;t saved any favorite artworks yet.
          </p>
          <Link href="/explore" className="btn-primary">
            Explore Artworks
          </Link>
        </div>
      ) : (
        <div className="masonry-grid">
          {favorites.map((fav) => (
            <article key={fav.favorite_id} className="project-card aspect-square">
              <Link href={`/artworks/${fav.artwork_id}`} className="project-image-wrap">
                <Image src={fav.image_url} alt={fav.title} fill className="project-image" sizes="300px" />
              </Link>
              <div className="card-editorial-body">
                <div className="card-top-bar">
                  <span className="card-tag-typology">{fav.category_name}</span>
                  <span className="card-like-count">
                    <Heart size={15} className="card-like-icon" />
                    <span className="card-like-num">{fav.like_count}</span>
                  </span>
                </div>
                <div className="card-bottom-info">
                  <Link href={`/artworks/${fav.artwork_id}`}>
                    <h3 className="card-title">{fav.title}</h3>
                  </Link>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Link href={`/artists/${fav.creator_id}`} className="card-author">
                      by {fav.creator_name}
                    </Link>
                    <RemoveFavoriteButton artworkId={fav.artwork_id} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
