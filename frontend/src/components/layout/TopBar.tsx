import {
  Bell,
  BookOpen,
  Disc3,
  History,
  Mic,
  Music2,
  Podcast,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useRef, useState } from 'react';
import LogoIcon from '../ui/LogoIcon';
import AccountDropdown from '../ui/AccountDropdown';
import Button from '../ui/Button';
import { useI18n } from '../../lib/i18n';
import { useCatalogTracks } from '../../hooks/tracks';
import { useAlbumsQuery } from '../../hooks/albums';
import { useArtistsQuery } from '../../hooks/artists';
import { useAudiobooksQuery } from '../../hooks/audiobooks';
import { usePodcastsQuery } from '../../hooks/podcasts';
import { usePlayerStore } from '../../store/playerStore';
import type { Album, Artist, Audiobook, Podcast as PodcastType, Track } from '../../types';

type SearchResult =
  | { type: 'track'; id: string; title: string; subtitle: string; image: string; item: Track }
  | { type: 'artist'; id: string; title: string; subtitle: string; image: string; item: Artist }
  | { type: 'album'; id: string; title: string; subtitle: string; image: string; item: Album }
  | { type: 'audiobook'; id: string; title: string; subtitle: string; image: string; item: Audiobook }
  | { type: 'podcast'; id: string; title: string; subtitle: string; image: string; item: PodcastType };

const RECENT_SEARCHES_KEY = 'lumitune_recent_searches';
const MAX_RECENT_SEARCHES = 7;

const getRecentSearches = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
};

const saveRecentSearches = (items: string[]) => {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, MAX_RECENT_SEARCHES)));
};

const matchesQuery = (query: string, values: Array<string | undefined>) =>
  values.some((value) => value?.toLowerCase().includes(query));

const resultIcon = {
  track: Music2,
  artist: UserRound,
  album: Disc3,
  audiobook: BookOpen,
  podcast: Podcast,
};

