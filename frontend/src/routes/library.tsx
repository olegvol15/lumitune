import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Disc3, Music2, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePlaylistsQuery, useCreatePlaylistMutation } from '../hooks/playlists';
import { useSavedAudiobooksQuery, useAudiobooksQuery } from '../hooks/audiobooks';
import { usePodcastsQuery } from '../hooks/podcasts';
import { useSavedAlbumsQuery } from '../hooks/albums';
import { useCatalogTracks } from '../hooks/tracks';
import { usePlayerStore } from '../store/playerStore';
import { formatListeners, formatLongDuration } from '../utils/format';
import { useI18n } from '../lib/i18n';
import { useArtistsQuery } from '../hooks/artists';
import type { Track, Artist, Audiobook, Podcast } from '../types';
import type { UserPlaylist } from '../types/store/store.types';

export const Route = createFileRoute('/library')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/signin' });
  },
  component: LibraryPage,
});

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: string;
  children: ReactNode;
}) {
  const accentIndex = accent ? title.indexOf(accent) : -1;
  const before = accentIndex >= 0 ? title.slice(0, accentIndex) : title;
  const after = accentIndex >= 0 && accent ? title.slice(accentIndex + accent.length) : '';

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[#c8f6ff] lg:text-2xl">
          {before}
          {accent && <span className="text-[#1CA2EA]">{accent}</span>}
          {after}
        </h2>
        <div className="hidden items-center gap-4 text-[#7aa7ff] sm:flex">
          <ChevronLeft size={20} strokeWidth={1.8} />
          <ChevronRight size={20} strokeWidth={1.8} />
        </div>
      </div>
      {children}
    </section>
  );
}

function HorizontalRow({ children }: { children: ReactNode }) {
  return <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-none">{children}</div>;
}

