import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-wordmark">
              <span className="footer-brand-name">ARCHIVE</span>
              <span className="footer-brand-tag">DIGITAL ARCHITECTURE EXHIBITION</span>
            </div>
            <p className="footer-brand-desc">
              A minimalist editorial showcase platform for architects, visual artists, curators, and spatial design enthusiasts worldwide.
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

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} ARCHIVE Digital Architecture Showcase.
          </p>
          <p className="footer-system-tag">
            ARCHIVE — A Space for Architectural Expression.
          </p>
        </div>
      </div>
    </footer>
  );
}
