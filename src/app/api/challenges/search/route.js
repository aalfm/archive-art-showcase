import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const rawStatus = searchParams.get('status');
    const status =
      rawStatus === 'all' ? 'all' : rawStatus === 'upcoming' ? 'upcoming' : 'active';

    const whereConditions = ['c.end_date >= NOW()'];
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
          : 'c.start_date <= NOW() AND c.end_date >= NOW()';

    const [listRes, countsRes] = await Promise.all([
      query(
        `
        SELECT c.id, c.title, c.description, c.prize, c.banner_url, c.start_date, c.end_date,
               u.name as curator_name, u.id as curator_id,
               COUNT(DISTINCT s.id)::int as submission_count,
               CASE
                 WHEN NOW() < c.start_date THEN 'upcoming'
                 WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
                 ELSE 'ended'
               END as challenge_status
        FROM challenges c
        LEFT JOIN users u ON c.curator_id = u.id
        LEFT JOIN submissions s ON s.challenge_id = c.id
        WHERE ${baseWhere} AND ${statusCondition}
        GROUP BY c.id, u.name, u.id
        ORDER BY c.end_date ASC, c.created_at DESC
        `,
        params
      ),
      query(
        `
        SELECT
          COUNT(*) FILTER (WHERE c.start_date <= NOW() AND c.end_date >= NOW())::int as active_count,
          COUNT(*) FILTER (WHERE NOW() < c.start_date)::int as upcoming_count
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
        active: countsRes.rows[0]?.active_count ?? 0,
        upcoming: countsRes.rows[0]?.upcoming_count ?? 0,
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
