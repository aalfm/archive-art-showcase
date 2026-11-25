import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const rawStatus = (searchParams.get('status') || 'all').toLowerCase();
    const status =
      rawStatus === 'upcoming'
        ? 'upcoming'
        : rawStatus === 'active'
          ? 'active'
          : rawStatus === 'completed' || rawStatus === 'ended'
            ? 'completed'
            : 'all';

    const whereConditions = ['TRUE'];
    const params = [];

    if (q) {
      const escaped = q.replace(/[\\%_]/g, '\\$&');
      params.push(`%${escaped}%`);
      const idx = params.length;
      whereConditions.push(`(
        c.title ILIKE $${idx} ESCAPE '\\'
        OR c.description ILIKE $${idx} ESCAPE '\\'
        OR c.prize ILIKE $${idx} ESCAPE '\\'
        OR c.rules ILIKE $${idx} ESCAPE '\\'
        OR u.name ILIKE $${idx} ESCAPE '\\'
      )`);
    }

    const baseWhere = whereConditions.join(' AND ');

    const statusCondition =
      status === 'all'
        ? 'TRUE'
        : status === 'upcoming'
          ? 'NOW() < c.start_date'
          : status === 'completed'
            ? 'c.end_date < NOW()'
            : 'c.start_date <= NOW() AND c.end_date >= NOW()';

    const [listRes, countsRes] = await Promise.all([
      query(
        `
        SELECT c.id, c.title, c.description, c.prize, c.banner_url, c.start_date, c.end_date,
               u.name AS curator_name, u.id AS curator_id,
               COUNT(DISTINCT s.id)::int AS submission_count,
               COUNT(DISTINCT CASE WHEN s.winner_rank IS NOT NULL AND wa.status = 'active' THEN s.id END)::int AS winner_count,
               tw.winner_name AS top_winner_name,
               tw.artwork_title AS top_winner_artwork,
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
        WHERE ${baseWhere} AND ${statusCondition}
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
        `,
        params
      ),
      query(
        `
        SELECT
          COUNT(*)::int AS all_count,
          COUNT(*) FILTER (WHERE c.start_date <= NOW() AND c.end_date >= NOW())::int AS active_count,
          COUNT(*) FILTER (WHERE NOW() < c.start_date)::int AS upcoming_count,
          COUNT(*) FILTER (WHERE c.end_date < NOW())::int AS completed_count
        FROM challenges c
        LEFT JOIN users u ON c.curator_id = u.id
        WHERE ${baseWhere}
        `,
        params
      ),
    ]);

    return NextResponse.json({
      challenges: listRes.rows,
      counts: {
        all: countsRes.rows[0]?.all_count ?? 0,
        active: countsRes.rows[0]?.active_count ?? 0,
        upcoming: countsRes.rows[0]?.upcoming_count ?? 0,
        completed: countsRes.rows[0]?.completed_count ?? 0,
      },
      serverNow: Date.now(),
    });
  } catch (err) {
    console.error('[Challenges Search API] Error:', err);
    return NextResponse.json(
      { error: 'Failed to search challenges.' },
      { status: 500 }
    );
  }
}
