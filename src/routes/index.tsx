import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { tracks } from '../data/tracks';
import { artists } from '../data/artists';
import { albums } from '../data/albums';
import SectionHeader from '../components/ui/SectionHeader';
import TrackRow from '../components/ui/TrackRow';
import MediaCard from '../components/ui/MediaCard';
import MoodPill from '../components/ui/MoodPill';

const moods = [
  { id: 'hiphop', icon: '🎤', label: 'Хіп-хоп' },
  { id: 'melankholia', icon: '🌙', label: 'Меланхолія' },
  { id: 'romantyka', icon: '❤️', label: 'Романтика' },
  { id: 'energiya', icon: '⚡', label: 'Енергія' },
  { id: 'relax', icon: '🌊', label: 'Релакс' },
];

const banners = [
  {
    id: 'b1',
    title: 'Новий хіт Lisa',
    subtitle: 'MONEY вже доступна',
    bg: 'from-purple-600 to-pink-500',
    image: 'https://picsum.photos/seed/lisa/400/200',
  },
  {
    id: 'b2',
    title: 'BTS — BE',
    subtitle: 'Альбом тижня',
    bg: 'from-blue-600 to-cyan-400',
    image: 'https://picsum.photos/seed/be-bts/400/200',
  },
  {
    id: 'b3',
    title: 'Taylor Swift',
    subtitle: 'Midnights — слухай зараз',
    bg: 'from-indigo-700 to-violet-500',
    image: 'https://picsum.photos/seed/midnights/400/200',
  },
];

function BannerCarousel() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((b) => (
          <div
            key={b.id}
            className={`w-full flex-shrink-0 h-44 bg-gradient-to-r ${b.bg} relative overflow-hidden rounded-2xl cursor-pointer`}
            onClick={() => navigate({ to: '/search' })}
          >
            <img
              src={b.image}
              alt={b.title}
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50"
            />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <p className="text-white/70 text-sm">{b.subtitle}</p>
              <h3 className="text-white text-xl font-bold">{b.title}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? 'w-5 bg-brand' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({ component: HomePage });

function HomePage() {
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const navigate = useNavigate();

  const topTracks = tracks.slice(0, 5);
  const newTracks = tracks.slice(5, 10);

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-muted text-sm">Добрий день 👋</p>
          <h1 className="text-white text-2xl font-bold">Що слухаємо?</h1>
        </div>
        <button
          onClick={() => navigate({ to: '/notifications' })}
          className="p-2.5 bg-surface-alt rounded-full relative"
        >
          <Bell size={20} className="text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
        </button>
      </div>

      {/* Banner carousel */}
      <BannerCarousel />

      {/* Mood filters */}
      <SectionHeader title="Настрій" />
      <div className="flex gap-3 overflow-x-auto pb-3 mb-5 scrollbar-none">
        {moods.map((m) => (
          <MoodPill
            key={m.id}
            icon={m.icon}
            label={m.label}
            active={activeMood === m.id}
            onClick={() => setActiveMood(activeMood === m.id ? null : m.id)}
          />
        ))}
      </div>

      {/* Top tracks today */}
      <SectionHeader title="Ваша топ-музика сьогодні" onShowAll={() => navigate({ to: '/favorite' })} />
      <div className="mb-5 space-y-1">
        {topTracks.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={tracks} showIndex />
        ))}
      </div>

      {/* New releases */}
      <SectionHeader title="Нові релізи" onShowAll={() => navigate({ to: '/search' })} />
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {albums.slice(0, 6).map((al) => (
          <MediaCard
            key={al.id}
            image={al.coverUrl}
            title={al.title}
            subtitle={al.artistName}
            onClick={() => navigate({ to: '/album/$id', params: { id: al.id } })}
          />
        ))}
      </div>

      {/* Artists you might like */}
      <SectionHeader title="Популярні виконавці" />
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none mt-5">
        {artists.slice(0, 6).map((a) => (
          <MediaCard
            key={a.id}
            image={a.image}
            title={a.name}
            subtitle={a.genre}
            rounded
            onClick={() => navigate({ to: '/artist/$id', params: { id: a.id } })}
          />
        ))}
      </div>

      {/* Recently played */}
      <SectionHeader title="Нещодавно прослухані" />
      <div className="mt-5 space-y-1">
        {newTracks.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={tracks} />
        ))}
      </div>
    </div>
  );
}
