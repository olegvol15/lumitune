import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Search, Mic, X } from 'lucide-react';
import { useSearch } from '../hooks/search';
import TrackRow from '../components/ui/TrackRow';
import MediaCard from '../components/ui/MediaCard';
import { useCatalogTracks } from '../hooks/tracks';
import { useAudiobooksQuery } from '../hooks/audiobooks';
import { useI18n } from '../lib/i18n';

export const Route = createFileRoute('/search')({ component: SearchPage });

function SearchPage() {
  const { tracks } = useCatalogTracks();
  const { data: audiobooks = [] } = useAudiobooksQuery();
  const { query, setQuery, results, hasResults } = useSearch(tracks, audiobooks);
  const navigate = useNavigate();
  const { copy } = useI18n();
  const genres = [
    { id: 'pop', label: copy.search.genres.pop, color: 'from-pink-500 to-rose-600', emoji: '🎵' },
    {
      id: 'rock',
      label: copy.search.genres.rock,
      color: 'from-orange-500 to-red-600',
      emoji: '🎸',
    },
    {
      id: 'hiphop',
      label: copy.search.genres.hiphop,
      color: 'from-yellow-500 to-orange-500',
      emoji: '🎤',
    },
    {
      id: 'electronic',
      label: copy.search.genres.electronic,
      color: 'from-cyan-500 to-blue-600',
      emoji: '🎛️',
    },
    {
      id: 'kpop',
      label: copy.search.genres.kpop,
      color: 'from-purple-500 to-pink-600',
      emoji: '✨',
    },
    {
      id: 'jazz',
      label: copy.search.genres.jazz,
      color: 'from-amber-600 to-yellow-500',
      emoji: '🎷',
    },
    {
      id: 'classical',
      label: copy.search.genres.classical,
      color: 'from-emerald-500 to-teal-600',
      emoji: '🎹',
    },
    {
      id: 'rnb',
      label: copy.search.genres.rnb,
      color: 'from-indigo-500 to-purple-600',
      emoji: '🎙️',
    },
  ];

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <h1 className="text-white text-2xl font-bold mb-4">{copy.search.title}</h1>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={copy.search.placeholder}
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
              <h2 className="text-white font-bold mb-2">{copy.search.tracks}</h2>
              <div className="space-y-1">
                {results.tracks.map((t) => (
                  <TrackRow key={t.id} track={t} queue={tracks} />
                ))}
              </div>
            </div>
          )}
          {results.artists.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-3">{copy.search.artists}</h2>
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
              <h2 className="text-white font-bold mb-3">{copy.search.albums}</h2>
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
          {results.audiobooks.length > 0 && (
            <div>
              <h2 className="text-white font-bold mb-3">{copy.search.audiobooks}</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {results.audiobooks.map((book) => (
                  <MediaCard
                    key={book.id}
                    image={book.coverUrl}
                    title={book.title}
                    subtitle={book.author}
                    onClick={() => navigate({ to: '/audiobook/$id', params: { id: book.id } })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : query && !hasResults ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={48} className="text-muted mb-4" />
          <p className="text-white font-semibold mb-1">{copy.common.noResults}</p>
          <p className="text-muted text-sm">{copy.common.tryAnotherQuery}</p>
        </div>
      ) : (
        <>
          <h2 className="text-white font-bold mb-3">{copy.search.browseGenres}</h2>
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
