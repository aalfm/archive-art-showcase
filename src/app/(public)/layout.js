import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getSession } from '@/lib/auth';

export default async function PublicLayout({ children }) {
  const session = await getSession();
  return (
    <>
      <Navbar user={session?.user || null} />
      <main className="public-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
