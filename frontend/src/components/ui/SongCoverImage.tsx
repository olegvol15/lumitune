import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Music2 } from 'lucide-react';
import type { SongCoverImageProps } from '../../types/ui/song-cover-image.types';

export default function SongCoverImage({
  src,
  fallbackLabel,
  onError,
  ...imgProps
}: SongCoverImageProps) {
  const normalizedSrc = src && src.trim().length > 0 ? src : '';
  const [imageSrc, setImageSrc] = useState(normalizedSrc);
  const showPlaceholder = imageSrc.length === 0;
  const initial = fallbackLabel?.trim().charAt(0).toUpperCase();

  useEffect(() => {
    setImageSrc(normalizedSrc);
  }, [normalizedSrc]);

  if (showPlaceholder) {
    return (
      <div
        className={`${imgProps.className ?? ''} bg-gradient-to-br from-[#173153] via-[#10243d] to-[#0a1929] flex items-center justify-center relative overflow-hidden`}
        aria-label={imgProps.alt}
      >
        <Music2 className="w-[38%] h-[38%] text-[#6fa9d9]/70" strokeWidth={1.75} />
        {initial ? (
          <span className="absolute bottom-[8%] right-[10%] text-[35%] font-semibold text-[#b9d5ee]/80 leading-none">
            {initial}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      {...imgProps}
      src={imageSrc}
      onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
        if (imageSrc !== '') {
          setImageSrc('');
        }
        onError?.(event);
      }}
    />
  );
}
