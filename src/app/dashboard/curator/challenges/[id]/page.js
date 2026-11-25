import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth';
import { isChallengeOwnerCurator } from '@/lib/challenge-auth';
import { query } from '@/lib/db';
import { formatEditorialTitle, toId } from '@/lib/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Challenge Details — ARCHIVE Curator',
};

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function CuratorChallengeDetailPage(props) {
  const params = await props.params;
  const challengeId = toId(params.id);
  if (!challengeId) notFound();

  const user = await requireRole('curator');

  const res = await query(
    `
    SELECT
      c.id,
      c.curator_id,
      c.title,
      c.description,
      c.rules,
      c.prize,
      c.banner_url,
      c.start_date,
      c.end_date,
      c.created_at,
      u.name AS curator_name,
      COUNT(DISTINCT s.id)::int AS submission_count,
      COUNT(DISTINCT CASE WHEN s.winner_rank IS NOT NULL AND a.status = 'active' THEN s.id END)::int AS winner_count,
      CASE
        WHEN NOW() < c.start_date THEN 'upcoming'
        WHEN NOW() BETWEEN c.start_date AND c.end_date THEN 'active'
        ELSE 'ended'
      END AS status
    FROM challenges c
    LEFT JOIN users u ON u.id = c.curator_id
    LEFT JOIN submissions s ON s.challenge_id = c.id
    LEFT JOIN artworks a ON a.id = s.artwork_id
    WHERE c.id = $1
    GROUP BY c.id, u.name
    `,
    [challengeId]
  );

  if (res.rows.length === 0) {
    notFound();
  }

  const challenge = res.rows[0];
  const canEdit = isChallengeOwnerCurator(user, challenge);

  // Enforce strict ownership authorization on the server side
  if (!canEdit) {
    redirect('/dashboard/curator/challenges');
  }

  const title = formatEditorialTitle(challenge.title);
  const submissionCount = Number(challenge.submission_count) || 0;
  const winnerCount = Number(challenge.winner_count) || 0;

  const statusMeta =
    challenge.status === 'active'
      ? {
          label: 'Active',
          badgeClass: 'badge-active',
          detail: 'Open for member submissions',
        }
      : challenge.status === 'upcoming'
        ? {
            label: 'Upcoming',
            badgeClass: 'badge-upcoming',
            detail: 'Scheduled to open on start date',
          }
        : {
            label: 'Completed',
            badgeClass: 'badge-ended',
            detail: 'Submission period closed',
          };

  const ruleLines = (challenge.rules || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="admin-detail-page curator-challenge-detail-page">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard/curator' },
          { label: 'My Challenges', href: '/dashboard/curator/challenges' },
          { label: title },
        ]}
      />

      <div className="dashboard-header admin-detail-header">
        <div>
          <div className="admin-detail-title-row">
            <h1 className="dashboard-title">Challenge Details</h1>
            <span className={`badge ${statusMeta.badgeClass}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="dashboard-subtitle">
            Read-only overview for curatorial program &ldquo;{title}&rdquo;.
          </p>
        </div>

        <div className="admin-detail-header-actions">
          <Link href="/dashboard/curator/challenges" className="btn-secondary">
            ← Back to Challenges
          </Link>
          <Link
            href={`/dashboard/curator/challenges/${challenge.id}/submissions`}
            className="btn-secondary"
          >
            Submissions ({submissionCount})
          </Link>
          {canEdit && (
            <Link
              href={`/dashboard/curator/challenges/${challenge.id}/edit`}
              className="btn-primary"
              id="btn-curator-edit-challenge"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Read-only Form-Like Panel Mirroring EditChallengeForm */}
      <div className="dashboard-form-panel curator-readonly-panel">
        <div className="dashboard-form curator-readonly-form">
          {/* Cover Image */}
          <div className="form-group">
            <span className="form-label">Challenge Cover Image</span>
            {challenge.banner_url ? (
              <div className="curator-readonly-banner">
                <Image
                  src={challenge.banner_url}
                  alt={`${title} cover banner`}
                  width={1200}
                  height={630}
                  unoptimized
                  className="curator-readonly-banner-img"
                />
              </div>
            ) : (
              <div className="curator-readonly-field curator-readonly-field--muted">
                No cover image uploaded.
              </div>
            )}
          </div>

          {/* Title & Prize */}
          <div className="dashboard-form-grid-2">
            <div className="form-group">
              <span className="form-label">Challenge Title</span>
              <div className="curator-readonly-field curator-readonly-field--strong">
                {title}
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">Prize / Award</span>
              <div className="curator-readonly-field">
                {challenge.prize || '—'}
              </div>
            </div>
          </div>

          {/* Status & Participation Summary */}
          <div className="dashboard-form-grid-2">
            <div className="form-group">
              <span className="form-label">Challenge Status</span>
              <div className="curator-readonly-field curator-readonly-status-field">
                <span className={`badge ${statusMeta.badgeClass}`}>
                  {statusMeta.label}
                </span>
                <span className="curator-readonly-status-note">{statusMeta.detail}</span>
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">Participation &amp; Curation</span>
              <div className="curator-readonly-field">
                {submissionCount} {submissionCount === 1 ? 'submission' : 'submissions'} ·{' '}
                {winnerCount > 0 ? `${winnerCount} ${winnerCount === 1 ? 'winner' : 'winners'} selected` : 'No winners selected yet'}
              </div>
            </div>
          </div>

          {/* Start Date & End Date / Submission Deadline */}
          <div className="dashboard-form-grid-2">
            <div className="form-group">
              <span className="form-label">Start Date</span>
              <div className="curator-readonly-field">
                {formatDateTime(challenge.start_date)}
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">End Date &amp; Submission Deadline</span>
              <div className="curator-readonly-field">
                {formatDateTime(challenge.end_date)}
              </div>
            </div>
          </div>

          {/* Description & Rules / Judging Criteria */}
          <div className="dashboard-form-grid-2">
            <div className="form-group">
              <span className="form-label">Challenge Description</span>
              <div className="curator-readonly-textarea">
                {challenge.description || 'No description provided.'}
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">Rules, Submission Requirements &amp; Judging Criteria</span>
              <div className="curator-readonly-textarea">
                {ruleLines.length > 0 ? (
                  <ol className="curator-readonly-rules-list">
                    {ruleLines.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ol>
                ) : (
                  <span className="curator-readonly-field--muted">No rules specified.</span>
                )}
              </div>
            </div>
          </div>

          {/* Curatorial Record Footer Info */}
          <div className="curator-readonly-meta-strip">
            <span>Curated by <strong>{challenge.curator_name || user.name}</strong></span>
            <span>·</span>
            <span>Created on {formatDate(challenge.created_at)}</span>
            <span>·</span>
            <span>Challenge ID #{challenge.id}</span>
          </div>

          {/* Actions */}
          <div className="dashboard-form-actions">
            {canEdit && (
              <Link
                href={`/dashboard/curator/challenges/${challenge.id}/edit`}
                className="btn-primary dashboard-submit-btn"
                id="btn-curator-edit-challenge-footer"
              >
                Edit Challenge
              </Link>
            )}
            <Link
              href={`/dashboard/curator/challenges/${challenge.id}/submissions`}
              className="btn-secondary"
            >
              View Submissions ({submissionCount})
            </Link>
            <Link href="/dashboard/curator/challenges" className="btn-secondary">
              Back to Challenges
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
