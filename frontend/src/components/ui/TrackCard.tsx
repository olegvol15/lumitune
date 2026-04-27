import type { ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import type { Track } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import SongCoverImage from './SongCoverImage';

export type TrackCardMetadata = {
  key: string;
  label: ReactNode;
  className?: string;
};

type TrackCardProps = {
  track: Track;
  queue?: Track[];
  onPlay?: (track: Track) => void;
  metadata?: TrackCardMetadata[];
  action?: ReactNode;
  showLeadingPlay?: boolean;
  className?: string;
};

export default function TrackCard({
  track,
  queue,
  onPlay,
  metadata = [],
  action,
  showLeadingPlay = false,
  className = '',
}: TrackCardProps) {
  const { play, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
      return;
    }

    if (onPlay) {
      onPlay(track);
      return;
    }

    play(track, queue);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handlePlay}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handlePlay();
        }
      }}
      className={`group flex w-full items-center gap-4 rounded-xl bg-[#0d2038]/45 px-4 py-2.5 text-left transition-colors hover:bg-[#132b48]/65 ${className}`}
    >
      {showLeadingPlay && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#07111f] text-[#9deaff]">
          {isActive && isPlaying ? (
            <Pause size={15} className="fill-[#9deaff] text-[#9deaff]" />
          ) : (
            <Play size={15} className="fill-[#9deaff] text-[#9deaff]" />
          )}
        </span>
      )}

      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        <SongCoverImage
          src={track.albumCover}
          alt={track.albumTitle}
          fallbackLabel={track.title}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handlePlay();
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={isActive && isPlaying ? 'Pause track' : 'Play track'}
        >
          {isActive && isPlaying ? (
            <Pause size={15} className="fill-white text-white" />
          ) : (
            <Play size={15} className="ml-0.5 fill-white text-white" />
          )}
        </button>
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-base font-semibold ${isActive ? 'text-brand' : 'text-white'}`}>
          {track.title}
        </p>
        <p className="truncate text-sm text-white/50">{track.artistName}</p>
      </div>

      {metadata.length > 0 && (
        <div className="hidden min-w-0 items-center gap-5 md:flex">
          {metadata.map((item) => (
            <span
              key={item.key}
              className={`truncate text-base text-white/75 ${item.className ?? ''}`}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}

      {action && (
        <span
          className="shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          {action}
        </span>
      )}
    </div>
  );
}
