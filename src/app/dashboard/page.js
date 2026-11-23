import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** /dashboard → role-specific dashboard */
export default async function DashboardIndexPage() {
  const user = await requireAuth();

  if (user.role === 'admin') redirect('/dashboard/admin');
  if (user.role === 'curator') {
    redirect(user.curator_status === 'approved' ? '/dashboard/curator' : '/dashboard/curator/pending');
  }
  redirect('/dashboard/member');
}
