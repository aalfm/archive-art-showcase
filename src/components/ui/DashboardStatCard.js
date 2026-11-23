import Link from 'next/link';

export default function DashboardStatCard({ label, value, href, linkLabel }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value}</span>
      </div>
      {href && linkLabel && (
        <Link href={href} className="stat-card-link">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
