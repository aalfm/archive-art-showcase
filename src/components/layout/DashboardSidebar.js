'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/actions/auth.actions';
import { formatCuratorStatusLabel, formatRoleLabel } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import { Menu, X } from '@/components/ui/Icons';

export default function DashboardSidebar({ user, isInactive = false }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const memberLinks = [
    { href: '/dashboard/member', label: 'Overview', icon: 'grid' },
    { href: '/dashboard/member/profile', label: 'My Profile', icon: 'user' },
    { href: '/dashboard/member/artworks', label: 'My Artworks', icon: 'image' },
    { href: '/dashboard/member/artworks/create', label: 'Upload Artwork', icon: 'plus-square' },
    { href: '/dashboard/member/favorites', label: 'Favorites', icon: 'heart' },
    { href: '/dashboard/member/submissions', label: 'Submissions', icon: 'send' },
    { href: '/dashboard/member/settings', label: 'Settings', icon: 'settings' },
  ];

  const curatorLinks = [
    { href: '/dashboard/curator', label: 'Overview', icon: 'grid' },
    { href: '/dashboard/curator/challenges', label: 'My Challenges', icon: 'award' },
  ];

  const pendingCuratorLinks = [
    { href: '/dashboard/curator/pending', label: 'Verification Status', icon: 'shield' },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Overview', icon: 'grid' },
    { href: '/dashboard/admin/users', label: 'User Management', icon: 'users' },
    { href: '/dashboard/admin/curators', label: 'Curator Verification', icon: 'shield' },
    { href: '/dashboard/admin/challenges', label: 'Challenges', icon: 'award' },
    { href: '/dashboard/admin/categories', label: 'Categories', icon: 'tag' },
    { href: '/dashboard/admin/reports', label: 'Content Moderation', icon: 'flag' },
  ];

  const inactiveLinks = [
    { href: pathname || '/dashboard/member', label: 'Account Status', icon: 'shield' },
  ];

  const rawLinks = isInactive
    ? inactiveLinks
    : user.role === 'admin'
      ? adminLinks
      : user.role === 'curator'
        ? (user.curator_status === 'approved' ? curatorLinks : pendingCuratorLinks)
        : memberLinks;

  const links = rawLinks.filter(
    (item, idx, arr) => arr.findIndex((other) => other.href === item.href) === idx
  );

  // Highlight only the most specific matching link
  const activeHref = links
    .filter((l) => pathname === l.href || pathname.startsWith(l.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const svgPaths = {
    grid: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
    'plus-square': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
    send: '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
    award: '<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>',
  };

  const isAdmin = user.role === 'admin';
  const isCurator = user.role === 'curator';
  const isDashboardOnly = isAdmin;
  const brandHref = isAdmin
    ? '/dashboard/admin'
    : isCurator
      ? (user.curator_status === 'approved' ? '/dashboard/curator' : '/dashboard/curator/pending')
      : '/';
  const brandAriaLabel = isAdmin
    ? 'ARCHIVE Admin Dashboard'
    : isCurator
      ? 'ARCHIVE Curator Dashboard'
      : 'ARCHIVE Home';

  return (
    <>
      {/* Mobile & Tablet Topbar */}
      <header className="dashboard-mobile-topbar">
        <Link href={brandHref} className="dashboard-topbar-brand" aria-label={brandAriaLabel}>
          <Image
            src="/logo/Logo_archive_white.svg"
            alt="ARCHIVE"
            width={136}
            height={30}
            className="dashboard-topbar-logo"
            priority
          />
        </Link>
        <button
          type="button"
          className="dashboard-mobile-hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open dashboard menu"
          aria-expanded={drawerOpen}
          aria-controls="dashboard-sidebar-drawer"
          id="btn-dashboard-hamburger"
        >
          <Menu size={20} />
        </button>
      </header>

      <aside
        id="dashboard-sidebar-drawer"
        className={`dashboard-sidebar ${drawerOpen ? 'is-open' : ''}`}
        aria-label="Dashboard Sidebar"
      >
        <div className="dashboard-drawer-head">
          <Link
            href={brandHref}
            className="dashboard-topbar-brand"
            aria-label={brandAriaLabel}
            onClick={() => setDrawerOpen(false)}
          >
            <Image
              src="/logo/Logo_archive_white.svg"
              alt="ARCHIVE"
              width={128}
              height={28}
              className="dashboard-topbar-logo"
            />
          </Link>
          <button
            type="button"
            className="dashboard-drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close dashboard menu"
            id="btn-dashboard-drawer-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="sidebar-user">
          <UserAvatar
            src={user.profile_image}
            role={user.role}
            name={user.name}
            size={42}
            className="sidebar-avatar"
          />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.name}</span>
            <span className={`sidebar-user-role${isInactive ? ' is-inactive' : ''}`}>
              {isInactive
                ? `${formatRoleLabel(user.role)} · Inactive`
                : user.role === 'curator' && user.curator_status
                  ? `${formatRoleLabel(user.role)} · ${formatCuratorStatusLabel(user.curator_status)}`
                  : formatRoleLabel(user.role)}
            </span>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Dashboard Navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-nav-item ${link.href === activeHref ? 'active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                dangerouslySetInnerHTML={{ __html: svgPaths[link.icon] || '' }}
              />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-divider" style={{ marginTop: 'auto' }}></div>

        {/* Explore / Back to site (non-admin) + logout */}
        <div className="sidebar-footer">
          {!isDashboardOnly && (
            <Link href="/" className="sidebar-nav-item" onClick={() => setDrawerOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>{isCurator ? 'Explore Site' : 'Back to Site'}</span>
            </Link>
          )}
          <form action={logoutUser}>
            <button type="submit" className="sidebar-nav-item sidebar-logout" style={{ width: '100%', textAlign: 'left' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {drawerOpen && (
        <div
          className="dashboard-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
