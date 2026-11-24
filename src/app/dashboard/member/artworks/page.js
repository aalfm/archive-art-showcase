import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DeleteArtworkButton from './DeleteArtworkButton';
import { Heart } from '@/components/ui/Icons';

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
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Artworks</h1>
          <p className="dashboard-subtitle">Manage all architectural works you have published ({artworks.length} total).</p>
        </div>
        <Link href="/dashboard/member/artworks/create" className="btn-primary">
          + Upload New Artwork
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div style={{ padding: 48, background: '#141618', borderRadius: 8, textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
          <p style={{ color: 'var(--surface)', fontSize: '0.95rem', marginBottom: 20 }}>
            You haven&apos;t uploaded any artworks yet.
          </p>
          <Link href="/dashboard/member/artworks/create" className="btn-primary">
            Upload First Artwork
          </Link>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Artwork</th>
                <th>Title &amp; Category</th>
                <th>Likes</th>
                <th>Status</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((art) => (
                <tr key={art.id}>
                  <td>
                    <div style={{ position: 'relative', width: 60, height: 60, borderRadius: 6, overflow: 'hidden', margin: '0 auto' }}>
                      <Image src={art.image_url} alt={art.title} fill style={{ objectFit: 'cover' }} sizes="60px" />
                    </div>
                  </td>
                  <td>
                    <Link href={`/artworks/${art.id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {art.title}
                    </Link>
                    <div style={{ fontSize: '0.74rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {art.category_name}
                    </div>
                  </td>
                  <td>
                    <span className="member-likes-cell">
                      <Heart size={18} filled className="member-like-icon" />
                      <span>{art.like_count}</span>
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${art.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                      {art.status === 'active' ? 'Active' : 'Taken Down'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--surface)' }}>
                    {new Date(art.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <Link href={`/artworks/${art.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                        View
                      </Link>
                      <Link href={`/dashboard/member/artworks/${art.id}/edit`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
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
