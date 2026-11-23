import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import ArtworkGallery from '@/components/home/ArtworkGallery';
import ChallengesSection from '@/components/home/ChallengesSection';

export const dynamic = 'force-dynamic';

async function getHomepageData() {
  try {
    const [artworksRes, challengesRes, categoriesRes] = await Promise.all([
      query(`
        SELECT a.id, a.title, a.image_url, a.tags, a.like_count, a.created_at,
               c.name as category_name,
               u.id as creator_id, u.name as creator_name
        FROM artworks a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.status = 'active'
        ORDER BY a.created_at DESC
        LIMIT 12
      `),
      query(`
        SELECT id, title, description, prize, banner_url, start_date, end_date,
               curator_id,
               CASE 
                 WHEN NOW() < start_date THEN 'upcoming'
                 WHEN NOW() BETWEEN start_date AND end_date THEN 'active'
                 ELSE 'ended'
               END as challenge_status
        FROM challenges
        WHERE end_date >= NOW()
        ORDER BY end_date ASC
        LIMIT 3
      `),
      query('SELECT id, name FROM categories ORDER BY name ASC'),
    ]);

    return {
      artworks: artworksRes.rows,
      challenges: challengesRes.rows,
      categories: categoriesRes.rows,
    };
  } catch (err) {
    console.error('[Homepage] Data fetch error:', err);
    return { artworks: [], challenges: [], categories: [] };
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
          <ChallengesSection challenges={data.challenges} />
        )}
      </main>
      <Footer />
    </>
  );
}
