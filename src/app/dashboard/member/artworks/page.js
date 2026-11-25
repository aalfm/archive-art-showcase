import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DeleteArtworkButton from './DeleteArtworkButton';
import { Heart } from '@/components/ui/Icons';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Artworks — ARCHIVE',
};

export default async function MemberArtworksPage() {
  const user = await requireRole('member');

  const res = await query(`
    SELECT a.id, a.title, a.image_url, a.tags, a.like_count, a.status, a.created_at,
           c.name as category_name
    FROM artworks a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.user_id = $1
    ORDER BY a.created_at DESC
  `, [user.id]);

  const artworks = res.rows;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/member' },
          { label: 'My Artworks' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My artworks</h1>
          <p className="dashboard-subtitle">Manage all architectural works you have published ({artworks.length} total).</p>
        </div>
        <Link href="/dashboard/member/artworks/create" className="btn-primary">
          + Upload new artwork
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div style={{ padding: 48, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)', textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
          <p style={{ color: 'var(--surface)', fontSize: '0.95rem', marginBottom: 20 }}>
            You haven&apos;t uploaded any artworks yet.
          </p>
          <Link href="/dashboard/member/artworks/create" className="btn-primary">
            Upload first artwork
          </Link>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table dashboard-responsive-table member-artworks-table">
            <colgroup>
              <col className="member-art-col-thumb" />
              <col className="member-art-col-title" />
              <col className="member-art-col-likes" />
              <col className="member-art-col-status" />
              <col className="member-art-col-date" />
              <col className="member-art-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Title &amp; category</th>
                <th>Likes</th>
                <th>Status</th>
                <th>Upload date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((art) => (
                <tr key={art.id}>
                  <td data-label="Artwork" data-cell="thumb">
                    <Link href={`/artworks/${art.id}`} className="table-thumb-link">
                      <div className="table-thumb-square">
                        <Image src={art.image_url} alt={art.title} fill style={{ objectFit: 'cover' }} sizes="60px" />
                      </div>
                    </Link>
                  </td>
                  <td data-label="Title & category" data-cell="primary">
                    <Link href={`/artworks/${art.id}`} className="dashboard-table-link">
                      {art.title}
                    </Link>
                    {art.category_name && (
                      <div className="table-cell-category">
                        {art.category_name}
                      </div>
                    )}
                  </td>
                  <td data-label="Likes">
                    <span className="member-likes-cell">
                      <Heart size={16} filled className="member-like-icon" />
                      <span>{art.like_count}</span>
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${art.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                      {art.status === 'active' ? 'Active' : 'Taken down'}
                    </span>
                  </td>
                  <td data-label="Upload date" className="table-cell-meta">
                    {new Date(art.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td data-label="Actions" data-cell="actions">
                    <div className="table-actions-group">
                      <Link href={`/artworks/${art.id}`} className="btn-secondary table-action-btn">
                        View
                      </Link>
                      <Link href={`/dashboard/member/artworks/${art.id}/edit`} className="btn-secondary table-action-btn">
                        Edit
                      </Link>
                      <DeleteArtworkButton artworkId={art.id} artworkTitle={art.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
