import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CategoryManager from './CategoryManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Category Management — ARCHIVE',
};

export default async function AdminCategoriesPage() {
  await requireRole('admin');

  const res = await query(`
    SELECT c.id, c.name, COUNT(a.id) as artwork_count
    FROM categories c
    LEFT JOIN artworks a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Categories' },
        ]}
      />
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Category management</h1>
          <p className="dashboard-subtitle">Manage the curatorial taxonomy for digital artworks across ARCHIVE.</p>
        </div>
      </div>

      <CategoryManager categories={res.rows} />
    </div>
  );
}
