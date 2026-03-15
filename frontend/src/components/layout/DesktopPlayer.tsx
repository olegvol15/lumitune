import { useRef } from 'react';
import {
  Heart,
  Plus,
  Volume2,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Maximize2,
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { formatDuration } from '../../utils/format';
import SongCoverImage from '../ui/SongCoverImage';

export default function DesktopPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    next,
    prev,
    seek,
    progress,
    toggleLike,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    volume,
    setVolume,
  } = usePlayerStore();

  const barRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pct);
  };

  if (!currentTrack) return null;

  const elapsed = progress * currentTrack.duration;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[72px] bg-[#060d19] border-t border-[#1a3050] flex items-center px-5 gap-6">
      {/* Left: album art + track info + actions */}
      <div className="flex items-center gap-3 w-64 flex-shrink-0">
        <SongCoverImage
          src={currentTrack.albumCover}
          alt={currentTrack.albumTitle}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold truncate leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-white/45 text-xs truncate leading-tight mt-0.5">
            {currentTrack.artistName}
          </p>
        </div>
        <button onClick={toggleLike} className="flex-shrink-0 transition-colors">
          <Heart
            size={16}
            className={
              currentTrack.liked
                ? 'text-[#1CA2EA] fill-[#1CA2EA]'
                : 'text-white/45 hover:text-white'
            }
          />
        </button>
        <button className="flex-shrink-0 text-white/45 hover:text-white transition-colors">
          <Plus size={16} />
        </button>
      </div>

      {/* Center: transport controls + progress row */}
      <div className="flex-1 min-w-0 flex flex-col items-center gap-2">
        {/* Transport controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={toggleRepeat}
            className={`transition-colors ${
              repeat !== 'off' ? 'text-[#1CA2EA]' : 'text-white/45 hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
          </button>

          <button onClick={prev} className="text-white/70 hover:text-white transition-colors">
            <SkipBack size={17} fill="currentColor" />
          </button>

          {/* Outlined circle play button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center hover:border-white transition-colors flex-shrink-0"
          >
            {isPlaying ? (
              <Pause size={14} fill="white" className="text-white" />
            ) : (
              <Play size={14} fill="white" className="text-white ml-0.5" />
            )}
          </button>

          <button onClick={next} className="text-white/70 hover:text-white transition-colors">
            <SkipForward size={17} fill="currentColor" />
          </button>

          <button
            onClick={toggleShuffle}
            className={`transition-colors ${
              shuffle ? 'text-[#1CA2EA]' : 'text-white/45 hover:text-white'
            }`}
          >
            <Shuffle size={15} />
          </button>
        </div>

        {/* Progress row: elapsed | bar | total */}
        <div className="flex items-center gap-3 w-full max-w-lg">
          <span className="text-[11px] text-white/40 flex-shrink-0 tabular-nums">
            {formatDuration(elapsed)}
          </span>

          <div
            ref={barRef}
            onClick={handleSeek}
            className="flex-1 relative h-1 bg-white/20 rounded-full cursor-pointer group"
          >
            <div
              className="absolute inset-y-0 left-0 bg-white rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>

          <span className="text-[11px] text-white/40 flex-shrink-0 tabular-nums">
            {formatDuration(currentTrack.duration)}
          </span>
        </div>
      </div>

      {/* Right: volume */}
      <div className="flex items-center gap-2.5 w-64 justify-end flex-shrink-0">
        <Volume2 size={16} className="text-white/45 flex-shrink-0" />

        {/* Volume slider */}
        <div className="relative w-24 h-1 bg-white/20 rounded-full group cursor-pointer flex-shrink-0">
          <div
            className="absolute inset-y-0 left-0 bg-white rounded-full"
            style={{ width: `${volume * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        <button className="text-white/45 hover:text-white transition-colors ml-1">
          <Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
}
