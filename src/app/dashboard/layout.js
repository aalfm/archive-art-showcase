import { redirect } from 'next/navigation';
import { getInactiveSessionUser, getSession } from '@/lib/auth';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Navbar from '@/components/layout/Navbar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session) {
    const inactiveUser = await getInactiveSessionUser();
    if (inactiveUser) {
      if (inactiveUser.role === 'admin') {
        return (
          <div className="dashboard-layout">
            <DashboardSidebar user={inactiveUser} isInactive />
            <main className="dashboard-main">
              {children}
            </main>
          </div>
        );
      }

      return (
        <>
          <Navbar user={inactiveUser} isInactive />
          <div className="dashboard-layout dashboard-layout--topnav">
            <main className="dashboard-main dashboard-main--topnav">
              {children}
            </main>
          </div>
        </>
      );
    }
    redirect('/login');
  }

  // Admin keeps its dedicated sidebar dashboard layout
  if (session.user.role === 'admin') {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar user={session.user} />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    );
  }

  // Member and Curator share the top Navbar dashboard shell with role-based profile dropdown
  return (
    <>
      <Navbar user={session.user} />
      <div className="dashboard-layout dashboard-layout--topnav">
        <main className="dashboard-main dashboard-main--topnav">
          {children}
        </main>
      </div>
    </>
  );
}
