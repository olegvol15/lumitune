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
  const navigate = useNavigate();
  const { copy } = useI18n();
  const { data: playlists = [] } = usePlaylistsQuery();
  const { data: savedAudiobooks = [] } = useSavedAudiobooksQuery();
  const { data: savedAlbums = [] } = useSavedAlbumsQuery();
  const { data: artists = [] } = useArtistsQuery();
  const createMutation = useCreatePlaylistMutation();
  const personalPlaylists = playlists.filter((playlist) => playlist.kind === 'user');
  const curatedPlaylists = playlists.filter((playlist) => playlist.kind === 'curated');

  const handleCreatePlaylist = async () => {
    const playlist = await createMutation.mutateAsync(
      `${copy.nav.createPlaylist} #${personalPlaylists.length + 1}`
    );
    navigate({ to: '/playlist/$id', params: { id: playlist.id } });
  };

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-2xl font-bold">{copy.library.title}</h1>
        <button
          onClick={() => void handleCreatePlaylist()}
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
              <Button variant="outline" size="sm" onClick={() => void handleCreatePlaylist()}>
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
    </div>
  );
}
