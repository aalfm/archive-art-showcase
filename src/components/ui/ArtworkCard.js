'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleLike } from '@/lib/actions/artwork.actions';
import { Heart } from '@/components/ui/Icons';
import ArtworkImage from '@/components/ui/ArtworkImage';

export default function ArtworkCard({
  artwork,
  priority = false,
  isLoggedIn = false,
  initialLiked = false,
}) {
  const {
    id,
    title,
    image_url,
    tags,
    like_count = 0,
    category_name,
  } = artwork;

  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(Number(like_count) || 0);
  const [isPending, setIsPending] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const popTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, []);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push('/login?redirect=%2Fexplore');
      return;
    }
    if (isPending) return;

    setIsPending(true);
    try {
      const res = await toggleLike(id);
      if (res?.error === 'login_required') {
        router.push('/login?redirect=%2Fexplore');
        return;
      }
      if (!res?.error && typeof res?.liked === 'boolean') {
        setLiked(res.liked);
        setCount((prev) => (res.liked ? prev + 1 : Math.max(prev - 1, 0)));
        setIsPopping(true);
        if (popTimerRef.current) clearTimeout(popTimerRef.current);
        popTimerRef.current = setTimeout(() => setIsPopping(false), 260);
      }
    } finally {
      setIsPending(false);
    }
  };

  const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : [];

  return (
    <article className="project-card artwork-card" data-id={id}>
      <Link href={`/artworks/${id}`} className="project-image-wrap" aria-label={`View work: ${title}`}>
        <ArtworkImage
          src={image_url}
          alt={title}
          fill
          className="project-image"
          sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
          priority={priority}
        />
      </Link>

      <div className="card-top-bar">
        {category_name && (
          <span className="card-tag-typology">{category_name}</span>
        )}
        <div className="card-actions-top">
          <button
            type="button"
            className={`card-like-count card-like-btn ${liked ? 'liked' : ''} ${isPopping ? 'pop' : ''}`}
            onClick={handleLike}
            disabled={isPending}
            aria-pressed={liked}
            aria-label={liked ? `Unlike ${title} (${count} likes)` : `Like ${title} (${count} likes)`}
            title={liked ? 'Unlike artwork' : 'Like artwork'}
          >
            <Heart size={16} filled={liked} className="card-like-icon" />
            <span className="card-like-num">{count}</span>
          </button>
        </div>
      </div>

      <div className="card-bottom-info">
        <Link href={`/artworks/${id}`}>
          <h3 className="card-title">{title}</h3>
        </Link>
        {tagList.length > 0 && (
          <div className="card-meta-reveal">
            <span>{tagList.join(' · ')}</span>
          </div>
        )}
      </div>
    </article>
  );
}
