'use server';

import { revalidatePath } from 'next/cache';
import { getClient } from '@/lib/db';
import { getSession } from '@/lib/auth';
import {
  MAX_BACKGROUND_LENGTH,
  MAX_SUPPORTING_NOTES_LENGTH,
  validateCuratorCvRequirement,
  validatePortfolioUrl,
} from '@/lib/curator';
import {
  hasUploadedCvFile,
  prepareCuratorCvUpload,
  removeStoredCuratorCv,
  savePreparedCuratorCv,
} from '@/lib/curator-cv';

/**
 * Allows a Curator account whose latest status is 'rejected' to update their
 * application details and submit a new review attempt (Rejected -> Pending).
 *
 * Security invariants enforced server-side inside a database transaction:
 * - Only authenticated, active users with role === 'curator' may reapply.
 * - Only users whose current status is strictly 'rejected' may reapply.
 * - Pending users cannot submit duplicate applications.
 * - Approved users cannot resubmit.
 * - Users can never set their own status to 'approved' or delete rejection history.
 * - Reuses the same user account (never creates duplicate user accounts).
 */
export async function reapplyCurator(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Please sign in first.' };
  }

  if (session.user.role !== 'curator') {
    return { error: 'Only curator accounts can submit a curator reapplication.' };
  }

  const rawName = formData.get('name')?.toString().trim() || session.user.name;
  const rawPortfolio = formData.get('portfolio_url')?.toString() ?? formData.get('external_link')?.toString() ?? '';
  const rawCvUrl = (formData.get('cv_url')?.toString() ?? '').trim();
  const rawCvFile = formData.get('cv_file');
  const keepPreviousCv = formData.get('keep_previous_cv')?.toString() === '1';
  const rawBackground = (formData.get('background')?.toString() ?? formData.get('bio')?.toString() ?? '').trim();
  const rawSupportingNotes = (formData.get('supporting_notes')?.toString() ?? '').trim();

  if (!rawName || rawName.length < 2 || rawName.length > 100) {
    return { error: 'Full name must be between 2–100 characters.' };
  }

  const portfolioCheck = validatePortfolioUrl(rawPortfolio, { required: true });
  if (!portfolioCheck.valid) {
    return { error: portfolioCheck.error };
  }

  const hasNewCvFile = hasUploadedCvFile(rawCvFile);
  let preparedCv = null;
  if (hasNewCvFile) {
    preparedCv = await prepareCuratorCvUpload(rawCvFile);
    if (!preparedCv.valid) {
      return { error: preparedCv.error };
    }
  }

  if (!rawBackground || rawBackground.length < 10) {
    return {
      error: 'Please provide your curatorial background and experience (at least 10 characters).',
    };
  }
  if (rawBackground.length > MAX_BACKGROUND_LENGTH) {
    return {
      error: `Curatorial background must be at most ${MAX_BACKGROUND_LENGTH} characters.`,
    };
  }
  if (rawSupportingNotes.length > MAX_SUPPORTING_NOTES_LENGTH) {
    return {
      error: `Supporting information must be at most ${MAX_SUPPORTING_NOTES_LENGTH} characters.`,
    };
  }

  const portfolioUrl = portfolioCheck.value;
  const supportingNotes = rawSupportingNotes || null;

  const client = await getClient();
  let savedCv = null;
  try {
    await client.query('BEGIN');

    // Lock user row to prevent concurrent duplicate reapplications
    const userRes = await client.query(
      'SELECT id, role, curator_status, is_active FROM users WHERE id = $1 FOR UPDATE',
      [session.user.id]
    );

    if (userRes.rows.length === 0 || userRes.rows[0].is_active === false) {
      await client.query('ROLLBACK');
      return { error: 'Account not found or inactive.' };
    }

    const dbUser = userRes.rows[0];
    if (dbUser.role !== 'curator') {
      await client.query('ROLLBACK');
      return { error: 'Only curator accounts can submit a curator reapplication.' };
    }

    if (dbUser.curator_status === 'pending') {
      await client.query('ROLLBACK');
      return {
        error: 'Your curator application is already pending review. Duplicate applications are not allowed.',
      };
    }

    if (dbUser.curator_status === 'approved') {
      await client.query('ROLLBACK');
      return { error: 'Your curator account is already approved.' };
    }

    if (dbUser.curator_status !== 'rejected') {
      await client.query('ROLLBACK');
      return { error: 'Only rejected curator applications can be submitted for reapplication.' };
    }

    // Extra guard: verify no pending attempt row already exists
    const existingPending = await client.query(
      `SELECT id FROM curator_applications WHERE user_id = $1 AND status = 'pending' LIMIT 1`,
      [session.user.id]
    );
    if (existingPending.rows.length > 0) {
      await client.query('ROLLBACK');
      return {
        error: 'A pending curator application already exists for your account.',
      };
    }

    // Resolve CV file (new upload or retained from previous application) and enforce CV requirement
    let cvFilePath = null;
    let cvFileName = null;
    if (!preparedCv && keepPreviousCv) {
      const prevRes = await client.query(
        `SELECT cv_file_path, cv_file_name
         FROM curator_applications
         WHERE user_id = $1 AND cv_file_path IS NOT NULL
         ORDER BY attempt_number DESC
         LIMIT 1`,
        [session.user.id]
      );
      if (prevRes.rows.length > 0) {
        cvFilePath = prevRes.rows[0].cv_file_path;
        cvFileName = prevRes.rows[0].cv_file_name;
      }
    }

    const cvCheck = validateCuratorCvRequirement({
      hasCvFile: Boolean(preparedCv || cvFilePath),
      cvUrl: rawCvUrl,
    });
    if (!cvCheck.valid) {
      await client.query('ROLLBACK');
      return { error: cvCheck.error };
    }

    if (preparedCv) {
      savedCv = await savePreparedCuratorCv(preparedCv);
      cvFilePath = savedCv.cvFilePath;
      cvFileName = savedCv.cvFileName;
    }

    const attemptRes = await client.query(
      `SELECT COALESCE(MAX(attempt_number), 0)::int + 1 AS next_attempt
       FROM curator_applications
       WHERE user_id = $1`,
      [session.user.id]
    );
    const nextAttempt = attemptRes.rows[0].next_attempt;

    // Insert a brand-new attempt record so previous rejected records & rejection reasons stay preserved
    await client.query(
      `INSERT INTO curator_applications (
         user_id, attempt_number, portfolio_url, cv_file_path, cv_file_name, cv_url, background, supporting_notes, status, submitted_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())`,
      [
        session.user.id,
        nextAttempt,
        portfolioUrl,
        cvFilePath,
        cvFileName,
        cvCheck.cvUrl,
        rawBackground,
        supportingNotes,
      ]
    );

    // Update the same user account (never create duplicate accounts; never set approved)
    await client.query(
      `UPDATE users
       SET name = $1, bio = $2, external_link = $3, curator_status = 'pending'
       WHERE id = $4 AND role = 'curator'`,
      [rawName, rawBackground, portfolioUrl, session.user.id]
    );

    await client.query('COMMIT');

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/dashboard/curator/pending');
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/admin/curators');
    revalidatePath(`/dashboard/admin/curators/${session.user.id}`);
    revalidatePath('/dashboard/admin/users');

    return { success: true, attemptNumber: nextAttempt };
  } catch (err) {
    await client.query('ROLLBACK');
    if (savedCv?.cvFilePath) {
      await removeStoredCuratorCv(savedCv.cvFilePath);
    }
    if (err.code === '23505') {
      return {
        error: 'Your curator application is already pending review. Duplicate applications are not allowed.',
      };
    }
    console.error('[Curator] Reapply error:', err);
    return { error: 'Failed to submit reapplication. Please try again.' };
  } finally {
    client.release();
  }
}
