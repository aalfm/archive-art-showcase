import { getSession } from '@/lib/auth';
import { applyAvatarPolicy } from '@/lib/avatar';
import { query } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import ArtworkGallery from '@/components/home/ArtworkGallery';
import ChallengesSection from '@/components/home/ChallengesSection';
import ArtistsSection from '@/components/home/ArtistsSection';

export const dynamic = 'force-dynamic';

async function getHomepageData() {
  try {
    const [artworksRes, challengesRes, categoriesRes, artistsRes] = await Promise.all([
      query(`
        SELECT a.id, a.title, a.description, a.image_url, a.tags, a.like_count, a.created_at,
               c.id as category_id, c.name as category_name,
               u.id as creator_id, u.name as creator_name
        FROM artworks a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.status = 'active'
        ORDER BY a.created_at DESC
        LIMIT 48
      `),
      query(`
        SELECT c.id, c.title, c.description, c.prize, c.banner_url, c.start_date, c.end_date,
               c.curator_id, u.name as curator_name,
               CASE 
                 WHEN NOW() < c.start_date THEN 'upcoming'
                 WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
                 ELSE 'ended'
               END as challenge_status
        FROM challenges c
        LEFT JOIN users u ON c.curator_id = u.id
        WHERE c.end_date >= NOW()
        ORDER BY c.end_date ASC
        LIMIT 3
      `),
      query('SELECT id, name FROM categories ORDER BY name ASC'),
      query(`
        SELECT u.id, u.name, u.bio, u.role,
               CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END as profile_image,
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
               ) as primary_category,
               COALESCE(
                 (
                   SELECT json_agg(
                     json_build_object(
                       'id', a3.id,
                       'title', a3.title,
                       'image_url', a3.image_url,
                       'category_name', c3.name
                     )
                     ORDER BY a3.like_count DESC, a3.created_at DESC
                   )
                   FROM artworks a3
                   LEFT JOIN categories c3 ON a3.category_id = c3.id
                   WHERE a3.user_id = u.id AND a3.status = 'active'
                 ),
                 '[]'::json
               ) as artworks
        FROM users u
        LEFT JOIN artworks a ON a.user_id = u.id AND a.status = 'active'
        WHERE u.role = 'member'
        GROUP BY u.id
        HAVING COUNT(a.id) > 0
        ORDER BY total_likes DESC, u.created_at ASC
        LIMIT 12
      `),
    ]);

    const serializedChallenges = challengesRes.rows.map((row) => ({
      ...row,
      start_date: row.start_date instanceof Date ? row.start_date.toISOString() : row.start_date,
      end_date: row.end_date instanceof Date ? row.end_date.toISOString() : row.end_date,
    }));

    return {
      artworks: artworksRes.rows,
      challenges: serializedChallenges,
      categories: categoriesRes.rows,
      artists: artistsRes.rows.map((row) => applyAvatarPolicy(row)),
      serverNow: Date.now(),
    };
  } catch (err) {
    console.error('[Homepage] Data fetch error:', err);
    return { artworks: [], challenges: [], categories: [], artists: [], serverNow: Date.now() };
  }
}

export default async function HomePage() {
  const [session, data] = await Promise.all([
    getSession(),
    getHomepageData(),
  ]);

  const popularArtworks = [...data.artworks].sort((a, b) => Number(b.like_count || 0) - Number(a.like_count || 0));
  const latestArtworks = data.artworks;

  return (
    <>
      <Navbar user={session?.user || null} />
      <main>
        <HeroSection artworks={data.artworks.slice(0, 4)} />
        <ArtworkGallery
          artworks={data.artworks}
          popularArtworks={popularArtworks}
          latestArtworks={latestArtworks}
          categories={data.categories}
        />
        {data.challenges.length > 0 && (
          <ChallengesSection challenges={data.challenges} initialNow={data.serverNow} />
        )}
        {data.artists.length > 0 && (
          <ArtistsSection artists={data.artists} />
        )}
      </main>
      <Footer />
    </>
  );
}
