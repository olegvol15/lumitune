import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Pencil, PlayCircle, Plus, Search, Trash2 } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import {
  useAudiobooksQuery,
  useDeleteAudiobookChapterMutation,
  useDeleteAudiobookMutation,
  useAudiobookQuery,
} from '../../hooks/audiobooks';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminCheckbox from '../../components/admin/AdminCheckbox';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AudiobookModal from '../../components/admin/AudiobookModal';
import AudiobookChapterModal from '../../components/admin/AudiobookChapterModal';
import { formatLongDuration } from '../../utils/format';
import type { Audiobook, AudiobookChapter } from '../../types';

export const Route = createFileRoute('/admin/audiobooks')({ component: AdminAudiobooksPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const thCenterClass =
  'px-3 py-3 text-center text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';
const tdCenterClass = 'px-3 py-3 text-sm text-white whitespace-nowrap text-center';
const tdMutedCenter = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap text-center';

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
          <AdminConfirmModal
            title="Delete chapter?"
            description="This will permanently delete the chapter and its audio file."
            confirmLabel="Delete"
            onClose={() => setConfirmDeleteId(null)}
            onConfirm={() => {
              deleteMutation.mutate(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          />
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
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [audiobookModal, setAudiobookModal] = useState<{
    open: boolean;
    mode: 'new' | 'edit';
    audiobook?: Audiobook;
  }>({ open: false, mode: 'new' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const filteredAudiobooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return audiobooks;
    return audiobooks.filter((audiobook) =>
      [audiobook.title, audiobook.author, audiobook.genre, audiobook.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [audiobooks, query]);

  const audiobookIds = filteredAudiobooks.map((audiobook) => audiobook.id);
  const allSelected = audiobookIds.length > 0 && audiobookIds.every((id) => selected.has(id));

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(allSelected ? new Set() : new Set(audiobookIds));
  };

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-[#3dc9b0]" />
          <h1 className="text-white font-semibold text-xl">Audiobooks</h1>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={() => setConfirmBulkDelete(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#f07282] hover:bg-[#d9606f] transition-colors"
            >
              <Trash2 size={14} />
              Delete Selected ({selected.size})
            </button>
          )}
          <button
            onClick={() => setAudiobookModal({ open: true, mode: 'new' })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors"
          >
            <Plus size={16} />
            New Audiobook
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8faa]" />
          <input
            type="text"
            placeholder="Search audiobooks…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-[#2a3a52] bg-[#19233a] py-2 pl-8 pr-3 text-sm text-white placeholder:text-[#4a5a72] focus:outline-none focus:border-[#3dc9b0] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#1e2638] rounded-xl border border-[#2a3a52] overflow-hidden">
        {error instanceof Error && (
          <div className="px-4 py-3 text-sm text-red-300 border-b border-[#2a3a52]">{error.message}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thCenterClass} style={{ width: 40 }}>
                  <AdminCheckbox checked={allSelected} onChange={handleSelectAll} />
                </th>
                <th className={thClass}>Audiobook</th>
                <th className={thClass}>Author</th>
                <th className={thCenterClass}>Genre</th>
                <th className={thCenterClass}>Duration</th>
                <th className={thCenterClass}>Chapters</th>
                <th className={thCenterClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#7a8faa] text-sm">Loading audiobooks…</td>
                </tr>
              )}
              {!isLoading && filteredAudiobooks.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#7a8faa] text-sm">
                    {audiobooks.length === 0 ? 'No audiobooks yet. Click "New Audiobook" to create one.' : 'No audiobooks match your search.'}
                  </td>
                </tr>
              )}
              {filteredAudiobooks.map((audiobook) => (
                <Fragment key={audiobook.id}>
                  <tr
                    className={`border-t border-[#2a3a52] transition-colors ${
                      selected.has(audiobook.id) || expandedId === audiobook.id ? 'bg-[#253050]' : 'hover:bg-[#253050]/50'
                    }`}
                  >
                    <td className={tdCenterClass}>
                      <AdminCheckbox checked={selected.has(audiobook.id)} onChange={() => toggleSelect(audiobook.id)} />
                    </td>
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
                    <td className={tdMutedCenter}>{audiobook.genre || '—'}</td>
                    <td className={tdMutedCenter}>{formatLongDuration(audiobook.duration)}</td>
                    <td className={tdMutedCenter}>
                      <button
                        onClick={() => setExpandedId(expandedId === audiobook.id ? null : audiobook.id)}
                        className="mx-auto flex items-center gap-1.5 text-[#3dc9b0] hover:text-[#35b09a] transition-colors text-xs font-medium"
                      >
                        <PlayCircle size={14} />
                        Chapters
                        {expandedId === audiobook.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </td>
                    <td className={tdCenterClass}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setAudiobookModal({ open: true, mode: 'edit', audiobook })}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => {
                            setConfirmDeleteId(audiobook.id);
                            setSelected((current) => {
                              const next = new Set(current);
                              next.delete(audiobook.id);
                              return next;
                            });
                          }}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-[#f07282] hover:bg-[#2a3a52] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === audiobook.id && <ChaptersPanel audiobook={audiobook} />}
                </Fragment>
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
        <AdminConfirmModal
          title="Delete audiobook?"
          description="This will permanently delete the audiobook, all chapters, and uploaded files."
          confirmLabel="Delete"
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            deleteAudiobookMutation.mutate(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      )}

      {confirmBulkDelete && (
        <AdminConfirmModal
          title="Delete selected audiobooks?"
          description={`This will permanently delete ${selected.size} selected audiobook${selected.size === 1 ? '' : 's'}, all chapters, and uploaded files.`}
          confirmLabel="Delete Selected"
          onClose={() => setConfirmBulkDelete(false)}
          onConfirm={() => {
            void Promise.all(Array.from(selected).map((id) => deleteAudiobookMutation.mutateAsync(id)));
            if (expandedId && selected.has(expandedId)) setExpandedId(null);
            setSelected(new Set());
            setConfirmBulkDelete(false);
          }}
        />
      )}
    </AdminLayout>
  );
}
