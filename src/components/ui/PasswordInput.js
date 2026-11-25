'use client';

import { useState } from 'react';
import { Eye, EyeOff } from '@/components/ui/Icons';

/**
 * Reusable password input with an independent accessible Show/Hide visibility toggle.
 * Preserves parent form-input sizing while preventing text from overlapping the icon button.
 */
export default function PasswordInput({
  className = 'form-input',
  wrapperClassName = '',
  disabled = false,
  ...props
}) {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => {
    setVisible((prev) => !prev);
  };

  return (
    <div className={`password-input-wrapper${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={`${className} password-input`.trim()}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={toggleVisibility}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
