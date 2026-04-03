import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Play, Pause, Clock } from 'lucide-react';
import { usePodcastQuery } from '../hooks/podcasts';
import { usePlayerStore } from '../store/playerStore';
import { formatLongDuration } from '../utils/format';
import type { Episode } from '../types';
import { useI18n } from '../lib/i18n';

export const Route = createFileRoute('/podcast/$id')({
  component: PodcastPage,
});

function PodcastPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data: podcast, isLoading } = usePodcastQuery(id);
  const { copy } = useI18n();
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playEpisode = usePlayerStore((s) => s.playEpisode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/50">
        {copy.common.loading}
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/50">
        {copy.common.podcast} not found
      </div>
    );
  }

  const episodes = podcast.episodes ?? [];

  const handlePlay = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  return (
    <div className="min-h-screen text-white">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={podcast.coverUrl}
            alt={podcast.title}
            className="w-full h-full object-cover blur-[80px] opacity-25 scale-110"
          />
        </div>
        <div className="relative z-10 px-6 pt-6 pb-10">
          <button
            onClick={() => router.history.back()}
            className="flex items-center gap-1.5 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">{copy.common.back}</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={podcast.coverUrl}
              alt={podcast.title}
              className="w-40 h-40 rounded-xl object-cover flex-shrink-0 shadow-2xl"
            />
            <div className="flex flex-col justify-end min-w-0">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{copy.common.podcast}</p>
              <h1 className="text-white text-3xl font-bold leading-tight mb-2">{podcast.title}</h1>
              <p className="text-white/70 text-sm mb-1">{podcast.author}</p>
              {podcast.category && (
                <span className="text-xs text-brand bg-brand/10 px-2 py-0.5 rounded-full w-fit">
                  {podcast.category}
                </span>
              )}
              <p className="text-white/50 text-sm mt-3 line-clamp-3 max-w-xl">
                {podcast.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="px-6 pb-20">
        <h2 className="text-white font-bold text-xl mb-4">
          {copy.common.episodes}{' '}
          <span className="text-white/30 font-normal text-base">({episodes.length})</span>
        </h2>

        {episodes.length === 0 ? (
          <p className="text-white/40 text-sm">{copy.common.episodeListEmpty}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {episodes.map((episode) => {
              const isActive = currentEpisode?.id === episode.id;
              return (
                <div
                  key={episode.id}
                  className={`group flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => handlePlay(episode)}
                >
                  {/* Episode number / play icon */}
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {isActive && isPlaying ? (
                      <Pause size={20} className="text-brand" />
                    ) : (
                      <>
                        <span className="text-white/40 text-sm group-hover:hidden">
                          {episode.episodeNumber}
                        </span>
                        <Play size={18} className="text-white hidden group-hover:block" fill="currentColor" />
                      </>
                    )}
                  </div>

                  {/* Cover */}
                  <img
                    src={episode.podcastCover}
                    alt={episode.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-brand' : 'text-white'}`}>
                      {episode.title}
                    </p>
                    {episode.description && (
                      <p className="text-white/40 text-xs truncate mt-0.5">{episode.description}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-white/40 text-xs flex-shrink-0">
                    <Clock size={12} />
                    <span>{formatLongDuration(episode.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
