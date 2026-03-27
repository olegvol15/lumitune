import { useState } from 'react';
import { Sun, Droplets, Heart, Zap, Music2, ChevronDown } from 'lucide-react';

const moods = [
  { id: 'happy', icon: Sun, label: 'Хепні' },
  { id: 'melancholy', icon: Droplets, label: 'Меланхолія' },
  { id: 'romance', icon: Heart, label: 'Романтика' },
  { id: 'drive', icon: Zap, label: 'Драйв' },
  { id: 'party', icon: Music2, label: 'Туса' },
];

export default function MoodSection() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">
          Саундреки на основі твого <span className="text-[#1CA2EA]">настрою</span>
        </h2>
        <button className="flex items-center gap-1.5 text-white/60 text-sm border border-[#1a3050] rounded-full px-4 py-1.5 hover:border-[#1CA2EA]/60 hover:text-white/80 transition-colors">
          Настрій
          <ChevronDown size={13} />
        </button>
      </div>

      <div className="flex gap-5 sm:gap-10 sm:justify-center overflow-x-auto pb-2 scrollbar-none">
        {moods.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(isActive ? null : id)}
              className="flex flex-col items-center gap-3 flex-shrink-0"
            >
              {/* Circle — always styled, active = stronger glow */}
              <div
                className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-[#1CA2EA] bg-[#071220] flex items-center justify-center transition-all ${
                  isActive
                    ? 'shadow-[0_0_20px_rgba(28,162,234,0.6),inset_0_0_20px_rgba(28,162,234,0.15)]'
                    : 'shadow-[0_0_10px_rgba(28,162,234,0.25),inset_0_0_10px_rgba(28,162,234,0.08)]'
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-colors ${isActive ? 'text-[#1CA2EA]' : 'text-[#5bb8e8]'}`}
                />
              </div>
              <span
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-white/70'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
