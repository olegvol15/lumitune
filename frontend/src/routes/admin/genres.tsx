import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  AudioLines,
  CircleDotDashed,
  Disc3,
  Guitar,
  Mic,
  Music2,
  Pencil,
  Plus,
  Radio,
  Search,
  Shapes,
  Sparkles,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  useAdminCreateGenreMutation,
  useAdminDeleteGenreMutation,
  useAdminGenresQuery,
  useAdminUpdateGenreMutation,
} from '../../hooks/admin-genres';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import type { AdminGenre } from '../../types/admin/admin-genres.types';

export const Route = createFileRoute('/admin/genres')({ component: AdminGenresPage });

const thClass = 'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const thCenterClass =
  'px-3 py-3 text-center text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';
const tdMutedCenter = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap text-center';
const tdCenterClass = 'px-3 py-3 text-sm text-white whitespace-nowrap text-center';
const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
const inputClass =
  'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

const genreIcons: Record<string, LucideIcon> = {
  classic: Disc3,
  classical: Disc3,
  hiphop: Mic,
  'hip-hop': Mic,
  jazz: AudioLines,
  kpop: Sparkles,
  'k-pop': Sparkles,
  metal: Guitar,
  pop: Music2,
  rap: Mic,
  rock: Radio,
};

const normalizeGenreIconKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getGenreIcon = (name: string): LucideIcon =>
  genreIcons[normalizeGenreIconKey(name)] ?? CircleDotDashed;

function GenreModal({
  genre,
  onClose,
}: {
  genre?: AdminGenre;
  onClose: () => void;
}) {
  const [name, setName] = useState(genre?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const createMutation = useAdminCreateGenreMutation();
  const updateMutation = useAdminUpdateGenreMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Genre name is required');
      return;
    }

    try {
      setError(null);
      if (genre) {
        await updateMutation.mutateAsync({ id: genre.id, name: trimmedName });
      } else {
        await createMutation.mutateAsync({ name: trimmedName });
      }
      onClose();
    } catch (mutationError) {
      const errorWithMessage = mutationError as { response?: { data?: { message?: string } }; message?: string };
      setError(errorWithMessage.response?.data?.message ?? errorWithMessage.message ?? 'Failed to save genre');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#1e2638] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a3a52] px-6 py-4">
          <h2 className="text-base font-semibold text-white">{genre ? 'Edit Genre' : 'New Genre'}</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-[#7a8faa] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Genre name"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#2a3a52] px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg bg-[#2a3a52] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#354a62] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-lg bg-[#3dc9b0] px-5 py-2 text-sm font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminGenresPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((state) => state.isBootstrapped);
  const [query, setQuery] = useState('');
  const [genreModal, setGenreModal] = useState<{ open: boolean; genre?: AdminGenre }>({ open: false });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: genres = [], isLoading, error } = useAdminGenresQuery();
  const deleteMutation = useAdminDeleteGenreMutation();

  const filteredGenres = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return genres;

    return genres.filter((genre) =>
      [genre.name, genre.slug].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [genres, query]);

  const usedGenres = genres.filter((genre) => genre.usage.total > 0).length;
  const totalAssignments = genres.reduce((sum, genre) => sum + genre.usage.total, 0);

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shapes size={18} className="text-[#3dc9b0]" />
          <div>
            <h1 className="text-xl font-semibold text-white">Genres</h1>
            <p className="text-sm text-[#7a8faa]">Admin-managed genre options for content metadata</p>
          </div>
        </div>

        <button
          onClick={() => setGenreModal({ open: true })}
          className="flex items-center gap-2 rounded-lg bg-[#3dc9b0] px-4 py-2 text-sm font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a]"
        >
          <Plus size={16} />
          New Genre
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Genres</p>
          <p className="text-2xl font-semibold text-white">{genres.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">In Use</p>
          <p className="text-2xl font-semibold text-white">{usedGenres}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Assignments</p>
          <p className="text-2xl font-semibold text-white">{totalAssignments}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            type="text"
            placeholder="Search genres…"
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
                <th className={thClass}>Genre</th>
                <th className={thClass}>Slug</th>
                <th className={thCenterClass}>Tracks</th>
                <th className={thCenterClass}>Albums</th>
                <th className={thCenterClass}>Audiobooks</th>
                <th className={thCenterClass}>Total</th>
                <th className={thCenterClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading genres…
                  </td>
                </tr>
              )}
              {!isLoading && filteredGenres.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-[#7a8faa]">
                    {genres.length === 0 ? 'No genres yet. Click "New Genre" to create one.' : 'No genres match your search.'}
                  </td>
                </tr>
              )}
              {filteredGenres.map((genre) => {
                const GenreIcon = getGenreIcon(genre.name);

                return (
                  <tr key={genre.id} className="border-t border-[#2a3a52] transition-colors hover:bg-[#253050]/50">
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#253050] text-[#3dc9b0]">
                          <GenreIcon size={14} />
                        </span>
                        <span className="font-medium">{genre.name}</span>
                      </div>
                    </td>
                    <td className={tdMuted}>{genre.slug}</td>
                    <td className={tdMutedCenter}>{genre.usage.tracks}</td>
                    <td className={tdMutedCenter}>{genre.usage.albums}</td>
                    <td className={tdMutedCenter}>{genre.usage.audiobooks}</td>
                    <td className={tdMutedCenter}>{genre.usage.total}</td>
                    <td className={tdCenterClass}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setGenreModal({ open: true, genre })}
                          className="rounded-lg p-1.5 text-[#7a8faa] transition-colors hover:bg-[#2a3a52] hover:text-white"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDeleteId(genre.id)}
                          className="rounded-lg p-1.5 text-[#7a8faa] transition-colors hover:bg-[#2a3a52] hover:text-[#f07282]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {genreModal.open && (
        <GenreModal genre={genreModal.genre} onClose={() => setGenreModal({ open: false })} />
      )}

      {confirmDeleteId && (
        <AdminConfirmModal
          title="Delete genre?"
          description="This removes the genre option only. Existing tracks, albums, and audiobooks keep their current genre text."
          confirmLabel="Delete"
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            deleteMutation.mutate(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
