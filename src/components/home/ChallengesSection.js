import Link from 'next/link';
import { Clock3, Trophy } from '@/components/ui/Icons';
import ArtworkImage from '@/components/ui/ArtworkImage';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

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
    <section className="challenges-preview-section">
      <div className="showcase-container">
        <div className="showcase-header">
          <div className="showcase-title-area">
            <h2 className="showcase-heading">ACTIVE CHALLENGES</h2>
            <p className="showcase-subtitle">
              Join curatorial challenges and showcase your creativity to the community.
            </p>
          </div>
        </div>

        <div className="challenges-grid">
          {challenges.map((ch) => (
            <article key={ch.id} className="challenge-preview-card">
              {ch.banner_url && (
                <div className="challenge-preview-banner">
                  <ArtworkImage
                    src={ch.banner_url}
                    alt={ch.title}
                    fill
                    className="challenge-preview-img"
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 100vw, 400px"
                  />
                  <div className="challenge-preview-overlay"></div>
                  <span className={`challenge-status-badge ${ch.challenge_status}`}>
                    {ch.challenge_status === 'active' ? 'ACTIVE' :
                     ch.challenge_status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
                  </span>
                </div>
              )}
              <div className="challenge-preview-body">
                <h3 className="challenge-preview-title">{ch.title}</h3>
                <p className="challenge-preview-desc">{ch.description.substring(0, 120)}...</p>
                <div className="challenge-preview-meta">
                  <span>
                    <Clock3 size={16} className="challenge-meta-icon" />
                    <span>{getDaysLeft(ch.start_date, ch.end_date, ch.challenge_status)}</span>
                  </span>
                  <span>
                    <Trophy size={16} className="challenge-meta-icon" />
                    <span>{ch.prize}</span>
                  </span>
                </div>
                <Link href={`/challenges/${ch.id}`} className="btn-primary challenge-preview-cta">
                  View Challenge
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="gallery-footer-action">
          <Link href="/challenges" className="btn-secondary">
            View All Challenges
          </Link>
        </div>
      </div>
    </section>
  );
}
