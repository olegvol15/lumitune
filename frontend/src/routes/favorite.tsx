import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Heart, Pause, Play, Search } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useCatalogTracks } from '../hooks/tracks';
import { useI18n } from '../lib/i18n';
import { useAuthStore } from '../store/authStore';
import { formatDuration } from '../utils/format';
import TrackCard from '../components/ui/TrackCard';
import { useLikedSongsQuery, useToggleTrackLikeMutation } from '../hooks/likes';

export const Route = createFileRoute('/favorite')({ component: FavoritePage });

function FavoriteHero({
  ownerName,
  avatarUrl,
  trackCount,
}: {
  ownerName: string;
  avatarUrl?: string;
  trackCount: number;
}) {
  const { copy } = useI18n();
  const hearts = Array.from({ length: 28 });

  return (
    <header className="relative mb-8 min-h-[220px] overflow-hidden rounded-t-3xl border border-[#24455a] bg-gradient-to-br from-[#071122] via-[#082133] to-[#06251f]">
      <div className="absolute inset-0 opacity-35">
        {hearts.map((_, index) => (
          <Heart
            key={index}
            size={34}
            strokeWidth={1.45}
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
        <h1 className="text-4xl font-black leading-none tracking-normal text-white sm:text-5xl lg:text-6xl">
          {copy.favorites.title}
        </h1>
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
          {trackCount} {copy.common.tracks}
        </p>
      </div>
    </header>
  );
}

function FavoritePage() {
  const [query, setQuery] = useState('');
  const play = usePlayerStore((s) => s.play);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const { tracks } = useCatalogTracks();
  const { data: likedTracksData = [] } = useLikedSongsQuery();
  const toggleTrackLikeMutation = useToggleTrackLikeMutation();
  const { copy } = useI18n();
  const user = useAuthStore((state) => state.user);

  const catalogTracksById = new Map(tracks.map((track) => [track.id, track]));
  const likedTracks = likedTracksData.map((track) => ({
    ...(catalogTracksById.get(track.id) ?? track),
    liked: true,
  }));
  const ownerName = user?.displayName || user?.username || 'HannaD';
  const avatarUrl =
    user?.profilePicture && user.profilePicture !== 'default-avatar.png'
      ? user.profilePicture
      : undefined;

  const sorted = [...likedTracks];
  const filteredTracks = sorted.filter((track) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return [track.title, track.artistName, track.albumTitle]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  const playAll = () => {
    if (filteredTracks.length === 0) return;
    if (currentTrack && filteredTracks.some((track) => track.id === currentTrack.id)) {
      togglePlay();
      return;
    }
    play(filteredTracks[0], filteredTracks);
  };
  const isFavoriteQueueActive = Boolean(
    currentTrack && filteredTracks.some((track) => track.id === currentTrack.id)
  );

  return (
    <div className="px-5 pb-12 pt-2 sm:px-8 lg:px-3">
      <FavoriteHero ownerName={ownerName} avatarUrl={avatarUrl} trackCount={likedTracks.length} />

      <div className="px-0 lg:px-10">
        <div className="mb-7 flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-5 text-[#9deaff]">
            <button
              type="button"
              onClick={playAll}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#9deaff] transition-colors hover:bg-[#9deaff]/10"
              aria-label={copy.common.playAll}
            >
              {isFavoriteQueueActive && isPlaying ? (
                <Pause size={22} className="fill-[#9deaff] text-[#9deaff]" />
              ) : (
                <Play size={22} className="ml-0.5 fill-[#9deaff] text-[#9deaff]" />
              )}
            </button>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bfefff]/70" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search.placeholder}
              className="w-full rounded-full border border-[#24455a] bg-[#07162a]/70 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#9deaff]"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              queue={filteredTracks}
              metadata={[
                { key: 'album', label: track.albumTitle, className: 'w-36' },
                { key: 'duration', label: formatDuration(track.duration), className: 'w-12 text-right' },
              ]}
              action={
                <button
                  type="button"
                  onClick={() =>
                    toggleTrackLikeMutation.mutate({
                      songId: track.id,
                      liked: track.liked,
                    })
                  }
                  disabled={toggleTrackLikeMutation.isPending}
                  className="rounded-full p-1.5 text-brand transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Unlike track"
                >
                  <Heart size={16} className="fill-brand text-brand" />
                </button>
              }
              onPlay={() => play(track, filteredTracks)}
            />
          ))}
        </div>

      {likedTracks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={48} className="text-muted mb-4" />
          <p className="text-white font-semibold">{copy.favorites.emptyTitle}</p>
          <p className="text-muted text-sm mt-1">{copy.favorites.emptyBody}</p>
        </div>
      )}
      </div>
    </div>
  );
}
