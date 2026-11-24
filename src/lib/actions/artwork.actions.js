'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canUseProfileImage } from '@/lib/avatar';
import { isUploadedImagePath, toId } from '@/lib/utils';

export async function createArtwork(prevState, formData) {
  const session = await getSession();
  if (!session) return { error: 'Please sign in first.' };
  if (session.user.role !== 'member') return { error: 'Only members can upload artworks.' };

  const title = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const categoryId = toId(formData.get('category_id'));
  const tags = formData.get('tags')?.toString().trim();
  const imageUrl = formData.get('image_url')?.toString().trim();

  if (!title || !description || !categoryId || !tags || !imageUrl) {
    return { error: 'All fields are required.' };
  }
  if (!isUploadedImagePath(imageUrl)) {
    return { error: 'Please upload an artwork image file from your device (JPG, PNG, or WebP).' };
  }
  if (title.length < 3 || title.length > 200) {
    return { error: 'Title must be between 3–200 characters.' };
  }
  if (description.length < 10) {
    return { error: 'Description must be at least 10 characters.' };
  }

  try {
    const result = await query(
      `INSERT INTO artworks (user_id, category_id, title, description, image_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [session.user.id, categoryId, title, description, imageUrl, tags]
    );

    revalidatePath('/');
    revalidatePath('/explore');
    revalidatePath('/artists');
    revalidatePath(`/artists/${session.user.id}`);
    revalidatePath('/dashboard/member/artworks');

    return { success: true, artworkId: result.rows[0].id };
  } catch (err) {
    console.error('[Artwork] Create error:', err);
    return { error: 'Failed to create artwork. Please try again.' };
  }
}

export async function updateArtwork(prevState, formData) {
  const session = await getSession();
  if (!session) return { error: 'Please sign in first.' };

  const artworkId = toId(formData.get('artwork_id'));
  const title = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const categoryId = toId(formData.get('category_id'));
  const tags = formData.get('tags')?.toString().trim();

  if (!artworkId || !title || !description || !categoryId || !tags) {
    return { error: 'All fields are required.' };
  }
  if (title.length < 3 || title.length > 200) {
    return { error: 'Title must be between 3–200 characters.' };
  }
  if (description.length < 10) {
    return { error: 'Description must be at least 10 characters.' };
  }

  try {
    const artwork = await query('SELECT user_id FROM artworks WHERE id = $1', [artworkId]);
    if (artwork.rows.length === 0) return { error: 'Artwork not found.' };
    if (artwork.rows[0].user_id !== session.user.id && session.user.role !== 'admin') {
      return { error: 'Not authorized to edit this artwork.' };
    }

    await query(
      `UPDATE artworks SET title=$1, description=$2, category_id=$3, tags=$4
       WHERE id=$5`,
      [title, description, categoryId, tags, artworkId]
    );

    revalidatePath('/');
    revalidatePath('/explore');
    revalidatePath('/dashboard/member/artworks');
    revalidatePath(`/artworks/${artworkId}`);
    return { success: true };
  } catch (err) {
    console.error('[Artwork] Update error:', err);
    return { error: 'Failed to update artwork.' };
  }
}

export async function deleteArtwork(rawArtworkId) {
  const session = await getSession();
  if (!session) return { error: 'Please sign in first.' };

  const artworkId = toId(rawArtworkId);
  if (!artworkId) return { error: 'Invalid artwork ID.' };

  try {
    const artwork = await query('SELECT user_id FROM artworks WHERE id = $1', [artworkId]);
    if (artwork.rows.length === 0) return { error: 'Artwork not found.' };
    if (artwork.rows[0].user_id !== session.user.id && session.user.role !== 'admin') {
      return { error: 'Not authorized to delete this artwork.' };
    }

    await query('DELETE FROM artworks WHERE id = $1', [artworkId]);

    revalidatePath('/');
    revalidatePath('/explore');
    revalidatePath('/artists');
    revalidatePath(`/artists/${artwork.rows[0].user_id}`);
    revalidatePath('/dashboard/member/artworks');
    return { success: true };
  } catch (err) {
    console.error('[Artwork] Delete error:', err);
    return { error: 'Failed to delete artwork.' };
  }
}

export async function toggleLike(rawArtworkId) {
  const session = await getSession();
  if (!session) return { error: 'login_required' };
  if (session.user.role === 'admin') {
    return { error: 'Administrators cannot like artworks.' };
  }

  const artworkId = toId(rawArtworkId);
  if (!artworkId) return { error: 'Invalid artwork ID.' };

  try {
    const deleted = await query(
      'DELETE FROM artwork_likes WHERE user_id=$1 AND artwork_id=$2 RETURNING id',
      [session.user.id, artworkId]
    );

    if (deleted.rows.length > 0) {
      await query('UPDATE artworks SET like_count = GREATEST(like_count - 1, 0) WHERE id=$1', [artworkId]);
      revalidatePath(`/artworks/${artworkId}`);
      revalidatePath('/');
      revalidatePath('/explore');
      return { liked: false };
    }

    const inserted = await query(
      'INSERT INTO artwork_likes (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT (user_id, artwork_id) DO NOTHING RETURNING id',
      [session.user.id, artworkId]
    );
    if (inserted.rows.length > 0) {
      await query('UPDATE artworks SET like_count = like_count + 1 WHERE id=$1', [artworkId]);
    }
    revalidatePath(`/artworks/${artworkId}`);
    revalidatePath('/');
    revalidatePath('/explore');
    return { liked: true };
  } catch (err) {
    console.error('[Artwork] Like error:', err);
    return { error: 'Failed to process like.' };
  }
}

export async function toggleFavorite(rawArtworkId) {
  const session = await getSession();
  if (!session) return { error: 'login_required' };
  if (session.user.role === 'admin') {
    return { error: 'Administrators cannot save favorites.' };
  }

  const artworkId = toId(rawArtworkId);
  if (!artworkId) return { error: 'Invalid artwork ID.' };

  try {
    const deleted = await query(
      'DELETE FROM favorites WHERE user_id=$1 AND artwork_id=$2 RETURNING id',
      [session.user.id, artworkId]
    );

    if (deleted.rows.length > 0) {
      revalidatePath('/dashboard/member/favorites');
      return { favorited: false };
    }

    await query(
      'INSERT INTO favorites (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT (user_id, artwork_id) DO NOTHING',
      [session.user.id, artworkId]
    );
    revalidatePath('/dashboard/member/favorites');
    return { favorited: true };
  } catch (err) {
    console.error('[Artwork] Favorite error:', err);
    return { error: 'Failed to process favorite.' };
  }
}

export async function addComment(prevState, formData) {
  const session = await getSession();
  if (!session) return { error: 'login_required' };
  if (session.user.role === 'admin') {
    return { error: 'Administrators cannot post comments.' };
  }

  const artworkId = formData.get('artwork_id')?.toString();
  const content = formData.get('content')?.toString().trim();

  if (!content || content.length < 1) return { error: 'Comment cannot be empty.' };
  if (content.length > 1000) return { error: 'Comment must be at most 1000 characters.' };

  try {
    await query(
      'INSERT INTO comments (user_id, artwork_id, content) VALUES ($1, $2, $3)',
      [session.user.id, artworkId, content]
    );
    revalidatePath(`/artworks/${artworkId}`);
    return { success: true };
  } catch (err) {
    console.error('[Comment] Add error:', err);
    return { error: 'Failed to add comment.' };
  }
}

export async function deleteComment(commentId, artworkId) {
  const session = await getSession();
  if (!session) return { error: 'Please sign in.' };

  try {
    const comment = await query('SELECT user_id FROM comments WHERE id=$1', [commentId]);
    if (comment.rows.length === 0) return { error: 'Comment not found.' };
    if (comment.rows[0].user_id !== session.user.id && session.user.role !== 'admin') {
      return { error: 'Not authorized.' };
    }

    await query('DELETE FROM comments WHERE id=$1', [commentId]);
    revalidatePath(`/artworks/${artworkId}`);
    return { success: true };
  } catch (err) {
    console.error('[Comment] Delete error:', err);
    return { error: 'Failed to delete comment.' };
  }
}

export async function reportArtwork(prevState, formData) {
  const session = await getSession();
  if (!session) return { error: 'login_required' };
  if (session.user.role === 'admin') {
    return { error: 'Administrators cannot report artworks.' };
  }

  const artworkId = formData.get('artwork_id')?.toString();
  const reason = formData.get('reason')?.toString();
  const rawDetails = formData.get('details')?.toString() ?? '';
  const trimmedDetails = rawDetails.trim();
  const validReasons = ['SARA', 'Plagiarism', 'Inappropriate Content', 'Other'];

  if (!validReasons.includes(reason)) {
    return { error: 'Invalid report reason.' };
  }

  if (reason === 'Other') {
    if (!trimmedDetails) {
      return { error: 'Please explain the reason for reporting this artwork.' };
    }
    if (trimmedDetails.length > 500) {
      return { error: 'Additional details must be at most 500 characters.' };
    }
  }

  const details = reason === 'Other' ? trimmedDetails : null;

  try {
    // Check if artwork exists
    const artwork = await query('SELECT id, user_id FROM artworks WHERE id=$1', [artworkId]);
    if (artwork.rows.length === 0) return { error: 'Artwork not found.' };
    if (artwork.rows[0].user_id === session.user.id) {
      return { error: 'You cannot report your own artwork.' };
    }

    // Check duplicate report
    const existing = await query(
      'SELECT id FROM reports WHERE user_id=$1 AND artwork_id=$2',
      [session.user.id, artworkId]
    );
    if (existing.rows.length > 0) {
      return { error: 'You have already reported this artwork.' };
    }

    await query(
      'INSERT INTO reports (user_id, artwork_id, reason, details) VALUES ($1, $2, $3, $4)',
      [session.user.id, artworkId, reason, details]
    );

    revalidatePath('/dashboard/admin/reports');
    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (err) {
    console.error('[Report] Error:', err);
    return { error: 'Failed to submit report.' };
  }
}

export async function updateProfile(prevState, formData) {
  const session = await getSession();
  if (!session) return { error: 'Please sign in.' };

  const allowProfilePhoto = canUseProfileImage(session.user.role);
  const name = formData.get('name')?.toString().trim();
  const bio = formData.get('bio')?.toString().trim() || null;
  const externalLink = formData.get('external_link')?.toString().trim() || null;
  const rawProfileImage = allowProfilePhoto
    ? formData.get('profile_image')?.toString().trim() || ''
    : '';
  const profileImage = allowProfilePhoto && rawProfileImage.length > 0 ? rawProfileImage : null;

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' };

  try {
    if (allowProfilePhoto) {
      const existingRes = await query('SELECT profile_image FROM users WHERE id = $1', [session.user.id]);
      const currentProfileImage = existingRes.rows[0]?.profile_image || null;

      if (profileImage && profileImage !== currentProfileImage && !isUploadedImagePath(profileImage)) {
        return { error: 'Please upload a profile photo file from your device (JPG, PNG, or WebP).' };
      }

      await query(
        `UPDATE users
         SET name = $1, bio = $2, external_link = $3, profile_image = $4
         WHERE id = $5`,
        [name, bio, externalLink, profileImage, session.user.id]
      );
    } else {
      // Non-member roles (Admin, Curator) never update profile_image; existing DB column data is left untouched
      await query(
        `UPDATE users
         SET name = $1, bio = $2, external_link = $3
         WHERE id = $4`,
        [name, bio, externalLink, session.user.id]
      );
    }

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/member');
    revalidatePath('/dashboard/member/profile');
    revalidatePath('/artists');
    revalidatePath(`/artists/${session.user.id}`);
    revalidatePath('/explore');
    revalidatePath('/');
    return { success: true, profileImage: allowProfilePhoto ? profileImage : null };
  } catch (err) {
    console.error('[Profile] Update error:', err);
    return { error: 'Failed to update profile.' };
  }
}
