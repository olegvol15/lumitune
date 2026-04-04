import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Disc3, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAlbumsQuery, useAdminDeleteAlbumMutation } from '../../hooks/albums';
import AdminLayout from '../../components/admin/AdminLayout';
import AlbumModal from '../../components/admin/AlbumModal';
import { formatLongDuration } from '../../utils/format';
import type { Album } from '../../types';

export const Route = createFileRoute('/admin/albums')({ component: AdminAlbumsPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';

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

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc3 size={18} className="text-[#3dc9b0]" />
          <h1 className="text-white font-semibold text-xl">Albums</h1>
        </div>
        <button
          onClick={() => setAlbumModal({ open: true, mode: 'new' })}
          className="flex items-center gap-2 rounded-lg bg-[#3dc9b0] px-4 py-2 text-sm font-semibold text-[#1a2030] hover:bg-[#35b09a] transition-colors"
        >
          <Plus size={16} />
          New Album
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2a3a52] bg-[#1e2638]">
        {error instanceof Error && (
          <div className="border-b border-[#2a3a52] px-4 py-3 text-sm text-red-300">{error.message}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass}>Album</th>
                <th className={thClass}>Artist</th>
                <th className={thClass}>Genre</th>
                <th className={thClass}>Duration</th>
                <th className={thClass}>Tracks</th>
                <th className={thClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading albums…
                  </td>
                </tr>
              )}
              {!isLoading && albums.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#7a8faa]">
                    No albums yet. Click "New Album" to create one.
                  </td>
                </tr>
              )}
              {albums.map((album) => (
                <tr key={album.id} className="border-t border-[#2a3a52] hover:bg-[#253050]/50 transition-colors">
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
                  <td className={tdMuted}>{album.genre || '—'}</td>
                  <td className={tdMuted}>{formatLongDuration(album.duration ?? 0)}</td>
                  <td className={tdMuted}>{album.trackCount ?? album.trackIds.length}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <button
                        title="Edit"
                        onClick={() => setAlbumModal({ open: true, mode: 'edit', album })}
                        className="rounded-lg p-1.5 text-[#7a8faa] hover:bg-[#2a3a52] hover:text-white transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setConfirmDeleteId(album.id)}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(event) => event.target === event.currentTarget && setConfirmDeleteId(null)}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#1e2638] shadow-2xl">
            <div className="px-6 py-5">
              <h2 className="mb-2 text-base font-semibold text-white">Delete album?</h2>
              <p className="text-sm text-[#7a8faa]">
                This will permanently delete the album and remove track associations.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-[#2a3a52] px-6 py-4">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg bg-[#2a3a52] px-5 py-2 text-sm font-semibold text-white hover:bg-[#354a62] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="rounded-lg bg-[#f07282] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d9606f] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
