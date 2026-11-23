import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session) {
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
