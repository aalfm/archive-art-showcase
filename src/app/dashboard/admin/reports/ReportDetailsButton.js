'use client';

import { useState } from 'react';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';

export default function ReportDetailsButton({
  reportId,
  artworkId,
  artworkTitle,
  reporterName,
  reason,
  details,
  createdAt,
  buttonStyle,
}) {
  const [open, setOpen] = useState(false);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <>
      <button
        type="button"
        className="btn-secondary moderation-action-btn"
        onClick={() => setOpen(true)}
        style={buttonStyle}
        id={`btn-see-details-${reportId}`}
      >
        See Details
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Report Details"
        size="md"
      >
        <div className="report-details-modal">
          <div className="report-details-meta-grid">
            <div className="report-details-meta-item">
              <span className="report-details-meta-label">Reported Artwork</span>
              {artworkId ? (
                <Link
                  href={`/artworks/${artworkId}`}
                  target="_blank"
                  className="report-details-meta-link"
                >
                  {artworkTitle} ↗
                </Link>
              ) : (
                <span className="report-details-meta-value">{artworkTitle}</span>
              )}
            </div>

            <div className="report-details-meta-item">
              <span className="report-details-meta-label">Reporter</span>
              <span className="report-details-meta-value">{reporterName}</span>
            </div>

            <div className="report-details-meta-item">
              <span className="report-details-meta-label">Category</span>
              <div>
                <span className="badge badge-role-admin">{reason}</span>
              </div>
            </div>

            <div className="report-details-meta-item">
              <span className="report-details-meta-label">Reported At</span>
              <span className="report-details-meta-value">{formattedDate}</span>
            </div>
          </div>

          <div className="report-details-body">
            <span className="report-details-meta-label">Reason Details</span>
            <div className="report-details-text-box">
              {details?.trim() ? details : 'No additional details provided.'}
            </div>
          </div>

          <div className="report-details-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setOpen(false)}
              id={`btn-close-details-${reportId}`}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
