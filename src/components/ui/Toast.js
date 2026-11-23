'use client';

import { useEffect, useState } from 'react';

export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast-notice show`}
      id="toast-notice"
      role="status"
      aria-live="polite"
    >
      <div className="toast-inner">
        {type === 'error' ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
        <span id="toast-message">{message}</span>
      </div>
    </div>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast({ message: '', type: 'info' });

  return { toast, showToast, hideToast };
}
