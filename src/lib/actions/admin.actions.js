'use server';

import { revalidatePath } from 'next/cache';
import { query, getClient } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { toId } from '@/lib/utils';

function requireAdmin(session) {
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function getDashboardStats() {
  const session = await getSession();
  requireAdmin(session);

  const [users, artworks, reports, challenges] = await Promise.all([
    query('SELECT COUNT(*) FROM users WHERE role != \'admin\''),
    query('SELECT COUNT(*) FROM artworks WHERE status=\'active\''),
    query('SELECT COUNT(*) FROM reports WHERE status=\'pending\''),
    query('SELECT COUNT(*) FROM challenges WHERE end_date >= NOW()'),
  ]);

  return {
    totalUsers: parseInt(users.rows[0].count),
    totalArtworks: parseInt(artworks.rows[0].count),
    pendingReports: parseInt(reports.rows[0].count),
    activeChallenges: parseInt(challenges.rows[0].count),
  };
}

export async function updateCuratorStatus(curatorId, status) {
  const session = await getSession();
  requireAdmin(session);

  if (!['approved', 'rejected'].includes(status)) {
    return { error: 'Invalid status.' };
  }

  try {
    await query(
      'UPDATE users SET curator_status=$1 WHERE id=$2 AND role=\'curator\'',
      [status, curatorId]
    );
    revalidatePath('/dashboard/admin/curators');
    return { success: true };
  } catch (err) {
    console.error('[Admin] Curator status error:', err);
    return { error: 'Failed to update curator status.' };
  }
}

export async function deleteUser(rawUserId) {
  const session = await getSession();
  requireAdmin(session);

  const userId = toId(rawUserId);
  if (!userId) return { error: 'Invalid user ID.' };
  if (userId === session.user.id) {
    return { error: 'Cannot delete your own account.' };
  }

  try {
    const user = await query('SELECT role FROM users WHERE id=$1', [userId]);
    if (user.rows.length === 0) return { error: 'User not found.' };
    if (user.rows[0].role === 'admin') {
      return { error: 'Cannot delete an admin account.' };
    }

    await query('DELETE FROM users WHERE id=$1', [userId]);
    revalidatePath('/dashboard/admin/users');
    return { success: true };
  } catch (err) {
    console.error('[Admin] Delete user error:', err);
    return { error: 'Failed to delete user.' };
  }
}

export async function createCategory(prevState, formData) {
  const session = await getSession();
  requireAdmin(session);

  const name = formData.get('name')?.toString().trim();
  if (!name || name.length < 2) return { error: 'Category name must be at least 2 characters.' };

  try {
    await query('INSERT INTO categories (name) VALUES ($1)', [name]);
    revalidatePath('/dashboard/admin/categories');
    return { success: true };
  } catch (err) {
    if (err.code === '23505') return { error: 'Category already exists.' };
    console.error('[Admin] Category create error:', err);
    return { error: 'Failed to create category.' };
  }
}

export async function updateCategory(prevState, formData) {
  const session = await getSession();
  requireAdmin(session);

  const categoryId = formData.get('category_id')?.toString();
  const name = formData.get('name')?.toString().trim();
  if (!name || name.length < 2) return { error: 'Category name must be at least 2 characters.' };

  try {
    await query('UPDATE categories SET name=$1 WHERE id=$2', [name, categoryId]);
    revalidatePath('/dashboard/admin/categories');
    return { success: true };
  } catch (err) {
    if (err.code === '23505') return { error: 'Category name is already in use.' };
    console.error('[Admin] Category update error:', err);
    return { error: 'Failed to update category.' };
  }
}

export async function deleteCategory(categoryId) {
  const session = await getSession();
  requireAdmin(session);

  try {
    await query('DELETE FROM categories WHERE id=$1', [categoryId]);
    revalidatePath('/dashboard/admin/categories');
    return { success: true };
  } catch (err) {
    if (err.code === '23503') {
      return { error: 'Category is still in use by artworks. Remove or reassign artworks first.' };
    }
    console.error('[Admin] Category delete error:', err);
    return { error: 'Failed to delete category.' };
  }
}

export async function dismissReport(reportId) {
  const session = await getSession();
  requireAdmin(session);

  try {
    await query(
      'UPDATE reports SET status=\'dismissed\' WHERE id=$1 AND status=\'pending\'',
      [reportId]
    );
    revalidatePath('/dashboard/admin/reports');
    return { success: true };
  } catch (err) {
    console.error('[Admin] Dismiss report error:', err);
    return { error: 'Failed to dismiss report.' };
  }
}

export async function takeDownArtwork(reportId, artworkId) {
  const session = await getSession();
  requireAdmin(session);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Mark artwork as taken down
    await client.query(
      'UPDATE artworks SET status=\'taken_down\' WHERE id=$1',
      [artworkId]
    );

    // Update all pending reports for this artwork to taken_down
    await client.query(
      'UPDATE reports SET status=\'taken_down\' WHERE artwork_id=$1 AND status=\'pending\'',
      [artworkId]
    );

    await client.query('COMMIT');
    revalidatePath('/');
    revalidatePath('/artists');
    revalidatePath('/dashboard/admin/reports');
    revalidatePath('/explore');
    revalidatePath(`/artworks/${artworkId}`);
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Admin] Take down error:', err);
    return { error: 'Failed to take down artwork.' };
  } finally {
    client.release();
  }
}
