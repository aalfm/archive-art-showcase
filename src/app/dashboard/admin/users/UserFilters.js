'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import FilterDropdown from '@/components/ui/FilterDropdown';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'curator', label: 'Curator' },
];

export default function UserFilters({ initialSearch = '', initialRole = '' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole.toLowerCase());
  const roleRef = useRef(role);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const applyFilters = (nextSearch, nextRole) => {
    const params = new URLSearchParams();
    const trimmedSearch = nextSearch.trim();
    const normalizedRole = (nextRole || '').trim().toLowerCase();
    if (trimmedSearch) params.set('q', trimmedSearch);
    if (normalizedRole) params.set('role', normalizedRole);
    const qs = params.toString();
    const target = qs ? `/dashboard/admin/users?${qs}` : '/dashboard/admin/users';
    startTransition(() => {
      router.push(target);
    });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(val, roleRef.current);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applyFilters(search, role);
  };

  const handleRoleSelect = (val) => {
    const normalized = (val || '').trim().toLowerCase();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setRole(normalized);
    roleRef.current = normalized;
    applyFilters(search, normalized);
  };

  const handleReset = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearch('');
    setRole('');
    roleRef.current = '';
    startTransition(() => {
      router.push('/dashboard/admin/users');
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-users-filter-bar"
    >
      <input
        type="text"
        name="q"
        id="admin-users-search"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search user name or email..."
        aria-label="Search user name or email"
        className="form-input admin-users-search-input"
      />

      <button type="submit" className="btn-primary" id="btn-admin-users-search">
        {isPending ? '...' : 'Search'}
      </button>

      {(search || role) && (
        <button
          type="button"
          className="btn-secondary"
          onClick={handleReset}
          id="btn-admin-users-reset"
        >
          Reset
        </button>
      )}

      <FilterDropdown
        id="admin-users-role-filter"
        className="explore-dropdown-category admin-users-role-dropdown"
        ariaLabel="Filter by role"
        value={role}
        options={ROLE_OPTIONS}
        placeholder="All roles"
        onSelect={handleRoleSelect}
      />
    </form>
  );
}
