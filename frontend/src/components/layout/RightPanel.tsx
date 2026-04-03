import { MoreHorizontal, X, Play, Pause, PanelRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { usePodcastQuery } from '../../hooks/podcasts';
import { useAudiobookQuery } from '../../hooks/audiobooks';
import type { AudiobookChapter, Episode } from '../../types';

export default function RightPanel() {
  const rightPanelOpen = usePlayerStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = usePlayerStore((s) => s.setRightPanelOpen);
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const currentAudiobook = usePlayerStore((s) => s.currentAudiobook);
  const currentAudiobookChapter = usePlayerStore((s) => s.currentAudiobookChapter);
  const audiobookQueue = usePlayerStore((s) => s.audiobookQueue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playEpisode = usePlayerStore((s) => s.playEpisode);
  const playAudiobookChapter = usePlayerStore((s) => s.playAudiobookChapter);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const { data: podcast } = usePodcastQuery(currentEpisode?.podcastId ?? '');
  const { data: audiobookData } = useAudiobookQuery(currentAudiobook?.id ?? '');

  const handleEpisodeClick = (ep: Episode) => {
    if (currentEpisode?.id === ep.id) {
      togglePlay();
    } else {
      playEpisode(ep);
    }
  };

  const handleAudiobookClick = (chapter: AudiobookChapter) => {
    if (currentAudiobookChapter?.id === chapter.id) {
      togglePlay();
    } else if (currentAudiobook) {
      playAudiobookChapter(chapter, currentAudiobook, audiobookData?.chapters ?? audiobookQueue);
    }
  };

  return (
    <motion.aside
      animate={{ width: rightPanelOpen ? 288 : 40 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="sticky top-16 h-[calc(100vh-4rem)] bg-[#060d19]/80 backdrop-blur-sm border-l border-[#1a3050] flex-shrink-0 z-[10] overflow-hidden"
    >
      {/* Collapsed tab */}
      <AnimatePresence>
        {!rightPanelOpen && (
          <motion.div
            key="tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center pt-3"
          >
            <button
              onClick={() => setRightPanelOpen(true)}
              className="text-white/30 hover:text-white transition-colors p-1.5"
              aria-label="Open panel"
            >
              <PanelRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full panel content */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="p-4 w-72 overflow-y-auto h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm font-semibold truncate pr-2">
                {currentAudiobook?.title ??
                  podcast?.title ??
                  currentEpisode?.podcastTitle ??
                  'Подкаст'}
              </span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button className="text-white/40 hover:text-white p-1.5 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
                <button
                  className="text-white/40 hover:text-white p-1.5 transition-colors"
                  onClick={() => setRightPanelOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {currentEpisode || currentAudiobookChapter ? (
              <>
                {/* Cover */}
                <img
                  src={currentAudiobookChapter?.audiobookCover ?? currentEpisode?.podcastCover}
                  alt={currentAudiobook?.title ?? currentEpisode?.podcastTitle ?? 'Current audio'}
                  className="w-full aspect-square object-cover rounded-xl grayscale mb-3"
                />

                {/* Title */}
                <p className="text-white text-base font-bold mb-4">
                  {currentAudiobook?.title ?? podcast?.title ?? currentEpisode?.podcastTitle}
                </p>

                {/* Chapter/episode list */}
                <div className="flex flex-col gap-1">
                  {(currentAudiobook
                    ? audiobookData?.chapters ?? audiobookQueue
                    : podcast?.episodes ?? (currentEpisode ? [currentEpisode] : [])
                  ).map((ep) => {
                    const isActive = currentAudiobookChapter
                      ? currentAudiobookChapter.id === ep.id
                      : currentEpisode?.id === ep.id;
                    const isThisPlaying = isActive && isPlaying;
                    return (
                      <button
                        key={ep.id}
                        onClick={() =>
                          currentAudiobookChapter
                            ? handleAudiobookClick(ep as AudiobookChapter)
                            : handleEpisodeClick(ep as Episode)
                        }
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                          isActive ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="w-5 flex-shrink-0 flex items-center justify-center">
                          {isThisPlaying ? (
                            <Pause size={13} className="text-brand" fill="currentColor" />
                          ) : isActive ? (
                            <Play size={13} className="text-brand" fill="currentColor" />
                          ) : (
                            <span className="text-white/30 text-xs tabular-nums">
                              {'chapterNumber' in ep ? ep.chapterNumber : ep.episodeNumber}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs truncate ${isActive ? 'text-brand font-medium' : 'text-white/70'}`}
                        >
                          {ep.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-white/30 text-sm">Play a podcast episode or audiobook chapter to see it here</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
