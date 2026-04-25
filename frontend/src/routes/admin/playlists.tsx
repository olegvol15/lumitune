import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ListMusic, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import PlaylistModal from '../../components/admin/PlaylistModal';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAdminDeletePlaylistMutation, useAdminPlaylistsQuery } from '../../hooks/admin-playlists';
import { formatLongDuration } from '../../utils/format';
import type { AdminPlaylist } from '../../types/admin/admin-playlists.types';

export const Route = createFileRoute('/admin/playlists')({ component: AdminPlaylistsPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const thCenterClass =
  'px-3 py-3 text-center text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';
const tdMutedCenter = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap text-center';
const tdCenterClass = 'px-3 py-3 text-sm text-white whitespace-nowrap text-center';

function TracksPanel({
  playlist,
  onManageTracks,
}: {
  playlist: AdminPlaylist;
  onManageTracks: (playlist: AdminPlaylist) => void;
}) {
  return (
    <tr>
      <td colSpan={6} className="px-0 pb-0">
        <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-[#2a3a52] bg-[#151d2e]">
          <div className="flex items-center justify-between border-b border-[#2a3a52] px-4 py-2.5">
            <span className="text-[#7a8faa] text-xs font-semibold uppercase tracking-wide">
              Tracks — {playlist.title}
            </span>
            <button
              onClick={() => onManageTracks(playlist)}
              className="flex items-center gap-1.5 rounded-lg bg-[#3dc9b0] px-3 py-1.5 text-xs font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a]"
            >
              <Plus size={13} />
              Manage Tracks
            </button>
          </div>

          {playlist.tracks.length === 0 ? (
            <div className="px-4 py-4 text-xs text-[#7a8faa]">
              No tracks yet. Click "Manage Tracks" to add songs to this playlist.
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-[#2a3a52]">
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Track</th>
                  <th className={thClass}>Artist</th>
                  <th className={thClass}>Duration</th>
                  <th className={thClass}>Plays</th>
                </tr>
              </thead>
              <tbody>
                {playlist.tracks.map((track, index) => (
                  <tr key={track.id} className="border-t border-[#2a3a52] hover:bg-[#1e2840]/50">
                    <td className={tdMuted}>{index + 1}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <img
                          src={track.albumCover}
                          alt={track.title}
                          className="h-7 w-7 shrink-0 rounded object-cover"
                        />
                        <span className="max-w-[240px] truncate">{track.title}</span>
                      </div>
                    </td>
                    <td className={tdMuted}>{track.artistName}</td>
                    <td className={tdMuted}>{formatLongDuration(track.duration)}</td>
                    <td className={tdMuted}>{track.playCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  );
}

function AdminPlaylistsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((state) => state.isBootstrapped);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [playlistModal, setPlaylistModal] = useState<{
    open: boolean;
    mode: 'new' | 'edit';
    playlist?: AdminPlaylist;
  }>({ open: false, mode: 'new' });

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: playlists = [], isLoading, error } = useAdminPlaylistsQuery();
  const deleteMutation = useAdminDeletePlaylistMutation();

  const filteredPlaylists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return playlists;

    return playlists.filter((playlist) =>
      [playlist.title, playlist.description, ...playlist.tracks.map((track) => `${track.title} ${track.artistName}`)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [playlists, query]);

  const totalTracks = playlists.reduce((sum, playlist) => sum + playlist.tracks.length, 0);
  const publicPlaylists = playlists.filter((playlist) => playlist.isPublic).length;

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ListMusic size={18} className="text-[#3dc9b0]" />
          <div>
            <h1 className="text-white font-semibold text-xl">Playlists</h1>
            <p className="text-[#7a8faa] text-sm">Curated playlists shown in the user app</p>
          </div>
        </div>

        <button
          onClick={() => setPlaylistModal({ open: true, mode: 'new' })}
          className="flex items-center gap-2 rounded-lg bg-[#3dc9b0] px-4 py-2 text-sm font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a]"
        >
          <Plus size={16} />
          New Playlist
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Curated Playlists</p>
          <p className="text-2xl font-semibold text-white">{playlists.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Public</p>
          <p className="text-2xl font-semibold text-white">{publicPlaylists}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Total Tracks</p>
          <p className="text-2xl font-semibold text-white">{totalTracks}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            type="text"
            placeholder="Search playlists…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-[#2a3a52] bg-[#19233a] py-2 pl-8 pr-3 text-sm text-white placeholder:text-[#4a5a72] focus:border-[#3dc9b0] focus:outline-none transition-colors"
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
                <th className={thClass}>Playlist</th>
                <th className={thClass}>Description</th>
                <th className={thCenterClass}>Visibility</th>
                <th className={thCenterClass}>Tracks</th>
                <th className={thCenterClass}>Inspect</th>
                <th className={thCenterClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading playlists…
                  </td>
                </tr>
              )}
              {!isLoading && filteredPlaylists.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#7a8faa]">
                    {playlists.length === 0 ? 'No curated playlists yet. Click "New Playlist" to create one.' : 'No playlists match your search.'}
                  </td>
                </tr>
              )}
              {filteredPlaylists.map((playlist) => (
                <Fragment key={playlist.id}>
                  <tr
                    className={`border-t border-[#2a3a52] transition-colors ${
                      expandedId === playlist.id ? 'bg-[#253050]' : 'hover:bg-[#253050]/50'
                    }`}
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        {playlist.coverUrl ? (
                          <img
                            src={playlist.coverUrl}
                            alt={playlist.title}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#253050] text-[#d8e4f2]">
                            <ListMusic size={15} />
                          </div>
                        )}
                        <span className="max-w-[180px] truncate font-medium">{playlist.title}</span>
                      </div>
                    </td>
                    <td className={tdMuted}>
                      <span className="inline-block max-w-[220px] truncate">
                        {playlist.description || '—'}
                      </span>
                    </td>
                    <td className={tdMutedCenter}>
                      <span className="inline-flex rounded-full border border-[#35506b] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#b9c8da]">
                        {playlist.isPublic ? 'Public' : 'Hidden'}
                      </span>
                    </td>
                    <td className={tdMutedCenter}>{playlist.tracks.length}</td>
                    <td className={tdMutedCenter}>
                      <button
                        onClick={() => setExpandedId(expandedId === playlist.id ? null : playlist.id)}
                        className="mx-auto flex items-center gap-1.5 text-xs font-medium text-[#3dc9b0] transition-colors hover:text-[#35b09a]"
                      >
                        Tracks
                        {expandedId === playlist.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </td>
                    <td className={tdCenterClass}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setPlaylistModal({ open: true, mode: 'edit', playlist })}
                          className="rounded-lg p-1.5 text-[#7a8faa] transition-colors hover:bg-[#2a3a52] hover:text-white"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDeleteId(playlist.id)}
                          className="rounded-lg p-1.5 text-[#7a8faa] transition-colors hover:bg-[#2a3a52] hover:text-[#f07282]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === playlist.id && (
                    <TracksPanel
                      playlist={playlist}
                      onManageTracks={(targetPlaylist) =>
                        setPlaylistModal({ open: true, mode: 'edit', playlist: targetPlaylist })
                      }
                    />
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {playlistModal.open && (
        <PlaylistModal
          mode={playlistModal.mode}
          playlist={playlistModal.playlist}
          onClose={() => setPlaylistModal({ open: false, mode: 'new' })}
        />
      )}

      {confirmDeleteId && (
        <AdminConfirmModal
          title="Delete curated playlist?"
          description="This will permanently delete the playlist from the admin and the user app."
          confirmLabel="Delete"
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            deleteMutation.mutate(confirmDeleteId);
            if (expandedId === confirmDeleteId) setExpandedId(null);
            setConfirmDeleteId(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
