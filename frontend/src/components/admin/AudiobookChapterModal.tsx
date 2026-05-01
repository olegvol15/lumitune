import { useState, type DragEvent } from 'react';
import { X, Upload } from 'lucide-react';
import {
  useUpdateAudiobookChapterMutation,
  useUploadAudiobookChapterMutation,
} from '../../hooks/audiobooks';
import type { AudiobookChapter } from '../../types';

interface Props {
  audiobookId: string;
  audiobookTitle: string;
  mode: 'new' | 'edit';
  chapter?: AudiobookChapter;
  nextChapterNumber: number;
  onClose: () => void;
}

const labelClass = 'block text-[#7a8faa] text-xs font-medium mb-1';
const inputClass =
  'w-full bg-[#19233a] border border-[#2a3a52] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors';

export default function AudiobookChapterModal({
  audiobookId,
  audiobookTitle,
  mode,
  chapter,
  nextChapterNumber,
  onClose,
}: Props) {
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [description, setDescription] = useState(chapter?.description ?? '');
  const [chapterNumber, setChapterNumber] = useState(chapter?.chapterNumber ?? nextChapterNumber);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [dragTarget, setDragTarget] = useState<'audio' | 'cover' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useUploadAudiobookChapterMutation(audiobookId);
  const updateMutation = useUpdateAudiobookChapterMutation(audiobookId);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (mode === 'new' && !audioFile) {
      setError('Audio file is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('chapterNumber', String(chapterNumber));
      if (audioFile) formData.append('audio', audioFile);
      if (coverFile) formData.append('cover', coverFile);

      if (mode === 'new') {
        await uploadMutation.mutateAsync(formData);
      } else if (chapter) {
        await updateMutation.mutateAsync({ chapterId: chapter.id, formData });
      }
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message ?? e.message ?? 'Failed to save');
    }
    setIsSaving(false);
  };

  const handleDropFile = (event: DragEvent<HTMLLabelElement>, target: 'audio' | 'cover') => {
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

  const dropLabelClass = (target: 'audio' | 'cover') =>
    `flex w-full cursor-pointer items-center gap-2 rounded-md border border-dashed bg-[#19233a] px-3 py-2 text-sm transition-colors hover:border-[#3dc9b0] hover:text-[#3dc9b0] ${
      dragTarget === target ? 'border-[#3dc9b0] text-[#3dc9b0]' : 'border-[#2a3a52] text-[#4a5a72]'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3a52]">
          <div>
            <h2 className="text-white font-semibold text-base">
              {mode === 'new' ? 'New Chapter' : 'Edit Chapter'}
            </h2>
            <p className="text-[#7a8faa] text-xs mt-0.5">{audiobookTitle}</p>
          </div>
          <button onClick={onClose} className="text-[#7a8faa] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Chapter #</label>
              <input
                type="number"
                min={1}
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
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
              <label
                className={dropLabelClass('audio')}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragTarget('audio');
                }}
                onDragLeave={() => setDragTarget(null)}
                onDrop={(event) => handleDropFile(event, 'audio')}
              >
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
              <label
                className={dropLabelClass('cover')}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragTarget('cover');
                }}
                onDragLeave={() => setDragTarget(null)}
                onDrop={(event) => handleDropFile(event, 'cover')}
              >
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
            {isSaving ? 'Saving…' : mode === 'new' ? 'Upload Chapter' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
