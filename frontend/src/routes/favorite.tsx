import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Heart, SortAsc } from 'lucide-react';
import TrackRow from '../components/ui/TrackRow';
import { usePlayerStore } from '../store/playerStore';
import Button from '../components/ui/Button';
import type { FavoriteSortKey } from '../types/routes/route.types';
import { useCatalogTracks } from '../hooks/tracks';
import { useI18n } from '../lib/i18n';
import { useAuthStore } from '../store/authStore';

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
  const [sort, setSort] = useState<FavoriteSortKey>('recent');
  const play = usePlayerStore((s) => s.play);
  const { tracks } = useCatalogTracks();
  const { copy } = useI18n();
  const user = useAuthStore((state) => state.user);

  const likedTracks = tracks.filter((t) => t.liked);
  const ownerName = user?.displayName || user?.username || 'HannaD';
  const avatarUrl =
    user?.profilePicture && user.profilePicture !== 'default-avatar.png'
      ? user.profilePicture
      : undefined;

  const sorted = [...likedTracks].sort((a, b) => {
    if (sort === 'az') return a.title.localeCompare(b.title);
    if (sort === 'artist') return a.artistName.localeCompare(b.artistName);
    return 0; // recent = original order
  });

  const playAll = () => {
    if (sorted.length > 0) play(sorted[0], sorted);
  };

  return (
    <div className="px-5 pb-12 pt-2 sm:px-8 lg:px-3">
      <FavoriteHero ownerName={ownerName} avatarUrl={avatarUrl} trackCount={likedTracks.length} />

      <div className="px-0 lg:px-10">

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <Button variant="secondary" shape="pill" onClick={playAll} className="px-6">
          {copy.common.playAll}
        </Button>
        <div className="relative">
          <button className="flex items-center gap-1.5 p-2.5 bg-surface-alt rounded-full text-muted text-sm">
            <SortAsc size={16} />
          </button>
        </div>
      </div>

      {/* Sort pills */}
      <div className="flex gap-2 mb-4">
        {(['recent', 'az', 'artist'] as FavoriteSortKey[]).map((s) => (
          <Button
            key={s}
            variant={sort === s ? 'secondary' : 'ghost'}
            shape="pill"
            size="sm"
            onClick={() => setSort(s)}
            className={sort !== s ? 'bg-surface-alt' : ''}
          >
            {s === 'recent' ? copy.favorites.recent : s === 'az' ? copy.favorites.az : copy.favorites.artist}
          </Button>
        ))}
      </div>

      {/* Track list */}
      <div className="space-y-1">
        {sorted.map((t) => (
          <TrackRow
            key={t.id}
            track={t}
            queue={sorted}
            disableHoverEffects
            disableTapAnimation
            playOnRowClick
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
