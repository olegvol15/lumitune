import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Music2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import type { LibraryTab } from '../types/routes/route.types';
import { usePlaylistsQuery, useCreatePlaylistMutation } from '../hooks/playlists';
import { useSavedAudiobooksQuery } from '../hooks/audiobooks';
import { useSavedAlbumsQuery } from '../hooks/albums';
import { formatLongDuration } from '../utils/format';
import { useI18n } from '../lib/i18n';
import { useArtistsQuery } from '../hooks/artists';

export const Route = createFileRoute('/library')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/signin' });
  },
  component: LibraryPage,
});

function LibraryPage() {
  const [tab, setTab] = useState<LibraryTab>('playlists');
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { copy } = useI18n();
  const { data: playlists = [] } = usePlaylistsQuery();
  const { data: savedAudiobooks = [] } = useSavedAudiobooksQuery();
  const { data: savedAlbums = [] } = useSavedAlbumsQuery();
  const { data: artists = [] } = useArtistsQuery();
  const createMutation = useCreatePlaylistMutation();
  const personalPlaylists = playlists.filter((playlist) => playlist.kind === 'user');
  const curatedPlaylists = playlists.filter((playlist) => playlist.kind === 'curated');

  const nextPlaylistName = `${copy.nav.createPlaylist} #${personalPlaylists.length + 1}`;

  const openCreateConfirmation = () => {
    setCreateError(null);
    setPlaylistName(nextPlaylistName);
    setConfirmCreateOpen(true);
  };

  const handleConfirmCreatePlaylist = async () => {
    const trimmedName = playlistName.trim();
    if (!trimmedName) {
      setCreateError(copy.library.playlistNameRequired);
      return;
    }

    try {
      setCreateError(null);
      const playlist = await createMutation.mutateAsync(trimmedName);
      setConfirmCreateOpen(false);
      navigate({ to: '/playlist/$id', params: { id: playlist.id } });
    } catch (error) {
      const errorWithMessage = error as { response?: { data?: { message?: string } }; message?: string };
      setCreateError(
        errorWithMessage.response?.data?.message ??
          errorWithMessage.message ??
          copy.library.createPlaylistError
      );
    }
  };

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-2xl font-bold">{copy.library.title}</h1>
        <button
          onClick={openCreateConfirmation}
          className="p-2 bg-surface-alt rounded-full hover:bg-white/10 transition-colors"
          title={copy.nav.createPlaylist}
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['playlists', 'albums', 'artists', 'audiobooks'] as LibraryTab[]).map((t) => (
          <Button
            key={t}
            variant={tab === t ? 'secondary' : 'ghost'}
            shape="pill"
            size="sm"
            onClick={() => setTab(t)}
            className={tab !== t ? 'bg-surface-alt text-sm' : 'text-sm'}
          >
            {t === 'playlists'
              ? copy.library.playlists
              : t === 'albums'
              ? copy.library.albums
              : t === 'artists'
              ? copy.library.artists
              : copy.library.audiobooks}
          </Button>
        ))}
      </div>

      {/* Content */}
      {tab === 'playlists' && (
        <div className="space-y-3">
          {/* Favourites */}
          <button
            onClick={() => navigate({ to: '/favorite' })}
            className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">♥</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{copy.nav.favoriteTracks}</p>
              <p className="text-muted text-sm">{copy.library.playlist}</p>
            </div>
          </button>

          {/* User-created playlists */}
          {personalPlaylists.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate({ to: '/playlist/$id', params: { id: p.id } })}
              className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1CA2EA]/30 to-[#0a1929] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {p.coverUrl ? (
                  <img src={p.coverUrl} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <Music2 size={24} className="text-[#1CA2EA]/70" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{p.title}</p>
                <p className="text-muted text-sm">{p.trackIds.length} {copy.common.tracks} · {copy.library.playlist}</p>

              </div>
            </button>
          ))}

          {curatedPlaylists.length > 0 && (
            <div className="pt-2">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Curated
              </p>
              {curatedPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => navigate({ to: '/playlist/$id', params: { id: playlist.id } })}
                  className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#30b7aa]/25 to-[#0a1929] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music2 size={24} className="text-[#30b7aa]/80" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{playlist.title}</p>
                    <p className="text-muted text-sm">Curated · {playlist.trackIds.length} {copy.common.tracks}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {playlists.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted text-sm mb-3">{copy.library.noPlaylists}</p>
              <Button variant="outline" size="sm" onClick={openCreateConfirmation}>
                {copy.nav.createPlaylist}
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === 'albums' && (
        <div className="space-y-3">
          {savedAlbums.map((al) => (
            <button
              key={al.id}
              onClick={() => navigate({ to: '/album/$id', params: { id: al.id } })}
              className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
            >
              <img src={al.coverUrl} alt={al.title} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{al.title}</p>
                <p className="text-muted text-sm">
                  {al.artistName} · {al.year}
                </p>
              </div>
            </button>
          ))}
          {savedAlbums.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted text-sm">{copy.library.noSavedAlbums ?? copy.common.noResults}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'artists' && (
        <div className="space-y-3">
          {artists.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate({ to: '/artist/$id', params: { id: a.id } })}
              className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
            >
              <img src={a.image} alt={a.name} className="w-14 h-14 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{a.name}</p>
                <p className="text-muted text-sm">{a.genre}</p>
              </div>
            </button>
          ))}
          {artists.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted text-sm">{copy.common.noResults}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'audiobooks' && (
        <div className="space-y-3">
          {savedAudiobooks.map((book) => (
            <button
              key={book.id}
              onClick={() => navigate({ to: '/audiobook/$id', params: { id: book.id } })}
              className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{book.title}</p>
                <p className="text-muted text-sm truncate">
                  {book.author} · {book.chapterCount} {copy.common.chapters} · {formatLongDuration(book.duration)}
                </p>
              </div>
            </button>
          ))}

          {savedAudiobooks.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted text-sm">{copy.library.noSavedAudiobooks}</p>
            </div>
          )}
        </div>
      )}

      {confirmCreateOpen && (
        <div
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (!createMutation.isPending && event.target === event.currentTarget) {
              setConfirmCreateOpen(false);
            }
          }}
        >
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-surface-alt shadow-2xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleConfirmCreatePlaylist();
              }}
            >
            <div className="px-6 py-5">
              <h2 className="mb-2 text-base font-semibold text-white">
                {copy.library.createPlaylistTitle}
              </h2>
              <p className="text-sm leading-relaxed text-muted">{copy.library.createPlaylistBody}</p>
              <label className="mt-4 block text-xs font-medium text-muted" htmlFor="library-playlist-name">
                {copy.library.playlistName}
              </label>
              <input
                id="library-playlist-name"
                autoFocus
                value={playlistName}
                onChange={(event) => {
                  setPlaylistName(event.target.value);
                  if (createError) setCreateError(null);
                }}
                disabled={createMutation.isPending}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/35 focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
              {createError && <p className="mt-3 text-sm text-red-300">{createError}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() => setConfirmCreateOpen(false)}
                disabled={createMutation.isPending}
                className="rounded-lg bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.common.no}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending ? copy.library.creatingPlaylist : copy.common.yes}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
