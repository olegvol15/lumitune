import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { artists } from '../data/artists';
import HeroBanner from '../components/home/HeroBanner';
import MoodSection from '../components/home/MoodSection';
import HorizontalSection from '../components/home/HorizontalSection';
import ArtistSection from '../components/home/ArtistSection';
import PodcastSection from '../components/home/PodcastSection';
import AudiobookSection from '../components/home/AudiobookSection';
import type { Album, Audiobook, Track } from '../types';
import type { HomeFilterTab } from '../types/routes/route.types';
import { useCatalogTracks } from '../hooks/tracks';
import { usePlayerStore } from '../store/playerStore';
import { useI18n } from '../lib/i18n';
import { useAlbumsQuery } from '../hooks/albums';

export const Route = createFileRoute('/')({ component: HomePage });

function HomePage() {
  const { tracks } = useCatalogTracks();
  const { data: albums = [] } = useAlbumsQuery();
  const { copy } = useI18n();
  const FILTER_TABS: HomeFilterTab[] = [copy.home.all, copy.home.tracks, copy.home.other] as HomeFilterTab[];
  const [activeTab, setActiveTab] = useState<HomeFilterTab>(FILTER_TABS[0]);
  const navigate = useNavigate();
  const play = usePlayerStore((state) => state.play);

  const handleMediaClick = (item: Album | Track | Audiobook) => {
    if ('coverUrl' in item) {
      if ('chapterCount' in item) {
        navigate({ to: '/audiobook/$id', params: { id: item.id } });
        return;
      }
      navigate({ to: '/album/$id', params: { id: item.id } });
      return;
    }

    play(item, tracks);
    if (window.innerWidth < 1024) {
      navigate({ to: '/player' });
    }
  };

  const handleArtistClick = (item: (typeof artists)[0]) => {
    navigate({ to: '/artist/$id', params: { id: item.id } });
  };

  return (
    <div className="px-4 sm:px-6 pt-5 pb-4">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeTab === tab
                ? 'bg-[#0a1929] border-white/40 text-white'
                : 'border-[#1a3050] text-white/60 hover:text-white hover:border-white/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <HeroBanner />

      <MoodSection />

      <HorizontalSection
        title={copy.home.topMusic}
        accentWord={copy.home.topMusicAccent}
        items={tracks.slice(0, 5) as Track[]}
        onItemClick={handleMediaClick}
      />

      <HorizontalSection
        title={copy.home.newMusic}
        accentWord={copy.home.newMusicAccent}
        items={albums.slice(0, 6) as Album[]}
        onItemClick={handleMediaClick}
      />

      <ArtistSection
        title={copy.home.favoriteArtists}
        accentWord={copy.home.favoriteArtistsAccent}
        artists={artists}
        onArtistClick={handleArtistClick}
      />

      <PodcastSection />

      <AudiobookSection />
    </div>
  );
}
