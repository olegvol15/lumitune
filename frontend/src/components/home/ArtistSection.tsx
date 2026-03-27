import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatListeners } from '../../utils/format';
import type { ArtistSectionProps } from '../../types/props/component-props.types';
import { staggerContainer, staggerItem } from '../../lib/motion';

export default function ArtistSection({
  title,
  accentWord,
  artists,
  onArtistClick,
}: ArtistSectionProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: dir === 'right' ? 200 : -200,
      behavior: 'smooth',
    });
  };

  const accentIdx = title.indexOf(accentWord);
  const before = accentIdx > -1 ? title.slice(0, accentIdx) : title;
  const after = accentIdx > -1 ? title.slice(accentIdx + accentWord.length) : '';

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-xl">
          {before}
          {accentWord && <span className="text-[#1CA2EA]">{accentWord}</span>}
          {after}
        </h2>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full border border-[#1a3050] flex items-center justify-center text-white/50 hover:text-white hover:border-[#1CA2EA] transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full border border-[#1a3050] flex items-center justify-center text-white/50 hover:text-white hover:border-[#1CA2EA] transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <motion.div
        ref={rowRef}
        className="flex gap-6 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {artists.map((artist) => (
          <motion.button
            key={artist.id}
            onClick={() => onArtistClick?.(artist)}
            className="flex-shrink-0 snap-start flex flex-col items-center gap-2.5 w-28 sm:w-36 group"
            variants={staggerItem}
          >
            <img
              src={artist.image}
              alt={artist.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover group-hover:opacity-85 transition-opacity"
            />
            <p className="text-white text-sm font-semibold text-center w-full truncate">
              {artist.name}
            </p>
            <p className="text-white/40 text-xs text-center">
              {formatListeners(artist.monthlyListeners)}
            </p>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
