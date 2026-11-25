'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CuratorHistoryModal({
  curatorName,
  curatorEmail,
  applications = [],
  buttonLabel,
}) {
  const [open, setOpen] = useState(false);

  const label =
    buttonLabel ||
    (applications.length > 1 ? `History (${applications.length})` : 'Details');

  return (
    <>
      <button
        type="button"
        className="btn-secondary curator-history-trigger"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={`Application history — ${curatorName}`}
        size="lg"
      >
        <div className="admin-curator-history-modal">
          <p className="admin-curator-history-sub">
            {curatorEmail} · {applications.length}{' '}
            {applications.length === 1 ? 'application record' : 'application records'}
          </p>

          {applications.length === 0 ? (
            <p style={{ color: '#77736B', fontSize: '0.88rem' }}>
              No application history recorded yet.
            </p>
          ) : (
            <div className="curator-history-list">
              {applications.map((app) => (
                <article key={app.id} className="curator-history-item">
                  <div className="curator-history-item-top">
                    <span className="curator-history-attempt">
                      Application #{app.attempt_number}
                    </span>
                    <span className={`badge badge-${app.status}`}>
                      {app.status === 'approved'
                        ? 'Approved'
                        : app.status === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                    </span>
                    <span className="curator-history-date">
                      Submitted {formatDate(app.submitted_at)}
                      {app.reviewed_at ? ` · Reviewed ${formatDate(app.reviewed_at)}` : ''}
                      {app.reviewed_by_name ? ` by ${app.reviewed_by_name}` : ''}
                    </span>
                  </div>

                  <div className="admin-history-fields">
                    <div>
                      <span className="curator-summary-label">Portfolio link</span>
                      {app.portfolio_url ? (
                        <div>
                          <a
                            href={app.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="curator-summary-link"
                          >
                            {app.portfolio_url} ↗
                          </a>
                        </div>
                      ) : (
                        <p className="curator-summary-muted">Not provided</p>
                      )}
                    </div>

                    {app.background && (
                      <div>
                        <span className="curator-summary-label">Curatorial background</span>
                        <p className="curator-summary-text">{app.background}</p>
                      </div>
                    )}

                    {app.supporting_notes && (
                      <div>
                        <span className="curator-summary-label">Supporting information</span>
                        <p className="curator-summary-text">{app.supporting_notes}</p>
                      </div>
                    )}

                    {app.rejection_reason && (
                      <div className="curator-history-reason">
                        <span className="curator-summary-label">Reason for rejection</span>
                        <p>{app.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
