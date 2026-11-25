'use client';

import { useState, useActionState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toggleLike, toggleFavorite, reportArtwork, addComment, deleteComment } from '@/lib/actions/artwork.actions';
import FilterDropdown from '@/components/ui/FilterDropdown';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatRoleLabel } from '@/lib/utils';

const REPORT_REASON_OPTIONS = [
  { value: 'SARA', label: 'Hate Speech / Discrimination' },
  { value: 'Plagiarism', label: 'Plagiarism' },
  { value: 'Inappropriate Content', label: 'Inappropriate Content' },
  { value: 'Other', label: 'Other' },
];

const MAX_REPORT_DETAILS = 500;

export default function ArtworkInteractions({
  artworkId, likeCount = 0, userLiked = false, userFavorited = false,
  userReported = false, isLoggedIn = false, isOwner = false, isAdmin = false,
  isCurator = false, comments = [], userId, showComments = false,
}) {
  const router = useRouter();
  const commentFormRef = useRef(null);
  const commentTextareaRef = useRef(null);
  const [liked, setLiked] = useState(userLiked);
  const [favorited, setFavorited] = useState(userFavorited);
  const [reported, setReported] = useState(userReported);
  const [likeCountState, setLikeCount] = useState(likeCount);
  const [loading, setLoading] = useState({ like: false, fav: false, report: false });
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState('');
  const [toast, setToast] = useState('');

  const showMsg = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loginRedirectUrl = `/login?redirect=${encodeURIComponent(`/artworks/${artworkId}`)}`;

  const handleLike = async () => {
    if (isAdmin || isCurator) return;
    if (!isLoggedIn) { router.push(loginRedirectUrl); return; }
    if (loading.like) return;
    setLoading(l => ({ ...l, like: true }));
    const res = await toggleLike(artworkId);
    if (res?.error === 'login_required') { router.push(loginRedirectUrl); return; }
    if (!res?.error) {
      setLiked(res.liked);
      setLikeCount(c => res.liked ? c + 1 : Math.max(c - 1, 0));
    }
    setLoading(l => ({ ...l, like: false }));
  };

  const handleFavorite = async () => {
    if (isAdmin || isCurator) return;
    if (!isLoggedIn) { router.push(loginRedirectUrl); return; }
    if (loading.fav) return;
    setLoading(l => ({ ...l, fav: true }));
    const res = await toggleFavorite(artworkId);
    if (res?.error === 'login_required') { router.push(loginRedirectUrl); return; }
    if (!res?.error) {
      setFavorited(res.favorited);
      showMsg(res.favorited ? 'Added to favorites' : 'Removed from favorites');
    }
    setLoading(l => ({ ...l, fav: false }));
  };

  const [commentState, commentAction, commentPending] = useActionState(async (prevState, formData) => {
    const res = await addComment(prevState, formData);
    if (res?.success) {
      commentFormRef.current?.reset();
      if (commentTextareaRef.current) {
        commentTextareaRef.current.style.height = 'auto';
      }
    }
    return res;
  }, null);

  const handleCommentInput = (e) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  };

  if (showComments) {
    return (
      <div className="comments-section">
        {isAdmin ? (
          <div className="comment-guest-notice">
            <p>Administrator accounts can moderate comments below but cannot post comments.</p>
          </div>
        ) : isCurator ? (
          <div className="comment-guest-notice">
            <p>Curator accounts browse in read-only mode and cannot post comments.</p>
          </div>
        ) : isLoggedIn ? (
          <form ref={commentFormRef} action={commentAction} className="comment-form">
            <input type="hidden" name="artwork_id" value={artworkId} />
            {commentState?.error && (
              <p className="form-error" style={{ marginBottom: 10 }}>{commentState.error}</p>
            )}
            <div className="comment-form-row">
              <textarea
                ref={commentTextareaRef}
                name="content"
                className="form-input comment-textarea"
                placeholder="Write a comment..."
                rows={2}
                required
                maxLength={1000}
                onInput={handleCommentInput}
                aria-label="Comment"
              />
              <button
                type="submit"
                className="btn-primary comment-submit-btn"
                disabled={commentPending}
                id={`btn-post-comment-${artworkId}`}
              >
                {commentPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="comment-guest-notice">
            <p>
              <a href={loginRedirectUrl} className="comment-guest-link">Sign in</a> to leave a comment.
            </p>
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="comments-empty-state">
              <p>No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <UserAvatar
                  src={comment.user_image}
                  role={comment.user_role}
                  name={comment.user_name || 'User'}
                  size={38}
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <div className="comment-header">
                    <div className="comment-author-meta">
                      <span className="comment-author">{comment.user_name || 'User'}</span>
                      {comment.user_role && (
                        <span className="comment-role-tag">{formatRoleLabel(comment.user_role)}</span>
                      )}
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {((!isCurator && userId === comment.user_id) || isAdmin) && (
                      <form action={async () => { await deleteComment(comment.id, artworkId); }}>
                        <button type="submit" className="comment-delete-btn" aria-label="Delete comment">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                          </svg>
                        </button>
                      </form>
                    )}
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Admin & Curator views: read-only like count, no member social interactions (like, favorite, report)
  if (isAdmin || isCurator) {
    return (
      <div className="artwork-interactions">
        <div className="interaction-buttons">
          <span
            className="interaction-btn like-btn interaction-readonly-metric"
            aria-label={`${likeCountState} likes`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>{likeCountState}</span>
          </span>
          <span className="interaction-admin-note">
            {isAdmin ? 'View & moderation access only' : 'Read-only browsing mode'}
          </span>
        </div>
      </div>
    );
  }

  // Interaction buttons (like, favorite, report)
  return (
    <div className="artwork-interactions">
      {toast && <div className="interaction-toast">{toast}</div>}

      <div className="interaction-buttons">
        {/* Like */}
        <button
          type="button"
          className={`interaction-btn like-btn ${liked ? 'active' : ''}`}
          onClick={handleLike}
          disabled={loading.like}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike artwork' : 'Like artwork'}
          id={`btn-like-${artworkId}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{likeCountState}</span>
        </button>

        {/* Favorite */}
        <button
          type="button"
          className={`interaction-btn fav-btn ${favorited ? 'active' : ''}`}
          onClick={handleFavorite}
          disabled={loading.fav}
          aria-pressed={favorited}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          id={`btn-favorite-${artworkId}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{favorited ? 'Saved' : 'Save'}</span>
        </button>

        {/* Report — only for non-owners who haven't reported yet */}
        {isLoggedIn && !isOwner && !reported && (
          <button
            type="button"
            className="interaction-btn report-btn"
            onClick={() => {
              setShowReportForm((prev) => !prev);
              setReportReason('');
              setReportDetails('');
              setReportError('');
            }}
            aria-label="Report artwork"
            id={`btn-report-${artworkId}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
            <span>Report</span>
          </button>
        )}
      </div>

      {/* Report Form */}
      {showReportForm && !reported && (
        <form
          action={async (formData) => {
            if (!reportReason) {
              setReportError('Please select a report reason.');
              document.getElementById(`report-reason-${artworkId}`)?.focus();
              return;
            }
            if (reportReason === 'Other' && !reportDetails.trim()) {
              setReportError('Please explain the reason for reporting this artwork.');
              document.getElementById(`report-details-${artworkId}`)?.focus();
              return;
            }
            const res = await reportArtwork(null, formData);
            if (res?.success) {
              setShowReportForm(false);
              setReportReason('');
              setReportDetails('');
              setReportError('');
              setReported(true);
              showMsg('Report submitted');
            } else if (res?.error) {
              setReportError(res.error);
              showMsg(res.error);
            }
          }}
          className="report-form"
        >
          <input type="hidden" name="artwork_id" value={artworkId} />
          <input type="hidden" name="reason" value={reportReason} />
          <div className="form-group">
            <label htmlFor={`report-reason-${artworkId}`} className="form-label">Report Reason</label>
            <FilterDropdown
              id={`report-reason-${artworkId}`}
              className="report-reason-dropdown"
              ariaLabel="Report Reason"
              value={reportReason}
              options={REPORT_REASON_OPTIONS}
              placeholder="Select a reason..."
              onSelect={(val) => {
                setReportReason(val);
                if (val !== 'Other') {
                  setReportDetails('');
                }
                setReportError('');
              }}
            />
          </div>

          {reportReason === 'Other' && (
            <div className="form-group report-details-group">
              <div className="report-details-label-row">
                <label htmlFor={`report-details-${artworkId}`} className="form-label">Additional Details</label>
                <span className="report-char-counter">
                  {reportDetails.length}/{MAX_REPORT_DETAILS}
                </span>
              </div>
              <textarea
                id={`report-details-${artworkId}`}
                name="details"
                className="form-textarea report-details-textarea"
                placeholder="Please explain the reason for reporting this artwork..."
                value={reportDetails}
                onChange={(e) => {
                  setReportDetails(e.target.value);
                  setReportError('');
                }}
                rows={3}
                maxLength={MAX_REPORT_DETAILS}
                required
              />
            </div>
          )}

          {reportError && <p className="form-error" style={{ marginBottom: 12 }}>{reportError}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-danger" style={{ flex: 1 }}>Submit Report</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowReportForm(false);
                setReportReason('');
                setReportDetails('');
                setReportError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {reported && (
        <p style={{ fontSize: '0.82rem', color: 'var(--surface)', marginTop: 8 }}>
          ✓ You have already reported this artwork.
        </p>
      )}
    </div>
  );
}
