import type { ProfileAlbumCardProps } from '../../types/profile/profile.types';
import SongCoverImage from '../ui/SongCoverImage';

export default function ProfileAlbumCard({ album, onClick }: ProfileAlbumCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="overflow-hidden rounded-2xl bg-[#0e2333]/90 text-left transition hover:bg-[#14304a]"
    >
      <div className="p-3">
        <SongCoverImage
          src={album.coverImage}
          alt={album.title}
          className="aspect-square w-full rounded-xl object-cover"
        />
      </div>
      <div className="px-3 pb-4">
        <div className="line-clamp-2 text-sm font-semibold text-white">{album.title}</div>
        <div className="mt-1 truncate text-[11px] uppercase tracking-[0.08em] text-[#7890a9]">
          МУЗИКАНТ
        </div>
      </div>
    </button>
  );
}
