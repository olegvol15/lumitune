import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Plus, Search, X } from 'lucide-react';
import type { Album } from '../../types';
import { useAdminTracksQuery } from '../../hooks/tracks';
import { useAlbumQuery, useAdminCreateAlbumMutation, useAdminUpdateAlbumMutation } from '../../hooks/albums';
import { useAdminGenresQuery } from '../../hooks/admin-genres';

interface Props {
  mode: 'new' | 'edit';
  album?: Album;
  onClose: () => void;
}

const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
const inputClass =
  'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

export default function AlbumModal({ mode, album, onClose }: Props) {
  const tracksQuery = useAdminTracksQuery();
  const albumDetailQuery = useAlbumQuery(album?.id ?? '');
  const genresQuery = useAdminGenresQuery();
  const createMutation = useAdminCreateAlbumMutation();
  const updateMutation = useAdminUpdateAlbumMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isEditLoading = mode === 'edit' && albumDetailQuery.isLoading;

  const [title, setTitle] = useState(album?.title ?? '');
  const [artistName, setArtistName] = useState(album?.artistName ?? '');
  const [genre, setGenre] = useState(album?.genre ?? '');
  const [description, setDescription] = useState(album?.description ?? '');
  const [releaseDate, setReleaseDate] = useState(album?.releaseDate?.slice(0, 10) ?? '');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(album?.trackIds ?? []);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(album?.coverUrl ?? '');
  const [trackToAdd, setTrackToAdd] = useState('');
  const [trackQuery, setTrackQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!album) return;
    setTitle(album.title);
    setArtistName(album.artistName);
    setGenre(album.genre);
    setDescription(album.description ?? '');
    setReleaseDate(album.releaseDate?.slice(0, 10) ?? '');
    setSelectedTrackIds(album.trackIds ?? []);
    setCoverFile(null);
    setCoverPreviewUrl(album.coverUrl ?? '');
    setTrackToAdd('');
    setTrackQuery('');
    setError(null);
  }, [album]);

  useEffect(() => {
    if (mode !== 'edit' || !albumDetailQuery.data) return;
    setSelectedTrackIds(albumDetailQuery.data.tracks.map((track) => track.id));
  }, [albumDetailQuery.data, mode]);

  const tracks = tracksQuery.data ?? [];
  const trackMap = useMemo(
    () => new Map(tracks.map((track) => [track.backendId || track.id, track])),
    [tracks]
  );
  const selectedTracks = selectedTrackIds
    .map((trackId) => trackMap.get(trackId))
    .filter((track): track is NonNullable<typeof track> => Boolean(track));
  const lockedArtist = selectedTracks[0]?.artistName?.trim() ?? '';
  const normalizedTrackQuery = trackQuery.trim().toLowerCase();
  const currentAlbumId = album?.id ?? '';
  const genreOptions = [
    ...(genresQuery.data?.map((item) => item.name) ?? []),
    ...(genre && !genresQuery.data?.some((item) => item.name === genre) ? [genre] : []),
  ];

  useEffect(() => {
    if (!lockedArtist) return;
    setArtistName((currentArtistName) => {
      const trimmed = currentArtistName.trim();
      if (!trimmed || trimmed === lockedArtist) return lockedArtist;
      return currentArtistName;
    });
  }, [lockedArtist]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(album?.coverUrl ?? '');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [album?.coverUrl, coverFile]);

  const availableTracks = useMemo(() => {
    return tracks.filter((track) => {
      const trackId = track.backendId || track.id;
      const isSelected = selectedTrackIds.includes(trackId);
      if (isSelected) return false;

      const sameArtist = !lockedArtist || track.artistName.trim().toLowerCase() === lockedArtist.toLowerCase();
      if (!sameArtist) return false;

      if (!normalizedTrackQuery) return true;

      return [track.title, track.artistName, track.albumTitle]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedTrackQuery));
    });
  }, [tracks, selectedTrackIds, lockedArtist, normalizedTrackQuery]);

  const toggleTrack = (trackId: string) => {
    setError(null);
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const handleAddTrackFromDropdown = (trackId: string) => {
    setTrackToAdd('');
    if (!trackId) return;
    setError(null);
    setSelectedTrackIds((prev) => (prev.includes(trackId) ? prev : [...prev, trackId]));
  };

  const moveTrack = (trackId: string, direction: -1 | 1) => {
    setSelectedTrackIds((prev) => {
      const index = prev.indexOf(trackId);
      if (index === -1) return prev;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (selectedTrackIds.length === 0) {
      setError('Albums must include at least one track');
      return;
    }

    const normalizedArtistName = artistName.trim() || lockedArtist;
    if (!normalizedArtistName) {
      setError('Artist is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('artistName', normalizedArtistName);
    if (genre.trim()) formData.append('genre', genre.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (releaseDate) formData.append('releaseDate', releaseDate);
    formData.append('trackIds', JSON.stringify(selectedTrackIds));
    if (coverFile) formData.append('cover', coverFile);

    try {
      setError(null);
      if (mode === 'new') {
        await createMutation.mutateAsync(formData);
      } else if (album) {
        await updateMutation.mutateAsync({ id: album.id, formData });
      }
      onClose();
    } catch (mutationError) {
      const errorWithMessage = mutationError as { response?: { data?: { message?: string } }; message?: string };
      setError(errorWithMessage.response?.data?.message ?? errorWithMessage.message ?? 'Failed to save album');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl rounded-2xl bg-[#1e2638] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#2a3a52] px-6 py-4">
          <h2 className="text-white font-semibold text-base">
            {mode === 'new' ? 'New Album' : 'Edit Album'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-[#7a8faa] hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Cover</label>
              <div className="flex items-center gap-3 rounded-xl border border-[#2a3a52] bg-[#151d2e] p-3">
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-[#19233a]">
                  {coverPreviewUrl ? (
                    <img src={coverPreviewUrl} alt={title || 'Album cover'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#4a5a72]">
                      No cover
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#2a3a52] bg-[#19233a] px-3 py-2 text-sm text-[#4a5a72] hover:border-[#3dc9b0] hover:text-[#3dc9b0] transition-colors">
                    <Plus size={14} />
                    <span className="truncate">{coverFile ? coverFile.name : 'Choose image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <p className="mt-2 text-xs text-[#7a8faa]">
                    {album?.coverUrl && !coverFile ? 'Using current cover until you replace it.' : 'PNG, JPG, or WebP recommended.'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Artist *</label>
              <input value={artistName} onChange={(e) => setArtistName(e.target.value)} className={inputClass} />
              {lockedArtist && (
                <p className="mt-1 text-xs text-[#3dc9b0]">Album locked to artist: {lockedArtist}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Genre</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass}>
                  <option value="">Select genre</option>
                  {genreOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Release Date</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Selected Tracks</label>
              <div className="rounded-xl border border-[#2a3a52] bg-[#151d2e]">
                {isEditLoading ? (
                  <div className="px-4 py-4 text-sm text-[#7a8faa]">Loading selected tracks…</div>
                ) : selectedTracks.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[#7a8faa]">No tracks selected</div>
                ) : (
                  selectedTracks.map((track, index) => {
                    const trackId = track.backendId || track.id;
                    return (
                      <div
                        key={trackId}
                        className="flex items-center gap-2 border-b border-[#2a3a52] px-3 py-2 last:border-b-0"
                      >
                        <span className="w-5 text-xs text-[#7a8faa]">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">{track.title}</p>
                          <p className="truncate text-xs text-[#7a8faa]">{track.artistName}</p>
                        </div>
                        <button
                          onClick={() => moveTrack(trackId, -1)}
                          className="p-1 text-[#7a8faa] hover:text-white"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveTrack(trackId, 1)}
                          className="p-1 text-[#7a8faa] hover:text-white"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => toggleTrack(trackId)}
                          className="p-1 text-[#f07282] hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
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
              <div className="mb-3">
                <label className={labelClass}>Add Track</label>
                <select
                  value={trackToAdd}
                  onChange={(event) => handleAddTrackFromDropdown(event.target.value)}
                  className={inputClass}
                >
                  <option value="">{lockedArtist ? `Select ${lockedArtist} track` : 'Select track'}</option>
                  {availableTracks.map((track) => {
                    const trackId = track.backendId || track.id;
                    return (
                      <option key={trackId} value={trackId}>
                        {track.artistName} - {track.title}{track.albumTitle ? ` (${track.albumTitle})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(event) => setTrackQuery(event.target.value)}
                  placeholder={lockedArtist ? `Search ${lockedArtist} tracks…` : 'Search tracks by title, artist, or album…'}
                  className="w-full rounded-lg border border-[#2a3a52] bg-[#19233a] py-2 pl-8 pr-3 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors"
                />
              </div>
              <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#2a3a52] bg-[#151d2e]">
                {tracksQuery.isLoading ? (
                  <div className="px-4 py-4 text-sm text-[#7a8faa]">Loading tracks…</div>
                ) : tracksQuery.error instanceof Error ? (
                  <div className="px-4 py-4 text-sm text-red-300">{tracksQuery.error.message}</div>
                ) : availableTracks.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[#7a8faa]">
                    {lockedArtist
                      ? `No ${lockedArtist} tracks match your search.`
                      : normalizedTrackQuery
                        ? 'No tracks match your search.'
                        : 'No tracks available.'}
                  </div>
                ) : availableTracks.map((track) => {
                  const trackId = track.backendId || track.id;
                  const belongsToOtherAlbum = Boolean(track.albumId && track.albumId !== currentAlbumId);
                  return (
                    <button
                      key={trackId}
                      onClick={() => toggleTrack(trackId)}
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
                      {belongsToOtherAlbum && (
                        <span className="rounded-full border border-[#f1b86a]/40 bg-[#f1b86a]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#f1b86a]">
                          Moves from {track.albumTitle || 'another album'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[#2a3a52] px-6 py-4">
          {error ? <p className="mr-auto text-xs text-red-400">{error}</p> : <span className="mr-auto" />}
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg bg-[#2a3a52] px-5 py-2 text-sm font-semibold text-white hover:bg-[#354a62] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving || isEditLoading}
            className="rounded-lg bg-[#3dc9b0] px-5 py-2 text-sm font-semibold text-[#1a2030] hover:bg-[#35b09a] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
