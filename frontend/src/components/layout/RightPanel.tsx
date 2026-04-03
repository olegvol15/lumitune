import { MoreHorizontal, X, Play, Pause, PanelRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { usePodcastQuery } from '../../hooks/podcasts';
import type { Episode } from '../../types';

export default function RightPanel() {
  const rightPanelOpen = usePlayerStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = usePlayerStore((s) => s.setRightPanelOpen);
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playEpisode = usePlayerStore((s) => s.playEpisode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const { data: podcast } = usePodcastQuery(currentEpisode?.podcastId ?? '');

  const handleEpisodeClick = (ep: Episode) => {
    if (currentEpisode?.id === ep.id) {
      togglePlay();
    } else {
      playEpisode(ep);
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
                {podcast?.title ?? currentEpisode?.podcastTitle ?? 'Подкаст'}
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

            {currentEpisode ? (
              <>
                {/* Podcast cover */}
                <img
                  src={currentEpisode.podcastCover}
                  alt={currentEpisode.podcastTitle}
                  className="w-full aspect-square object-cover rounded-xl grayscale mb-3"
                />

                {/* Podcast title */}
                <p className="text-white text-base font-bold mb-4">
                  {podcast?.title ?? currentEpisode.podcastTitle}
                </p>

                {/* Episode list */}
                <div className="flex flex-col gap-1">
                  {(podcast?.episodes ?? [currentEpisode]).map((ep) => {
                    const isActive = currentEpisode.id === ep.id;
                    const isThisPlaying = isActive && isPlaying;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => handleEpisodeClick(ep)}
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
                              {ep.episodeNumber}
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
                <p className="text-white/30 text-sm">Play a podcast episode to see it here</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
