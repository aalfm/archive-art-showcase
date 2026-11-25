import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { buildMemberDetailHref } from '@/lib/member-navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Profile — ARCHIVE',
};

export default async function MemberProfilePage(props) {
  const [user, searchParams] = await Promise.all([
    requireRole('member'),
    props?.searchParams,
  ]);
  const publicProfileHref = buildMemberDetailHref(`/artists/${user.id}`, 'profile', searchParams);

  return (
    <div className="member-form-page member-profile-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/member' },
          { label: 'My Profile' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Profile</h1>
          <p className="dashboard-subtitle">Manage your public profile and creator identity.</p>
        </div>
        <Link href={publicProfileHref} className="btn-secondary">
          View Public Profile →
        </Link>
      </div>

      <ProfileForm user={user} publicProfileHref={publicProfileHref} />
    </div>
  );
}
