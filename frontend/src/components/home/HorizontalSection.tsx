import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import MediaCard from '../ui/MediaCard';
import type { Track } from '../../types';
import { isAlbum } from '../../utils/typeGuards';
import type { HorizontalSectionProps } from '../../types/props/component-props.types';

export default function HorizontalSection({
  title,
  accentWord,
  items,
  onItemClick,
}: HorizontalSectionProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: dir === 'right' ? 168 : -168,
      behavior: 'smooth',
    });
  };

  const accentIdx = title.indexOf(accentWord);
  const before = accentIdx > -1 ? title.slice(0, accentIdx) : title;
  const after = accentIdx > -1 ? title.slice(accentIdx + accentWord.length) : '';

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-xl">
          {before}
          {accentWord && <span className="text-[#1CA2EA]">{accentWord}</span>}
          {after}
        </h2>
        <div className="flex items-center gap-2">
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

      <div ref={rowRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {items.slice(0, 5).map((item) => {
          if (isAlbum(item)) {
            return (
              <MediaCard
                key={item.id}
                image={item.coverUrl}
                title={item.title}
                subtitle={`By ${item.artistName}`}
                onClick={() => onItemClick?.(item)}
              />
            );
          }
          const track = item as Track;
          return (
            <MediaCard
              key={track.id}
              image={track.albumCover}
              title={track.title}
              subtitle={track.artistName}
              onClick={() => onItemClick?.(item)}
            />
          );
        })}

        {/* "Все тут" card */}
        <button className="w-36 flex-shrink-0 flex flex-col items-center justify-center aspect-square rounded-xl border border-dashed border-[#1a3050] text-white/30 hover:border-[#1CA2EA] hover:text-[#1CA2EA] transition-colors gap-2">
          <Plus size={22} />
          <span className="text-xs font-medium">Все тут</span>
        </button>
      </div>
    </section>
  );
}
