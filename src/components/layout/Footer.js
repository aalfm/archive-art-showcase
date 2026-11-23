import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-wordmark" style={{ display: 'inline-flex'}}>
              <span className="brand-text" style={{ fontSize: '1rem' }}>ARCHIVE</span>
              <span className="brand-edition">DIGITAL GALLERY</span>
            </div>
            <p className="footer-brand-desc">
              A curated digital showcase platform for artists, architects, curators, and creative enthusiasts worldwide.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-col">
              <h4 className="footer-links-heading">Platform</h4>
              <ul className="footer-links-list">
                <li><Link href="/explore">Explore Works</Link></li>
                <li><Link href="/challenges">Challenges</Link></li>
                <li><Link href="/artists">Artists</Link></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-links-heading">Account</h4>
              <ul className="footer-links-list">
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/register?role=member">Register as Member</Link></li>
                <li><Link href="/register?role=curator">Register as Curator</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} ARCHIVE Digital Architecture Showcase.
          </p>
          <p className="footer-system-tag" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--surface)', letterSpacing: '0.08em' }}>
            ARCHIVE | A Space for Architectural Expression.
          </p>
        </div>
      </div>
    </footer>
  );
}
