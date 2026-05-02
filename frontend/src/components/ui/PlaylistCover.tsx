import { Music2 } from 'lucide-react';
import SongCoverImage from './SongCoverImage';

interface PlaylistCoverProps {
  title: string;
  trackCoverUrls?: string[];
  fallbackCoverUrl?: string;
  className?: string;
  roundedClassName?: string;
}

export default function PlaylistCover({
  title,
  trackCoverUrls = [],
  fallbackCoverUrl,
  className = '',
  roundedClassName = 'rounded-xl',
}: PlaylistCoverProps) {
  const covers = trackCoverUrls.filter(Boolean).slice(0, 4);

  if (covers.length === 0) {
    if (fallbackCoverUrl) {
      return (
        <SongCoverImage
          src={fallbackCoverUrl}
          alt={title}
          fallbackLabel={title}
          className={`h-full w-full object-cover ${roundedClassName} ${className}`}
        />
      );
    }

    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#173153] via-[#10243d] to-[#0a1929] ${roundedClassName} ${className}`}
        aria-label={title}
      >
        <Music2 className="h-[38%] w-[38%] text-[#6fa9d9]/70" strokeWidth={1.75} />
      </div>
    );
  }

  if (covers.length === 1) {
    return (
      <SongCoverImage
        src={covers[0]}
        alt={title}
        fallbackLabel={title}
        className={`h-full w-full object-cover ${roundedClassName} ${className}`}
      />
    );
  }

  const tiles = covers.length === 2 ? [covers[0], covers[1], covers[0], covers[1]] : covers;

  return (
    <div className={`grid h-full w-full grid-cols-2 grid-rows-2 overflow-hidden bg-[#0a1929] ${roundedClassName} ${className}`}>
      {tiles.map((cover, index) => (
        <SongCoverImage
          key={`${cover}-${index}`}
          src={cover}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      ))}
    </div>
  );
}
