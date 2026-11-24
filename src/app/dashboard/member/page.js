import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { Heart } from '@/components/ui/Icons';
import DashboardStatCard from '@/components/ui/DashboardStatCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Member Overview — ARCHIVE',
};

export default async function MemberOverviewPage() {
  const user = await requireRole('member');

  const [statsRes, recentArtworksRes, recentSubmissionsRes] = await Promise.all([
    query(`
      SELECT 
        (SELECT COUNT(*) FROM artworks WHERE user_id = $1 AND status = 'active') as artwork_count,
        (SELECT COALESCE(SUM(like_count), 0) FROM artworks WHERE user_id = $1 AND status = 'active') as total_likes,
        (SELECT COUNT(*) FROM favorites WHERE user_id = $1) as favorite_count,
        (SELECT COUNT(*) FROM submissions WHERE member_id = $1) as submission_count
    `, [user.id]),
    query(`
      SELECT a.id, a.title, a.image_url, a.like_count, a.created_at, c.name as category_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.user_id = $1 AND a.status = 'active'
      ORDER BY a.created_at DESC
      LIMIT 4
    `, [user.id]),
    query(`
      SELECT s.id, s.winner_rank, s.created_at,
             c.title as challenge_title, c.end_date,
             a.title as artwork_title, a.image_url as artwork_image
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      JOIN artworks a ON s.artwork_id = a.id
      WHERE s.member_id = $1
      ORDER BY s.created_at DESC
      LIMIT 3
    `, [user.id]),
  ]);

  const stats = statsRes.rows[0];
  const recentArtworks = recentArtworksRes.rows;
  const recentSubmissions = recentSubmissionsRes.rows;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Member Overview</h1>
          <p className="dashboard-subtitle">Welcome back, {user.name}.</p>
        </div>
        <div className="dashboard-header-actions">
          <Link href="/dashboard/member/artworks/create" className="btn-primary">
            + Upload Artwork
          </Link>
          <Link href="/challenges" className="btn-secondary">
            Join Challenge
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <DashboardStatCard label="Artworks Uploaded" value={stats.artwork_count} />
        <DashboardStatCard label="Total Likes" value={stats.total_likes} />
        <DashboardStatCard label="Favorite Artworks" value={stats.favorite_count} />
        <DashboardStatCard label="Challenge Submissions" value={stats.submission_count} />
      </div>

      {/* Recent Artworks */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--accent)', letterSpacing: '0.1em' }}>
            YOUR RECENT ARTWORKS
          </h2>
          <Link href="/dashboard/member/artworks" style={{ fontSize: '0.82rem', color: 'var(--surface)', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        {recentArtworks.length === 0 ? (
          <div style={{ padding: 32, background: '#141618', borderRadius: 8, textAlign: 'center', border: '1px solid var(--bg-secondary)' }}>
            <p style={{ color: 'var(--surface)', fontSize: '0.9rem', marginBottom: 16 }}>You haven&apos;t uploaded any artworks yet.</p>
            <Link href="/dashboard/member/artworks/create" className="btn-primary">
              Upload Your First Artwork
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {recentArtworks.map(art => (
              <div key={art.id} style={{ background: '#141618', border: '1px solid var(--bg-secondary)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', height: 160 }}>
                  <Image src={art.image_url} alt={art.title} fill style={{ objectFit: 'cover' }} sizes="240px" />
                </div>
                <div style={{ padding: 14 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{art.category_name}</span>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0 8px' }}>{art.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="member-likes-cell member-likes-cell--compact">
                      <Heart size={17} filled className="member-like-icon" />
                      <span>{art.like_count}</span>
                    </span>
                    <Link href={`/dashboard/member/artworks/${art.id}/edit`} style={{ fontSize: '0.78rem', color: 'var(--accent)', textDecoration: 'none' }}>
                      Edit →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Submissions */}
      {recentSubmissions.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 16 }}>
            RECENT CHALLENGE SUBMISSIONS
          </h2>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>Artwork</th>
                  <th>Status / Rank</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map(sub => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600 }}>{sub.challenge_title}</td>
                    <td>{sub.artwork_title}</td>
                    <td>
                      {sub.winner_rank ? (
                        <span className="badge badge-approved">Rank #{sub.winner_rank} 🏆</span>
                      ) : (
                        <span className="badge badge-pending">Under Review</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--surface)' }}>
                      {new Date(sub.created_at).toLocaleDateString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
