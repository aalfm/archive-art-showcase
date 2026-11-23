import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Profile — ARCHIVE',
};

export default async function MemberProfilePage() {
  const user = await requireRole('member');

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">MY PROFILE</h1>
          <p className="dashboard-subtitle">Manage your public profile and creator identity.</p>
        </div>
        <Link href={`/artists/${user.id}`} className="btn-secondary" target="_blank">
          View Public Profile ↗
        </Link>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
