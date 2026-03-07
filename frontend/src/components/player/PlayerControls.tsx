import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import type { PlayerControlsProps } from "../../types/props/component-props.types";

export default function PlayerControls({ size = "lg" }: PlayerControlsProps) {
  const {
    isPlaying,
    togglePlay,
    next,
    prev,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  const iconSize = size === "lg" ? 24 : 18;
  const playSize = size === "lg" ? 56 : 40;

  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={toggleShuffle}
        className={`transition-colors ${shuffle ? "text-brand" : "text-muted hover:text-white"}`}
      >
        <Shuffle size={iconSize} />
      </button>

      <button
        onClick={prev}
        className="text-white hover:text-brand transition-colors"
      >
        <SkipBack size={iconSize} fill="currentColor" />
      </button>

      <button
        onClick={togglePlay}
        style={{ width: playSize, height: playSize }}
        className="rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand/80 transition-colors flex-shrink-0"
      >
        {isPlaying ? (
          <Pause size={iconSize} fill="white" />
        ) : (
          <Play size={iconSize} fill="white" className="ml-0.5" />
        )}
      </button>

      <button
        onClick={next}
        className="text-white hover:text-brand transition-colors"
      >
        <SkipForward size={iconSize} fill="currentColor" />
      </button>

      <button
        onClick={toggleRepeat}
        className={`transition-colors ${repeat !== "off" ? "text-brand" : "text-muted hover:text-white"}`}
      >
        {repeat === "one" ? (
          <Repeat1 size={iconSize} />
        ) : (
          <Repeat size={iconSize} />
        )}
      </button>
    </div>
  );
}
