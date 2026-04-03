import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Mic, PlayCircle } from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import {
  usePodcastsQuery,
  useDeletePodcastMutation,
  useDeleteEpisodeMutation,
} from '../../hooks/podcasts';
import { usePodcastQuery } from '../../hooks/podcasts';
import AdminLayout from '../../components/admin/AdminLayout';
import PodcastModal from '../../components/admin/PodcastModal';
import EpisodeModal from '../../components/admin/EpisodeModal';
import { formatLongDuration } from '../../utils/format';
import type { Podcast, Episode } from '../../types';

export const Route = createFileRoute('/admin/podcasts')({ component: AdminPodcastsPage });

const thClass =
  'px-3 py-3 text-left text-xs font-semibold text-[#7a8faa] uppercase tracking-wide whitespace-nowrap';
const tdClass = 'px-3 py-3 text-sm text-white whitespace-nowrap';
const tdMuted = 'px-3 py-3 text-sm text-[#7a8faa] whitespace-nowrap';

// ── Episodes sub-panel ──────────────────────────────────────────────────────
function EpisodesPanel({ podcast }: { podcast: Podcast }) {
  const { data, isLoading } = usePodcastQuery(podcast.id);
  const deleteMutation = useDeleteEpisodeMutation(podcast.id);
  const [episodeModal, setEpisodeModal] = useState<{
    open: boolean;
    mode: 'new' | 'edit';
    episode?: Episode;
  }>({ open: false, mode: 'new' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const episodes = data?.episodes ?? [];

  return (
    <tr>
      <td colSpan={6} className="px-0 pb-0">
        <div className="mx-3 mb-3 bg-[#151d2e] rounded-xl border border-[#2a3a52] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a3a52]">
            <span className="text-[#7a8faa] text-xs font-semibold uppercase tracking-wide">
              Episodes — {podcast.title}
            </span>
            <button
              onClick={() => setEpisodeModal({ open: true, mode: 'new' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors"
            >
              <Plus size={13} />
              Add Episode
            </button>
          </div>

          {isLoading ? (
            <div className="px-4 py-4 text-xs text-[#7a8faa]">Loading…</div>
          ) : episodes.length === 0 ? (
            <div className="px-4 py-4 text-xs text-[#7a8faa]">
              No episodes yet. Click "Add Episode" to upload the first one.
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
                {episodes.map((ep) => (
                  <tr key={ep.id} className="border-t border-[#2a3a52] hover:bg-[#1e2840]/50">
                    <td className={tdMuted}>{ep.episodeNumber}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <img
                          src={ep.podcastCover}
                          alt={ep.title}
                          className="w-7 h-7 rounded object-cover shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="min-w-0">
                          <p className="truncate max-w-[220px]">{ep.title}</p>
                          {ep.description && (
                            <p className="text-[#4a5a72] text-xs truncate max-w-[220px]">
                              {ep.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={tdMuted}>{formatLongDuration(ep.duration)}</td>
                    <td className={tdMuted}>{ep.plays.toLocaleString()}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setEpisodeModal({ open: true, mode: 'edit', episode: ep })}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDeleteId(ep.id)}
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

        {episodeModal.open && (
          <EpisodeModal
            podcastId={podcast.id}
            podcastTitle={podcast.title}
            mode={episodeModal.mode}
            episode={episodeModal.episode}
            nextEpisodeNumber={episodes.length + 1}
            onClose={() => setEpisodeModal({ open: false, mode: 'new' })}
          />
        )}

        {confirmDeleteId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={(e) => e.target === e.currentTarget && setConfirmDeleteId(null)}
          >
            <div className="w-full max-w-sm bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-5">
                <h2 className="text-white font-semibold text-base mb-2">Delete episode?</h2>
                <p className="text-[#7a8faa] text-sm">
                  This will permanently delete the episode and its audio file.
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

// ── Main page ───────────────────────────────────────────────────────────────
function AdminPodcastsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAdminAuthStore((s) => s.isBootstrapped);

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) navigate({ to: '/admin/login' });
  }, [isAuthenticated, isBootstrapped, navigate]);

  const { data: podcasts = [], isLoading, error } = usePodcastsQuery();
  const deletePodcastMutation = useDeletePodcastMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [podcastModal, setPodcastModal] = useState<{ open: boolean; mode: 'new' | 'edit'; podcast?: Podcast }>({
    open: false,
    mode: 'new',
  });

  if (!isBootstrapped || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Mic size={18} className="text-[#3dc9b0]" />
          <h1 className="text-white font-semibold text-xl">Podcasts</h1>
        </div>
        <button
          onClick={() => setPodcastModal({ open: true, mode: 'new' })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#1a2030] bg-[#3dc9b0] hover:bg-[#35b09a] transition-colors"
        >
          <Plus size={16} />
          New Podcast
        </button>
      </div>

      <div className="bg-[#1e2638] rounded-xl border border-[#2a3a52] overflow-hidden">
        {error instanceof Error && (
          <div className="px-4 py-3 text-sm text-red-300 border-b border-[#2a3a52]">
            {error.message}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-[#2a3a52]">
              <tr>
                <th className={thClass}>Podcast</th>
                <th className={thClass}>Author</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Episodes</th>
                <th className={thClass} style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#7a8faa] text-sm">
                    Loading podcasts…
                  </td>
                </tr>
              )}
              {!isLoading && podcasts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#7a8faa] text-sm">
                    No podcasts yet. Click "New Podcast" to create one.
                  </td>
                </tr>
              )}
              {podcasts.map((podcast) => (
                <>
                  <tr
                    key={podcast.id}
                    className={`border-t border-[#2a3a52] transition-colors ${
                      expandedId === podcast.id ? 'bg-[#253050]' : 'hover:bg-[#253050]/50'
                    }`}
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <img
                          src={podcast.coverUrl}
                          alt={podcast.title}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="%232a3a52"/></svg>';
                          }}
                        />
                        <span className="font-medium truncate max-w-[180px]">{podcast.title}</span>
                      </div>
                    </td>
                    <td className={tdMuted}>{podcast.author}</td>
                    <td className={tdMuted}>
                      {podcast.category ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-[#2a3a52] text-[#7a8faa]">
                          {podcast.category}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tdMuted}>
                      <button
                        onClick={() => setExpandedId(expandedId === podcast.id ? null : podcast.id)}
                        className="flex items-center gap-1.5 text-[#3dc9b0] hover:text-[#35b09a] transition-colors text-xs font-medium"
                      >
                        <PlayCircle size={14} />
                        Episodes
                        {expandedId === podcast.id ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </button>
                    </td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-1">
                        <button
                          title="Edit"
                          onClick={() => setPodcastModal({ open: true, mode: 'edit', podcast })}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-white hover:bg-[#2a3a52] transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setConfirmDeleteId(podcast.id)}
                          className="p-1.5 rounded-lg text-[#7a8faa] hover:text-[#f07282] hover:bg-[#2a3a52] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === podcast.id && <EpisodesPanel podcast={podcast} />}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {podcastModal.open && (
        <PodcastModal
          mode={podcastModal.mode}
          podcast={podcastModal.podcast}
          onClose={() => setPodcastModal({ open: false, mode: 'new' })}
        />
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => e.target === e.currentTarget && setConfirmDeleteId(null)}
        >
          <div className="w-full max-w-sm bg-[#1e2638] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5">
              <h2 className="text-white font-semibold text-base mb-2">Delete podcast?</h2>
              <p className="text-[#7a8faa] text-sm">
                This will permanently delete the podcast and all its episodes. This action cannot be
                undone.
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
                  deletePodcastMutation.mutate(confirmDeleteId);
                  setConfirmDeleteId(null);
                  if (expandedId === confirmDeleteId) setExpandedId(null);
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
