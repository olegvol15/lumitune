import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import {
  useAudiobooksQuery,
  useDeleteAudiobookChapterMutation,
  useDeleteAudiobookMutation,
  useAudiobookQuery,
} from '../../hooks/audiobooks';
import AdminLayout from '../../components/admin/AdminLayout';
import AudiobookModal from '../../components/admin/AudiobookModal';
import AudiobookChapterModal from '../../components/admin/AudiobookChapterModal';
import { formatLongDuration } from '../../utils/format';
import type { Audiobook, AudiobookChapter } from '../../types';

export const Route = createFileRoute('/admin/audiobooks')({ component: AdminAudiobooksPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';

function ChaptersPanel({ audiobook }: { audiobook: Audiobook }) {
  const { data, isLoading } = useAudiobookQuery(audiobook.id);
  const deleteMutation = useDeleteAudiobookChapterMutation(audiobook.id);
  const [chapterModal, setChapterModal] = useState<{
    open: boolean;
    mode: 'new' | 'edit';
    chapter?: AudiobookChapter;
  }>({ open: false, mode: 'new' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const chapters = data?.chapters ?? [];

  return (
    <tr>
      <td colSpan={6} className="px-0 pb-0">
        <div className="mx-3 mb-3 bg-[#151d2e] rounded-xl border border-[#2a3a52] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a3a52]">
            <span className="text-[#7a8faa] text-xs font-semibold uppercase tracking-wide">
              Chapters — {audiobook.title}
            </span>
            <button
              onClick={() => setChapterModal({ open: true, mode: 'new' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors"
            >
              <Plus size={13} />
              Add Chapter
            </button>
          </div>

          {isLoading ? (
            <div className="px-4 py-4 text-xs text-[#7a8faa]">Loading…</div>
          ) : chapters.length === 0 ? (
            <div className="px-4 py-4 text-xs text-[#7a8faa]">
              No chapters yet. Click "Add Chapter" to upload the first one.
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-[#2a3a52]">
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Title</th>
                  <th className={thClass}>Duration</th>
                  <th className={thClass}>Plays</th>
                  <th className={thClass} style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id} className="border-t border-[#2a3a52] hover:bg-[#1e2840]/50">
                    <td className={tdMuted}>{chapter.chapterNumber}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <img
                          src={chapter.audiobookCover}
                          alt={chapter.title}
                          className="w-7 h-7 rounded object-contain bg-black/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="truncate max-w-[220px]">{chapter.title}</p>
                          {chapter.description && (
                            <p className="text-[#4a5a72] text-xs truncate max-w-[220px]">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={tdMuted}>{formatLongDuration(chapter.duration)}</td>
                    <td className={tdMuted}>{chapter.plays.toLocaleString()}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setChapterModal({ open: true, mode: 'edit', chapter })}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDeleteId(chapter.id)}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-[#f07282] hover:bg-[#2a3a52] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {chapterModal.open && (
          <AudiobookChapterModal
            audiobookId={audiobook.id}
            audiobookTitle={audiobook.title}
            mode={chapterModal.mode}
            chapter={chapterModal.chapter}
            nextChapterNumber={chapters.length + 1}
            onClose={() => setChapterModal({ open: false, mode: 'new' })}
          />
        )}

        {confirmDeleteId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={(e) => e.target === e.currentTarget && setConfirmDeleteId(null)}
          >
            <div className="w-full max-w-sm bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-5">
                <h2 className="text-white font-semibold text-base mb-2">Delete chapter?</h2>
                <p className="text-[#7a8faa] text-sm">
                  This will permanently delete the chapter and its audio file.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-[#2a3a52] flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2a3a52] hover:bg-[#354a62] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteMutation.mutate(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#f07282] hover:bg-[#d9606f] transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}

function AdminAudiobooksPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((s) => s.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: audiobooks = [], isLoading, error } = useAudiobooksQuery();
  const deleteAudiobookMutation = useDeleteAudiobookMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [audiobookModal, setAudiobookModal] = useState<{
    open: boolean;
    mode: 'new' | 'edit';
    audiobook?: Audiobook;
  }>({ open: false, mode: 'new' });

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-[#3dc9b0]" />
          <h1 className="text-white font-semibold text-xl">Audiobooks</h1>
        </div>
        <button
          onClick={() => setAudiobookModal({ open: true, mode: 'new' })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors"
        >
          <Plus size={16} />
          New Audiobook
        </button>
      </div>

      <div className="bg-[#1e2638] rounded-xl border border-[#2a3a52] overflow-hidden">
        {error instanceof Error && (
          <div className="px-4 py-3 text-sm text-red-300 border-b border-[#2a3a52]">{error.message}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass}>Audiobook</th>
                <th className={thClass}>Author</th>
                <th className={thClass}>Genre</th>
                <th className={thClass}>Duration</th>
                <th className={thClass}>Chapters</th>
                <th className={thClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#7a8faa] text-sm">Loading audiobooks…</td>
                </tr>
              )}
              {!isLoading && audiobooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#7a8faa] text-sm">
                    No audiobooks yet. Click "New Audiobook" to create one.
                  </td>
                </tr>
              )}
              {audiobooks.map((audiobook) => (
                <>
                  <tr
                    key={audiobook.id}
                    className={`border-t border-[#2a3a52] transition-colors ${
                      expandedId === audiobook.id ? 'bg-[#253050]' : 'hover:bg-[#253050]/50'
                    }`}
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <img
                          src={audiobook.coverUrl}
                          alt={audiobook.title}
                          className="w-9 h-9 rounded-lg object-contain bg-black/10 shrink-0"
                        />
                        <span className="font-medium truncate max-w-[180px]">{audiobook.title}</span>
                      </div>
                    </td>
                    <td className={tdMuted}>{audiobook.author}</td>
                    <td className={tdMuted}>{audiobook.genre || '—'}</td>
                    <td className={tdMuted}>{formatLongDuration(audiobook.duration)}</td>
                    <td className={tdMuted}>
                      <button
                        onClick={() => setExpandedId(expandedId === audiobook.id ? null : audiobook.id)}
                        className="flex items-center gap-1.5 text-[#3dc9b0] hover:text-[#35b09a] transition-colors text-xs font-medium"
                      >
                        <PlayCircle size={14} />
                        Chapters
                        {expandedId === audiobook.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setAudiobookModal({ open: true, mode: 'edit', audiobook })}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDeleteId(audiobook.id)}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-[#f07282] hover:bg-[#2a3a52] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === audiobook.id && <ChaptersPanel audiobook={audiobook} />}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {audiobookModal.open && (
        <AudiobookModal
          mode={audiobookModal.mode}
          audiobook={audiobookModal.audiobook}
          onClose={() => setAudiobookModal({ open: false, mode: 'new' })}
        />
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmDeleteId(null)}
        >
          <div className="w-full max-w-sm bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5">
              <h2 className="text-white font-semibold text-base mb-2">Delete audiobook?</h2>
              <p className="text-[#7a8faa] text-sm">
                This will permanently delete the audiobook, all chapters, and uploaded files.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-[#2a3a52] flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#2a3a52] hover:bg-[#354a62] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteAudiobookMutation.mutate(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#f07282] hover:bg-[#d9606f] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