export default function TopBar() {
  const { copy } = useI18n();
  const navigate = useNavigate();
  const play = usePlayerStore((state) => state.play);
  const { tracks } = useCatalogTracks();
  const { data: albums = [] } = useAlbumsQuery();
  const { data: artists = [] } = useArtistsQuery();
  const { data: audiobooks = [] } = useAudiobooksQuery();
  const { data: podcasts = [] } = usePodcastsQuery();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  const rootRef = useRef<HTMLFormElement | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo<SearchResult[]>(() => {
    if (!normalizedQuery) return [];

    const trackResults: SearchResult[] = tracks
      .filter((track) =>
        matchesQuery(normalizedQuery, [track.title, track.artistName, track.albumTitle])
      )
      .slice(0, 4)
      .map((track) => ({
        type: 'track',
        id: track.id,
        title: track.title,
        subtitle: track.artistName,
        image: track.albumCover,
        item: track,
      }));

    const artistResults: SearchResult[] = artists
      .filter((artist) => matchesQuery(normalizedQuery, [artist.name, artist.genre]))
      .slice(0, 3)
      .map((artist) => ({
        type: 'artist',
        id: artist.id,
        title: artist.name,
        subtitle: artist.genre || copy.search.artists,
        image: artist.image,
        item: artist,
      }));

    const albumResults: SearchResult[] = albums
      .filter((album) => matchesQuery(normalizedQuery, [album.title, album.artistName, album.genre]))
      .slice(0, 3)
      .map((album) => ({
        type: 'album',
        id: album.id,
        title: album.title,
        subtitle: album.artistName,
        image: album.coverUrl,
        item: album,
      }));

    const audiobookResults: SearchResult[] = audiobooks
      .filter((book) => matchesQuery(normalizedQuery, [book.title, book.author, book.genre]))
      .slice(0, 2)
      .map((book) => ({
        type: 'audiobook',
        id: book.id,
        title: book.title,
        subtitle: book.author,
        image: book.coverUrl,
        item: book,
      }));

    const podcastResults: SearchResult[] = podcasts
      .filter((podcastItem) =>
        matchesQuery(normalizedQuery, [
          podcastItem.title,
          podcastItem.author,
          podcastItem.category,
          podcastItem.description,
        ])
      )
      .slice(0, 2)
      .map((podcastItem) => ({
        type: 'podcast',
        id: podcastItem.id,
        title: podcastItem.title,
        subtitle: podcastItem.author,
        image: podcastItem.coverUrl,
        item: podcastItem,
      }));

    return [
      ...trackResults,
      ...artistResults,
      ...albumResults,
      ...audiobookResults,
      ...podcastResults,
    ].slice(0, 10);
  }, [
    albums,
    artists,
    audiobooks,
    copy.search.artists,
    normalizedQuery,
    podcasts,
    tracks,
  ]);

  const rememberSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const nextRecentSearches = [
      trimmed,
      ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(nextRecentSearches);
    saveRecentSearches(nextRecentSearches);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setOpen(true);
  };

  const selectResult = (result: SearchResult) => {
    rememberSearch(query || result.title);
    closeDropdown();
    setQuery('');

    if (result.type === 'track') {
      play(result.item, tracks);
      return;
    }

    if (result.type === 'artist') {
      navigate({ to: '/artist/$id', params: { id: result.id } });
      return;
    }

    if (result.type === 'album') {
      navigate({ to: '/album/$id', params: { id: result.id } });
      return;
    }

    if (result.type === 'audiobook') {
      navigate({ to: '/audiobook/$id', params: { id: result.id } });
      return;
    }

    navigate({ to: '/podcast/$id', params: { id: result.id } });
  };

  const selectRecentSearch = (value: string) => {
    setQuery(value);
    setOpen(true);
  };

  const removeRecentSearch = (value: string) => {
    const nextRecentSearches = recentSearches.filter((item) => item !== value);
    setRecentSearches(nextRecentSearches);
    saveRecentSearches(nextRecentSearches);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (results[0]) {
      selectResult(results[0]);
      return;
    }

    rememberSearch(query);
  };

  const showRecentSearches = open && !normalizedQuery && recentSearches.length > 0;
  const showResults = open && normalizedQuery.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#060d19]/85 backdrop-blur-md border-b border-[#1a3050] flex items-center px-5 gap-4">
      {/* Logo only — no text */}
      <Link to="/" className="flex items-center flex-shrink-0 pl-1">
        <LogoIcon className="w-12 h-auto" />
      </Link>

      {/* Search — capped width, centered */}
      <div className="flex-1 flex justify-center">
      <form ref={rootRef} onSubmit={submitSearch} className="w-full max-w-xl relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
              closeDropdown();
            }
          }}
          placeholder={copy.search.topbarPlaceholder}
          className="w-full bg-[#0a1929] border border-[#1a3050] rounded-full pl-9 pr-10 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#1CA2EA]/60"
        />
        <Mic size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        {(showRecentSearches || showResults) && (
          <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-xl border border-[#263e64] bg-[#050914] shadow-[0_24px_60px_rgba(0,0,0,0.48)]">
            {showRecentSearches && (
              <div className="py-2">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-white/65 hover:bg-white/8 hover:text-white"
                  >
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectRecentSearch(item)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <History size={17} className="shrink-0 text-white/45" />
                      <span className="truncate">{item}</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => removeRecentSearch(item)}
                      className="rounded-full p-1 text-white/35 transition hover:bg-white/10 hover:text-white"
                      aria-label={`Remove ${item}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showResults && (
              <div className="max-h-[420px] overflow-y-auto py-2">
                {results.length > 0 ? (
                  results.map((result) => {
                    const Icon = resultIcon[result.type];

                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectResult(result)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/8"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#10213a]">
                          {result.image ? (
                            <img
                              src={result.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon size={17} className="text-[#8AB8F0]" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-white">
                            {result.title}
                          </span>
                          <span className="block truncate text-xs capitalize text-white/45">
                            {result.type} · {result.subtitle}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search size={28} className="mx-auto mb-2 text-white/35" />
                    <p className="text-sm font-semibold text-white">{copy.common.noResults}</p>
                    <p className="mt-1 text-xs text-white/45">{copy.common.tryAnotherQuery}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </form>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 flex-shrink-0 justify-end pr-1">
        <Button
          variant="ghost"
          size="sm"
          shape="pill"
          className="h-10 w-10 !rounded-full !p-0 !text-white/60 hover:!text-white"
          aria-label={copy.nav.notifications}
        >
          <Bell size={20} />
        </Button>
        <AccountDropdown />
      </div>
    </header>
  );
}
