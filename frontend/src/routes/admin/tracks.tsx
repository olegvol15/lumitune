import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { Pencil, Trash2, Play, Plus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAdminTracksStore } from '../../store/adminTracksStore';
import AdminLayout from '../../components/admin/AdminLayout';
import TrackModal from '../../components/admin/TrackModal';
import { formatDuration } from '../../utils/format';

export const Route = createFileRoute('/admin/tracks')({ component: AdminTracksPage });

function AdminTracksPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, navigate]);

  const {
    tracks,
    isLoading,
    error,
    selected,
    search,
    page,
    pageSize,
    modal,
    setSearch,
    setPage,
    toggleSelect,
    selectAll,
    clearSelection,
    fetchTracks,
    openNew,
    openEdit,
    deleteTrack,
    deleteSelected,
  } = useAdminTracksStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTracks();
    }
  }, [isAuthenticated, fetchTracks]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artistId.toLowerCase().includes(q) ||
        t.albumId.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q),
    );
  }, [tracks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageIds = paginated.map((t) => t.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const handleSelectAll = () => {
    if (allPageSelected) clearSelection();
    else selectAll(pageIds);
  };

  if (!isAuthenticated) return null;

  const thClass = 'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
  const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
  const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-white font-semibold text-xl">Tracks</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors"
        >
          <Plus size={16} />
          New Item
        </button>
      </div>

      {/* Search + Delete Selected */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            type="text"
            placeholder="Search tracks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#19233a] border border-[#2a3a52] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors"
          />
        </div>
        {selected.size > 0 && (
          <button
            onClick={async () => {
              await deleteSelected();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#f07282] hover:bg-[#d9606f] transition-colors"
          >
            <Trash2 size={14} />
            Delete Selected ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1e2638] rounded-xl border border-[#2a3a52] overflow-hidden">
        {error && (
          <div className="px-4 py-3 text-sm text-red-300 border-b border-[#2a3a52]">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass} style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={handleSelectAll}
                    className="accent-[#3dc9b0] cursor-pointer"
                  />
                </th>
                <th className={thClass}>Name</th>
                <th className={thClass}>ArtistId</th>
                <th className={thClass}>GenreId</th>
                <th className={thClass}>TagsId</th>
                <th className={thClass}>AlbumId</th>
                <th className={thClass}>SeqNum</th>
                <th className={thClass}>PlaysNum</th>
                <th className={thClass}>Adult</th>
                <th className={thClass}>ID</th>
                <th className={thClass}>Time</th>
                <th className={thClass} style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-[#7a8faa] text-sm">
                    {isLoading ? 'Loading tracks…' : 'No tracks found'}
                  </td>
                </tr>
              )}
              {paginated.map((track) => (
                <tr
                  key={track.id}
                  className={`border-t border-[#2a3a52] transition-colors ${
                    selected.has(track.id) ? 'bg-[#253050]' : 'hover:bg-[#253050]/50'
                  }`}
                >
                  <td className={tdClass}>
                    <input
                      type="checkbox"
                      checked={selected.has(track.id)}
                      onChange={() => toggleSelect(track.id)}
                      className="accent-[#3dc9b0] cursor-pointer"
                    />
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2">
                      <img
                        src={track.albumCover}
                        alt={track.title}
                        className="w-8 h-8 rounded object-cover shrink-0"
                      />
                      <span className="truncate max-w-[140px]">{track.title}</span>
                    </div>
                  </td>
                  <td className={tdMuted}>{track.artistId || '—'}</td>
                  <td className={tdMuted}>{track.genreId || '—'}</td>
                  <td className={tdMuted}>{track.tagsId || '—'}</td>
                  <td className={tdMuted}>{track.albumId || '—'}</td>
                  <td className={tdMuted}>{track.seqNum}</td>
                  <td className={tdMuted}>{track.playCount.toLocaleString()}</td>
                  <td className={tdMuted}>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        track.adult
                          ? 'bg-[#f07282]/20 text-[#f07282]'
                          : 'bg-[#2a3a52] text-[#7a8faa]'
                      }`}
                    >
                      {track.adult ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className={`${tdMuted} font-mono text-xs`}>{track.id}</td>
                  <td className={tdMuted}>{formatDuration(track.duration)}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <button
                        title="Play"
                        className="p-1.5 rounded-lg text-[#7a8faa] hover:text-[#3dc9b0] hover:bg-[#2a3a52] transition-colors"
                      >
                        <Play size={14} />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => openEdit(track)}
                        className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete"
                        onClick={async () => {
                          await deleteTrack(track.id);
                        }}
                        className="p-1.5 rounded-lg text-[#7a8faa] hover:text-[#f07282] hover:bg-[#2a3a52] transition-colors"
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a3a52]">
          <span className="text-xs text-[#7a8faa]">
            {filtered.length} track{filtered.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? 'bg-[#3dc9b0] text-[#1a2030]'
                    : 'text-[#7a8faa] hover:text-white hover:bg-[#2a3a52]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && <TrackModal />}
    </AdminLayout>
  );
}
