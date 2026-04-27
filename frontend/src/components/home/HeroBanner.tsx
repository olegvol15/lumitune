import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Album, Track } from '../../types';

type HeroBannerItem = {
  id: string;
  imageUrl: string;
  label: string;
};

export default function HeroBanner({ albums, tracks }: { albums: Album[]; tracks: Track[] }) {
  const [active, setActive] = useState(0);
  const banners: HeroBannerItem[] = [
    ...albums.slice(0, 3).map((album) => ({
      id: `album-${album.id}`,
      imageUrl: album.coverUrl,
      label: `${album.title} · ${album.artistName}`,
    })),
    ...tracks.slice(0, 3).map((track) => ({
      id: `track-${track.id}`,
      imageUrl: track.albumCover,
      label: `${track.title} · ${track.artistName}`,
    })),
  ].slice(0, 3);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const activeIndex = active % banners.length;

  return (
    <div className="mb-8">
      {/* Pagination dots above */}
      <div className="mb-3 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show banner ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === activeIndex ? 'w-9 bg-[#45A7EE]' : 'w-2 bg-white/15 hover:bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Banner carousel */}
      <div className="relative h-44 overflow-hidden rounded-xl bg-[#07111f] shadow-[0_18px_45px_rgba(0,0,0,0.20)] sm:h-60 lg:h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={banners[activeIndex].id}
            className="absolute inset-0 cursor-pointer"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
            exit={{ opacity: 0, x: -40, transition: { duration: 0.25, ease: 'easeIn' } }}
          >
            <img
              src={banners[activeIndex].imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
            />
            <div className="absolute inset-0 bg-black/30" />
            <img
              src={banners[activeIndex].imageUrl}
              alt={banners[activeIndex].label}
              className="relative h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" />
            <div className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] sm:left-5">
              <span className="block truncate rounded-full bg-[rgba(20,20,28,0.68)] px-4 py-1.5 text-sm font-semibold !text-white shadow-lg backdrop-blur-md sm:text-base">
                {banners[activeIndex].label}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
