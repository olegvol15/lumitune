import { ChevronLeft, ChevronRight, Pencil, Search, Settings } from "lucide-react";
import type { ReactNode } from "react";
import Button from "../ui/Button";
import SongCoverImage from "../ui/SongCoverImage";
import { formatDuration } from "../../utils/format";
import type { CreatorAlbum, CreatorTrack } from "./types";

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-[14px] font-semibold leading-none text-white">{value}</div>
      <div className="mt-1 text-[10px] text-[#bfd2df]">{label}</div>
    </div>
  );
}

export function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#f5fbff]">
        {title}
      </h2>
      {right}
    </div>
  );
}

export function SectionArrows() {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        className="!h-8 !w-8 !rounded-full !p-0 !text-[#8ca4bf] hover:!bg-white/5 hover:!text-white"
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        className="!h-8 !w-8 !rounded-full !p-0 !text-[#8ca4bf] hover:!bg-white/5 hover:!text-white"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

export function TrackSectionTools() {
  return (
    <div className="flex items-center gap-2">
      <Search size={14} className="text-[#7d97af]" />
      <span className="text-xs text-[#9cb0c3]">Дата додавання</span>
      <span className="text-[#7d97af]">≡</span>
      <SectionArrows />
    </div>
  );
}

export function HeroActions({
  onEditProfile,
  onOpenSettings,
}: {
  onEditProfile: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex items-start justify-end gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        onClick={onEditProfile}
        className="!h-7 !w-7 !rounded-full !p-0 !text-white hover:!bg-white/10"
      >
        <Pencil size={14} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        onClick={onOpenSettings}
        className="!h-7 !w-7 !rounded-full !p-0 !text-white hover:!bg-white/10"
      >
        <Settings size={14} />
      </Button>
    </div>
  );
}

export function TrackCard({
  track,
  onPlay,
  onEdit,
}: {
  track: CreatorTrack;
  onPlay: () => void;
  onEdit: () => void;
}) {
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

export function AlbumCard({
  album,
  onClick,
}: {
  album: CreatorAlbum;
  onClick: () => void;
}) {
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

export function FollowingCard({
  name,
  image,
  listeners,
  onClick,
}: {
  name: string;
  image: string;
  listeners: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-center">
      <img
        src={image}
        alt={name}
        className="mx-auto h-28 w-28 rounded-full object-cover grayscale transition hover:grayscale-0"
      />
      <div className="mt-4 text-sm font-medium text-white">{name}</div>
      <div className="mt-1 text-[11px] text-[#7288a0]">{listeners}</div>
    </button>
  );
}

export function TopTrackRow({
  track,
  index,
  onPlay,
}: {
  track: CreatorTrack;
  index: number;
  onPlay: () => void;
}) {
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
