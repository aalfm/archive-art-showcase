'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/actions/auth.actions';
import UserAvatar from '@/components/ui/UserAvatar';

export default function Navbar({ user }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setDrawerOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'curator') {
      return user.curator_status === 'approved' ? '/dashboard/curator' : '/dashboard/curator/pending';
    }
    return '/dashboard/member';
  };

  const isNavActive = (href) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <Link href="/" className="brand-wordmark brand-logo-only" aria-label="ARCHIVE Home">
            <Image
              src="/logo/Logo_archive_white.svg"
              alt="ARCHIVE"
              width={169}
              height={37}
              className="brand-logo-img"
              priority
            />
          </Link>
        </div>

        <nav className="header-center" aria-label="Main Navigation">
          <div className="nav-pill-bar">
            <Link href="/" className={`nav-pill-item ${isNavActive('/') ? 'active' : ''}`} data-nav="beranda">
              Home
            </Link>
            <Link href="/explore" className={`nav-pill-item ${isNavActive('/explore') || isNavActive('/artworks') ? 'active' : ''}`} data-nav="jelajahi">
              Explore
            </Link>
            <Link href="/challenges" className={`nav-pill-item ${isNavActive('/challenges') ? 'active' : ''}`} data-nav="tantangan">
              Challenges
            </Link>
            <Link href="/artists" className={`nav-pill-item ${isNavActive('/artists') ? 'active' : ''}`} data-nav="seniman">
              Artists
            </Link>
          </div>
        </nav>

        <div className="header-right">
          <div className="header-actions">
            {user ? (
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  type="button"
                  className="btn-login-pill"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  id="btn-user-menu"
                >
                  {user.profile_image ? (
                    <UserAvatar
                      src={user.profile_image}
                      name={user.name}
                      size={20}
                      className="user-profile-icon"
                    />
                  ) : (
                    <Image
                      src="/logo/Favicon_profil.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="user-profile-icon"
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                  )}
                  <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-header">
                      <span className="user-dropdown-name">{user.name}</span>
                      <span className="user-dropdown-role">{user.role.toUpperCase()}</span>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link href={getDashboardLink()} className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      Dashboard
                    </Link>
                    {user.role === 'member' && (
                      <Link href="/dashboard/member/artworks/create" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Upload Artwork
                      </Link>
                    )}
                    <div className="user-dropdown-divider"></div>
                    <form action={logoutUser}>
                      <button type="submit" className="user-dropdown-item user-dropdown-logout" role="menuitem">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-login-pill" id="btn-login">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Sign In
              </Link>
            )}

            <button
              type="button"
              className="btn-hamburger"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              id="btn-hamburger"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>
      
      <div
        className={`mobile-drawer ${drawerOpen ? 'active' : ''}`}
        id="mobile-drawer"
        role="dialog"
        aria-label="Mobile navigation menu"
      >
        <div className="drawer-header">
          <span className="brand-text" style={{ fontSize: '1rem', letterSpacing: '0.15em' }}>ARCHIVE</span>
          <button type="button" className="drawer-close-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu" id="drawer-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav className="drawer-nav" aria-label="Mobile Navigation">
          <Link href="/" className={`drawer-nav-item ${isNavActive('/') ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>Home</Link>
          <Link href="/explore" className={`drawer-nav-item ${isNavActive('/explore') || isNavActive('/artworks') ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>Explore</Link>
          <Link href="/challenges" className={`drawer-nav-item ${isNavActive('/challenges') ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>Challenges</Link>
          <Link href="/artists" className={`drawer-nav-item ${isNavActive('/artists') ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>Artists</Link>
        </nav>
        <div className="drawer-footer">
          {user ? (
            <>
              <Link href={getDashboardLink()} className="btn-primary" style={{ display: 'block', textAlign: 'center' }} onClick={() => setDrawerOpen(false)}>
                Dashboard
              </Link>
              <form action={logoutUser} style={{ marginTop: 8 }}>
                <button type="submit" className="btn-secondary" style={{ width: '100%' }}>Sign Out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center' }} onClick={() => setDrawerOpen(false)} id="drawer-login-btn">Sign In</Link>
              <Link href="/register" className="btn-secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }} onClick={() => setDrawerOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}></div>}
    </>
  );
}
