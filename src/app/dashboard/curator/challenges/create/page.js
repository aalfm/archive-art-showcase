import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CreateChallengeForm from './CreateChallengeForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create New Challenge — ARCHIVE',
};

export default async function CreateChallengePage() {
  await requireRole('curator');

  return (
    <div className="admin-detail-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/curator' },
          { label: 'Challenges', href: '/dashboard/curator/challenges' },
          { label: 'Create Challenge' },
        ]}
      />

      <div className="dashboard-header admin-detail-header">
        <div>
          <h1 className="dashboard-title">Create challenge</h1>
          <p className="dashboard-subtitle">
            Launch a curatorial competition and invite creators to submit their finest works.
          </p>
        </div>
        <div className="admin-detail-header-actions">
          <Link href="/dashboard/curator/challenges" className="btn-secondary">
            ← Back to challenges
          </Link>
        </div>
      </div>

      <CreateChallengeForm />
    </div>
  );
}
