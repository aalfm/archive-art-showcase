'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { logoutUser } from '@/lib/actions/auth.actions';
import {
  getActivePageLabel,
  getCuratorActivePageLabel,
  getMemberActivePageLabel,
} from '@/lib/navigation';
import { resolveNavbarDashboardOrigin } from '@/lib/member-navigation';
import { formatCuratorStatusLabel, formatRoleLabel } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';

const MENU_ICONS = {
  grid: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  user: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  image: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  'plus-square': (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  heart: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  send: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  award: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  shield: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const MEMBER_FLAT_MENU_ITEMS = [
  { href: '/dashboard/member', label: 'Overview', icon: 'grid', exact: true },
  { href: '/dashboard/member/profile', label: 'My Profile', icon: 'user' },
  { href: '/dashboard/member/artworks', label: 'My Artworks', icon: 'image' },
  { href: '/dashboard/member/favorites', label: 'Favorites', icon: 'heart' },
  { href: '/dashboard/member/submissions', label: 'Submissions', icon: 'send' },
];

const CURATOR_FLAT_MENU_ITEMS = [
  { href: '/dashboard/curator', label: 'Overview', icon: 'grid', exact: true },
  { href: '/dashboard/curator/challenges', label: 'My Challenges', icon: 'award' },
];

function getRoleDropdownConfig(user, isInactive) {
  if (!user) return { primary: [], account: [], sectionLabel: '' };

  if (isInactive) {
    return {
      sectionLabel: 'Account',
      primary: [
        { href: '/dashboard/member/inactive', label: 'Account Status', icon: 'shield' },
      ],
      account: [],
    };
  }

  if (user.role === 'member') {
    return {
      sectionLabel: '',
      primary: MEMBER_FLAT_MENU_ITEMS,
      account: [],
    };
  }

  if (user.role === 'curator') {
    if (user.curator_status === 'approved') {
      return {
        sectionLabel: '',
        primary: CURATOR_FLAT_MENU_ITEMS,
        account: [],
      };
    }

    return {
      sectionLabel: 'Curator Status',
      primary: [
        { href: '/dashboard/curator/pending', label: 'Verification Status', icon: 'shield' },
      ],
      account: [],
    };
  }

  // Admin keeps its existing compact link to Admin Dashboard (which preserves its sidebar)
  return {
    sectionLabel: '',
    primary: [
      { href: '/dashboard/admin', label: 'Dashboard', icon: 'grid' },
    ],
    account: [],
  };
}

function NavbarContent({ user, isInactive = false, fromParam = '' }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userTriggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const closeUserMenu = useCallback(() => {
    setUserMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (userMenuOpen) {
          closeUserMenu();
          userTriggerRef.current?.focus();
        }
        setDrawerOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        closeUserMenu();
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
  }, [userMenuOpen, closeUserMenu]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (isInactive) return '/dashboard/member/inactive';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'curator') {
      return user.curator_status === 'approved' ? '/dashboard/curator' : '/dashboard/curator/pending';
    }
    return '/dashboard/member';
  };

  const dropdownConfig = useMemo(
    () => getRoleDropdownConfig(user, isInactive),
    [user, isInactive]
  );

  const allDropdownLinks = useMemo(
    () => [...dropdownConfig.primary, ...dropdownConfig.account],
    [dropdownConfig]
  );

  const activeDashboardOrigin = useMemo(
    () => (isInactive ? null : resolveNavbarDashboardOrigin(pathname, fromParam, user)),
    [isInactive, pathname, fromParam, user]
  );

  // Highlight only the most specific matching dashboard route inside the dropdown
  const activeDropdownHref = useMemo(() => {
    if (activeDashboardOrigin?.dropdownHref) {
      return activeDashboardOrigin.dropdownHref;
    }
    if (!pathname) return null;
    const match = allDropdownLinks
      .filter((item) =>
        item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + '/')
      )
      .sort((a, b) => b.href.length - a.href.length)[0];
    return match?.href || null;
  }, [activeDashboardOrigin, allDropdownLinks, pathname]);

  const roleLabel = useMemo(() => (user ? formatRoleLabel(user.role) : ''), [user]);

  const isAdminUser = Boolean(user && user.role === 'admin');
  const isCuratorUser = Boolean(user && user.role === 'curator');
  const isDashboardOnlyUser = isAdminUser;
  const isMemberUser = Boolean(user && user.role === 'member');
  const isActiveMember = Boolean(isMemberUser && !isInactive);
  const isApprovedCurator = Boolean(
    isCuratorUser && !isInactive && user.curator_status === 'approved'
  );
  const isFlatRoleDropdown = isActiveMember || isApprovedCurator;
  const flatDropdownItems = isApprovedCurator ? CURATOR_FLAT_MENU_ITEMS : MEMBER_FLAT_MENU_ITEMS;

  const activePageLabel = useMemo(() => {
    if (activeDashboardOrigin?.label) {
      return activeDashboardOrigin.label;
    }
    if (isMemberUser) {
      return isInactive ? '' : getMemberActivePageLabel(pathname);
    }
    if (isCuratorUser) {
      return isInactive ? '' : getCuratorActivePageLabel(pathname);
    }
    return getActivePageLabel(pathname);
  }, [activeDashboardOrigin, isMemberUser, isCuratorUser, isInactive, pathname]);

  const showPageContext = Boolean(
    user && (user.role === 'member' || user.role === 'curator')
  );

  const firstName = (user?.name || '').trim().split(/\s+/)[0] || roleLabel;

  const roleSubLabel = useMemo(() => {
    if (!user) return '';
    if (isInactive) return `${roleLabel} · Inactive`;
    if (user.role === 'curator' && user.curator_status) {
      return `${roleLabel} · ${formatCuratorStatusLabel(user.curator_status)}`;
    }
    return roleLabel;
  }, [user, isInactive, roleLabel]);

  // Do not activate Explore / Challenges / Artists when viewing a detail page opened from a role dashboard menu
  const isNavActive = (href) => {
    if (activeDashboardOrigin) return false;
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
  };

  const handleDropdownKeyDown = (e) => {
    if (!dropdownRef.current) return;
    const focusable = Array.from(
      dropdownRef.current.querySelectorAll('a[role="menuitem"], button[role="menuitem"]')
    );
    if (focusable.length === 0) return;

    const currentIndex = focusable.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % focusable.length;
      focusable[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
      focusable[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusable[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      focusable[focusable.length - 1]?.focus();
    }
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown' && !userMenuOpen) {
      e.preventDefault();
      setUserMenuOpen(true);
      requestAnimationFrame(() => {
        const firstItem = dropdownRef.current?.querySelector(
          'a[role="menuitem"], button[role="menuitem"]'
        );
        firstItem?.focus();
      });
    }
  };

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <Link
            href={isDashboardOnlyUser ? getDashboardLink() : '/'}
            className="brand-wordmark brand-logo-only"
            aria-label={isAdminUser ? 'ARCHIVE Admin Dashboard' : 'ARCHIVE Home'}
          >
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

        {!isDashboardOnlyUser && (
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
        )}

        <div className="header-right">
          <div className="header-actions">
            {user ? (
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  ref={userTriggerRef}
                  type="button"
                  className={`btn-login-pill navbar-profile-trigger${showPageContext ? ' navbar-profile-trigger--with-context' : ''}${isMemberUser || isCuratorUser ? ' navbar-profile-trigger--member' : ''}${userMenuOpen ? ' is-open' : ''}`}
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  onKeyDown={handleTriggerKeyDown}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-controls="navbar-user-dropdown"
                  aria-label={
                    showPageContext && activePageLabel
                      ? `${user.name} (${roleLabel} · ${activePageLabel}) account menu`
                      : `${user.name} account menu`
                  }
                  id="btn-user-menu"
                >
                  <UserAvatar
                    src={user.profile_image}
                    role={user.role}
                    name={user.name}
                    size={showPageContext ? 28 : 24}
                    className="user-profile-icon"
                  />
                  {showPageContext ? (
                    <span className="navbar-profile-identity">
                      <span className="navbar-user-name">{firstName}</span>
                      <span
                        className="navbar-role-context"
                        title={activePageLabel ? `${roleLabel} · ${activePageLabel}` : roleLabel}
                      >
                        <span className={`navbar-role-label${isInactive ? ' is-inactive' : ''}`}>
                          {roleLabel}
                        </span>
                        {activePageLabel && (
                          <>
                            <span className="navbar-context-sep" aria-hidden="true">·</span>
                            <span className="navbar-active-page">{activePageLabel}</span>
                          </>
                        )}
                      </span>
                    </span>
                  ) : (
                    <span className="navbar-user-name">{firstName}</span>
                  )}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    className="navbar-profile-chevron"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div
                    ref={dropdownRef}
                    id="navbar-user-dropdown"
                    className={`user-dropdown user-dropdown--panel${isFlatRoleDropdown ? ' user-dropdown--member-flat' : ''}`}
                    role="menu"
                    aria-label="Account and dashboard navigation"
                    onKeyDown={handleDropdownKeyDown}
                  >
                    {isFlatRoleDropdown ? (
                      <>
                        {flatDropdownItems.map((item) => {
                          const isActive = item.href === activeDropdownHref;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`user-dropdown-item${isActive ? ' is-active' : ''}`}
                              role="menuitem"
                              aria-current={isActive ? 'page' : undefined}
                              onClick={closeUserMenu}
                            >
                              <span className="user-dropdown-item-icon">
                                {MENU_ICONS[item.icon]}
                              </span>
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}

                        <div className="user-dropdown-divider" role="separator" />

                        <form action={logoutUser} className="user-dropdown-logout-form">
                          <button
                            type="submit"
                            className="user-dropdown-item user-dropdown-logout"
                            role="menuitem"
                          >
                            <span className="user-dropdown-item-icon">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                              </svg>
                            </span>
                            <span>Sign Out</span>
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <div className="user-dropdown-header">
                          <UserAvatar
                            src={user.profile_image}
                            role={user.role}
                            name={user.name}
                            size={34}
                            className="user-dropdown-avatar"
                          />
                          <div className="user-dropdown-meta">
                            <span className="user-dropdown-name">{user.name}</span>
                            <span className={`user-dropdown-role${isInactive ? ' is-inactive' : ''}`}>
                              {roleSubLabel}
                            </span>
                          </div>
                        </div>

                        <div className="user-dropdown-divider" role="separator" />

                        {dropdownConfig.sectionLabel && (
                          <div className="user-dropdown-section-label">
                            {dropdownConfig.sectionLabel}
                          </div>
                        )}

                        <div className="user-dropdown-group">
                          {dropdownConfig.primary.map((item) => {
                            const isActive = item.href === activeDropdownHref;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`user-dropdown-item${isActive ? ' is-active' : ''}`}
                                role="menuitem"
                                aria-current={isActive ? 'page' : undefined}
                                onClick={closeUserMenu}
                              >
                                <span className="user-dropdown-item-icon">
                                  {MENU_ICONS[item.icon]}
                                </span>
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>

                        <div className="user-dropdown-divider" role="separator" />

                        <div className="user-dropdown-group">
                          {dropdownConfig.account.map((item) => {
                            const isActive = item.href === activeDropdownHref;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`user-dropdown-item${isActive ? ' is-active' : ''}`}
                                role="menuitem"
                                aria-current={isActive ? 'page' : undefined}
                                onClick={closeUserMenu}
                              >
                                <span className="user-dropdown-item-icon">
                                  {MENU_ICONS[item.icon]}
                                </span>
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}

                          <form action={logoutUser}>
                            <button
                              type="submit"
                              className="user-dropdown-item user-dropdown-logout"
                              role="menuitem"
                            >
                              <span className="user-dropdown-item-icon">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
                                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                  <polyline points="16 17 21 12 16 7" />
                                  <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                              </span>
                              <span>Sign Out</span>
                            </button>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-login-pill navbar-signin-btn" id="btn-login">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sign In
              </Link>
            )}

            {!isDashboardOnlyUser && (
              <button
                type="button"
                className="btn-hamburger"
                onClick={() => {
                  closeUserMenu();
                  setDrawerOpen((prev) => !prev);
                }}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                id="btn-hamburger"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            )}
          </div>
        </div>
      </header>

      {!isDashboardOnlyUser && (
        <>
          <div
            className={`mobile-drawer ${drawerOpen ? 'active' : ''}`}
            id="mobile-drawer"
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            <div className="drawer-header">
              <span className="brand-text" style={{ fontSize: '1rem', letterSpacing: '0.15em' }}>ARCHIVE</span>
              <button type="button" className="drawer-close-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu" id="drawer-close-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
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
                  <Link href={getDashboardLink()} className="btn-primary drawer-cta" onClick={() => setDrawerOpen(false)}>
                    Dashboard
                  </Link>
                  <form action={logoutUser} style={{ marginTop: 8 }}>
                    <button type="submit" className="btn-secondary drawer-cta">Sign Out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-primary drawer-cta" onClick={() => setDrawerOpen(false)} id="drawer-login-btn">Sign In</Link>
                  <Link href="/register" className="btn-secondary drawer-cta" style={{ marginTop: 8 }} onClick={() => setDrawerOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
          {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}></div>}
        </>
      )}
    </>
  );
}

function NavbarWithSearchParams({ user, isInactive }) {
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from') || '';
  return <NavbarContent user={user} isInactive={isInactive} fromParam={fromParam} />;
}

export default function Navbar({ user, isInactive = false }) {
  return (
    <Suspense fallback={<NavbarContent user={user} isInactive={isInactive} fromParam="" />}>
      <NavbarWithSearchParams user={user} isInactive={isInactive} />
    </Suspense>
  );
}
