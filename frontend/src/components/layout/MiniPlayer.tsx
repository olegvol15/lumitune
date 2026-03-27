import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { usePlayerStore } from '../../store/playerStore';
import ProgressBar from '../player/ProgressBar';
import SongCoverImage from '../ui/SongCoverImage';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, next, seek, progress, toggleLike } =
    usePlayerStore();
  const navigate = useNavigate();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-3 pb-1">
      <div className="bg-surface-alt rounded-2xl shadow-lg overflow-hidden max-w-lg mx-auto">
        <ProgressBar progress={progress} onSeek={seek} className="px-0" />
        <div className="flex items-center gap-3 px-3 py-2.5">
          <button onClick={() => navigate({ to: '/player' })} className="flex-shrink-0">
            <SongCoverImage
              src={currentTrack.albumCover}
              alt={currentTrack.albumTitle}
              className="w-10 h-10 rounded-lg object-cover"
            />
          </button>

          <button onClick={() => navigate({ to: '/player' })} className="flex-1 min-w-0 text-left">
            <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-muted text-xs truncate">{currentTrack.artistName}</p>
          </button>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={toggleLike} className="p-2 hover:bg-white/10 rounded-full">
              <Heart
                size={18}
                className={currentTrack.liked ? 'text-brand fill-brand' : 'text-muted'}
              />
            </button>
            <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full">
              {isPlaying ? (
                <Pause size={20} className="text-white" fill="white" />
              ) : (
                <Play size={20} className="text-white" fill="white" />
              )}
            </button>
            <button onClick={next} className="p-2 hover:bg-white/10 rounded-full">
              <SkipForward size={20} className="text-white" fill="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
