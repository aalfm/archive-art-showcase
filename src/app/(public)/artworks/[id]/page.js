import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { resolveUserAvatarSrc } from '@/lib/avatar';
import UserAvatar from '@/components/ui/UserAvatar';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ArtworkInteractions from './ArtworkInteractions';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getArtwork(id) {
  const artworkRes = await query(`
    SELECT a.id, a.title, a.description, a.image_url, a.tags, a.like_count, a.status, a.created_at,
           c.id as category_id, c.name as category_name,
           u.id as creator_id, u.name as creator_name, u.bio as creator_bio,
           u.role as creator_role,
           CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END as creator_image,
           u.external_link as creator_link
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
             u.id as user_id, u.name as user_name, u.role as user_role,
             CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END as user_image
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

  const rawArtwork = artworkRes.rows[0];
  const artwork = {
    ...rawArtwork,
    creator_image: resolveUserAvatarSrc({
      role: rawArtwork.creator_role,
      profile_image: rawArtwork.creator_image,
    }),
  };

  const comments = commentsRes.rows.map((comment) => ({
    ...comment,
    user_image: resolveUserAvatarSrc({
      role: comment.user_role,
      profile_image: comment.user_image,
    }),
  }));

  return {
    artwork,
    comments,
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
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  if (!toId(params.id)) notFound();
  const [data, session] = await Promise.all([
    getArtwork(params.id),
    getSession(),
  ]);

  if (!data) notFound();

  const { artwork, comments, otherWorks } = data;
  const user = session?.user || null;
  const rawFrom = Array.isArray(searchParams?.from) ? searchParams.from[0] : searchParams?.from;
  const isFromMemberSubmissions = user?.role === 'member' && rawFrom === 'submissions';

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

  const breadcrumbItems = isFromMemberSubmissions
    ? [
        { label: 'Dashboard', href: '/dashboard/member' },
        { label: 'Submissions', href: '/dashboard/member/submissions' },
        { label: artwork.title },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Explore', href: '/explore' },
        ...(artwork.category_name
          ? [
              {
                label: artwork.category_name,
                href: artwork.category_id ? `/explore?category=${artwork.category_id}` : '/explore',
              },
            ]
          : []),
        { label: artwork.title },
      ];

  return (
    <div className="artwork-detail-page">
      {isFromMemberSubmissions ? (
        <div className="detail-context-bar">
          <Breadcrumb items={breadcrumbItems} className="arthive-breadcrumb--detail" />
          <Link href="/dashboard/member/submissions" className="detail-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to submissions</span>
          </Link>
        </div>
      ) : (
        <Breadcrumb items={breadcrumbItems} className="arthive-breadcrumb--detail" />
      )}

      <div className="artwork-detail-layout">
        <div className="artwork-detail-image-col">
          <div className="artwork-detail-image-wrap">
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              width={0}
              height={0}
              className="artwork-detail-image"
              sizes="(max-width: 900px) 100vw, 58vw"
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
            <UserAvatar
              src={artwork.creator_image}
              role={artwork.creator_role}
              name={artwork.creator_name || 'Artist'}
              size={38}
              className="artwork-creator-avatar"
            />
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
            <h3>About this artwork</h3>
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
