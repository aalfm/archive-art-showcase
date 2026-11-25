import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { restrictAdminFromPublic } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }) {
  const session = await restrictAdminFromPublic();
  return (
    <>
      <Navbar user={session?.user || null} />
      <main className="public-main">
        {children}
      </main>
      <Footer user={session?.user || null} />
    </>
  );
}
