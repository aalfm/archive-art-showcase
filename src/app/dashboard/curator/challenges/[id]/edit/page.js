import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import EditChallengeForm from './EditChallengeForm';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Challenge — ARCHIVE',
};

export default async function EditChallengePage(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const user = await requireRole('curator');

  const res = await query('SELECT * FROM challenges WHERE id = $1', [params.id]);

  if (res.rows.length === 0) {
    notFound();
  }

  const challenge = res.rows[0];

  if (challenge.curator_id !== user.id && user.role !== 'admin') {
    redirect('/dashboard/curator/challenges');
  }

  return (
    <div className="curator-overview-page">
      <div className="dashboard-header curator-page-header">
        <div>
          <h1 className="curator-page-title">EDIT CHALLENGE</h1>
          <p className="curator-page-subtitle">Update details for curatorial program &ldquo;{challenge.title}&rdquo;.</p>
        </div>
      </div>

      <EditChallengeForm challenge={challenge} />
    </div>
  );
}
