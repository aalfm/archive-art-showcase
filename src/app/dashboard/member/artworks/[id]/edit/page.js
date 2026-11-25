import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import Breadcrumb from '@/components/ui/Breadcrumb';
import EditArtworkForm from './EditArtworkForm';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Artwork — ARCHIVE',
};

export default async function EditArtworkPage(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const user = await requireRole('member');

  const [artworkRes, categoriesRes] = await Promise.all([
    query('SELECT * FROM artworks WHERE id = $1', [params.id]),
    query('SELECT id, name FROM categories ORDER BY name ASC'),
  ]);

  if (artworkRes.rows.length === 0) {
    notFound();
  }

  const artwork = artworkRes.rows[0];

  if (artwork.user_id !== user.id && user.role !== 'admin') {
    redirect('/dashboard/member/artworks');
  }

  return (
    <div className="member-form-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/member' },
          { label: 'My Artworks', href: '/dashboard/member/artworks' },
          { label: `Edit: ${artwork.title}` },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Edit Artwork</h1>
          <p className="dashboard-subtitle">Update metadata details for &ldquo;{artwork.title}&rdquo;.</p>
        </div>
      </div>

      <EditArtworkForm artwork={artwork} categories={categoriesRes.rows} />
    </div>
  );
}
