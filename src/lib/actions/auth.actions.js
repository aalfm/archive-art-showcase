'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getClient, query } from '@/lib/db';
import { createSession, deleteSession, revokeUserSessions } from '@/lib/auth';
import {
  MAX_BACKGROUND_LENGTH,
  validateCuratorCvRequirement,
  validatePortfolioUrl,
} from '@/lib/curator';
import {
  hasUploadedCvFile,
  prepareCuratorCvUpload,
  removeStoredCuratorCv,
  savePreparedCuratorCv,
} from '@/lib/curator-cv';

export async function registerUser(prevState, formData) {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString();
  const bio = formData.get('bio')?.toString().trim() || null;
  const rawExternalLink = formData.get('external_link')?.toString().trim() || '';
  const rawCvUrl = formData.get('cv_url')?.toString().trim() || '';
  const rawCvFile = formData.get('cv_file');

  // Validation
  if (!name || !email || !password || !role) {
    return { error: 'All fields are required.' };
  }
  if (!['member', 'curator'].includes(role)) {
    return { error: 'Invalid role.' };
  }
  if (name.length < 2 || name.length > 100) {
    return { error: 'Name must be between 2–100 characters.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Invalid email format.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (bio && bio.length > MAX_BACKGROUND_LENGTH) {
    return { error: `Background must be at most ${MAX_BACKGROUND_LENGTH} characters.` };
  }

  let externalLink = null;
  let cvUrl = null;
  let preparedCv = null;

  if (role === 'curator') {
    const portfolioCheck = validatePortfolioUrl(rawExternalLink, { required: true });
    if (!portfolioCheck.valid) {
      return { error: portfolioCheck.error };
    }
    externalLink = portfolioCheck.value;

    const hasCvFile = hasUploadedCvFile(rawCvFile);
    if (hasCvFile) {
      preparedCv = await prepareCuratorCvUpload(rawCvFile);
      if (!preparedCv.valid) {
        return { error: preparedCv.error };
      }
    }

    const cvCheck = validateCuratorCvRequirement({ hasCvFile, cvUrl: rawCvUrl });
    if (!cvCheck.valid) {
      return { error: cvCheck.error };
    }
    cvUrl = cvCheck.cvUrl;
  } else if (rawExternalLink) {
    const portfolioCheck = validatePortfolioUrl(rawExternalLink, { required: false });
    if (!portfolioCheck.valid) {
      return { error: portfolioCheck.error };
    }
    externalLink = portfolioCheck.value;
  }

  const client = await getClient();
  let newUserId;
  let savedCv = null;
  try {
    await client.query('BEGIN');

    // Check if email already exists before persisting any file
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return { error: 'Email is already registered.' };
    }

    if (role === 'curator' && preparedCv) {
      savedCv = await savePreparedCuratorCv(preparedCv);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const curatorStatus = role === 'curator' ? 'pending' : null;

    const result = await client.query(
      `INSERT INTO users (name, email, password, role, curator_status, bio, external_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, email, hashedPassword, role, curatorStatus, bio, externalLink]
    );
    newUserId = result.rows[0].id;

    if (role === 'curator') {
      await client.query(
        `INSERT INTO curator_applications (
           user_id, attempt_number, portfolio_url, cv_file_path, cv_file_name, cv_url, background, status, submitted_at
         ) VALUES ($1, 1, $2, $3, $4, $5, $6, 'pending', NOW())`,
        [
          newUserId,
          externalLink,
          savedCv?.cvFilePath || null,
          savedCv?.cvFileName || null,
          cvUrl,
          bio,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    if (savedCv?.cvFilePath) {
      await removeStoredCuratorCv(savedCv.cvFilePath);
    }
    if (err.code === '23505') {
      return { error: 'Email is already registered.' };
    }
    console.error('[Auth] Register error:', err);
    return { error: 'Registration failed. Please try again.' };
  } finally {
    client.release();
  }

  try {
    await createSession(newUserId);
  } catch (err) {
    console.error('[Auth] Create session error after register:', err);
    return { error: 'Account created, but failed to start session. Please sign in.' };
  }

  if (role === 'curator') {
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/admin/curators');
    revalidatePath('/dashboard/admin/users');
    redirect('/dashboard/curator/pending');
  } else {
    revalidatePath('/dashboard/admin/users');
    redirect('/dashboard/member');
  }
}

export async function loginUser(prevState, formData) {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const redirectTo = formData.get('redirect')?.toString() || '';

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  let user;
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return { error: 'Invalid email or password.' };
    }

    user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: 'Invalid email or password.' };
    }

    if (user.is_active === false) {
      await revokeUserSessions(user.id);
      return { error: 'This account has been deactivated. Please contact an administrator.' };
    }

    await createSession(user.id);
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return { error: 'Sign in failed. Please try again.' };
  }

  if (user.role === 'admin') {
    if (
      redirectTo === '/dashboard/admin' ||
      redirectTo.startsWith('/dashboard/admin/') ||
      redirectTo.startsWith('/dashboard/admin?')
    ) {
      redirect(redirectTo);
    }
    redirect('/dashboard/admin');
  }

  if (user.role === 'curator') {
    const curatorHome =
      user.curator_status === 'approved'
        ? '/dashboard/curator'
        : '/dashboard/curator/pending';
    const isSafeCuratorRedirect =
      redirectTo.startsWith('/') &&
      !redirectTo.startsWith('//') &&
      !redirectTo.startsWith('/login') &&
      !redirectTo.startsWith('/register') &&
      !redirectTo.startsWith('/dashboard/admin') &&
      !redirectTo.startsWith('/dashboard/member') &&
      (user.curator_status === 'approved'
        ? !redirectTo.startsWith('/dashboard/curator/pending')
        : !redirectTo.startsWith('/dashboard/curator') || redirectTo === '/dashboard/curator/pending');
    if (isSafeCuratorRedirect) {
      redirect(redirectTo);
    }
    redirect(curatorHome);
  }

  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//') && !redirectTo.startsWith('/login')) {
    redirect(redirectTo);
  }

  redirect('/dashboard/member');
}

export async function logoutUser() {
  await deleteSession();
  redirect('/');
}

/**
 * Change password
 */
export async function changePassword(prevState, formData) {
  const { getSession } = await import('@/lib/auth');
  const session = await getSession();
  if (!session) return { error: 'Please sign in first.' };

  const currentPassword = formData.get('current_password')?.toString();
  const newPassword = formData.get('new_password')?.toString();
  const confirmPassword = formData.get('confirm_password')?.toString();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All password fields are required.' };
  }
  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters.' };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'New password confirmation does not match.' };
  }

  try {
    const userRes = await query('SELECT password FROM users WHERE id = $1', [session.user.id]);
    if (userRes.rows.length === 0) return { error: 'User not found.' };

    const match = await bcrypt.compare(currentPassword, userRes.rows[0].password);
    if (!match) {
      return { error: 'Current password is incorrect.' };
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, session.user.id]);

    return { success: true };
  } catch (err) {
    console.error('[Auth] Change password error:', err);
    return { error: 'Failed to update password.' };
  }
}
