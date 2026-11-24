import Link from 'next/link';
import ArtworkImage from '@/components/ui/ArtworkImage';
import { Heart } from '@/components/ui/Icons';

export default function ArtistArtworkCard({ artwork, priority = false }) {
  if (!artwork) return null;

  return (
    <article className="artist-artwork-item">
      <Link
        href={`/artworks/${artwork.id}`}
        className="artist-artwork-thumb"
        aria-label={`View artwork ${artwork.title}`}
      >
        <ArtworkImage
          src={artwork.image_url}
          alt={artwork.title}
          fill
          className="artist-artwork-img"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          priority={priority}
        />
      </Link>

      <div className="artist-artwork-meta">
        <div className="artist-artwork-top">
          {artwork.category_name && (
            <span className="artist-artwork-category">{artwork.category_name}</span>
          )}
          <span className="artist-artwork-likes" aria-label={`${artwork.like_count || 0} likes`}>
            <Heart size={13} className="exhibition-heart-icon" />
            <span>{artwork.like_count || 0}</span>
          </span>
        </div>

        <h4 className="artist-artwork-title">
          <Link href={`/artworks/${artwork.id}`}>{artwork.title}</Link>
        </h4>
      </div>
    </article>
  );
}
