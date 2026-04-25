import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Avatar from '../../components/ui/Avatar';
import { useAdminUsersQuery } from '../../hooks/admin-users';
import { useAdminAuthStore } from '../../store/adminAuthStore';

export const Route = createFileRoute('/admin/users')({ component: AdminUsersPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';

function formatJoinedDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getAvatarSrc(profilePicture: string) {
  if (!profilePicture || profilePicture === 'default-avatar.png') return undefined;
  return profilePicture.startsWith('http') || profilePicture.startsWith('/')
    ? profilePicture
    : `/${profilePicture}`;
}

function AdminUsersPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((s) => s.isBootstrapped);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: users = [], isLoading, error } = useAdminUsersQuery();

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) =>
      [user.displayName, user.username, user.email, user.role, user.country, user.city]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [query, users]);

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#3dc9b0]" />
          <div>
            <h1 className="text-white font-semibold text-xl">Users</h1>
            <p className="text-[#7a8faa] text-sm">Listeners and creators registered in the app</p>
          </div>
        </div>

        <div className="min-w-[280px] max-w-sm w-full relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, username, email, role..."
            className="w-full rounded-lg border border-[#2a3a52] bg-[#1e2638] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-colors focus:border-[#3dc9b0]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8faa] mb-2">Total Users</p>
          <p className="text-2xl font-semibold text-white">{users.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8faa] mb-2">Listeners</p>
          <p className="text-2xl font-semibold text-white">{users.filter((user) => user.role === 'user').length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8faa] mb-2">Creators</p>
          <p className="text-2xl font-semibold text-white">{users.filter((user) => user.role === 'creator').length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2a3a52] bg-[#1e2638]">
        {error instanceof Error && (
          <div className="border-b border-[#2a3a52] px-4 py-3 text-sm text-red-300">{error.message}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass}>User</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>Role</th>
                <th className={thClass}>Location</th>
                <th className={thClass}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading users…
                  </td>
                </tr>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#7a8faa]">
                    {users.length === 0 ? 'No users yet.' : 'No users match your search.'}
                  </td>
                </tr>
              )}
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-[#2a3a52] hover:bg-[#253050]/50 transition-colors">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={getAvatarSrc(user.profilePicture)}
                        alt={user.displayName}
                        size={36}
                        className="bg-gradient-to-br from-[#2d4261] to-[#1d2638] text-[#d8e4f2]"
                      />
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate font-medium">{user.displayName}</p>
                        <p className="max-w-[220px] truncate text-xs text-[#7a8faa]">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className={tdMuted}>{user.email}</td>
                  <td className={tdMuted}>
                    <span className="inline-flex rounded-full border border-[#35506b] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#b9c8da]">
                      {user.role}
                    </span>
                  </td>
                  <td className={tdMuted}>{[user.city, user.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className={tdMuted}>{formatJoinedDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
