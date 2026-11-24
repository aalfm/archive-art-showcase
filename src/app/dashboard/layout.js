import { redirect } from 'next/navigation';
import { getInactiveSessionUser, getSession } from '@/lib/auth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session) {
    const inactiveUser = await getInactiveSessionUser();
    if (inactiveUser) {
      return (
        <div className="dashboard-layout">
          <DashboardSidebar user={inactiveUser} isInactive />
          <main className="dashboard-main">
            {children}
          </main>
        </div>
      );
    }
    redirect('/login');
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar user={session.user} />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
