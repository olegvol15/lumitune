import { motion } from 'framer-motion';
import type { MediaCardProps } from '../../types/props/component-props.types';
import SongCoverImage from './SongCoverImage';
import { cardHover, cardTap } from '../../lib/motion';

const sizes = {
  sm: 'w-28',
  md: 'w-36',
  lg: 'w-44',
};

export default function MediaCard({
  image,
  title,
  subtitle,
  onClick,
  size = 'md',
  rounded = false,
}: MediaCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`${sizes[size]} flex-shrink-0 text-left group`}
      whileHover={cardHover}
      whileTap={cardTap}
    >
      <SongCoverImage
        src={image}
        alt={title}
        fallbackLabel={title}
        className={`w-full aspect-square object-cover mb-2 ${
          rounded ? 'rounded-full' : 'rounded-xl'
        } group-hover:opacity-80 transition-opacity`}
      />
      <p className="text-white text-sm font-semibold truncate">{title}</p>
      {subtitle && <p className="text-muted text-xs truncate mt-0.5">{subtitle}</p>}
    </motion.button>
  );
}
