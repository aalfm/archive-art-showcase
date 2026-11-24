import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PublicPageContainer from '@/components/layout/PublicPageContainer';
import ChallengesGallery from './ChallengesGallery';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Architecture Challenges — ARCHIVE',
  description: 'Explore architectural challenges, showcase your ideas, and turn creative visions into reality.',
};

async function getChallenges() {
  const res = await query(`
    SELECT c.id, c.title, c.description, c.prize, c.banner_url, c.start_date, c.end_date,
           u.name as curator_name, u.id as curator_id,
           COUNT(DISTINCT s.id)::int as submission_count,
           (EXTRACT(EPOCH FROM NOW()) * 1000)::double precision as server_now,
           CASE
             WHEN NOW() < c.start_date THEN 'upcoming'
             WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
             ELSE 'ended'
           END as challenge_status
    FROM challenges c
    LEFT JOIN users u ON c.curator_id = u.id
    LEFT JOIN submissions s ON s.challenge_id = c.id
    WHERE c.end_date >= NOW()
    GROUP BY c.id, u.name, u.id
    ORDER BY c.end_date ASC, c.created_at DESC
  `);
  const serverNow = res.rows[0]?.server_now || 0;
  const challenges = res.rows.map((row) => ({
    ...row,
    start_date: row.start_date instanceof Date ? row.start_date.toISOString() : row.start_date,
    end_date: row.end_date instanceof Date ? row.end_date.toISOString() : row.end_date,
  }));
  return { challenges, serverNow };
}

export default async function ChallengesPage() {
  const [{ challenges, serverNow }, session] = await Promise.all([
    getChallenges(),
    getSession(),
  ]);

  const initialCounts = {
    active: challenges.filter((c) => c.challenge_status === 'active').length,
    upcoming: challenges.filter((c) => c.challenge_status === 'upcoming').length,
  };

  return (
    <PublicPageContainer>
      <div className="showcase-header">
        <div className="showcase-title-area">
          <span className="editorial-eyebrow">COMPETITIONS &amp; OPEN CALLS</span>
          <h1 className="showcase-heading">Architecture Challenges</h1>
          <p className="showcase-subtitle">
            Explore architectural challenges, showcase your ideas, and turn creative visions into reality.
          </p>
        </div>
        {session?.user?.role === 'curator' && session.user.curator_status === 'approved' && (
          <Link href="/dashboard/curator/challenges/create" className="btn-primary">
            + Create Challenge
          </Link>
        )}
      </div>

      <ChallengesGallery
        initialChallenges={challenges}
        initialCounts={initialCounts}
        initialNow={serverNow}
        userRole={session?.user?.role || null}
      />
    </PublicPageContainer>
  );
}
