import Link from 'next/link';
import { Clock3, Trophy } from '@/components/ui/Icons';
import ArtworkImage from '@/components/ui/ArtworkImage';

function getDaysLeft(startDate, endDate, status) {
  if (status === 'ended') return 'Ended';
  if (status === 'upcoming') {
    const diff = new Date(startDate) - new Date();
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return `Starts in ${days} day${days > 1 ? 's' : ''}`;
  }
  const diff = new Date(endDate) - new Date();
  if (diff <= 0) return 'Ended';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days} day${days > 1 ? 's' : ''} left`;
}

export default function ChallengesSection({ challenges }) {
  return (
    <section className="challenges-preview-section" aria-label="Active Challenges">
      <div className="editorial-container">
        <header className="editorial-section-header">
          <div className="editorial-section-title-group">
            <span className="editorial-eyebrow">OPEN CALLS &amp; COMPETITIONS</span>
            <h2 className="editorial-section-heading">Active Challenges</h2>
            <p className="editorial-section-subtitle">
              Join curatorial challenges and present spatial concepts to the ARCHIVE community.
            </p>
          </div>
          <Link href="/challenges" className="editorial-header-link">
            <span>View All Challenges</span>
          </Link>
        </header>

        <div className="editorial-challenges-grid">
          {challenges.map((ch, idx) => (
            <article key={ch.id} className="editorial-challenge-item">
              {ch.banner_url && (
                <Link href={`/challenges/${ch.id}`} className="editorial-challenge-media">
                  <ArtworkImage
                    src={ch.banner_url}
                    alt={ch.title}
                    fill
                    className="editorial-challenge-img"
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 767px) 100vw, 33vw"
                  />
                </Link>
              )}

              <div className="editorial-challenge-body">
                <div className="editorial-challenge-kicker">
                  <span className="editorial-challenge-index">0{idx + 1}</span>
                  <span className={`editorial-status-tag ${ch.challenge_status}`}>
                    {ch.challenge_status === 'active'
                      ? 'ACTIVE'
                      : ch.challenge_status === 'upcoming'
                        ? 'UPCOMING'
                        : 'ENDED'}
                  </span>
                </div>

                <h3 className="editorial-challenge-title">
                  <Link href={`/challenges/${ch.id}`}>{ch.title}</Link>
                </h3>

                <p className="editorial-challenge-desc">
                  {ch.description?.length > 130
                    ? `${ch.description.substring(0, 127).trim()}...`
                    : ch.description}
                </p>

                <div className="editorial-challenge-meta">
                  <span>
                    <Clock3 size={14} className="editorial-meta-icon" />
                    <span>{getDaysLeft(ch.start_date, ch.end_date, ch.challenge_status)}</span>
                  </span>
                  <span>
                    <Trophy size={14} className="editorial-meta-icon" />
                    <span>{ch.prize}</span>
                  </span>
                </div>

                <Link href={`/challenges/${ch.id}`} className="editorial-inline-cta">
                  <span>View Challenge</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
