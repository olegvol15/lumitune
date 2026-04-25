import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { Disc3, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAlbumsQuery, useAdminDeleteAlbumMutation } from '../../hooks/albums';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminCheckbox from '../../components/admin/AdminCheckbox';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AlbumModal from '../../components/admin/AlbumModal';
import { formatLongDuration } from '../../utils/format';
import type { Album } from '../../types';

export const Route = createFileRoute('/admin/albums')({ component: AdminAlbumsPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const thCenterClass =
  'px-3 py-3 text-center text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';
const tdCenterClass = 'px-3 py-3 text-sm text-white whitespace-nowrap text-center';
const tdMutedCenter = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap text-center';

function AdminAlbumsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((s) => s.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: albums = [], isLoading, error } = useAlbumsQuery();
  const deleteMutation = useAdminDeleteAlbumMutation();
  const [albumModal, setAlbumModal] = useState<{ open: boolean; mode: 'new' | 'edit'; album?: Album }>({
    open: false,
    mode: 'new',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const filteredAlbums = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return albums;
    return albums.filter((album) =>
      [album.title, album.artistName, album.genre, String(album.year ?? ''), album.description ?? '']
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [albums, query]);

  const albumIds = filteredAlbums.map((album) => album.id);
  const allSelected = albumIds.length > 0 && albumIds.every((id) => selected.has(id));

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(albumIds));
  };

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc3 size={18} className="text-[#3dc9b0]" />
          <h1 className="text-white font-semibold text-xl">Albums</h1>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={() => setConfirmBulkDelete(true)}
              className="flex items-center gap-2 rounded-lg bg-[#f07282] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d9606f] transition-colors"
            >
              <Trash2 size={14} />
              Delete Selected ({selected.size})
            </button>
          )}
          <button
            onClick={() => setAlbumModal({ open: true, mode: 'new' })}
            className="flex items-center gap-2 rounded-lg bg-[#3dc9b0] px-4 py-2 text-sm font-semibold text-[#1a2030] hover:bg-[#35b09a] transition-colors"
          >
            <Plus size={16} />
            New Album
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            type="text"
            placeholder="Search albums…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-[#2a3a52] bg-[#19233a] py-2 pl-8 pr-3 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2a3a52] bg-[#1e2638]">
        {error instanceof Error && (
          <div className="border-b border-[#2a3a52] px-4 py-3 text-sm text-red-300">{error.message}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thCenterClass} style={{ width: 40 }}>
                  <AdminCheckbox checked={allSelected} onChange={handleSelectAll} />
                </th>
                <th className={thClass}>Album</th>
                <th className={thClass}>Artist</th>
                <th className={thCenterClass}>Genre</th>
                <th className={thCenterClass}>Duration</th>
                <th className={thCenterClass}>Tracks</th>
                <th className={thCenterClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading albums…
                  </td>
                </tr>
              )}
              {!isLoading && filteredAlbums.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-[#7a8faa]">
                    {albums.length === 0 ? 'No albums yet. Click "New Album" to create one.' : 'No albums match your search.'}
                  </td>
                </tr>
              )}
              {filteredAlbums.map((album) => (
                <tr key={album.id} className={`border-t border-[#2a3a52] transition-colors ${selected.has(album.id) ? 'bg-[#253050]' : 'hover:bg-[#253050]/50'}`}>
                  <td className={tdCenterClass}>
                    <AdminCheckbox checked={selected.has(album.id)} onChange={() => toggleSelect(album.id)} />
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="h-9 w-9 rounded-lg object-contain bg-black/10 shrink-0"
                      />
                      <span className="max-w-[180px] truncate font-medium">{album.title}</span>
                    </div>
                  </td>
                  <td className={tdMuted}>{album.artistName}</td>
                  <td className={tdMutedCenter}>{album.genre || '—'}</td>
                  <td className={tdMutedCenter}>{formatLongDuration(album.duration ?? 0)}</td>
                  <td className={tdMutedCenter}>{album.trackCount ?? album.trackIds.length}</td>
                  <td className={tdCenterClass}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Edit"
                        onClick={() => setAlbumModal({ open: true, mode: 'edit', album })}
                        className="rounded-lg p-1.5 text-[#7a8faa] hover:bg-[#2a3a52] hover:text-white transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => {
                          setConfirmDeleteId(album.id);
                          setSelected((current) => {
                            const next = new Set(current);
                            next.delete(album.id);
                            return next;
                          });
                        }}
                        className="rounded-lg p-1.5 text-[#7a8faa] hover:bg-[#2a3a52] hover:text-[#f07282] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {albumModal.open && (
        <AlbumModal
          mode={albumModal.mode}
          album={albumModal.album}
          onClose={() => setAlbumModal({ open: false, mode: 'new' })}
        />
      )}

      {confirmDeleteId && (
        <AdminConfirmModal
          title="Delete album?"
          description="This will permanently delete the album and remove track associations."
          confirmLabel="Delete"
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            deleteMutation.mutate(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      )}

      {confirmBulkDelete && (
        <AdminConfirmModal
          title="Delete selected albums?"
          description={`This will permanently delete ${selected.size} selected album${selected.size === 1 ? '' : 's'}.`}
          confirmLabel="Delete Selected"
          onClose={() => setConfirmBulkDelete(false)}
          onConfirm={() => {
            void Promise.all(Array.from(selected).map((id) => deleteMutation.mutateAsync(id)));
            setSelected(new Set());
            setConfirmBulkDelete(false);
          }}
        />
      )}
    </AdminLayout>
  );
}
