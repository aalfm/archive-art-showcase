import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function Footer({ user }) {
  const resolvedUser = user === undefined ? (await getSession())?.user ?? null : user;
  const isAuthenticated = Boolean(resolvedUser);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className={`footer-top ${isAuthenticated ? 'footer-top--2col' : 'footer-top--3col'}`}>
          <div className="footer-brand">
            <div className="footer-wordmark">
              <span className="footer-brand-name">ARCHIVE</span>
              <span className="footer-brand-tag">Digital architecture exhibition</span>
            </div>
            <p className="footer-brand-desc">
              A minimalist editorial showcase platform for architects, visual artists, curators, and spatial design enthusiasts worldwide.
            </p>
          </div>

          <div className="footer-links-col footer-links-col--platform">
            <h4 className="footer-links-heading">Platform</h4>
            <ul
              className={`footer-links-list ${
                isAuthenticated ? 'footer-links-list--horizontal' : 'footer-links-list--vertical'
              }`}
            >
              <li><Link href="/explore">Explore Works</Link></li>
              <li><Link href="/challenges">Challenges</Link></li>
              <li><Link href="/artists">Artists</Link></li>
            </ul>
          </div>

          {!isAuthenticated && (
            <div className="footer-links-col footer-links-col--account">
              <h4 className="footer-links-heading">Account</h4>
              <ul className="footer-links-list footer-links-list--vertical">
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/register?role=member">Register as Member</Link></li>
                <li><Link href="/register?role=curator">Register as Curator</Link></li>
              </ul>
            </div>
          )}
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} ARCHIVE Digital Architecture Showcase.
          </p>
          <p className="footer-system-tag">
            ARCHIVE | A Space for Architectural Expression.
          </p>
        </div>
      </div>
    </footer>
  );
}
