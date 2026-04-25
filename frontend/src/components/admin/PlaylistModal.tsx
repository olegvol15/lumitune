import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Search, X } from 'lucide-react';
import type { AdminPlaylist } from '../../types/admin/admin-playlists.types';
import { useAdminTracksQuery } from '../../hooks/tracks';
import {
  useAdminAddSongToPlaylistMutation,
  useAdminCreatePlaylistMutation,
  useAdminRemoveSongFromPlaylistMutation,
  useAdminUpdatePlaylistMutation,
} from '../../hooks/admin-playlists';

interface Props {
  mode: 'new' | 'edit';
  playlist?: AdminPlaylist;
  onClose: () => void;
}

const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
const inputClass =
  'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

export default function PlaylistModal({ mode, playlist, onClose }: Props) {
  const tracksQuery = useAdminTracksQuery();
  const createMutation = useAdminCreatePlaylistMutation();
  const updateMutation = useAdminUpdatePlaylistMutation();
  const addSongMutation = useAdminAddSongToPlaylistMutation();
  const removeSongMutation = useAdminRemoveSongFromPlaylistMutation();
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    addSongMutation.isPending ||
    removeSongMutation.isPending;

  const [title, setTitle] = useState(playlist?.title ?? '');
  const [description, setDescription] = useState(playlist?.description ?? '');
  const [coverUrl, setCoverUrl] = useState(playlist?.coverUrl ?? '');
  const [isPublic, setIsPublic] = useState(playlist?.isPublic ?? true);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(playlist?.trackIds ?? []);
  const [trackQuery, setTrackQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playlist) return;
    setTitle(playlist.title);
    setDescription(playlist.description ?? '');
    setCoverUrl(playlist.coverUrl ?? '');
    setIsPublic(playlist.isPublic);
    setSelectedTrackIds(playlist.trackIds);
    setTrackQuery('');
    setError(null);
  }, [playlist]);

  const tracks = tracksQuery.data ?? [];
  const selectedTracks = selectedTrackIds
    .map((trackId) => tracks.find((track) => track.id === trackId))
    .filter((track): track is NonNullable<typeof track> => Boolean(track));

  const availableTracks = useMemo(() => {
    const normalizedQuery = trackQuery.trim().toLowerCase();
    return tracks.filter((track) => {
      if (selectedTrackIds.includes(track.id)) return false;
      if (!normalizedQuery) return true;
      return [track.title, track.artistName, track.albumTitle]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [selectedTrackIds, trackQuery, tracks]);

  const toggleTrack = (trackId: string) => {
    setError(null);
    setSelectedTrackIds((current) =>
      current.includes(trackId) ? current.filter((id) => id !== trackId) : [...current, trackId]
    );
  };

  const moveTrack = (trackId: string, direction: -1 | 1) => {
    setSelectedTrackIds((current) => {
      const index = current.indexOf(trackId);
      if (index === -1) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Playlist title is required');
      return;
    }

    try {
      setError(null);

      const payload = {
        name: title.trim(),
        description: description.trim() || undefined,
        coverImage: coverUrl.trim() || undefined,
        isPublic,
      };

      const response =
        mode === 'new'
          ? await createMutation.mutateAsync(payload)
          : await updateMutation.mutateAsync({ id: playlist!.id, payload });

      const playlistId = response.data.playlist._id;
      const initialTrackIds = playlist?.trackIds ?? [];
      const hasTrackChanges =
        initialTrackIds.length !== selectedTrackIds.length ||
        initialTrackIds.some((trackId, index) => trackId !== selectedTrackIds[index]);

      if (mode === 'new') {
        for (const trackId of selectedTrackIds) {
          await addSongMutation.mutateAsync({ playlistId, songId: trackId });
        }
      } else if (hasTrackChanges) {
        for (const trackId of initialTrackIds) {
          await removeSongMutation.mutateAsync({ playlistId, songId: trackId });
        }
        for (const trackId of selectedTrackIds) {
          await addSongMutation.mutateAsync({ playlistId, songId: trackId });
        }
      }

      onClose();
    } catch (mutationError) {
      const errorWithMessage = mutationError as { response?: { data?: { message?: string } }; message?: string };
      setError(errorWithMessage.response?.data?.message ?? errorWithMessage.message ?? 'Failed to save playlist');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-[#1e2638] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a3a52] px-6 py-4">
          <h2 className="text-white font-semibold text-base">
            {mode === 'new' ? 'New Curated Playlist' : 'Edit Curated Playlist'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-[#7a8faa] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid max-h-[80vh] gap-6 overflow-y-auto px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Cover URL</label>
              <input
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div className="rounded-xl border border-[#2a3a52] bg-[#151d2e] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Visibility</p>
                  <p className="mt-1 text-xs text-[#7a8faa]">
                    Public playlists are visible in the user app.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic((current) => !current)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isPublic ? 'bg-[#3dc9b0]' : 'bg-[#2a3a52]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      isPublic ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Selected Tracks</label>
              <div className="rounded-xl border border-[#2a3a52] bg-[#151d2e]">
                {selectedTracks.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[#7a8faa]">No tracks selected</div>
                ) : (
                  selectedTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-2 border-b border-[#2a3a52] px-3 py-2 last:border-b-0"
                    >
                      <span className="w-5 text-xs text-[#7a8faa]">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{track.title}</p>
                        <p className="truncate text-xs text-[#7a8faa]">{track.artistName}</p>
                      </div>
                      <button onClick={() => moveTrack(track.id, -1)} className="p-1 text-[#7a8faa] hover:text-white">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveTrack(track.id, 1)} className="p-1 text-[#7a8faa] hover:text-white">
                        <ArrowDown size={14} />
                      </button>
                      <button onClick={() => toggleTrack(track.id)} className="p-1 text-[#f07282] hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className={labelClass}>Available Tracks</label>
                <span className="text-xs text-[#7a8faa]">
                  {availableTracks.length} {availableTracks.length === 1 ? 'track' : 'tracks'}
                </span>
              </div>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(event) => setTrackQuery(event.target.value)}
                  placeholder="Search tracks by title, artist, or album…"
                  className="w-full rounded-lg border border-[#2a3a52] bg-[#19233a] py-2 pl-8 pr-3 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors"
                />
              </div>
              <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#2a3a52] bg-[#151d2e]">
                {tracksQuery.isLoading ? (
                  <div className="px-4 py-4 text-sm text-[#7a8faa]">Loading tracks…</div>
                ) : availableTracks.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[#7a8faa]">
                    {trackQuery.trim() ? 'No tracks match your search.' : 'No tracks available.'}
                  </div>
                ) : (
                  availableTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => toggleTrack(track.id)}
                      className="flex w-full items-center gap-3 border-b border-[#2a3a52] px-3 py-2 text-left last:border-b-0 hover:bg-[#1e2840]/50"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded border border-[#4a5a72] text-transparent">
                        <Check size={12} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{track.title}</p>
                        <p className="truncate text-xs text-[#7a8faa]">
                          {track.artistName} {track.albumTitle ? `· ${track.albumTitle}` : ''}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[#2a3a52] px-6 py-4">
          {error ? <p className="mr-auto text-xs text-red-400">{error}</p> : <span className="mr-auto" />}
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
