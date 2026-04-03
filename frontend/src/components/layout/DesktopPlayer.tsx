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
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useThemeStore } from '../../store/themeStore';
import { formatDuration } from '../../utils/format';
import SongCoverImage from '../ui/SongCoverImage';
import { slideUp } from '../../lib/motion';

export default function DesktopPlayer() {
  const {
    currentTrack,
    currentEpisode,
    currentAudiobook,
    currentAudiobookChapter,
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

  const isLight = useThemeStore((s) => s.theme === 'ice');
  const barRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(pct);
  };

  const activeMedia = currentTrack
    ? { cover: currentTrack.albumCover, label: currentTrack.albumTitle, title: currentTrack.title, subtitle: currentTrack.artistName, duration: currentTrack.duration, isEpisode: false }
    : currentEpisode
    ? { cover: currentEpisode.podcastCover, label: currentEpisode.podcastTitle, title: currentEpisode.title, subtitle: currentEpisode.podcastTitle, duration: currentEpisode.duration, isEpisode: true }
    : currentAudiobookChapter && currentAudiobook
    ? {
        cover: currentAudiobookChapter.audiobookCover,
        label: currentAudiobook.title,
        title: currentAudiobookChapter.title,
        subtitle: `${currentAudiobook.author} · ${currentAudiobook.title}`,
        duration: currentAudiobookChapter.duration,
        isEpisode: true,
      }
    : null;

  const elapsed = activeMedia ? progress * activeMedia.duration : 0;

  return (
    <AnimatePresence>
      {activeMedia && (
        <motion.div
          className={`desktop-player fixed bottom-0 left-0 right-0 z-50 h-[72px] border-t flex items-center px-5 gap-6 ${isLight ? 'bg-[#aacfe4] border-[#8fbdcf]' : 'bg-[#060d19] border-[#1a3050]'}`}
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Left: album art + track info + actions */}
          <div className="flex items-center gap-3 w-64 flex-shrink-0">
            <SongCoverImage
              src={activeMedia.cover}
              alt={activeMedia.label}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate leading-tight">
                {activeMedia.title}
              </p>
              <p className="text-white/45 text-xs truncate leading-tight mt-0.5">
                {activeMedia.subtitle}
              </p>
            </div>
            {!activeMedia.isEpisode && (
              <button onClick={toggleLike} className="flex-shrink-0 transition-colors">
                <Heart
                  size={16}
                  className={
                    currentTrack?.liked
                      ? 'text-[#1CA2EA] fill-[#1CA2EA]'
                      : 'text-white/45 hover:text-white'
                  }
                />
              </button>
            )}
            {!currentAudiobookChapter && (
              <button className="flex-shrink-0 text-white/45 hover:text-white transition-colors">
                <Plus size={16} />
              </button>
            )}
          </div>

          {/* Center: transport controls + progress row */}
          <div className="flex-1 min-w-0 flex flex-col items-center gap-2">
            {/* Transport controls */}
            <div className="flex items-center gap-5">
              {!currentAudiobookChapter ? (
                <button
                  onClick={toggleRepeat}
                  className={`transition-colors ${
                    repeat !== 'off' ? 'text-[#1CA2EA]' : 'text-white/45 hover:text-white'
                  }`}
                >
                  {repeat === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
                </button>
              ) : (
                <div className="w-[15px]" />
              )}

              <button onClick={prev} className="text-white/70 hover:text-white transition-colors">
                <SkipBack size={17} fill="currentColor" />
              </button>

              {/* Outlined circle play button */}
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full border border-white/60 flex items-center justify-center hover:border-white transition-colors flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause size={14} className="text-white fill-white" />
                ) : (
                  <Play size={14} className="text-white fill-white ml-0.5" />
                )}
              </button>

              <button onClick={next} className="text-white/70 hover:text-white transition-colors">
                <SkipForward size={17} fill="currentColor" />
              </button>

              {!currentAudiobookChapter ? (
                <button
                  onClick={toggleShuffle}
                  className={`transition-colors ${
                    shuffle ? 'text-[#1CA2EA]' : 'text-white/45 hover:text-white'
                  }`}
                >
                  <Shuffle size={15} />
                </button>
              ) : (
                <div className="w-[15px]" />
              )}
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
                {formatDuration(activeMedia.duration)}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
