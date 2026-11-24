import { redirect } from 'next/navigation';
import { getInactiveSessionUser, getSession } from '@/lib/auth';
import AccountInactiveNotice from '@/components/dashboard/AccountInactiveNotice';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Account Inactive — ARCHIVE',
};

export default async function MemberInactivePage() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  const inactiveUser = await getInactiveSessionUser();
  if (!inactiveUser) {
    redirect('/login');
  }

  return <AccountInactiveNotice user={inactiveUser} />;
}
