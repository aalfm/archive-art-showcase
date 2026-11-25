import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { authorizeCuratorChallengeActor } from '@/lib/challenge-auth';
import { normalizeChallengeName } from '@/lib/challenge-validation';
import { query } from '@/lib/db';
import { toId } from '@/lib/utils';

export async function GET(request) {
  try {
    const session = await getSession();
    const auth = authorizeCuratorChallengeActor(session, 'check challenge titles');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const rawTitle = searchParams.get('title') || '';
    const excludeId = toId(searchParams.get('excludeId'));
    const normalizedTitle = normalizeChallengeName(rawTitle);

    if (!normalizedTitle) {
      return NextResponse.json({
        available: true,
        duplicate: false,
        normalizedTitle: '',
      });
    }

    const sql = excludeId
      ? 'SELECT id FROM challenges WHERE LOWER(BTRIM(title)) = $1 AND id <> $2 LIMIT 1'
      : 'SELECT id FROM challenges WHERE LOWER(BTRIM(title)) = $1 LIMIT 1';
    const params = excludeId ? [normalizedTitle, excludeId] : [normalizedTitle];

    const res = await query(sql, params);
    const duplicate = res.rows.length > 0;

    return NextResponse.json({
      available: !duplicate,
      duplicate,
      normalizedTitle,
    });
  } catch (err) {
    console.error('[Challenge] Check title availability error:', err);
    return NextResponse.json(
      { error: 'Failed to check challenge title availability.' },
      { status: 500 }
    );
  }
}
