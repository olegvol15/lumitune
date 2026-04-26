import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Droplets,
  Heart,
  Music2,
  Pencil,
  Plus,
  Search,
  Smile,
  Sun,
  Trash2,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  useAdminCreateMoodMutation,
  useAdminDeleteMoodMutation,
  useAdminMoodsQuery,
  useAdminUpdateMoodMutation,
} from '../../hooks/admin-moods';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import type { AdminMood } from '../../types/admin/admin-moods.types';

export const Route = createFileRoute('/admin/moods')({ component: AdminMoodsPage });

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

const moodIcons: Record<string, LucideIcon> = {
  calm: Smile,
  drive: Zap,
  energetic: Zap,
  energy: Zap,
  happy: Sun,
  inspired: Sun,
  love: Heart,
  melancholy: Droplets,
  party: Music2,
  romance: Heart,
  sad: Droplets,
};

const normalizeMoodIconKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getMoodIcon = (name: string): LucideIcon => moodIcons[normalizeMoodIconKey(name)] ?? Smile;

function MoodModal({ mood, onClose }: { mood?: AdminMood; onClose: () => void }) {
  const [name, setName] = useState(mood?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const createMutation = useAdminCreateMoodMutation();
  const updateMutation = useAdminUpdateMoodMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Mood name is required');
      return;
    }

    try {
      setError(null);
      if (mood) {
        await updateMutation.mutateAsync({ id: mood.id, name: trimmedName });
      } else {
        await createMutation.mutateAsync({ name: trimmedName });
      }
      onClose();
    } catch (mutationError) {
      const errorWithMessage = mutationError as { response?: { data?: { message?: string } }; message?: string };
      setError(errorWithMessage.response?.data?.message ?? errorWithMessage.message ?? 'Failed to save mood');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#1e2638] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a3a52] px-6 py-4">
          <h2 className="text-base font-semibold text-white">{mood ? 'Edit Mood' : 'New Mood'}</h2>
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
              placeholder="Mood name"
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

function AdminMoodsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((state) => state.isBootstrapped);
  const [query, setQuery] = useState('');
  const [moodModal, setMoodModal] = useState<{ open: boolean; mood?: AdminMood }>({ open: false });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: moods = [], isLoading, error } = useAdminMoodsQuery();
  const deleteMutation = useAdminDeleteMoodMutation();

  const filteredMoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return moods;

    return moods.filter((mood) =>
      [mood.name, mood.slug].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [moods, query]);

  const usedMoods = moods.filter((mood) => mood.usage.total > 0).length;
  const totalAssignments = moods.reduce((sum, mood) => sum + mood.usage.total, 0);

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Smile size={18} className="text-[#3dc9b0]" />
          <div>
            <h1 className="text-xl font-semibold text-white">Moods</h1>
            <p className="text-sm text-[#7a8faa]">Track mood options for creator and admin metadata</p>
          </div>
        </div>

        <button
          onClick={() => setMoodModal({ open: true })}
          className="flex items-center gap-2 rounded-lg bg-[#3dc9b0] px-4 py-2 text-sm font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a]"
        >
          <Plus size={16} />
          New Mood
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Moods</p>
          <p className="text-2xl font-semibold text-white">{moods.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">In Use</p>
          <p className="text-2xl font-semibold text-white">{usedMoods}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Track Assignments</p>
          <p className="text-2xl font-semibold text-white">{totalAssignments}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            type="text"
            placeholder="Search moods…"
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
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass}>Mood</th>
                <th className={thClass}>Slug</th>
                <th className={thCenterClass}>Tracks</th>
                <th className={thCenterClass}>Total</th>
                <th className={thCenterClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading moods…
                  </td>
                </tr>
              )}
              {!isLoading && filteredMoods.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#7a8faa]">
                    {moods.length === 0 ? 'No moods yet. Click "New Mood" to create one.' : 'No moods match your search.'}
                  </td>
                </tr>
              )}
              {filteredMoods.map((mood) => {
                const MoodIcon = getMoodIcon(mood.name);

                return (
                  <tr key={mood.id} className="border-t border-[#2a3a52] transition-colors hover:bg-[#253050]/50">
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#253050] text-[#3dc9b0]">
                          <MoodIcon size={14} />
                        </span>
                        <span className="font-medium">{mood.name}</span>
                      </div>
                    </td>
                    <td className={tdMuted}>{mood.slug}</td>
                    <td className={tdMutedCenter}>{mood.usage.tracks}</td>
                    <td className={tdMutedCenter}>{mood.usage.total}</td>
                    <td className={tdCenterClass}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setMoodModal({ open: true, mood })}
                          className="rounded-lg p-1.5 text-[#7a8faa] transition-colors hover:bg-[#2a3a52] hover:text-white"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDeleteId(mood.id)}
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

      {moodModal.open && (
        <MoodModal mood={moodModal.mood} onClose={() => setMoodModal({ open: false })} />
      )}

      {confirmDeleteId && (
        <AdminConfirmModal
          title="Delete mood?"
          description="This removes the mood option only. Existing tracks keep their current mood text."
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