function LibraryHero({
  ownerName,
  avatarUrl,
  itemCount,
}: {
  ownerName: string;
  avatarUrl?: string;
  itemCount: number;
}) {
  const { copy } = useI18n();
  const discs = Array.from({ length: 28 });

  return (
    <header className="relative mb-10 min-h-[220px] overflow-hidden rounded-t-3xl border border-[#24455a] bg-gradient-to-br from-[#071122] via-[#082133] to-[#06251f]">
      <div className="absolute inset-0 opacity-35">
        {discs.map((_, index) => (
          <Disc3
            key={index}
            size={34}
            strokeWidth={1.35}
            className="absolute text-[#1CA2EA]"
            style={{
              left: `${5 + (index % 10) * 10}%`,
              top: `${9 + Math.floor(index / 10) * 31 + (index % 2) * 8}%`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-transparent to-transparent" />
      <div className="relative flex min-h-[220px] flex-col justify-center px-7 pb-12 pt-6 sm:px-10">
        <h2 className="text-4xl font-black leading-none tracking-normal text-white sm:text-5xl lg:text-6xl">
          {copy.nav.myLibrary}
        </h2>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-[#07162a]/65 px-7 py-3 backdrop-blur-sm sm:px-10">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#12385a] text-xs font-bold text-white">
            {ownerName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <p className="text-sm font-semibold text-white">{ownerName}</p>
        <span className="text-sm text-white/50">·</span>
        <p className="text-sm text-white/80">
          {itemCount} {copy.common.tracks}
        </p>
      </div>
    </header>
  );
}

function AddTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-16 shrink-0 flex-col items-center justify-center gap-2 text-white/60 transition-colors hover:text-white"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <Plus size={20} />
      </span>
      <span className="text-xs">{label}</span>
    </button>
  );
}

function SquareCard({
  image,
  title,
  subtitle,
  fallbackIcon,
  onClick,
}: {
  image?: string;
  title: string;
  subtitle?: string;
  fallbackIcon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-28 shrink-0 rounded-lg bg-[#0d2038]/95 p-1.5 text-left transition-colors hover:bg-[#132b48] sm:w-36"
    >
      <div className="mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#12385a] to-[#07111f]">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          fallbackIcon ?? <Music2 size={28} className="text-[#1CA2EA]" />
        )}
      </div>
      <p className="truncate text-sm font-medium text-white">{title}</p>
      {subtitle && <p className="mt-0.5 truncate text-xs text-white/45">{subtitle}</p>}
    </button>
  );
}

function ArtistCard({ artist, onClick }: { artist: Artist; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-32 shrink-0 text-center sm:w-40">
      <img
        src={artist.image}
        alt={artist.name}
        className="mx-auto mb-3 h-28 w-28 rounded-full object-cover transition-opacity hover:opacity-85 sm:h-36 sm:w-36"
      />
      <p className="truncate text-sm font-semibold text-white">{artist.name}</p>
      <p className="mt-1 text-xs text-white/45">{formatListeners(artist.monthlyListeners)}</p>
    </button>
  );
}

function MixCard({ playlist, tracks }: { playlist: UserPlaylist; tracks: Track[] }) {
  const covers = playlist.trackIds
    .map((trackId) => tracks.find((track) => track.id === trackId)?.albumCover)
    .filter((cover): cover is string => Boolean(cover))
    .slice(0, 3);

  return (
    <div className="w-44 shrink-0 rounded-xl bg-gradient-to-br from-[#123a3f] to-[#0c1730] p-3">
      <div className="relative mb-4 h-28">
        {(covers.length > 0 ? covers : [playlist.coverUrl]).map((cover, index) => (
          <div
            key={`${cover ?? playlist.id}-${index}`}
            className="absolute h-24 w-24 overflow-hidden rounded-lg bg-[#0b2038] shadow-lg"
            style={{ left: index * 18, top: index * 6, zIndex: covers.length - index }}
          >
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music2 size={24} className="text-[#1CA2EA]" />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="truncate text-lg font-semibold uppercase text-white">{playlist.title}</p>
      <p className="mt-1 truncate text-xs uppercase text-white/45">
        {playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'track' : 'tracks'}
      </p>
    </div>
  );
}

function PodcastCard({ podcast, onClick }: { podcast: Podcast; onClick: () => void }) {
  const latestEpisode = podcast.episodes?.[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-64 shrink-0 rounded-lg bg-[#0d2038]/95 p-4 text-left transition-colors hover:bg-[#132b48] lg:w-72"
    >
      <h3 className="truncate text-sm font-bold text-white">{latestEpisode?.title ?? podcast.title}</h3>
      <p className="mt-1 truncate text-xs text-white/60">{podcast.author}</p>
      <img src={podcast.coverUrl} alt={podcast.title} className="mt-4 h-40 w-full rounded object-cover" />
      <p className="mt-4 line-clamp-4 text-xs leading-relaxed text-white/55">{podcast.description}</p>
    </button>
  );
}

function AudiobookRow({ book, onClick }: { book: Audiobook; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full max-w-4xl gap-4 rounded-lg text-left transition-opacity hover:opacity-85"
    >
      <img src={book.coverUrl} alt={book.title} className="h-40 w-32 shrink-0 rounded object-cover" />
      <div className="min-w-0 py-1">
        <p className="font-semibold text-white">{book.title}</p>
        <p className="mt-1 text-sm font-medium text-white/70">{book.author}</p>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/45">{book.description}</p>
        <p className="mt-5 text-xs text-white/45">{book.publishedAt}</p>
        <p className="mt-1 text-xs text-white/45">{formatLongDuration(book.duration)}</p>
      </div>
    </button>
  );
}

function LibraryPage() {
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { copy } = useI18n();
  const user = useAuthStore((state) => state.user);
  const { tracks } = useCatalogTracks();
  const { data: playlists = [] } = usePlaylistsQuery();
  const { data: savedAudiobooks = [] } = useSavedAudiobooksQuery();
  const { data: audiobooks = [] } = useAudiobooksQuery();
  const { data: podcasts = [] } = usePodcastsQuery();
  const { data: savedAlbums = [] } = useSavedAlbumsQuery();
  const { data: artists = [] } = useArtistsQuery();
  const createMutation = useCreatePlaylistMutation();
  const play = usePlayerStore((state) => state.play);

  const personalPlaylists = playlists.filter((playlist) => playlist.kind === 'user');
  const curatedPlaylists = playlists.filter((playlist) => playlist.kind === 'curated');
  const allPlaylists = [...personalPlaylists, ...curatedPlaylists];
  const likedTracks = tracks.filter((track) => track.liked);
  const favoriteTracks = likedTracks.length > 0 ? likedTracks : tracks.slice(0, 8);
  const favoriteArtists = artists.slice(0, 5);
  const topMixes = allPlaylists.slice(0, 2);
  const likedAudiobooks = savedAudiobooks.length > 0 ? savedAudiobooks : audiobooks.slice(0, 1);
  const libraryItemCount =
    likedTracks.length + allPlaylists.length + savedAlbums.length + savedAudiobooks.length;
  const ownerName = user?.displayName || user?.username || 'HannaD';
  const avatarUrl =
    user?.profilePicture && user.profilePicture !== 'default-avatar.png'
      ? user.profilePicture
      : undefined;
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
    <div className="px-5 pb-12 pt-2 sm:px-8 lg:px-3">
      <LibraryHero ownerName={ownerName} avatarUrl={avatarUrl} itemCount={libraryItemCount} />

      <div className="px-0 lg:px-10">

      <Section title={copy.nav.favoriteTracks}>
        <HorizontalRow>
          {favoriteTracks.slice(0, 8).map((track) => (
            <SquareCard
              key={track.id}
              image={track.albumCover}
              title={track.title}
              subtitle={track.artistName}
              onClick={() => play(track, tracks)}
            />
          ))}
          <AddTile label={copy.home.allHere} onClick={() => navigate({ to: '/favorite' })} />
        </HorizontalRow>
      </Section>

      <Section title={copy.library.playlists}>
        <HorizontalRow>
          {allPlaylists.slice(0, 7).map((playlist) => (
            <SquareCard
              key={playlist.id}
              image={playlist.coverUrl}
              title={playlist.title}
              subtitle={`${playlist.trackIds.length} ${copy.common.tracks}`}
              fallbackIcon={<Music2 size={30} className="text-[#1CA2EA]" />}
              onClick={() => navigate({ to: '/playlist/$id', params: { id: playlist.id } })}
            />
          ))}
          <AddTile label={copy.home.allHere} onClick={openCreateConfirmation} />
        </HorizontalRow>
      </Section>

      <Section title={copy.home.favoriteArtists} accent={copy.home.favoriteArtistsAccent}>
        <HorizontalRow>
          {favoriteArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => navigate({ to: '/artist/$id', params: { id: artist.id } })}
            />
          ))}
          <AddTile label={copy.home.allHere} onClick={() => undefined} />
        </HorizontalRow>
      </Section>

      {topMixes.length > 0 && (
        <Section title={copy.library.topMixes} accent={copy.library.topMixesAccent}>
          <HorizontalRow>
            {topMixes.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                onClick={() => navigate({ to: '/playlist/$id', params: { id: playlist.id } })}
              >
                <MixCard playlist={playlist} tracks={tracks} />
              </button>
            ))}
          </HorizontalRow>
        </Section>
      )}

      {podcasts.length > 0 && (
        <Section title={copy.library.likedPodcasts} accent={copy.library.likedPodcastsAccent}>
          <HorizontalRow>
            {podcasts.slice(0, 3).map((podcast) => (
              <PodcastCard
                key={podcast.id}
                podcast={podcast}
                onClick={() => navigate({ to: '/podcast/$id', params: { id: podcast.id } })}
              />
            ))}
          </HorizontalRow>
        </Section>
      )}

      {likedAudiobooks.length > 0 && (
        <Section title={copy.library.likedAudiobooks} accent={copy.library.likedAudiobooksAccent}>
          <div className="space-y-5">
            {likedAudiobooks.slice(0, 2).map((book) => (
              <AudiobookRow
                key={book.id}
                book={book}
                onClick={() => navigate({ to: '/audiobook/$id', params: { id: book.id } })}
              />
            ))}
          </div>
        </Section>
      )}

      {savedAlbums.length > 0 && (
        <Section title={copy.library.albums}>
          <HorizontalRow>
            {savedAlbums.slice(0, 7).map((album) => (
              <SquareCard
                key={album.id}
                image={album.coverUrl}
                title={album.title}
                subtitle={`${album.artistName} · ${album.year}`}
                onClick={() => navigate({ to: '/album/$id', params: { id: album.id } })}
              />
            ))}
          </HorizontalRow>
        </Section>
      )}
      </div>

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
