import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import EditArtworkForm from './EditArtworkForm';
import { toId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Artwork — ARCHIVE',
};

export default async function EditArtworkPage(props) {
  const params = await props.params;
  if (!toId(params.id)) notFound();
  const user = await requireRole('member', 'admin');

  const [artworkRes, categoriesRes] = await Promise.all([
    query('SELECT * FROM artworks WHERE id = $1', [params.id]),
    query('SELECT id, name FROM categories ORDER BY name ASC'),
  ]);

  if (artworkRes.rows.length === 0) {
    notFound();
  }

  const artwork = artworkRes.rows[0];

  // Verify ownership
  if (artwork.user_id !== user.id && user.role !== 'admin') {
    redirect('/dashboard/member/artworks');
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">EDIT ARTWORK</h1>
          <p className="dashboard-subtitle">Update metadata details for &ldquo;{artwork.title}&rdquo;.</p>
        </div>
      </div>

      <EditArtworkForm artwork={artwork} categories={categoriesRes.rows} />
    </div>
  );
}
