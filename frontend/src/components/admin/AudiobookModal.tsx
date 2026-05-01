import { useState, type DragEvent } from 'react';
import { X, Upload } from 'lucide-react';
import { useCreateAudiobookMutation, useUpdateAudiobookMutation } from '../../hooks/audiobooks';
import { useAdminGenresQuery } from '../../hooks/admin-genres';
import { useI18n } from '../../lib/i18n';
import type { Audiobook } from '../../types';

interface Props {
  mode: 'new' | 'edit';
  audiobook?: Audiobook;
  onClose: () => void;
}

const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
const inputClass =
  'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

export default function AudiobookModal({ mode, audiobook, onClose }: Props) {
  const { copy } = useI18n();
  const [title, setTitle] = useState(audiobook?.title ?? '');
  const [authorName, setAuthorName] = useState(audiobook?.author ?? '');
  const [description, setDescription] = useState(audiobook?.description ?? '');
  const [genre, setGenre] = useState(audiobook?.genre ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isCoverDragOver, setIsCoverDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateAudiobookMutation();
  const updateMutation = useUpdateAudiobookMutation();
  const genresQuery = useAdminGenresQuery();
  const genreOptions = [
    ...(genresQuery.data?.map((item) => item.name) ?? []),
    ...(genre && !genresQuery.data?.some((item) => item.name === genre) ? [genre] : []),
  ];

  const handleSave = async () => {
    if (!title.trim() || !authorName.trim() || !description.trim()) {
      setError('Title, author, and description are required');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('authorName', authorName.trim());
      formData.append('description', description.trim());
      if (genre) formData.append('genre', genre);
      if (coverFile) formData.append('cover', coverFile);

      if (mode === 'new') {
        await createMutation.mutateAsync(formData);
      } else if (audiobook) {
        await updateMutation.mutateAsync({ id: audiobook.id, formData });
      }

      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message ?? e.message ?? copy.admin.saveError);
    }
    setIsSaving(false);
  };

  const handleCoverDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsCoverDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file.');
      return;
    }
    setCoverFile(file);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a52]">
          <h2 className="text-white font-semibold text-base">
            {mode === 'new' ? copy.admin.newAudiobook : copy.admin.editAudiobook}
          </h2>
          <button onClick={onClose} className="text-[#7a8faa] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={labelClass}>{copy.admin.title} *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{copy.admin.author} *</label>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{copy.admin.genre}</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass}>
              <option value="">{copy.admin.selectGenre}</option>
              {genreOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>{copy.common.description} *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>{copy.admin.coverImage}</label>
            <label
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md border border-dashed bg-[#19233a] px-3 py-2 text-sm transition-colors hover:border-[#3dc9b0] hover:text-[#3dc9b0] ${
                isCoverDragOver ? 'border-[#3dc9b0] text-[#3dc9b0]' : 'border-[#2a3a52] text-[#4a5a72]'
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsCoverDragOver(true);
              }}
              onDragLeave={() => setIsCoverDragOver(false)}
              onDrop={handleCoverDrop}
            >
              <Upload size={14} />
              <span>{coverFile ? coverFile.name : copy.common.chooseImage}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#2a3a52] flex justify-end gap-3">
          {error && <p className="mr-auto text-xs text-red-400 self-center">{error}</p>}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] disabled:opacity-50 transition-colors"
          >
            {isSaving ? copy.admin.saving : copy.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
