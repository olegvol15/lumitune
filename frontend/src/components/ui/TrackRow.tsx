import { Heart, MoreVertical, Play } from "lucide-react";
import { formatDuration, formatPlayCount } from "../../utils/format";
import type { Track } from "../../types";
import { usePlayerStore } from "../../store/playerStore";

interface TrackRowProps {
  track: Track;
  index?: number;
  queue?: Track[];
  showIndex?: boolean;
  showPlayCount?: boolean;
}

export default function TrackRow({
  track,
  index,
  queue,
  showIndex = false,
  showPlayCount = false,
}: TrackRowProps) {
  const { play, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      play(track, queue);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-xl group hover:bg-surface-alt transition-colors ${
        isActive ? "bg-surface-alt" : ""
      }`}
    >
      {/* Index / album art */}
      <div className="relative flex-shrink-0 w-10 h-10">
        <img
          src={track.albumCover}
          alt={track.albumTitle}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isActive && isPlaying ? (
            <span className="w-2.5 h-2.5 bg-brand rounded-sm" />
          ) : (
            <Play size={14} className="text-white fill-white ml-0.5" />
          )}
        </button>
        {showIndex && index !== undefined && (
          <span
            className={`absolute inset-0 flex items-center justify-center text-xs font-bold group-hover:opacity-0 transition-opacity ${
              isActive ? "text-brand" : "text-muted"
            }`}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${isActive ? "text-brand" : "text-white"}`}
        >
          {track.title}
        </p>
        <p className="text-xs text-muted truncate">{track.artistName}</p>
      </div>

      {/* Play count or duration */}
      {showPlayCount ? (
        <span className="text-xs text-muted flex-shrink-0">
          {formatPlayCount(track.playCount)}
        </span>
      ) : (
        <span className="text-xs text-muted flex-shrink-0">
          {formatDuration(track.duration)}
        </span>
      )}

      {/* Like + more */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded-full hover:bg-white/10">
          <Heart
            size={14}
            className={track.liked ? "text-brand fill-brand" : "text-muted"}
          />
        </button>
        <button className="p-1.5 rounded-full hover:bg-white/10">
          <MoreVertical size={14} className="text-muted" />
        </button>
      </div>
    </div>
  );
}
