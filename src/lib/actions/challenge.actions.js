'use server';

import { revalidatePath } from 'next/cache';
import { query, getClient } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isUploadedImagePath, toId } from '@/lib/utils';

function revalidateChallengePaths(challengeId) {
  revalidatePath('/');
  revalidatePath('/challenges');
  if (challengeId) {
    revalidatePath(`/challenges/${challengeId}`);
    revalidatePath(`/dashboard/admin/challenges/${challengeId}`);
    revalidatePath(`/dashboard/curator/challenges/${challengeId}`);
    revalidatePath(`/dashboard/curator/challenges/${challengeId}/submissions`);
  }
  revalidatePath('/dashboard/admin/challenges');
  revalidatePath('/dashboard/curator/challenges');
  revalidatePath('/dashboard/member/submissions');
}

function canManageChallengeWinners(user, challenge) {
  if (!user || !challenge) return false;
  if (user.role === 'admin') return true;
  return (
    user.role === 'curator' &&
    user.curator_status === 'approved' &&
    Number(challenge.curator_id) === Number(user.id)
  );
}

export async function createChallenge(prevState, formData) {
  const session = await getSession();
  if (!session || session.user.role !== 'curator' || session.user.curator_status !== 'approved') {
    return { error: 'Only verified curators can create challenges.' };
  }

  const title = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const rules = formData.get('rules')?.toString().trim();
  const prize = formData.get('prize')?.toString().trim();
  const bannerUrl = formData.get('banner_url')?.toString().trim();
  const startDate = formData.get('start_date')?.toString();
  const endDate = formData.get('end_date')?.toString();

  if (!title || !description || !rules || !prize || !bannerUrl || !startDate || !endDate) {
    return { error: 'All fields are required.' };
  }
  if (!isUploadedImagePath(bannerUrl)) {
    return { error: 'Please upload a challenge banner file from your device (JPG, PNG, or WebP).' };
  }
  if (new Date(endDate) <= new Date(startDate)) {
    return { error: 'End date must be after start date.' };
  }

  try {
    const result = await query(
      `INSERT INTO challenges (curator_id, title, description, rules, prize, banner_url, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [session.user.id, title, description, rules, prize, bannerUrl, startDate, endDate]
    );

    revalidateChallengePaths(result.rows[0].id);
    return { success: true, challengeId: result.rows[0].id };
  } catch (err) {
    console.error('[Challenge] Create error:', err);
    return { error: 'Failed to create challenge.' };
  }
}

export async function updateChallenge(prevState, formData) {
  const session = await getSession();
  if (!session || (session.user.role !== 'curator' && session.user.role !== 'admin')) {
    return { error: 'Not authorized.' };
  }
  if (session.user.role === 'curator' && session.user.curator_status !== 'approved') {
    return { error: 'Curator account is not verified yet.' };
  }

  const challengeId = toId(formData.get('challenge_id'));
  const title = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString().trim();
  const rules = formData.get('rules')?.toString().trim();
  const prize = formData.get('prize')?.toString().trim();
  const bannerUrl = formData.get('banner_url')?.toString().trim();
  const startDate = formData.get('start_date')?.toString();
  const endDate = formData.get('end_date')?.toString();

  if (!challengeId || !title || !description || !rules || !prize || !bannerUrl || !startDate || !endDate) {
    return { error: 'All fields are required.' };
  }
  if (new Date(endDate) <= new Date(startDate)) {
    return { error: 'End date must be after start date.' };
  }

  try {
    const challenge = await query('SELECT curator_id, banner_url FROM challenges WHERE id=$1', [challengeId]);
    if (challenge.rows.length === 0) return { error: 'Challenge not found.' };
    if (challenge.rows[0].curator_id !== session.user.id && session.user.role !== 'admin') {
      return { error: 'Not authorized to edit this challenge.' };
    }
    if (bannerUrl !== challenge.rows[0].banner_url && !isUploadedImagePath(bannerUrl)) {
      return { error: 'Please upload a challenge banner file from your device (JPG, PNG, or WebP).' };
    }

    await query(
      `UPDATE challenges SET title=$1, description=$2, rules=$3, prize=$4, 
       banner_url=$5, start_date=$6, end_date=$7 WHERE id=$8`,
      [title, description, rules, prize, bannerUrl, startDate, endDate, challengeId]
    );

    revalidateChallengePaths(challengeId);
    return { success: true };
  } catch (err) {
    console.error('[Challenge] Update error:', err);
    return { error: 'Failed to update challenge.' };
  }
}

export async function deleteChallenge(rawChallengeId) {
  const session = await getSession();
  if (!session) return { error: 'Please sign in.' };

  const challengeId = toId(rawChallengeId);
  if (!challengeId) return { error: 'Invalid challenge ID.' };

  try {
    const challenge = await query('SELECT curator_id FROM challenges WHERE id=$1', [challengeId]);
    if (challenge.rows.length === 0) return { error: 'Challenge not found.' };
    if (challenge.rows[0].curator_id !== session.user.id && session.user.role !== 'admin') {
      return { error: 'Not authorized.' };
    }

    await query('DELETE FROM challenges WHERE id=$1', [challengeId]);
    revalidateChallengePaths(challengeId);
    return { success: true };
  } catch (err) {
    console.error('[Challenge] Delete error:', err);
    return { error: 'Failed to delete challenge.' };
  }
}

export async function submitToChallenge(prevState, formData) {
  const session = await getSession();
  if (!session || session.user.role !== 'member') {
    return { error: 'Only members can submit artworks.' };
  }

  const challengeId = toId(formData.get('challenge_id'));
  const artworkId = toId(formData.get('artwork_id'));

  if (!challengeId || !artworkId) return { error: 'Invalid submission data.' };

  try {
    // Verify challenge is active
    const challenge = await query(
      'SELECT * FROM challenges WHERE id=$1 AND start_date <= NOW() AND end_date >= NOW()',
      [challengeId]
    );
    if (challenge.rows.length === 0) {
      return { error: 'Challenge is inactive or has already ended.' };
    }

    // Verify artwork belongs to member
    const artwork = await query(
      'SELECT user_id FROM artworks WHERE id=$1 AND status=\'active\'',
      [artworkId]
    );
    if (artwork.rows.length === 0) return { error: 'Artwork not found.' };
    if (artwork.rows[0].user_id !== session.user.id) {
      return { error: 'This artwork does not belong to you.' };
    }

    // Check duplicate submission (member already submitted to this challenge)
    const existing = await query(
      'SELECT id FROM submissions WHERE challenge_id=$1 AND member_id=$2',
      [challengeId, session.user.id]
    );
    if (existing.rows.length > 0) {
      return { error: 'You have already submitted an artwork to this challenge.' };
    }

    await query(
      'INSERT INTO submissions (challenge_id, artwork_id, member_id) VALUES ($1, $2, $3)',
      [challengeId, artworkId, session.user.id]
    );

    revalidatePath(`/challenges/${challengeId}`);
    revalidatePath('/challenges');
    revalidatePath('/dashboard/member/submissions');
    revalidatePath(`/dashboard/curator/challenges/${challengeId}/submissions`);
    return { success: true };
  } catch (err) {
    if (err.code === '23505') return { error: 'Artwork has already been submitted to this challenge.' };
    console.error('[Submission] Error:', err);
    return { error: 'Failed to submit artwork.' };
  }
}

export async function withdrawSubmission(rawSubmissionId) {
  const session = await getSession();
  if (!session) return { error: 'Please sign in.' };
  if (session.user.role !== 'member') {
    return { error: 'Only members can withdraw challenge submissions.' };
  }

  const submissionId = toId(rawSubmissionId);
  if (!submissionId) return { error: 'Invalid submission ID.' };

  try {
    const submission = await query(
      `SELECT s.member_id, s.challenge_id, s.created_at, c.end_date 
       FROM submissions s JOIN challenges c ON s.challenge_id = c.id
       WHERE s.id=$1`,
      [submissionId]
    );
    if (submission.rows.length === 0) return { error: 'Submission not found.' };
    if (submission.rows[0].member_id !== session.user.id) {
      return { error: 'Not authorized.' };
    }
    if (new Date(submission.rows[0].end_date) < new Date()) {
      return { error: 'Challenge has ended; submission cannot be withdrawn.' };
    }

    await query('DELETE FROM submissions WHERE id=$1', [submissionId]);
    revalidatePath('/dashboard/member/submissions');
    revalidatePath(`/challenges/${submission.rows[0].challenge_id}`);
    revalidatePath(`/dashboard/curator/challenges/${submission.rows[0].challenge_id}/submissions`);
    return { success: true };
  } catch (err) {
    console.error('[Submission] Withdraw error:', err);
    return { error: 'Failed to withdraw submission.' };
  }
}

export async function selectWinner(prevState, formData) {
  const session = await getSession();
  if (
    !session ||
    (session.user.role !== 'admin' &&
      !(session.user.role === 'curator' && session.user.curator_status === 'approved'))
  ) {
    return { error: 'Not authorized to manage challenge winners.' };
  }

  const challengeId = toId(formData.get('challenge_id'));
  const submissionId = toId(formData.get('submission_id'));
  const rank = parseInt(formData.get('rank')?.toString(), 10);
  const rawNote = formData.get('winner_note')?.toString().trim() ?? '';
  const winnerNote = rawNote.length > 0 ? rawNote.slice(0, 400) : null;

  if (!challengeId || !submissionId || ![1, 2, 3].includes(rank)) {
    return { error: 'Please choose a valid rank (1st, 2nd, or 3rd Place).' };
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verify challenge exists, actor has permission, and competition has ended
    const challengeRes = await client.query(
      'SELECT id, curator_id, end_date FROM challenges WHERE id = $1',
      [challengeId]
    );
    if (challengeRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { error: 'Challenge not found.' };
    }
    const challenge = challengeRes.rows[0];
    if (!canManageChallengeWinners(session.user, challenge)) {
      await client.query('ROLLBACK');
      return { error: 'You are not authorized to manage winners for this challenge.' };
    }
    if (new Date(challenge.end_date) > new Date()) {
      await client.query('ROLLBACK');
      return { error: 'Winners can only be selected after the challenge has ended.' };
    }

    // Verify submission belongs to this challenge and artwork is valid & active
    const submissionRes = await client.query(
      `SELECT s.id, s.challenge_id, a.status AS artwork_status
       FROM submissions s
       JOIN artworks a ON a.id = s.artwork_id
       WHERE s.id = $1`,
      [submissionId]
    );
    if (
      submissionRes.rows.length === 0 ||
      Number(submissionRes.rows[0].challenge_id) !== Number(challengeId)
    ) {
      await client.query('ROLLBACK');
      return { error: 'Selected submission does not belong to this challenge.' };
    }
    if (submissionRes.rows[0].artwork_status !== 'active') {
      await client.query('ROLLBACK');
      return { error: 'Cannot assign a winner to an unavailable or taken-down artwork.' };
    }

    // Clear previous occupant of this rank on this challenge (if another submission)
    await client.query(
      'UPDATE submissions SET winner_rank = NULL, winner_note = NULL WHERE challenge_id = $1 AND winner_rank = $2 AND id != $3',
      [challengeId, rank, submissionId]
    );

    // Assign rank and optional selection note to target submission
    await client.query(
      'UPDATE submissions SET winner_rank = $1, winner_note = $2 WHERE id = $3',
      [rank, winnerNote, submissionId]
    );

    await client.query('COMMIT');
    revalidateChallengePaths(challengeId);
    return { success: true, rank, winnerNote };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Winner] Select error:', err);
    return { error: 'Failed to save winner assignment.' };
  } finally {
    client.release();
  }
}

export async function clearWinner(rawChallengeId, rawSubmissionId) {
  const session = await getSession();
  if (
    !session ||
    (session.user.role !== 'admin' &&
      !(session.user.role === 'curator' && session.user.curator_status === 'approved'))
  ) {
    return { error: 'Not authorized to manage challenge winners.' };
  }

  const challengeId = toId(rawChallengeId);
  const submissionId = toId(rawSubmissionId);
  if (!challengeId || !submissionId) {
    return { error: 'Invalid challenge or submission ID.' };
  }

  try {
    const challengeRes = await query(
      'SELECT id, curator_id, end_date FROM challenges WHERE id = $1',
      [challengeId]
    );
    if (challengeRes.rows.length === 0) {
      return { error: 'Challenge not found.' };
    }
    if (!canManageChallengeWinners(session.user, challengeRes.rows[0])) {
      return { error: 'You are not authorized to manage winners for this challenge.' };
    }

    const updated = await query(
      'UPDATE submissions SET winner_rank = NULL, winner_note = NULL WHERE id = $1 AND challenge_id = $2 RETURNING id',
      [submissionId, challengeId]
    );
    if (updated.rows.length === 0) {
      return { error: 'Submission not found for this challenge.' };
    }

    revalidateChallengePaths(challengeId);
    return { success: true };
  } catch (err) {
    console.error('[Winner] Clear error:', err);
    return { error: 'Failed to remove winner assignment.' };
  }
}
