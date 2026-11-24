'use server';

import { revalidatePath } from 'next/cache';
import { query, getClient } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { toId } from '@/lib/utils';

function requireAdmin(session) {
  if (!session || session.user.role !== 'admin' || session.user.is_active === false) {
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

export async function setUserActiveStatus(rawUserId, nextActive) {
  const session = await getSession();
  requireAdmin(session);

  const userId = toId(rawUserId);
  if (!userId) return { error: 'Invalid user ID.' };
  if (typeof nextActive !== 'boolean') return { error: 'Invalid account status.' };
  if (userId === session.user.id) {
    return { error: 'Cannot change the status of your own account.' };
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const userRes = await client.query('SELECT role, is_active FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { error: 'User not found.' };
    }
    if (userRes.rows[0].role === 'admin') {
      await client.query('ROLLBACK');
      return { error: 'Cannot deactivate or modify an admin account.' };
    }

    await client.query('UPDATE users SET is_active = $1 WHERE id = $2', [nextActive, userId]);

    if (!nextActive) {
      await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    }

    await client.query('COMMIT');
    revalidatePath('/dashboard/admin/users');
    revalidatePath('/dashboard/admin');
    revalidatePath('/artists');
    revalidatePath(`/artists/${userId}`);
    revalidatePath('/artists/[id]', 'page');
    revalidatePath('/');
    return { success: true, isActive: nextActive };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Admin] Update user active status error:', err);
    return { error: `Failed to ${nextActive ? 'activate' : 'deactivate'} account.` };
  } finally {
    client.release();
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
