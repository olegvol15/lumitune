import { Pencil } from 'lucide-react';
import type { ProfileTrackCardProps } from '../../types/profile/profile.types';
import Button from '../ui/Button';
import SongCoverImage from '../ui/SongCoverImage';

export default function ProfileTrackCard({ track, onPlay, onEdit }: ProfileTrackCardProps) {
  return (
    <div className="group relative">
      <button type="button" onClick={onPlay} className="w-full text-left">
        <SongCoverImage
          src={track.albumCover}
          alt={track.title}
          className="aspect-square w-full rounded-xl object-cover transition group-hover:opacity-85"
        />
        <div className="mt-3">
          <div className="truncate text-sm font-semibold text-white">{track.title}</div>
          <div className="truncate text-[11px] text-[#7d90a7]">{track.artistName}</div>
        </div>
      </button>
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        onClick={onEdit}
        className="absolute right-2 top-2 !h-7 !w-7 !rounded-full !bg-black/35 !p-0 !text-white opacity-0 transition group-hover:opacity-100 hover:!bg-black/55"
      >
        <Pencil size={13} />
      </Button>
    </div>
  );
}
