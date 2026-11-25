import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

/**
 * Top breadcrumb and optional contextual return link bar for shared detail pages.
 * Renders the standard Breadcrumb unchanged when no Member return context is active.
 *
 * @param {{
 *   breadcrumbItems: Array<{ label: string, href?: string }>,
 *   returnHref?: string,
 *   backLabel?: string,
 * }} props
 */
export default function DetailContextBar({ breadcrumbItems, returnHref, backLabel }) {
  if (!returnHref || !backLabel) {
    return <Breadcrumb items={breadcrumbItems} className="archive-breadcrumb--detail" />;
  }

  return (
    <div className="detail-context-bar">
      <Breadcrumb items={breadcrumbItems} className="archive-breadcrumb--detail" />
      <Link href={returnHref} className="detail-back-link">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>{backLabel}</span>
      </Link>
    </div>
  );
}
