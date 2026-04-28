import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import ProgressBar from '../player/ProgressBar';
import SongCoverImage from '../ui/SongCoverImage';
import { slideUp } from '../../lib/motion';
import { useToggleTrackLikeMutation } from '../../hooks/likes';

export default function MiniPlayer() {
  const {
    currentTrack,
    currentEpisode,
    currentAudiobook,
    currentAudiobookChapter,
    isPlaying,
    togglePlay,
    next,
    seek,
    progress,
  } =
    usePlayerStore();
  const toggleTrackLikeMutation = useToggleTrackLikeMutation();
  const currentTrackLiked = Boolean(currentTrack?.liked);
  const navigate = useNavigate();

  const activeMedia = currentTrack
    ? { cover: currentTrack.albumCover, label: currentTrack.albumTitle, title: currentTrack.title, subtitle: currentTrack.artistName, isEpisode: false }
    : currentEpisode
    ? { cover: currentEpisode.podcastCover, label: currentEpisode.podcastTitle, title: currentEpisode.title, subtitle: currentEpisode.podcastTitle, isEpisode: true }
    : currentAudiobook && currentAudiobookChapter
    ? {
        cover: currentAudiobookChapter.audiobookCover,
        label: currentAudiobook.title,
        title: currentAudiobookChapter.title,
        subtitle: `${currentAudiobook.author} · ${currentAudiobook.title}`,
        isEpisode: true,
      }
    : null;

  return (
    <AnimatePresence>
      {activeMedia && (
        <motion.div
          className="fixed bottom-20 left-0 right-0 z-30 px-3 pb-1"
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="bg-surface-alt rounded-2xl shadow-lg overflow-hidden max-w-lg mx-auto border border-[#1a3050]">
            <ProgressBar progress={progress} onSeek={seek} className="px-0" />
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button onClick={() => navigate({ to: '/player' })} className="flex-shrink-0">
                <SongCoverImage
                  src={activeMedia.cover}
                  alt={activeMedia.label}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              </button>

              <button
                onClick={() => navigate({ to: '/player' })}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-white text-sm font-semibold truncate">{activeMedia.title}</p>
                <p className="text-muted text-xs truncate">{activeMedia.subtitle}</p>
              </button>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!activeMedia.isEpisode && (
                  <button
                    onClick={() => {
                      if (currentTrack) {
                        toggleTrackLikeMutation.mutate({
                          songId: currentTrack.id,
                          liked: currentTrackLiked,
                        });
                      }
                    }}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Heart
                      size={18}
                      className={currentTrackLiked ? 'text-brand fill-brand' : 'text-muted'}
                    />
                  </button>
                )}
                <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full">
                  {isPlaying ? (
                    <Pause size={20} className="text-white" fill="currentColor" />
                  ) : (
                    <Play size={20} className="text-white" fill="currentColor" />
                  )}
                </button>
                {!activeMedia.isEpisode && (
                  <button onClick={next} className="p-2 hover:bg-white/10 rounded-full">
                    <SkipForward size={20} className="text-white" fill="currentColor" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
