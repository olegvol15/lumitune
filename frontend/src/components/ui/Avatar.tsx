import { useEffect, useState } from 'react';
import type { AvatarProps } from '../../types/props/component-props.types';

export default function Avatar({ src, alt = '', size = 40, className = '' }: AvatarProps) {
  const style = { width: size, height: size };
  const isDefaultAvatar = !src || src.endsWith('/default-avatar.png') || src === 'default-avatar.png';
  const [hasImageError, setHasImageError] = useState(isDefaultAvatar);

  useEffect(() => {
    setHasImageError(isDefaultAvatar);
  }, [isDefaultAvatar, src]);

  if (src && !hasImageError) {
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      style={style}
      className={`rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
