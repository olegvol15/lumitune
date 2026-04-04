import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Plus, X } from 'lucide-react';
import type { Album } from '../../types';
import { useAdminTracksQuery } from '../../hooks/tracks';
import { useAlbumQuery, useAdminCreateAlbumMutation, useAdminUpdateAlbumMutation } from '../../hooks/albums';

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
  const createMutation = useAdminCreateAlbumMutation();
  const updateMutation = useAdminUpdateAlbumMutation();

  const [title, setTitle] = useState(album?.title ?? '');
  const [artistName, setArtistName] = useState(album?.artistName ?? '');
  const [genre, setGenre] = useState(album?.genre ?? '');
  const [description, setDescription] = useState(album?.description ?? '');
  const [releaseDate, setReleaseDate] = useState(album?.releaseDate?.slice(0, 10) ?? '');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(album?.trackIds ?? []);
  const [coverFile, setCoverFile] = useState<File | null>(null);
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
  }, [album]);

  useEffect(() => {
    if (mode !== 'edit' || !albumDetailQuery.data) return;
    setSelectedTrackIds(albumDetailQuery.data.tracks.map((track) => track.id));
  }, [albumDetailQuery.data, mode]);

  const tracks = tracksQuery.data ?? [];
  const selectedTracks = selectedTrackIds
    .map((trackId) => tracks.find((track) => track.backendId === trackId || track.id === trackId))
    .filter((track): track is NonNullable<typeof track> => Boolean(track));

  const toggleTrack = (trackId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
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
    if (!title.trim() || !artistName.trim()) {
      setError('Title and artist are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('artistName', artistName.trim());
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
          <button onClick={onClose} className="text-[#7a8faa] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Artist *</label>
              <input value={artistName} onChange={(e) => setArtistName(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Genre</label>
                <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass} />
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
            <div>
              <label className={labelClass}>Cover</label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#2a3a52] bg-[#19233a] px-3 py-2 text-sm text-[#4a5a72] hover:border-[#3dc9b0] hover:text-[#3dc9b0] transition-colors">
                <Plus size={14} />
                <span>{coverFile ? coverFile.name : 'Choose image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Selected Tracks</label>
              <div className="rounded-xl border border-[#2a3a52] bg-[#151d2e]">
                {selectedTracks.length === 0 ? (
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
              <label className={labelClass}>Available Tracks</label>
              <div className="max-h-[320px] overflow-y-auto rounded-xl border border-[#2a3a52] bg-[#151d2e]">
                {tracks.map((track) => {
                  const trackId = track.backendId || track.id;
                  const selected = selectedTrackIds.includes(trackId);
                  return (
                    <button
                      key={trackId}
                      onClick={() => toggleTrack(trackId)}
                      className={`flex w-full items-center gap-3 border-b border-[#2a3a52] px-3 py-2 text-left last:border-b-0 ${
                        selected ? 'bg-[#253050]' : 'hover:bg-[#1e2840]/50'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border ${
                          selected
                            ? 'border-[#3dc9b0] bg-[#3dc9b0] text-[#1a2030]'
                            : 'border-[#4a5a72] text-transparent'
                        }`}
                      >
                        <Check size={12} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{track.title}</p>
                        <p className="truncate text-xs text-[#7a8faa]">
                          {track.artistName} {track.albumTitle ? `· ${track.albumTitle}` : ''}
                        </p>
                      </div>
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
            className="rounded-lg bg-[#2a3a52] px-5 py-2 text-sm font-semibold text-white hover:bg-[#354a62] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            className="rounded-lg bg-[#3dc9b0] px-5 py-2 text-sm font-semibold text-[#1a2030] hover:bg-[#35b09a] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
