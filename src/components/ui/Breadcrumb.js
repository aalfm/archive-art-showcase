import Link from 'next/link';

/**
 * Unified reusable Breadcrumb navigation component for ARCHIVE.
 *
 * - Every parent item with an `href` renders as a clickable Next.js <Link>.
 * - The final item always renders as non-clickable text with `aria-current="page"`.
 * - Long dynamic labels truncate gracefully on smaller viewports without breaking layout.
 *
 * @param {{ items: Array<{ label: string, href?: string }>, className?: string }} props
 */
export default function Breadcrumb({ items = [], className = '' }) {
  const validItems = items.filter((item) => item && item.label);
  if (validItems.length === 0) return null;

  return (
    <nav
      className={`archive-breadcrumb${className ? ` ${className}` : ''}`}
      aria-label="Breadcrumb"
    >
      <ol className="archive-breadcrumb-list">
        {validItems.map((item, index) => {
          const isLast = index === validItems.length - 1;
          const key = `${item.href || 'current'}-${index}`;

          return (
            <li key={key} className="archive-breadcrumb-item">
              {index > 0 && (
                <svg
                  className="archive-breadcrumb-sep"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}

              {isLast || !item.href ? (
                <span
                  className="archive-breadcrumb-current"
                  aria-current={isLast ? 'page' : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="archive-breadcrumb-link"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
