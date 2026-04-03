import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useUploadEpisodeMutation, useUpdateEpisodeMutation } from '../../hooks/podcasts';
import type { Episode } from '../../types';

interface Props {
  podcastId: string;
  podcastTitle: string;
  mode: 'new' | 'edit';
  episode?: Episode;
  nextEpisodeNumber: number;
  onClose: () => void;
}

const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
const inputClass =
  'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

export default function EpisodeModal({
  podcastId,
  podcastTitle,
  mode,
  episode,
  nextEpisodeNumber,
  onClose,
}: Props) {
  const [title, setTitle] = useState(episode?.title ?? '');
  const [description, setDescription] = useState(episode?.description ?? '');
  const [episodeNumber, setEpisodeNumber] = useState(episode?.episodeNumber ?? nextEpisodeNumber);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadEpisodeMutation(podcastId);
  const updateMutation = useUpdateEpisodeMutation(podcastId);

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (mode === 'new' && !audioFile) { setError('Audio file is required'); return; }
    setIsSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('episodeNumber', String(episodeNumber));
      if (audioFile) formData.append('audio', audioFile);
      if (coverFile) formData.append('cover', coverFile);

      if (mode === 'new') {
        await uploadMutation.mutateAsync(formData);
      } else if (episode) {
        await updateMutation.mutateAsync({ episodeId: episode.id, formData });
      }
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message ?? e.message ?? 'Failed to save');
    }
    setIsSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a52]">
          <div>
            <h2 className="text-white font-semibold text-base">
              {mode === 'new' ? 'New Episode' : 'Edit Episode'}
            </h2>
            <p className="text-[#7a8faa] text-xs mt-0.5">{podcastTitle}</p>
          </div>
          <button onClick={onClose} className="text-[#7a8faa] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                placeholder="Episode title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Episode #</label>
              <input
                type="number"
                min={1}
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              placeholder="What's this episode about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Audio File {mode === 'new' ? '*' : '(leave empty to keep existing)'}
              </label>
              <label className="flex items-center gap-2 cursor-pointer w-full bg-[#19233a] border border-[#2a3a52] border-dashed rounded-md px-3 py-2 text-sm text-[#4a5a72] hover:border-[#3dc9b0] hover:text-[#3dc9b0] transition-colors">
                <Upload size={14} />
                <span className="truncate">{audioFile ? audioFile.name : 'Choose audio'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div>
              <label className={labelClass}>Cover Image</label>
              <label className="flex items-center gap-2 cursor-pointer w-full bg-[#19233a] border border-[#2a3a52] border-dashed rounded-md px-3 py-2 text-sm text-[#4a5a72] hover:border-[#3dc9b0] hover:text-[#3dc9b0] transition-colors">
                <Upload size={14} />
                <span className="truncate">{coverFile ? coverFile.name : 'Choose image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#2a3a52] flex justify-end gap-3">
          {error && <p className="mr-auto text-xs text-red-400 self-center">{error}</p>}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving…' : mode === 'new' ? 'Upload Episode' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
