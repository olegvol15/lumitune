import { Heart, MoreVertical, Pause, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDuration, formatPlayCount } from '../../utils/format';
import { usePlayerStore } from '../../store/playerStore';
import type { TrackRowProps } from '../../types/props/component-props.types';
import SongCoverImage from './SongCoverImage';
import { cardHover, cardTap } from '../../lib/motion';
import { useToggleTrackLikeMutation } from '../../hooks/likes';

export default function TrackRow({
  track,
  index,
  queue,
  showIndex = false,
  showPlayCount = false,
  disableHoverEffects = false,
  disableTapAnimation = false,
  playOnRowClick = false,
  alwaysShowPlayButton = false,
}: TrackRowProps) {
  const { play, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const toggleTrackLikeMutation = useToggleTrackLikeMutation();
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      play(track, queue);
    }
  };

  return (
    <motion.div
      className={`flex items-center gap-3 p-2 rounded-xl group transition-colors ${
        !disableHoverEffects ? 'hover:bg-surface-alt' : ''
      } ${
        isActive ? 'bg-surface-alt' : ''
      } ${
        playOnRowClick ? 'cursor-pointer' : ''
      }`}
      whileHover={disableHoverEffects ? undefined : cardHover}
      whileTap={disableTapAnimation ? undefined : cardTap}
      onClick={playOnRowClick ? handlePlay : undefined}
    >
      {/* Index / album art */}
      <div className="relative flex-shrink-0 w-10 h-10">
        <SongCoverImage
          src={track.albumCover}
          alt={track.albumTitle}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <button
          onClick={(event) => {
            event.stopPropagation();
            handlePlay();
          }}
          className={`absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg transition-opacity ${
            alwaysShowPlayButton
              ? 'opacity-100'
              : disableHoverEffects
              ? 'opacity-0 hover:opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isActive && isPlaying ? (
            <Pause size={14} className="text-white fill-white" />
          ) : (
            <Play size={14} className="text-white fill-white ml-0.5" />
          )}
        </button>
        {showIndex && index !== undefined && (
          <span
            className={`pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-bold transition-opacity ${
              alwaysShowPlayButton ? 'opacity-0' : disableHoverEffects ? '' : 'group-hover:opacity-0'
            } ${
              isActive ? 'text-brand' : 'text-muted'
            }`}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-brand' : 'text-white'}`}>
          {track.title}
        </p>
        <p className="text-xs text-muted truncate">{track.artistName}</p>
      </div>

      {/* Play count or duration */}
      {showPlayCount ? (
        <span className="text-xs text-muted flex-shrink-0">{formatPlayCount(track.playCount)}</span>
      ) : (
        <span className="text-xs text-muted flex-shrink-0">{formatDuration(track.duration)}</span>
      )}

      {/* Like + more */}
      <div
        className={`flex items-center gap-1 transition-opacity ${
          disableHoverEffects ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          onClick={(event) => {
            event.stopPropagation();
            toggleTrackLikeMutation.mutate({
              songId: track.id,
              liked: track.liked,
            });
          }}
          className="p-1.5 rounded-full hover:bg-white/10"
        >
          <Heart size={14} className={track.liked ? 'text-brand fill-brand' : 'text-muted'} />
        </button>
        <button
          onClick={(event) => event.stopPropagation()}
          className="p-1.5 rounded-full hover:bg-white/10"
        >
          <MoreVertical size={14} className="text-muted" />
        </button>
      </div>
    </motion.div>
  );
}
