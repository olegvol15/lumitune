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
      <div className="flex justify-center gap-1.5 mb-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? 'w-5 bg-[#1CA2EA]' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Banner carousel */}
      <div className="relative overflow-hidden rounded-xl h-44 sm:h-60 lg:h-72">
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
              alt={banners[activeIndex].label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="bg-black/40 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                {banners[activeIndex].label}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
