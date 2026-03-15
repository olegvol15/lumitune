import type { ProfileTopTrackRowProps } from '../../types/profile/profile.types';
import { formatDuration } from '../../utils/format';
import SongCoverImage from '../ui/SongCoverImage';

export default function ProfileTopTrackRow({ track, index, onPlay }: ProfileTopTrackRowProps) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1.8fr)_120px_110px_50px] items-center gap-4 rounded-xl bg-[#13273a]/92 px-4 py-3">
      <button
        type="button"
        onClick={onPlay}
        className="text-left text-[28px] leading-none text-white/95 transition hover:text-[#85cbff]"
      >
        {index + 1}
      </button>
      <div className="flex min-w-0 items-center gap-3">
        <SongCoverImage
          src={track.albumCover}
          alt={track.title}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{track.title}</div>
          <div className="truncate text-[11px] text-[#71859d]">{track.artistName}</div>
        </div>
      </div>
      <div className="text-sm text-[#d1dce8]">{track.releaseDate}</div>
      <div className="flex items-center gap-2 text-sm text-[#d1dce8]">
        <span>{track.likes}</span>
        <span className="text-[#74a6ff]">♥</span>
      </div>
      <div className="text-right text-sm text-[#d1dce8]">{formatDuration(track.duration)}</div>
    </div>
  );
}
