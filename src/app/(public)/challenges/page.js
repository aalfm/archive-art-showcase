import Link from 'next/link';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import PublicPageContainer from '@/components/layout/PublicPageContainer';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ChallengesGallery from './ChallengesGallery';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Architecture Challenges — ARCHIVE',
  description: 'Explore architectural challenges, showcase your ideas, and turn creative visions into reality.',
};

async function getChallenges() {
  const res = await query(`
    SELECT c.id, c.title, c.description, c.prize, c.banner_url, c.start_date, c.end_date,
           u.name AS curator_name, u.id AS curator_id,
           COUNT(DISTINCT s.id)::int AS submission_count,
           COUNT(DISTINCT CASE WHEN s.winner_rank IS NOT NULL AND wa.status = 'active' THEN s.id END)::int AS winner_count,
           tw.winner_name AS top_winner_name,
           tw.artwork_title AS top_winner_artwork,
           (EXTRACT(EPOCH FROM NOW()) * 1000)::double precision AS server_now,
           CASE
             WHEN NOW() < c.start_date THEN 'upcoming'
             WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
             ELSE 'completed'
           END AS challenge_status
    FROM challenges c
    LEFT JOIN users u ON c.curator_id = u.id
    LEFT JOIN submissions s ON s.challenge_id = c.id
    LEFT JOIN artworks wa ON wa.id = s.artwork_id
    LEFT JOIN LATERAL (
      SELECT wu.name AS winner_name, a2.title AS artwork_title
      FROM submissions s2
      JOIN artworks a2 ON a2.id = s2.artwork_id AND a2.status = 'active'
      JOIN users wu ON wu.id = s2.member_id
      WHERE s2.challenge_id = c.id AND s2.winner_rank IS NOT NULL
      ORDER BY s2.winner_rank ASC
      LIMIT 1
    ) tw ON TRUE
    GROUP BY c.id, u.name, u.id, tw.winner_name, tw.artwork_title
    ORDER BY
      CASE
        WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 1
        WHEN NOW() < c.start_date THEN 2
        ELSE 3
      END ASC,
      CASE WHEN NOW() BETWEEN c.start_date AND c.end_date THEN c.end_date END ASC,
      CASE WHEN NOW() < c.start_date THEN c.start_date END ASC,
      CASE WHEN NOW() > c.end_date THEN c.end_date END DESC,
      c.created_at DESC
  `);
  const serverNow = res.rows[0]?.server_now || Date.now();
  const challenges = res.rows.map((row) => ({
    ...row,
    start_date: row.start_date instanceof Date ? row.start_date.toISOString() : row.start_date,
    end_date: row.end_date instanceof Date ? row.end_date.toISOString() : row.end_date,
  }));
  return { challenges, serverNow };
}

export default async function ChallengesPage(props) {
  const searchParams = await props.searchParams;
  const rawStatus = (searchParams?.status || '').toString().toLowerCase();
  const initialStatus = ['all', 'active', 'upcoming', 'completed'].includes(rawStatus)
    ? rawStatus
    : rawStatus === 'ended'
      ? 'completed'
      : 'all';

  const [{ challenges, serverNow }, session] = await Promise.all([
    getChallenges(),
    getSession(),
  ]);

  const initialCounts = {
    all: challenges.length,
    active: challenges.filter((c) => c.challenge_status === 'active').length,
    upcoming: challenges.filter((c) => c.challenge_status === 'upcoming').length,
    completed: challenges.filter((c) => c.challenge_status === 'completed').length,
  };

  const statusLabelMap = {
    active: 'Active',
    upcoming: 'Upcoming',
    completed: 'Completed',
  };
  const breadcrumbItems =
    initialStatus !== 'all' && statusLabelMap[initialStatus]
      ? [
          { label: 'Home', href: '/' },
          { label: 'Challenges', href: '/challenges' },
          { label: statusLabelMap[initialStatus] },
        ]
      : [
          { label: 'Home', href: '/' },
          { label: 'Challenges' },
        ];

  return (
    <PublicPageContainer>
      <Breadcrumb items={breadcrumbItems} className="arthive-breadcrumb--public" />
      <div className="showcase-header">
        <div className="showcase-title-area">
          <span className="editorial-eyebrow">COMPETITIONS &amp; ARCHIVE</span>
          <h1 className="showcase-heading">Architecture challenges</h1>
          <p className="showcase-subtitle">
            Explore active competitions, upcoming open calls, and completed challenge archives with winning works.
          </p>
        </div>
        {session?.user?.role === 'curator' && session.user.curator_status === 'approved' && (
          <Link href="/dashboard/curator/challenges/create" className="btn-primary">
            + Create challenge
          </Link>
        )}
      </div>

      <ChallengesGallery
        initialChallenges={challenges}
        initialCounts={initialCounts}
        initialStatus={initialStatus}
        initialNow={serverNow}
        userRole={session?.user?.role || null}
      />
    </PublicPageContainer>
  );
}
