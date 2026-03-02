import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Heart,
  ListMusic,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import PlayerControls from "../components/player/PlayerControls";
import ProgressBar from "../components/player/ProgressBar";
import TrackRow from "../components/ui/TrackRow";
import { useState } from "react";
import Button from "../components/ui/Button";

export const Route = createFileRoute("/player")({ component: PlayerPage });

function PlayerPage() {
  const navigate = useNavigate();
  const [showQueue, setShowQueue] = useState(false);
  const { currentTrack, queue, seek, progress, toggleLike } = usePlayerStore();

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface px-4 text-center">
        <p className="text-muted mb-4">Немає активного треку</p>
        <Button
          variant="secondary"
          shape="pill"
          onClick={() => navigate({ to: "/" })}
          className="px-6"
        >
          Перейти на головну
        </Button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, #1A3A4A 0%, #111 60%)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => window.history.back()} className="p-2 -ml-2">
          <ChevronDown size={28} className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-white/60 text-xs uppercase tracking-widest">
            Відтворення
          </p>
          <p className="text-white text-sm font-medium truncate max-w-[180px]">
            {currentTrack.albumTitle}
          </p>
        </div>
        <button className="p-2 -mr-2">
          <MoreHorizontal size={24} className="text-white" />
        </button>
      </div>

      {!showQueue ? (
        <>
          {/* Album art */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
            <img
              src={currentTrack.albumCover}
              alt={currentTrack.albumTitle}
              className="w-full max-w-sm aspect-square rounded-2xl object-cover shadow-2xl"
            />
          </div>

          {/* Track info */}
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-white text-2xl font-bold truncate">
                  {currentTrack.title}
                </h1>
                <p className="text-white/60 text-base mt-0.5">
                  {currentTrack.artistName}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-3">
                <button onClick={toggleLike} className="p-2">
                  <Heart
                    size={24}
                    className={
                      currentTrack.liked
                        ? "text-brand fill-brand"
                        : "text-white/60"
                    }
                  />
                </button>
                <button className="p-2">
                  <Share2 size={22} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar
              progress={progress}
              onSeek={seek}
              duration={currentTrack.duration}
              className="mb-6"
            />

            {/* Controls */}
            <PlayerControls size="lg" />

            {/* Queue + volume row */}
            <div className="flex items-center justify-between mt-6 mb-6">
              <button className="p-2">
                <Share2 size={20} className="text-white/40" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ListMusic size={18} />}
                onClick={() => setShowQueue(true)}
                className="text-sm text-white/60"
              >
                Черга
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Queue view */
        <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Черга відтворення</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQueue(false)}
              className="text-sm font-medium text-brand"
            >
              Закрити
            </Button>
          </div>
          <div className="overflow-y-auto space-y-1 flex-1">
            {queue.map((t, i) => (
              <TrackRow
                key={`${t.id}-${i}`}
                track={t}
                index={i}
                queue={queue}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
