import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import CreateArtworkForm from './CreateArtworkForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Upload New Artwork — ARCHIVE',
};

export default async function CreateArtworkPage() {
  await requireRole('member');

  const categoriesRes = await query('SELECT id, name FROM categories ORDER BY name ASC');
  const categories = categoriesRes.rows;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Upload Artwork</h1>
          <p className="dashboard-subtitle">Publish your new digital artwork to ARCHIVE&apos;s curated gallery.</p>
        </div>
      </div>

      <CreateArtworkForm categories={categories} />
    </div>
  );
}
