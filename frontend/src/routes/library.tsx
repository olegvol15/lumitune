import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Music2 } from 'lucide-react';
import { albums } from '../data/albums';
import { artists } from '../data/artists';
import Button from '../components/ui/Button';
import { usePlaylistStore } from '../store/playlistStore';
import { useAuthStore } from '../store/authStore';
import type { LibraryTab } from '../types/routes/route.types';

export const Route = createFileRoute('/library')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/signin' });
  },
  component: LibraryPage,
});

function LibraryPage() {
  const [tab, setTab] = useState<LibraryTab>('playlists');
  const navigate = useNavigate();
  const { playlists, createPlaylist } = usePlaylistStore();

  const handleCreatePlaylist = () => {
    const id = createPlaylist();
    navigate({ to: '/playlist/$id', params: { id } });
  };

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-2xl font-bold">Бібліотека</h1>
        <button
          onClick={handleCreatePlaylist}
          className="p-2 bg-surface-alt rounded-full hover:bg-white/10 transition-colors"
          title="Створити плейлист"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['playlists', 'albums', 'artists'] as LibraryTab[]).map((t) => (
          <Button
            key={t}
            variant={tab === t ? 'secondary' : 'ghost'}
            shape="pill"
            size="sm"
            onClick={() => setTab(t)}
            className={tab !== t ? 'bg-surface-alt text-sm' : 'text-sm'}
          >
            {t === 'playlists' ? 'Плейлисти' : t === 'albums' ? 'Альбоми' : 'Виконавці'}
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
              <p className="text-white font-semibold truncate">Улюблені треки</p>
              <p className="text-muted text-sm">Плейлист</p>
            </div>
          </button>

          {/* User-created playlists */}
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate({ to: '/playlist/$id', params: { id: p.id } })}
              className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1CA2EA]/30 to-[#0a1929] flex items-center justify-center flex-shrink-0">
                <Music2 size={24} className="text-[#1CA2EA]/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{p.title}</p>
                <p className="text-muted text-sm">{p.trackIds.length} треків · Плейлист</p>
              </div>
            </button>
          ))}

          {playlists.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-muted text-sm mb-3">У вас ще немає плейлистів</p>
              <Button variant="outline" size="sm" onClick={handleCreatePlaylist}>
                Створити плейлист
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === 'albums' && (
        <div className="space-y-3">
          {albums.map((al) => (
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
        </div>
      )}
    </div>
  );
}
