import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import ArtworkInteractions from './ArtworkInteractions';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getArtwork(id) {
  const artworkRes = await query(`
    SELECT a.id, a.title, a.description, a.image_url, a.tags, a.like_count, a.status, a.created_at,
           c.name as category_name,
           u.id as creator_id, u.name as creator_name, u.bio as creator_bio,
           u.profile_image as creator_image, u.external_link as creator_link
    FROM artworks a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = $1
  `, [id]);

  if (artworkRes.rows.length === 0) return null;
  if (artworkRes.rows[0].status === 'taken_down') return null;

  const [commentsRes, otherWorksRes] = await Promise.all([
    query(`
      SELECT c.id, c.content, c.created_at,
             u.id as user_id, u.name as user_name, u.profile_image as user_image
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.artwork_id = $1
      ORDER BY c.created_at DESC
      LIMIT 20
    `, [id]),
    query(`
      SELECT a.id, a.title, a.image_url, a.like_count,
             u.name as creator_name, u.id as creator_id
      FROM artworks a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = (SELECT user_id FROM artworks WHERE id = $1)
        AND a.id != $1 AND a.status = 'active'
      ORDER BY a.created_at DESC
      LIMIT 4
    `, [id]),
  ]);

  return {
    artwork: artworkRes.rows[0],
    comments: commentsRes.rows,
    otherWorks: otherWorksRes.rows,
  };
}

export async function generateMetadata(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const data = await getArtwork(params.id);
  if (!data) return { title: 'Artwork not found — ARTHIVE' };
  return {
    title: `${data.artwork.title} by ${data.artwork.creator_name} — ARTHIVE`,
    description: data.artwork.description.substring(0, 160),
  };
}

export default async function ArtworkDetailPage(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const [data, session] = await Promise.all([
    getArtwork(params.id),
    getSession(),
  ]);

  if (!data) notFound();

  const { artwork, comments, otherWorks } = data;
  const user = session?.user || null;

  const isAdmin = user?.role === 'admin';
  let userLiked = false;
  let userFavorited = false;
  let userReported = false;

  if (user && !isAdmin) {
    const [likeRes, favRes, repRes] = await Promise.all([
      query('SELECT id FROM artwork_likes WHERE user_id=$1 AND artwork_id=$2', [user.id, artwork.id]),
      query('SELECT id FROM favorites WHERE user_id=$1 AND artwork_id=$2', [user.id, artwork.id]),
      query('SELECT id FROM reports WHERE user_id=$1 AND artwork_id=$2', [user.id, artwork.id]),
    ]);
    userLiked = likeRes.rows.length > 0;
    userFavorited = favRes.rows.length > 0;
    userReported = repRes.rows.length > 0;
  }

  const tagList = artwork.tags?.split(',').map(t => t.trim()).filter(Boolean) || [];
  const formattedDate = new Date(artwork.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="artwork-detail-page">
      <div className="detail-breadcrumb">
        <Link href="/explore">Explore</Link>
        <span>›</span>
        <span>{artwork.category_name}</span>
        <span>›</span>
        <span className="detail-breadcrumb-current">{artwork.title}</span>
      </div>

      <div className="artwork-detail-layout">
        <div className="artwork-detail-image-col">
          <div className="artwork-detail-image-wrap">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              className="artwork-detail-image"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>
        </div>

        <div className="artwork-detail-info-col">
          <div className="artwork-detail-header">
            {artwork.category_name && (
              <span className="artwork-detail-category">{artwork.category_name}</span>
            )}
            <h1 className="artwork-detail-title">{artwork.title}</h1>
          </div>

          <Link href={`/artists/${artwork.creator_id}`} className="artwork-creator-link">
            <div className="artwork-creator-avatar">
              {artwork.creator_image ? (
                <Image src={artwork.creator_image} alt={artwork.creator_name} fill style={{ objectFit: 'cover', borderRadius: '50%' }} sizes="40px" />
              ) : (
                artwork.creator_name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <span className="artwork-creator-name">{artwork.creator_name}</span>
              <span className="artwork-creator-label">Artist</span>
            </div>
          </Link>

          <ArtworkInteractions
            artworkId={artwork.id}
            likeCount={artwork.like_count}
            userLiked={userLiked}
            userFavorited={userFavorited}
            userReported={userReported}
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            isOwner={user?.id === artwork.creator_id}
          />

          {tagList.length > 0 && (
            <div className="artwork-tags">
              {tagList.map((tag, i) => (
                <span key={i} className="artwork-tag">#{tag}</span>
              ))}
            </div>
          )}

          <div className="artwork-description">
            <h3>About This Artwork</h3>
            <p>{artwork.description}</p>
          </div>

          <div className="artwork-meta-footer">
            <span>Uploaded {formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="artwork-comments-section">
        <div className="showcase-container" style={{ maxWidth: '900px' }}>
          <h2 className="showcase-heading" style={{ fontSize: '1.25rem' }}>
            Comments ({comments.length})
          </h2>

          <ArtworkInteractions
            artworkId={artwork.id}
            comments={comments}
            isLoggedIn={!!user}
            isAdmin={user?.role === 'admin'}
            userId={user?.id}
            showComments
          />
        </div>
      </div>

      {otherWorks.length > 0 && (
        <div className="artwork-other-works">
          <div className="showcase-container">
            <h2 className="showcase-heading" style={{ fontSize: '1.25rem' }}>
              More from {artwork.creator_name}
            </h2>
            <div className="masonry-grid" style={{ marginTop: '1.5rem' }}>
              {otherWorks.map((w) => (
                <article key={w.id} className="project-card aspect-wide">
                  <Link href={`/artworks/${w.id}`} className="project-image-wrap">
                    <Image src={w.image_url} alt={w.title} fill className="project-image" sizes="300px" />
                  </Link>
                  <div className="card-editorial-body">
                    <div className="card-bottom-info">
                      <Link href={`/artworks/${w.id}`}>
                        <h3 className="card-title">{w.title}</h3>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
