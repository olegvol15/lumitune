import { useEffect, useMemo, useState } from 'react';
import { Music2, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useAdminTracksStore } from '../../store/adminTracksStore';
import { useSaveAdminTrackMutation } from '../../hooks/tracks';
import type { AdminTrack } from '../../types/admin/admin-tracks.types';
import { useAlbumsQuery } from '../../hooks/albums';
import { useAdminGenresQuery } from '../../hooks/admin-genres';
import { useAdminMoodsQuery } from '../../hooks/admin-moods';

const TAGS = [
  'top-100',
  'trending',
  'viral',
  'new-release',
  'classic',
  'featured',
  'chill',
  'workout',
  'party',
];

export default function TrackModal() {
  const { modal, closeModal } = useAdminTracksStore();
  const { open, mode, track } = modal;

  const [form, setForm] = useState<AdminTrack | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('/vite.svg');
  const [dragTarget, setDragTarget] = useState<'audio' | 'cover' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTrackMutation = useSaveAdminTrackMutation();
  const albumsQuery = useAlbumsQuery();
  const genresQuery = useAdminGenresQuery();
  const moodsQuery = useAdminMoodsQuery();
  const availableAlbums = albumsQuery.data ?? [];
  const currentGenre = form?.genreId || form?.genre || '';
  const currentMood = form?.moodId || form?.mood || '';
  const genreOptions = [
    ...(genresQuery.data?.map((genre) => genre.name) ?? []),
    ...(currentGenre && !genresQuery.data?.some((genre) => genre.name === currentGenre) ? [currentGenre] : []),
  ];
  const moodOptions = [
    ...(moodsQuery.data?.map((mood) => mood.name) ?? []),
    ...(currentMood && !moodsQuery.data?.some((mood) => mood.name === currentMood) ? [currentMood] : []),
  ];

  useEffect(() => {
    if (track) {
      // Reset modal-local draft fields when a different track is opened.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({ ...track });
      setAudioFile(null);
      setCoverFile(null);
      setCoverPreviewUrl(track.albumCover || '/vite.svg');
      setError(null);
    }
  }, [track]);
  const selectedAlbum = availableAlbums.find((album) => album.id === (form?.albumId ?? ''));
  const titleError = !form?.title.trim() ? 'Track title is required' : null;
  const audioError = mode === 'new' && !audioFile ? 'Audio file is required for new tracks' : null;

  useEffect(() => {
    if (!coverFile) {
      // Keep preview synced with the selected album or persisted cover when no new file is selected.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoverPreviewUrl(form?.albumCover || selectedAlbum?.coverUrl || '/vite.svg');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile, form?.albumCover, selectedAlbum?.coverUrl]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const audioSummary = useMemo(() => {
    if (audioFile) return audioFile.name;
    if (mode === 'edit' && form?.sourceFilePath) return form.sourceFilePath.split('/').pop() || 'Current audio file';
    return 'No audio file selected';
  }, [audioFile, form?.sourceFilePath, mode]);

  if (!open || !form) return null;

  const set = (field: keyof AdminTrack, value: AdminTrack[keyof AdminTrack]) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handleAlbumChange = (albumId: string) => {
    const album = availableAlbums.find((a) => a.id === albumId);
    setForm((prev) =>
      prev
        ? {
            ...prev,
            albumId,
            albumTitle: album?.title ?? '',
            albumCover: album?.coverUrl ?? '',
            artistName: album?.artistName ?? prev.artistName,
            artistId: album?.artistName ?? prev.artistId,
          }
        : prev
    );
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Track title is required');
      return;
    }
    if (mode === 'new' && !audioFile) {
      setError('Audio file is required for new tracks');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await saveTrackMutation.mutateAsync({ mode, track: form, audioFile, coverFile });
      closeModal();
    } catch (error) {
      const mutationError = error as { message?: string; response?: { data?: { message?: string } } };
      setError(mutationError.response?.data?.message ?? mutationError.message ?? 'Failed to save track');
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    if (track) {
      setForm({ ...track });
      setAudioFile(null);
      setCoverFile(null);
    }
  };

  const handleDropFile = (
    event: React.DragEvent<HTMLLabelElement>,
    target: 'audio' | 'cover'
  ) => {
    event.preventDefault();
    setDragTarget(null);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (target === 'audio') {
      if (!file.type.startsWith('audio/')) {
        setError('Please drop an audio file.');
        return;
      }
      setAudioFile(file);
      setError(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file.');
      return;
    }
    setCoverFile(file);
    setError(null);
  };

  const getUploadCardClass = (target: 'audio' | 'cover') =>
    `${uploadCardClass} ${
      dragTarget === target ? 'border-[#3dc9b0] bg-[#1d2b42] shadow-[0_0_0_1px_rgba(61,201,176,0.22)]' : ''
    }`;

  const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
  const inputClass =
    'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';
  const sectionTitleClass = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5f7391]';
  const panelClass = 'rounded-xl border border-[#2a3a52] bg-[#151d2e] p-4';
  const uploadCardClass =
    'group flex min-h-[132px] min-w-0 flex-col rounded-xl border border-dashed border-[#2a3a52] bg-[#19233a] p-4 text-left transition-colors hover:border-[#3dc9b0]';
  const saveDisabled = isSaving || Boolean(titleError) || Boolean(audioError);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-[#1e2638] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a52]">
          <div>
            <h2 className="text-white font-semibold text-base">
              {mode === 'new' ? 'New Track' : 'Edit Track'}
            </h2>
            <p className="mt-1 text-sm text-[#7a8faa]">
              {mode === 'new'
                ? 'Upload audio, add metadata, and optionally attach the track to an album.'
                : 'Update track details, files, and album placement.'}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-[#7a8faa] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-6 py-5">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-5">
              <section className={panelClass}>
                <p className={sectionTitleClass}>Details</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={labelClass}>Title *</label>
                    <input
                      type="text"
                      placeholder="Track title"
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                      className={inputClass}
                    />
                    {titleError && <p className="mt-1 text-xs text-red-400">{titleError}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Artist</label>
                    <input
                      type="text"
                      placeholder="Artist name"
                      value={form.artistName || form.artistId}
                      onChange={(e) => {
                        set('artistName', e.target.value);
                        set('artistId', e.target.value);
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Album</label>
                      <select
                        value={form.albumId}
                        onChange={(e) => handleAlbumChange(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">No album</option>
                        {availableAlbums.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.artistName} - {a.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Track Number</label>
                      <input
                        type="number"
                        min={1}
                        value={form.seqNum}
                        onChange={(e) => set('seqNum', Number(e.target.value) || 1)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Genre</label>
                      <select
                        value={currentGenre}
                        onChange={(e) => {
                          set('genreId', e.target.value);
                          set('genre', e.target.value);
                        }}
                        className={inputClass}
                      >
                        <option value="">Select genre</option>
                        {genreOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Mood</label>
                      <select
                        value={currentMood}
                        onChange={(e) => {
                          set('moodId', e.target.value);
                          set('mood', e.target.value);
                        }}
                        className={inputClass}
                      >
                        <option value="">Select mood</option>
                        {moodOptions.map((mood) => (
                          <option key={mood} value={mood}>
                            {mood}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Tag</label>
                      <select
                        value={form.tagsId}
                        onChange={(e) => set('tagsId', e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select tag</option>
                        {TAGS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Notes</label>
                    <textarea
                      rows={4}
                      placeholder="Additional info..."
                      value={form.info}
                      onChange={(e) => set('info', e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </section>

              <section className={panelClass}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={sectionTitleClass}>Metadata</p>
                    <p className="mt-1 text-xs text-[#7a8faa]">Reference fields used by the admin table and upload logic.</p>
                  </div>
                  <span className="rounded-full bg-[#253050] px-3 py-1 text-xs font-medium text-[#8ea4c2]">
                    {mode === 'new' ? 'Draft' : 'Saved'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Track ID</label>
                    <input
                      type="text"
                      value={form.id}
                      onChange={(e) => set('id', e.target.value)}
                      disabled
                      className={`${inputClass} cursor-not-allowed opacity-60`}
                    />
                  </div>
                  <div className="rounded-md border border-[#2a3a52] bg-[#19233a] px-3 py-2">
                    <span className="block text-[11px] uppercase tracking-wide text-[#5f7391]">Plays</span>
                    <span className="mt-1 block text-sm font-medium text-white">{form.playCount.toLocaleString()}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className={panelClass}>
                <p className={sectionTitleClass}>Assets</p>
                <div className="mt-4 space-y-3">
                  <label
                    className={getUploadCardClass('audio')}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragTarget('audio');
                    }}
                    onDragLeave={() => setDragTarget(null)}
                    onDrop={(event) => handleDropFile(event, 'audio')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-white">
                          <Music2 size={16} className="text-[#3dc9b0]" />
                          <span className="text-sm font-medium">Audio file {mode === 'new' ? '*' : ''}</span>
                        </div>
                        <p className="mt-1 max-w-full overflow-hidden break-words text-sm text-[#7a8faa]">{audioSummary}</p>
                      </div>
                      <Upload size={16} className="shrink-0 text-[#7a8faa] group-hover:text-[#3dc9b0]" />
                    </div>
                    <span className="mt-4 inline-flex w-fit rounded-full border border-[#2a3a52] px-2.5 py-1 text-xs text-[#8ea4c2]">
                      Choose audio
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {audioError && <p className="text-xs text-red-400">{audioError}</p>}

                  <label
                    className={getUploadCardClass('cover')}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragTarget('cover');
                    }}
                    onDragLeave={() => setDragTarget(null)}
                    onDrop={(event) => handleDropFile(event, 'cover')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-white">
                          <ImageIcon size={16} className="text-[#3dc9b0]" />
                          <span className="text-sm font-medium">Cover image</span>
                        </div>
                        <p className="mt-1 max-w-full overflow-hidden break-words text-sm text-[#7a8faa]">
                          {coverFile ? coverFile.name : 'Optional cover artwork for the track or single.'}
                        </p>
                      </div>
                      <Upload size={16} className="shrink-0 text-[#7a8faa] group-hover:text-[#3dc9b0]" />
                    </div>
                    <span className="mt-4 inline-flex w-fit rounded-full border border-[#2a3a52] px-2.5 py-1 text-xs text-[#8ea4c2]">
                      Choose image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </section>

              <section className={panelClass}>
                <p className={sectionTitleClass}>Preview</p>
                <div className="mt-4 flex min-w-0 items-center gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#19233a] shadow-inner">
                    <img src={coverPreviewUrl} alt={form.title || 'Track cover'} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-lg font-semibold text-white">{form.title || 'Untitled track'}</p>
                    <p className="mt-1 truncate text-sm text-[#7a8faa]">
                      {(form.artistName || form.artistId) || 'Unknown artist'}
                      {selectedAlbum ? ` · ${selectedAlbum.title}` : ''}
                    </p>
                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex max-w-full items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          form.adult ? 'bg-[#f07282]/20 text-[#f7a1ad]' : 'bg-[#253050] text-[#8ea4c2]'
                        }`}
                      >
                        {form.adult ? 'Explicit' : 'Clean'}
                      </span>
                      {form.genreId && (
                        <span className="inline-flex max-w-full items-center truncate rounded-full bg-[#253050] px-2.5 py-1 text-xs text-[#8ea4c2]">
                          {form.genreId}
                        </span>
                      )}
                      {currentMood && (
                        <span className="inline-flex max-w-full items-center truncate rounded-full bg-[#253050] px-2.5 py-1 text-xs text-[#8ea4c2]">
                          {currentMood}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className={panelClass}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={sectionTitleClass}>Content Flags</p>
                    <p className="mt-1 text-xs text-[#7a8faa]">Control how this track is labeled in the admin.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('adult', !form.adult)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      form.adult ? 'bg-[#3dc9b0]' : 'bg-[#2a3a52]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        form.adult ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#2a3a52] flex justify-end gap-3">
          {error && <p className="mr-auto text-xs text-red-400 self-center">{error}</p>}
          {mode === 'edit' && (
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#f07282] hover:bg-[#d9606f] transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saveDisabled}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
