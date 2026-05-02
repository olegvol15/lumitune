import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  BadgeCheck,
  Image,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  useAdminArtistsQuery,
  useAdminCreateArtistMutation,
  useAdminDeleteArtistMutation,
  useAdminUpdateArtistMutation,
} from '../../hooks/admin-artists';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import type { AdminArtist, AdminArtistPayload } from '../../types/admin/admin-artists.types';

export const Route = createFileRoute('/admin/artists')({ component: AdminArtistsPage });

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

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const emptyPayload: AdminArtistPayload = {
  name: '',
  slug: '',
  image: '',
  bannerImage: '',
  genre: '',
  bio: '',
  verified: false,
  artistUserId: '',
};

function ArtistModal({
  artist,
  onClose,
}: {
  artist?: AdminArtist;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AdminArtistPayload>(() =>
    artist
      ? {
          name: artist.name,
          slug: artist.slug,
          image: artist.image,
          bannerImage: artist.bannerImage,
          genre: artist.genre,
          bio: artist.bio,
          verified: artist.verified,
          artistUserId: artist.artistUserId ?? '',
        }
      : emptyPayload
  );
  const [error, setError] = useState<string | null>(null);
  const createMutation = useAdminCreateArtistMutation();
  const updateMutation = useAdminUpdateArtistMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const setField = <K extends keyof AdminArtistPayload>(
    key: K,
    value: AdminArtistPayload[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('Artist name is required');
      return;
    }

    const payload: AdminArtistPayload = {
      name,
      slug: form.slug?.trim() || slugify(name),
      image: form.image?.trim(),
      bannerImage: form.bannerImage?.trim(),
      genre: form.genre?.trim(),
      bio: form.bio?.trim(),
      verified: Boolean(form.verified),
      artistUserId: form.artistUserId?.trim(),
    };

    try {
      setError(null);
      if (artist) {
        await updateMutation.mutateAsync({ id: artist.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (mutationError) {
      const errorWithMessage = mutationError as { response?: { data?: { message?: string } }; message?: string };
      setError(errorWithMessage.response?.data?.message ?? errorWithMessage.message ?? 'Failed to save artist');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#1e2638] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a3a52] px-6 py-4">
          <h2 className="text-base font-semibold text-white">{artist ? 'Edit Artist' : 'New Artist'}</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-[#7a8faa] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-132px)] space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Name *</label>
              <input
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                className={inputClass}
                placeholder="Artist name"
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                value={form.slug}
                onChange={(event) => setField('slug', event.target.value)}
                className={inputClass}
                placeholder="auto-generated from name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Avatar Image</label>
              <input
                value={form.image}
                onChange={(event) => setField('image', event.target.value)}
                className={inputClass}
                placeholder="/uploads/artists/avatar.jpg"
              />
            </div>
            <div>
              <label className={labelClass}>Banner Image</label>
              <input
                value={form.bannerImage}
                onChange={(event) => setField('bannerImage', event.target.value)}
                className={inputClass}
                placeholder="/uploads/artists/banner.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Genre</label>
              <input
                value={form.genre}
                onChange={(event) => setField('genre', event.target.value)}
                className={inputClass}
                placeholder="Pop"
              />
            </div>
            <div>
              <label className={labelClass}>Linked User ID</label>
              <input
                value={form.artistUserId}
                onChange={(event) => setField('artistUserId', event.target.value)}
                className={inputClass}
                placeholder="Optional creator user id"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(event) => setField('bio', event.target.value)}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder="Short artist biography"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={Boolean(form.verified)}
              onChange={(event) => setField('verified', event.target.checked)}
              className="h-4 w-4 rounded border-[#2a3a52] accent-[#3dc9b0]"
            />
            Verified artist
          </label>

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
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminArtistsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((state) => state.isBootstrapped);
  const [query, setQuery] = useState('');
  const [artistModal, setArtistModal] = useState<{ open: boolean; artist?: AdminArtist }>({ open: false });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: artists = [], isLoading, error } = useAdminArtistsQuery();
  const deleteMutation = useAdminDeleteArtistMutation();

  const filteredArtists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return artists;

    return artists.filter((artist) =>
      [artist.name, artist.slug, artist.genre, artist.bio]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [artists, query]);

  const verifiedArtists = artists.filter((artist) => artist.verified).length;
  const totalListeners = artists.reduce((sum, artist) => sum + artist.monthlyListeners, 0);
  const totalTracks = artists.reduce((sum, artist) => sum + artist.trackCount, 0);

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UserRound size={18} className="text-[#3dc9b0]" />
          <div>
            <h1 className="text-xl font-semibold text-white">Artists</h1>
            <p className="text-sm text-[#7a8faa]">Artist profiles used by public artist pages</p>
          </div>
        </div>

        <button
          onClick={() => setArtistModal({ open: true })}
          className="flex items-center gap-2 rounded-lg bg-[#3dc9b0] px-4 py-2 text-sm font-semibold text-[#1a2030] transition-colors hover:bg-[#35b09a]"
        >
          <Plus size={16} />
          New Artist
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Artists</p>
          <p className="text-2xl font-semibold text-white">{artists.length}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Verified</p>
          <p className="text-2xl font-semibold text-white">{verifiedArtists}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Monthly Listeners</p>
          <p className="text-2xl font-semibold text-white">{totalListeners.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[#2a3a52] bg-[#1e2638] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8faa]">Tracks</p>
          <p className="text-2xl font-semibold text-white">{totalTracks.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            type="text"
            placeholder="Search artists..."
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
          <table className="w-full min-w-[980px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass}>Artist</th>
                <th className={thClass}>Slug</th>
                <th className={thClass}>Genre</th>
                <th className={thCenterClass}>Listeners</th>
                <th className={thCenterClass}>Followers</th>
                <th className={thCenterClass}>Tracks</th>
                <th className={thCenterClass}>Status</th>
                <th className={thCenterClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-[#7a8faa]">
                    Loading artists...
                  </td>
                </tr>
              )}
              {!isLoading && filteredArtists.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-[#7a8faa]">
                    {artists.length === 0 ? 'No artists yet. Click "New Artist" to create one.' : 'No artists match your search.'}
                  </td>
                </tr>
              )}
              {filteredArtists.map((artist) => (
                <tr key={artist.id} className="border-t border-[#2a3a52] transition-colors hover:bg-[#253050]/50">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      {artist.image ? (
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#253050] text-[#3dc9b0]">
                          <Image size={16} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="max-w-[190px] truncate font-medium">{artist.name}</span>
                          {artist.verified && <BadgeCheck size={14} className="shrink-0 text-[#3dc9b0]" />}
                        </div>
                        <p className="max-w-[240px] truncate text-xs text-[#7a8faa]">
                          {artist.bio || 'No bio yet'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={tdMuted}>{artist.slug}</td>
                  <td className={tdMuted}>{artist.genre || '-'}</td>
                  <td className={tdMutedCenter}>{artist.monthlyListeners.toLocaleString()}</td>
                  <td className={tdMutedCenter}>{artist.followers.toLocaleString()}</td>
                  <td className={tdMutedCenter}>{artist.trackCount.toLocaleString()}</td>
                  <td className={tdMutedCenter}>{artist.verified ? 'Verified' : 'Standard'}</td>
                  <td className={tdCenterClass}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Edit"
                        onClick={() => setArtistModal({ open: true, artist })}
                        className="rounded-lg p-1.5 text-[#7a8faa] transition-colors hover:bg-[#2a3a52] hover:text-white"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setConfirmDeleteId(artist.id)}
                        className="rounded-lg p-1.5 text-[#7a8faa] transition-colors hover:bg-[#2a3a52] hover:text-[#f07282]"
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

      {artistModal.open && (
        <ArtistModal artist={artistModal.artist} onClose={() => setArtistModal({ open: false })} />
      )}

      {confirmDeleteId && (
        <AdminConfirmModal
          title="Delete artist?"
          description="This removes the curated artist profile. Existing songs and albums keep their artist text."
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
