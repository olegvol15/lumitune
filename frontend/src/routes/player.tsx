import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import {
  ChevronDown,
  Heart,
  MoreHorizontal,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Repeat1,
  BarChart2,
} from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import ProgressBar from '../components/player/ProgressBar';
import SongCoverImage from '../components/ui/SongCoverImage';
import Button from '../components/ui/Button';
import { useToggleTrackLikeMutation } from '../hooks/likes';
import { useI18n } from '../lib/i18n';

export const Route = createFileRoute('/player')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) throw redirect({ to: '/auth/signin' });
  },
  component: PlayerPage,
});

function PlayerPage() {
  const navigate = useNavigate();
  const { copy } = useI18n();
  const {
    currentTrack,
    currentEpisode,
    currentAudiobook,
    currentAudiobookChapter,
    queue,
    seek,
    progress,
    isPlaying,
    togglePlay,
    next,
    prev,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    play,
  } = usePlayerStore();
  const toggleTrackLikeMutation = useToggleTrackLikeMutation();

  const activeMedia = currentTrack
    ? {
        header: currentTrack.albumTitle,
        image: currentTrack.albumCover,
        imageAlt: currentTrack.albumTitle,
        title: currentTrack.title,
        subtitle: `by ${currentTrack.artistName}`,
        duration: currentTrack.duration,
        showLike: true,
        liked: currentTrack.liked,
      }
    : currentEpisode
    ? {
        header: currentEpisode.podcastTitle,
        image: currentEpisode.podcastCover,
        imageAlt: currentEpisode.podcastTitle,
        title: currentEpisode.title,
        subtitle: currentEpisode.podcastTitle,
        duration: currentEpisode.duration,
        showLike: false,
        liked: false,
      }
    : currentAudiobook && currentAudiobookChapter
    ? {
        header: currentAudiobook.title,
        image: currentAudiobookChapter.audiobookCover,
        imageAlt: currentAudiobook.title,
        title: currentAudiobookChapter.title,
        subtitle: `${currentAudiobook.author} · ${currentAudiobook.title}`,
        duration: currentAudiobookChapter.duration,
        showLike: false,
        liked: false,
      }
    : null;

  if (!activeMedia) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#060d19] px-4 text-center">
        <p className="text-muted mb-4">{copy.common.noActiveTrack}</p>
        <Button variant="secondary" shape="pill" onClick={() => navigate({ to: '/' })} className="px-6">
          {copy.common.goHome}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060d19] overflow-y-auto">
      {/* Background tint behind album art area */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #0d2035 0%, transparent 55%)' }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pt-12 pb-3 flex-shrink-0">
        <button onClick={() => window.history.back()} className="p-2 -ml-2">
          <ChevronDown size={26} className="text-white" />
        </button>
        <p className="text-white text-sm font-semibold truncate max-w-[200px]">
          {activeMedia.header}
        </p>
        <button className="p-2 -mr-2">
          <MoreHorizontal size={22} className="text-white/70" />
        </button>
      </div>

      {/* Album art */}
      <div className="relative px-6 pb-7 flex-shrink-0">
        <SongCoverImage
          src={activeMedia.image}
          alt={activeMedia.imageAlt}
          className="w-full aspect-square rounded-2xl object-cover shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
        />
      </div>

      {/* Track info + like */}
      <div className="relative px-6 mb-3 flex items-start justify-between gap-4 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-xl font-bold leading-snug">{activeMedia.title}</h1>
          <p className="text-white/50 text-sm mt-1">{activeMedia.subtitle}</p>
        </div>
        {activeMedia.showLike && (
          <button
            onClick={() => {
              if (currentTrack) {
                toggleTrackLikeMutation.mutate({
                  songId: currentTrack.id,
                  liked: currentTrack.liked,
                });
              }
            }}
            className="p-1 mt-1 flex-shrink-0"
          >
            <Heart
              size={24}
              className={activeMedia.liked ? 'text-brand fill-brand' : 'text-white/50'}
            />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative px-6 mb-6 flex-shrink-0">
        <ProgressBar progress={progress} onSeek={seek} duration={activeMedia.duration} />
      </div>

      {/* Controls: Repeat · Prev · Play · Next · Shuffle */}
      <div className="relative flex items-center justify-between px-8 mb-8 flex-shrink-0">
        {currentTrack ? (
          <button
            onClick={toggleRepeat}
            className={`transition-colors ${repeat !== 'off' ? 'text-brand' : 'text-white/45 hover:text-white'}`}
          >
            {repeat === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
          </button>
        ) : (
          <div className="w-[22px]" />
        )}

        <button onClick={prev} className="text-white/80 hover:text-white transition-colors">
          <SkipBack size={26} fill="currentColor" />
        </button>

        {/* Large outlined play/pause button */}
        <button
          onClick={togglePlay}
          className="w-[72px] h-[72px] rounded-full border-2 border-white flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {isPlaying ? (
            <Pause size={28} fill="white" className="text-white" />
          ) : (
            <Play size={28} fill="white" className="text-white ml-1" />
          )}
        </button>

        <button onClick={next} className="text-white/80 hover:text-white transition-colors">
          <SkipForward size={26} fill="currentColor" />
        </button>

        {currentTrack ? (
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? 'text-brand' : 'text-white/45 hover:text-white'}`}
          >
            <Shuffle size={22} />
          </button>
        ) : (
          <div className="w-[22px]" />
        )}
      </div>

      {/* Queue */}
      {currentTrack && (
        <div className="relative px-4 pb-8 flex-shrink-0">
        <div className="bg-[#0d1b2e] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
          {queue.map((track, i) => {
            const isActive = track.id === currentTrack.id;
            return (
              <button
                key={`${track.id}-${i}`}
                onClick={() => play(track, queue)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] ${isActive ? 'bg-white/[0.06]' : ''}`}
              >
                {/* Index / playing indicator */}
                <div className="w-6 flex items-center justify-center flex-shrink-0">
                  {isActive ? (
                    <BarChart2 size={16} className="text-brand" />
                  ) : (
                    <span className="text-xs text-white/40 font-medium tabular-nums">{i + 1}</span>
                  )}
                </div>

                {/* Album art */}
                <SongCoverImage
                  src={track.albumCover}
                  alt={track.albumTitle}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />

                {/* Title + artist */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? 'text-brand' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-white/45 truncate">{track.artistName}</p>
                </div>

                {/* Duration */}
                <span className="text-xs text-white/40 flex-shrink-0 tabular-nums">
                  {Math.floor(track.duration / 60)}:{String(Math.round(track.duration % 60)).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}
