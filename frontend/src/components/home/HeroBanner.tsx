import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '../../lib/i18n';

export default function HeroBanner() {
  const { copy } = useI18n();
  const [active, setActive] = useState(0);
  const banners = [
    {
      id: 'b1',
      imageUrl: 'https://picsum.photos/seed/exoplanet/900/300',
      label: copy.home.heroBanners[0],
    },
    {
      id: 'b2',
      imageUrl: 'https://picsum.photos/seed/kpopnight/900/300',
      label: copy.home.heroBanners[1],
    },
    {
      id: 'b3',
      imageUrl: 'https://picsum.photos/seed/indievibes/900/300',
      label: copy.home.heroBanners[2],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      {/* Pagination dots above */}
      <div className="flex justify-center gap-1.5 mb-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? 'w-5 bg-[#1CA2EA]' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Banner carousel */}
      <div className="relative overflow-hidden rounded-xl h-44 sm:h-60 lg:h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={banners[active].id}
            className="absolute inset-0 cursor-pointer"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
            exit={{ opacity: 0, x: -40, transition: { duration: 0.25, ease: 'easeIn' } }}
          >
            <img
              src={banners[active].imageUrl}
              alt={banners[active].label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="bg-black/40 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                {banners[active].label}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
