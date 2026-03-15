import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Search, Mic, X } from 'lucide-react';
import { useSearch } from '../hooks/search';
import TrackRow from '../components/ui/TrackRow';
import MediaCard from '../components/ui/MediaCard';
import { useCatalogTracks } from '../hooks/tracks';

const genres = [
  { id: 'pop', label: 'Поп', color: 'from-pink-500 to-rose-600', emoji: '🎵' },
  {
    id: 'rock',
    label: 'Рок',
    color: 'from-orange-500 to-red-600',
    emoji: '🎸',
  },
  {
    id: 'hiphop',
    label: 'Хіп-хоп',
    color: 'from-yellow-500 to-orange-500',
    emoji: '🎤',
  },
  {
    id: 'electronic',
    label: 'Електронна',
    color: 'from-cyan-500 to-blue-600',
    emoji: '🎛️',
  },
  {
    id: 'kpop',
    label: 'K-Pop',
    color: 'from-purple-500 to-pink-600',
    emoji: '✨',
  },
  {
    id: 'jazz',
    label: 'Джаз',
    color: 'from-amber-600 to-yellow-500',
    emoji: '🎷',
  },
  {
    id: 'classical',
    label: 'Класика',
    color: 'from-emerald-500 to-teal-600',
    emoji: '🎹',
  },
  {
    id: 'rnb',
    label: 'R&B',
    color: 'from-indigo-500 to-purple-600',
    emoji: '🎙️',
  },
];

export const Route = createFileRoute('/search')({ component: SearchPage });

function SearchPage() {
  const { tracks } = useCatalogTracks();
  const { query, setQuery, results, hasResults } = useSearch(tracks);
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <h1 className="text-white text-2xl font-bold mb-4">Пошук</h1>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Виконавці, треки, альбоми..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface-alt text-white placeholder-muted rounded-xl py-3 pl-10 pr-10 outline-none focus:ring-2 focus:ring-brand/50 text-sm"
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            <X size={18} className="text-muted" />
          </button>
        ) : (
          <button className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Mic size={18} className="text-muted" />
          </button>
        )}
      </div>

      {/* Results or genre grid */}
      {query && hasResults ? (
        <div className="space-y-6">
          {results.tracks.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-2">Треки</h2>
              <div className="space-y-1">
                {results.tracks.map((t) => (
                  <TrackRow key={t.id} track={t} queue={tracks} />
                ))}
              </div>
            </div>
          )}
          {results.artists.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-3">Виконавці</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {results.artists.map((a) => (
                  <MediaCard
                    key={a.id}
                    image={a.image}
                    title={a.name}
                    subtitle={a.genre}
                    rounded
                    onClick={() => navigate({ to: '/artist/$id', params: { id: a.id } })}
                  />
                ))}
              </div>
            </div>
          )}
          {results.albums.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-3">Альбоми</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {results.albums.map((al) => (
                  <MediaCard
                    key={al.id}
                    image={al.coverUrl}
                    title={al.title}
                    subtitle={al.artistName}
                    onClick={() => navigate({ to: '/album/$id', params: { id: al.id } })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : query && !hasResults ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={48} className="text-muted mb-4" />
          <p className="text-white font-semibold mb-1">Нічого не знайдено</p>
          <p className="text-muted text-sm">Спробуйте інший запит</p>
        </div>
      ) : (
        <>
          <h2 className="text-white font-bold mb-3">Перегляд за жанрами</h2>
          <div className="grid grid-cols-2 gap-3">
            {genres.map((g) => (
              <button
                key={g.id}
                className={`bg-gradient-to-br ${g.color} rounded-2xl h-24 flex items-end p-3 overflow-hidden relative`}
              >
                <span className="absolute top-2 right-3 text-3xl">{g.emoji}</span>
                <span className="text-white font-bold text-base">{g.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
