import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { applyAvatarPolicy } from '@/lib/avatar';
import { resolveRoleReturnContext } from '@/lib/member-navigation';
import { toId } from '@/lib/utils';
import { Heart } from '@/components/ui/Icons';
import UserAvatar from '@/components/ui/UserAvatar';
import DetailContextBar from '@/components/ui/DetailContextBar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCreatorProfile(id) {
  noStore();
  const userRes = await query(
    `
      SELECT id, name, bio,
             CASE WHEN LOWER(role) = 'member' THEN profile_image ELSE NULL END as profile_image,
             external_link, role, is_active, created_at
      FROM users WHERE id = $1 AND role = 'member'
    `,
    [id]
  );

  if (userRes.rows.length === 0) return null;
  const user = applyAvatarPolicy(userRes.rows[0]);

  if (user.is_active === false) {
    return { user, artworks: [] };
  }

  const artworksRes = await query(
    `
      SELECT a.id, a.title, a.image_url, a.like_count, a.created_at,
             c.name as category_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.user_id = $1 AND a.status = 'active'
      ORDER BY a.like_count DESC
    `,
    [id]
  );

  return { user, artworks: artworksRes.rows };
}

export async function generateMetadata(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const data = await getCreatorProfile(params.id);
  if (!data) return { title: 'Artist not found — ARCHIVE' };
  if (data.user.is_active === false) {
    return { title: `${data.user.name} (Inactive) — ARCHIVE` };
  }
  return { title: `${data.user.name} — ARCHIVE Artist` };
}

export default async function CreatorProfilePage(props) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  if (!toId(params.id)) notFound();
  const [data, session] = await Promise.all([
    getCreatorProfile(params.id),
    getSession(),
  ]);
  if (!data) notFound();

  const { user, artworks } = data;
  const memberContext = resolveRoleReturnContext(searchParams, session?.user || null);
  const withContext = (href) => (memberContext ? memberContext.appendContext(href) : href);
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const breadcrumbItems = memberContext
    ? memberContext.buildBreadcrumbs(user.name)
    : [
        { label: 'Home', href: '/' },
        { label: 'Artists', href: '/artists' },
        { label: user.name },
      ];

  if (user.is_active === false) {
    return (
      <div className="creator-profile-page artist-inactive-page">
        <DetailContextBar
          breadcrumbItems={breadcrumbItems}
          returnHref={memberContext?.returnHref}
          backLabel={memberContext?.backLabel}
        />

        <section
          className="artist-inactive-card"
          id="artist-inactive-profile"
          aria-labelledby="artist-inactive-name"
        >
          <div className="artist-inactive-identity">
            <div className="artist-inactive-avatar-wrap">
              <UserAvatar
                src={user.profile_image}
                role={user.role}
                name={user.name}
                size={88}
                className="creator-profile-avatar-placeholder artist-inactive-avatar"
              />
            </div>

            <div className="artist-inactive-identity-text">
              <div className="creator-profile-name-row">
                <h1 className="creator-profile-name artist-inactive-name" id="artist-inactive-name">
                  {user.name}
                </h1>
                <span
                  className="artist-dir-status-inactive"
                  id="artist-profile-inactive-badge"
                  aria-label="Account status: Inactive"
                >
                  <span className="artist-dir-status-dot" aria-hidden="true" />
                  <span>INACTIVE</span>
                </span>
              </div>
              <p className="artist-inactive-meta">Artist · Joined {joinDate}</p>
            </div>
          </div>

          <div className="artist-inactive-notice" role="status" id="artist-account-inactive-notice">
            <span className="artist-inactive-notice-label" id="artist-account-inactive-label">
              ACCOUNT INACTIVE
            </span>
            <p className="artist-inactive-notice-message" id="artist-account-inactive-message">
              This artist account is currently inactive and is no longer available on ARCHIVE.
            </p>
            <p className="artist-inactive-notice-sub">
              Published artworks by this creator remain accessible in the Explore gallery and through their artwork detail pages.
            </p>
          </div>

          <div className="artist-inactive-actions">
            <Link href="/explore" className="btn-primary">
              Explore Artworks
            </Link>
            <Link href={memberContext ? memberContext.returnHref : '/artists'} className="btn-secondary">
              {memberContext ? memberContext.backLabel : 'Back to Artists'}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const totalLikes = artworks.reduce((sum, a) => sum + (a.like_count || 0), 0);

  return (
    <div className="creator-profile-page">
      <DetailContextBar
        breadcrumbItems={breadcrumbItems}
        returnHref={memberContext?.returnHref}
        backLabel={memberContext?.backLabel}
      />

      <div className="creator-profile-header">
        <div className="creator-profile-avatar-wrap">
          <UserAvatar
            src={user.profile_image}
            role={user.role}
            name={user.name}
            size={100}
            className="creator-profile-avatar-placeholder"
          />
        </div>
        <div className="creator-profile-info">
          <div className="creator-profile-name-row">
            <h1 className="creator-profile-name">{user.name}</h1>
          </div>
          {user.bio && <p className="creator-profile-bio">{user.bio}</p>}
          {user.external_link && (
            <a href={user.external_link} target="_blank" rel="noopener noreferrer" className="creator-profile-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              {user.external_link}
            </a>
          )}
          <div className="creator-profile-stats">
            <div className="creator-stat">
              <span className="creator-stat-value">{artworks.length}</span>
              <span className="creator-stat-label">Artworks</span>
            </div>
            <div className="creator-stat">
              <span className="creator-stat-value">{totalLikes}</span>
              <span className="creator-stat-label">Total Likes</span>
            </div>
            <div className="creator-stat">
              <span className="creator-stat-value">{joinDate}</span>
              <span className="creator-stat-label">Joined</span>
            </div>
          </div>
        </div>
      </div>

      <div className="showcase-container creator-profile-gallery">
        <h2 className="showcase-heading creator-profile-gallery-heading">
          Artwork Gallery
        </h2>
        {artworks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--surface)', fontFamily: 'var(--font-mono)' }}>No artworks uploaded yet.</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {artworks.map((artwork) => {
              const artworkHref = withContext(`/artworks/${artwork.id}`);
              return (
                <article key={artwork.id} className="project-card creator-artwork-card">
                  <Link href={artworkHref} className="project-image-wrap">
                    <Image
                      src={artwork.image_url}
                      alt={artwork.title}
                      fill
                      className="project-image"
                      sizes="(max-width: 639px) 100vw, (max-width: 1079px) 50vw, 33vw"
                    />
                  </Link>
                  <div className="card-editorial-body">
                    <div className="card-top-bar">
                      <span className="card-tag-typology">{artwork.category_name}</span>
                      <span className="card-like-count">
                        <Heart size={15} className="card-like-icon" />
                        <span className="card-like-num">{artwork.like_count}</span>
                      </span>
                    </div>
                    <div className="card-bottom-info">
                      <Link href={artworkHref}>
                        <h3 className="card-title">{artwork.title}</h3>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
