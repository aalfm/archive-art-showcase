import { requireRole } from '@/lib/auth';
import CreateChallengeForm from './CreateChallengeForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create New Challenge — ARCHIVE',
};

export default async function CreateChallengePage() {
  await requireRole('curator');

  return (
    <div className="curator-overview-page">
      <div className="dashboard-header curator-page-header">
        <div>
          <h1 className="curator-page-title">CREATE CHALLENGE</h1>
          <p className="curator-page-subtitle">Launch a curatorial competition and invite creators to submit their finest works.</p>
        </div>
      </div>

      <CreateChallengeForm />
    </div>
  );
}
