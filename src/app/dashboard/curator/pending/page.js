import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { logoutUser } from '@/lib/actions/auth.actions';
import { Hourglass, X } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Curator Verification — ARCHIVE',
};

export default async function CuratorPendingPage() {
  const user = await requireAuth();

  if (user.role !== 'curator') {
    redirect('/dashboard');
  }
  if (user.curator_status === 'approved') {
    redirect('/dashboard/curator');
  }

  const isRejected = user.curator_status === 'rejected';

  return (
    <div className="curator-pending-wrap">
      <div className={`curator-pending-icon ${isRejected ? 'is-rejected' : 'is-pending'}`}>
        {isRejected ? <X size={32} /> : <Hourglass size={32} />}
      </div>

      <h1 className="curator-pending-title">
        {isRejected ? 'CURATOR APPLICATION REJECTED' : 'AWAITING CURATOR VERIFICATION'}
      </h1>

      <p className="curator-pending-desc">
        {isRejected
          ? 'We are sorry, your Curator account application was not approved by the ARCHIVE Administrator.'
          : 'Your Curator account is currently under review by an ARCHIVE Administrator. You will be able to create challenges and manage curation once your account is approved.'}
      </p>

      <div className="curator-pending-actions">
        <Link href="/" className="btn-secondary curator-pending-btn">
          Back to Home
        </Link>
        <form action={logoutUser}>
          <button type="submit" className="btn-primary curator-pending-btn">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
