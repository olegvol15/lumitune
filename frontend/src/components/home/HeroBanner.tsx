import { useEffect, useState } from 'react';

const banners = [
  {
    id: 'b1',
    imageUrl: 'https://picsum.photos/seed/exoplanet/900/300',
    label: 'EXO Planet — новий альбом',
  },
  {
    id: 'b2',
    imageUrl: 'https://picsum.photos/seed/kpopnight/900/300',
    label: 'К-Поп вечір — слухай зараз',
  },
  {
    id: 'b3',
    imageUrl: 'https://picsum.photos/seed/indievibes/900/300',
    label: 'Indie Vibes — відкрий нове',
  },
];

export default function HeroBanner() {
  const [active, setActive] = useState(0);

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
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {banners.map((b) => (
            <div key={b.id} className="w-full flex-shrink-0 h-full relative cursor-pointer">
              <img src={b.imageUrl} alt={b.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5">
                <span className="bg-black/40 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  {b.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
