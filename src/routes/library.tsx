import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { playlists } from '../data/playlists';
import { albums } from '../data/albums';
import { artists } from '../data/artists';

type Tab = 'playlists' | 'albums' | 'artists';

export const Route = createFileRoute('/library')({ component: LibraryPage });

function LibraryPage() {
  const [tab, setTab] = useState<Tab>('playlists');
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-2xl font-bold">Бібліотека</h1>
        <button className="p-2 bg-surface-alt rounded-full">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['playlists', 'albums', 'artists'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? 'bg-brand text-white' : 'bg-surface-alt text-muted'
            }`}
          >
            {t === 'playlists' ? 'Плейлисти' : t === 'albums' ? 'Альбоми' : 'Виконавці'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'playlists' && (
        <div className="space-y-3">
          {playlists.map((p) => {
            const count = p.trackIds.length;
            return (
              <button
                key={p.id}
                onClick={() => navigate({ to: '/favorite' })}
                className="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-surface-alt transition-colors"
              >
                <img src={p.coverUrl} alt={p.title} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{p.title}</p>
                  <p className="text-muted text-sm">{count} треків · {p.isPublic ? 'Публічний' : 'Приватний'}</p>
                </div>
              </button>
            );
          })}
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
                <p className="text-muted text-sm">{al.artistName} · {al.year}</p>
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
