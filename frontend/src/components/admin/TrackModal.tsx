import { useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { type AdminTrack, useAdminTracksStore } from '../../store/adminTracksStore';
import { albums } from '../../data/albums';

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'R&B', 'K-Pop', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin'];
const TAGS = ['top-100', 'trending', 'viral', 'new-release', 'classic', 'featured', 'chill', 'workout', 'party'];

export default function TrackModal() {
  const { modal, closeModal, saveTrack } = useAdminTracksStore();
  const { open, mode, track } = modal;

  const [form, setForm] = useState<AdminTrack | null>(null);

  useEffect(() => {
    if (track) setForm({ ...track });
  }, [track]);

  if (!open || !form) return null;

  const set = (field: keyof AdminTrack, value: AdminTrack[keyof AdminTrack]) =>
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);

  const handleAlbumChange = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId);
    setForm((prev) =>
      prev
        ? {
            ...prev,
            albumId,
            albumTitle: album?.title ?? '',
            albumCover: album?.coverUrl ?? '',
          }
        : prev,
    );
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    saveTrack(form);
  };

  const handleReset = () => {
    if (track) setForm({ ...track });
  };

  const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
  const inputClass =
    'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="w-full max-w-lg bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a52]">
          <h2 className="text-white font-semibold text-base">
            {mode === 'new' ? 'New Track' : 'Edit Track'}
          </h2>
          <button
            onClick={closeModal}
            className="text-[#7a8faa] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name Track */}
          <div>
            <label className={labelClass}>Name Track</label>
            <input
              type="text"
              placeholder="Track title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* ID + ArtistId */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>ID</label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => set('id', e.target.value)}
                disabled={mode === 'edit'}
                className={`${inputClass} ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className={labelClass}>ArtistId</label>
              <input
                type="text"
                placeholder="e.g. a1"
                value={form.artistId}
                onChange={(e) => set('artistId', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* AlbumId + SeqNumber */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>AlbumId</label>
              <select
                value={form.albumId}
                onChange={(e) => handleAlbumChange(e.target.value)}
                className={inputClass}
              >
                <option value="">— select album —</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>SeqNumber</label>
              <input
                type="number"
                min={1}
                value={form.seqNum}
                onChange={(e) => set('seqNum', Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          {/* GenreId + TagsId */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>GenreId</label>
              <select
                value={form.genreId}
                onChange={(e) => set('genreId', e.target.value)}
                className={inputClass}
              >
                <option value="">— select genre —</option>
                {GENRES.map((g) => (
                  <option key={g} value={g.toLowerCase().replace(/\s+/g, '-')}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>TagsId</label>
              <select
                value={form.tagsId}
                onChange={(e) => set('tagsId', e.target.value)}
                className={inputClass}
              >
                <option value="">— select tag —</option>
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Import Track + Import Picture */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Import Track</label>
              <label className="flex items-center gap-2 cursor-pointer w-full bg-[#19233a] border border-[#2a3a52] border-dashed rounded-md px-3 py-2 text-sm text-[#4a5a72] hover:border-[#3dc9b0] hover:text-[#3dc9b0] transition-colors">
                <Upload size={14} />
                <span>Choose file</span>
                <input type="file" accept="audio/*" className="hidden" />
              </label>
            </div>
            <div>
              <label className={labelClass}>Import Picture</label>
              <label className="flex items-center gap-2 cursor-pointer w-full bg-[#19233a] border border-[#2a3a52] border-dashed rounded-md px-3 py-2 text-sm text-[#4a5a72] hover:border-[#3dc9b0] hover:text-[#3dc9b0] transition-colors">
                <Upload size={14} />
                <span>Choose file</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Adult toggle */}
          <div className="flex items-center gap-3">
            <label className={`${labelClass} mb-0`}>Adult content</label>
            <button
              type="button"
              onClick={() => set('adult', !form.adult)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                form.adult ? 'bg-[#3dc9b0]' : 'bg-[#2a3a52]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  form.adult ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Info */}
          <div>
            <label className={labelClass}>Info</label>
            <textarea
              rows={3}
              placeholder="Additional info..."
              value={form.info}
              onChange={(e) => set('info', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-[#2a3a52] flex justify-end gap-3">
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
            className="px-5 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
