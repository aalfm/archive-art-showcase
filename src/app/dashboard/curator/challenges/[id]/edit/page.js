import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { isChallengeOwnerCurator } from '@/lib/challenge-auth';
import { query } from '@/lib/db';
import EditChallengeForm from './EditChallengeForm';
import { formatEditorialTitle, toId } from '@/lib/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';

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

  if (!isChallengeOwnerCurator(user, challenge)) {
    redirect('/dashboard/curator/challenges');
  }

  const title = formatEditorialTitle(challenge.title);

  return (
    <div className="admin-detail-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/curator' },
          { label: 'My Challenges', href: '/dashboard/curator/challenges' },
          { label: title, href: `/dashboard/curator/challenges/${challenge.id}` },
          { label: 'Edit' },
        ]}
      />

      <div className="dashboard-header admin-detail-header">
        <div>
          <h1 className="dashboard-title">Edit Challenge</h1>
          <p className="dashboard-subtitle">Update details for curatorial program &ldquo;{title}&rdquo;.</p>
        </div>
        <div className="admin-detail-header-actions">
          <Link href={`/dashboard/curator/challenges/${challenge.id}`} className="btn-secondary">
            ← Back to Details
          </Link>
        </div>
      </div>

      <EditChallengeForm challenge={challenge} />
    </div>
  );
}
