import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Search, Mic, X } from 'lucide-react';
import { useSearch } from '../hooks/search';
import TrackRow from '../components/ui/TrackRow';
import MediaCard from '../components/ui/MediaCard';
import { useCatalogTracks } from '../hooks/tracks';
import { useAudiobooksQuery } from '../hooks/audiobooks';
import { useAlbumsQuery } from '../hooks/albums';
import { useI18n } from '../lib/i18n';
import { useArtistsQuery } from '../hooks/artists';

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const { tracks } = useCatalogTracks();
  const { data: audiobooks = [] } = useAudiobooksQuery();
  const { data: albums = [] } = useAlbumsQuery();
  const { data: artists = [] } = useArtistsQuery();
  const navigate = useNavigate();
  const { query, setQuery, results, hasResults } = useSearch(
    tracks,
    audiobooks,
    albums,
    artists,
    search.q
  );
  const { copy } = useI18n();
  const genreColors = [
    'border-[#2f73bf] bg-[#0f2945]',
    'border-[#30b7aa] bg-[#102f34]',
    'border-[#7c5cff] bg-[#21194a]',
    'border-[#d94f8c] bg-[#3a1730]',
    'border-[#d69b35] bg-[#382711]',
    'border-[#4c8dff] bg-[#15284d]',
    'border-[#5fbf72] bg-[#163421]',
    'border-[#9a6cff] bg-[#291c46]',
  ];
  const genres = Array.from(
    new Set([
      ...albums.map((album) => album.genre).filter(Boolean),
      ...audiobooks.map((book) => book.genre).filter(Boolean),
      ...artists.map((artist) => artist.genre).filter(Boolean),
    ])
  ).map((label, index) => ({
    id: label.toLowerCase().replace(/\s+/g, '-'),
    label,
    color: genreColors[index % genreColors.length],
  }));

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    const trimmedQuery = nextQuery.trim();

    navigate({
      to: '/search',
      search: { q: trimmedQuery },
      replace: true,
    });
  };

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <h1 className="text-white text-2xl font-bold mb-4">{copy.search.title}</h1>

      {/* Mobile search bar */}
      <div className="relative mb-5 lg:hidden">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder={copy.search.placeholder}
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          className="w-full bg-surface-alt text-white placeholder-muted rounded-xl py-3 pl-10 pr-10 outline-none focus:ring-2 focus:ring-brand/50 text-sm"
        />
        {query ? (
          <button
            onClick={() => updateQuery('')}
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => updateQuery(g.label)}
                className={`relative flex h-24 items-end overflow-hidden rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-[#8AB8F0] hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] ${g.color}`}
              >
                <span className="absolute right-3 top-3 h-10 w-10 rounded-full border border-white/10 bg-white/5" />
                <span className="relative text-sm font-bold text-white">{g.label}</span>
              </button>
            ))}
          </div>
          {genres.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={48} className="text-muted mb-4" />
              <p className="text-white font-semibold mb-1">{copy.common.noResults}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
