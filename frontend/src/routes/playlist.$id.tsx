import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Search, Plus, X, ChevronLeft, Music2, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { formatDuration, formatPlayCount } from '../utils/format';
import Button from '../components/ui/Button';
import { useCatalogTracks } from '../hooks/tracks';
import SongCoverImage from '../components/ui/SongCoverImage';
import {
  usePlaylistsQuery,
  useRenamePlaylistMutation,
  useDeletePlaylistMutation,
  useAddSongMutation,
  useRemoveSongMutation,
} from '../hooks/playlists';

export const Route = createFileRoute('/playlist/$id')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/signin' });
  },
  component: PlaylistPage,
});

const RECS_PAGE = 8;

function PlaylistPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { play } = usePlayerStore();
  const { tracks } = useCatalogTracks();

  const { data: playlists = [] } = usePlaylistsQuery();
  const renameMutation = useRenamePlaylistMutation();
  const deleteMutation = useDeletePlaylistMutation();
  const addSongMutation = useAddSongMutation();
  const removeSongMutation = useRemoveSongMutation();

  const [query, setQuery] = useState('');
  const [recsShown, setRecsShown] = useState(RECS_PAGE);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const playlist = playlists.find((p) => p.id === id);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const startEditing = () => {
    setTitleDraft(playlist?.title ?? '');
    setEditingTitle(true);
  };

  const commitRename = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== playlist?.title) {
      renameMutation.mutate({ playlistId: id, name: trimmed });
    }
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setEditingTitle(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate({ to: '/library' }),
    });
  };

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <p className="text-muted mb-4">Плейлист не знайдено</p>
        <Button variant="secondary" shape="pill" onClick={() => navigate({ to: '/library' })}>
          До бібліотеки
        </Button>
      </div>
    );
  }

  const playlistTracks = playlist.trackIds
    .map((tid) => tracks.find((t) => t.id === tid))
    .filter(Boolean) as typeof tracks;

  const q = query.toLowerCase();
  const recommendations = tracks.filter(
    (t) =>
      !playlist.trackIds.includes(t.id) &&
      (q === '' ||
        t.title.toLowerCase().includes(q) ||
        t.artistName.toLowerCase().includes(q) ||
        t.albumTitle.toLowerCase().includes(q))
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hearts background pattern */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(28,162,234,0.12) 0%, transparent 65%)',
        }}
      >
        <div className="grid grid-cols-10 gap-6 p-6 opacity-[0.07]">
          {Array.from({ length: 150 }).map((_, i) => (
            <span key={i} className="text-[#1CA2EA] text-lg select-none">
              ♥
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 px-6 pt-5 pb-10">
        {/* Back */}
        <button
          onClick={() => navigate({ to: '/library' })}
          className="flex items-center gap-1.5 text-muted hover:text-white transition-colors text-sm mb-5"
        >
          <ChevronLeft size={16} />
          Бібліотека
        </button>

        {/* Header */}
        <div className="flex items-start gap-5 mb-6">
          {/* Cover */}
          <div className="w-32 h-32 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#1CA2EA]/40 to-[#0a1929] flex items-center justify-center shadow-xl">
            {playlistTracks.length > 0 ? (
              <SongCoverImage
                src={playlistTracks[0].albumCover}
                alt={playlist.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Music2 size={40} className="text-[#1CA2EA]/60" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-muted text-xs uppercase tracking-wider mb-1">Плейлист</p>

            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleTitleKeyDown}
                className="text-white text-3xl font-bold leading-tight mb-2 bg-transparent outline-none w-full max-w-sm"
              />
            ) : (
              <div className="flex items-center gap-2 group/title mb-2">
                <h1 className="text-white text-3xl font-bold leading-tight">{playlist.title}</h1>
                <button
                  onClick={startEditing}
                  className="text-muted hover:text-white transition-colors opacity-0 group-hover/title:opacity-100 flex-shrink-0"
                  title="Перейменувати"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}

            <p className="text-muted text-sm">Ви &bull; {playlist.trackIds.length} треків</p>
          </div>

          {/* Delete */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-shrink-0 p-2 rounded-full text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Видалити плейлист"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <div className="flex-shrink-0 flex items-center gap-2 bg-[#0a1929] border border-[#1a3050] rounded-xl px-3 py-2">
              <span className="text-sm text-white/80">Видалити?</span>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                Так
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-muted hover:text-white transition-colors"
              >
                Ні
              </button>
            </div>
          )}
        </div>

        {/* Play button */}
        {playlistTracks.length > 0 && (
          <div className="mb-6">
            <Button
              variant="secondary"
              shape="pill"
              className="px-6"
              onClick={() => play(playlistTracks[0], playlistTracks)}
            >
              Відтворити
            </Button>
          </div>
        )}

        {/* Tracks in playlist */}
        {playlistTracks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-bold text-base mb-3">У плейлисті</h2>
            <div className="space-y-1">
              {playlistTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 group transition-colors"
                >
                  <SongCoverImage
                    src={track.albumCover}
                    alt={track.albumTitle}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 cursor-pointer"
                    onClick={() => play(track, playlistTracks)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                    <p className="text-muted text-xs truncate">{track.artistName}</p>
                  </div>
                  <span className="text-muted text-xs flex-shrink-0 hidden sm:block">
                    {track.albumTitle}
                  </span>
                  <span className="text-muted text-xs flex-shrink-0 w-12 text-right">
                    {formatDuration(track.duration)}
                  </span>
                  <button
                    onClick={() => removeSongMutation.mutate({ playlistId: id, songId: track.id })}
                    disabled={removeSongMutation.isPending}
                    className="p-1.5 rounded-full hover:bg-white/10 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 disabled:opacity-30"
                    title="Видалити з плейлисту"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Пошук треків та виконавців..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0a1929] border border-[#1a3050] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-[#1CA2EA]/60 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Recommendations */}
        <div>
          <div className="mb-4">
            <h2 className="text-white font-bold text-lg">Рекомендації</h2>
            <p className="text-muted text-sm">На основі ваших вподобань</p>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-muted text-sm">Нічого не знайдено</p>
          ) : (
            <>
              <div className="space-y-1">
                {recommendations.slice(0, recsShown).map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 group transition-colors"
                  >
                    <SongCoverImage
                      src={track.albumCover}
                      alt={track.albumTitle}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                      <p className="text-muted text-xs truncate">{track.artistName}</p>
                    </div>
                    <span className="text-muted text-xs flex-shrink-0 hidden md:block w-32 truncate text-right">
                      {track.albumTitle}
                    </span>
                    <span className="text-muted text-xs flex-shrink-0 w-12 text-right hidden sm:block">
                      {formatPlayCount(track.playCount)}
                    </span>
                    <span className="text-muted text-xs flex-shrink-0 w-10 text-right">
                      {formatDuration(track.duration)}
                    </span>
                    <button
                      onClick={() =>
                        addSongMutation.mutate({ playlistId: id, songId: track.id })
                      }
                      disabled={addSongMutation.isPending}
                      className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-[#1CA2EA] hover:text-[#1CA2EA] transition-colors flex-shrink-0 disabled:opacity-30"
                      title="Додати до плейлисту"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {recsShown < recommendations.length && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecsShown((n) => n + RECS_PAGE)}
                  >
                    Показати ще
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
