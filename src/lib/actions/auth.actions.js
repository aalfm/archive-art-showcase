'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/auth';

/**
 * Register a new user (member or curator)
 */
export async function registerUser(prevState, formData) {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString();
  const bio = formData.get('bio')?.toString().trim() || null;
  const externalLink = formData.get('external_link')?.toString().trim() || null;

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

  try {
    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return { error: 'Email is already registered.' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const curatorStatus = role === 'curator' ? 'pending' : null;

    const result = await query(
      `INSERT INTO users (name, email, password, role, curator_status, bio, external_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, email, hashedPassword, role, curatorStatus, bio, externalLink]
    );

    await createSession(result.rows[0].id);
  } catch (err) {
    console.error('[Auth] Register error:', err);
    return { error: 'Registration failed. Please try again.' };
  }

  if (role === 'curator') {
    redirect('/dashboard/curator/pending');
  } else {
    redirect('/dashboard/member');
  }
}

/**
 * Login a user
 */
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

    await createSession(user.id);
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return { error: 'Sign in failed. Please try again.' };
  }

  // Honour a safe, same-site redirect target (set by the route guard)
  if (redirectTo.startsWith('/') && !redirectTo.startsWith('//') && !redirectTo.startsWith('/login')) {
    redirect(redirectTo);
  }

  if (user.role === 'admin') {
    redirect('/dashboard/admin');
  } else if (user.role === 'curator') {
    if (user.curator_status === 'approved') {
      redirect('/dashboard/curator');
    } else {
      redirect('/dashboard/curator/pending');
    }
  } else {
    redirect('/dashboard/member');
  }
}

/**
 * Logout
 */
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
