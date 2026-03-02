import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { tracks } from "../data/tracks";
import { artists } from "../data/artists";
import { albums } from "../data/albums";
import HeroBanner from "../components/home/HeroBanner";
import MoodSection from "../components/home/MoodSection";
import HorizontalSection from "../components/home/HorizontalSection";
import ArtistSection from "../components/home/ArtistSection";
import PodcastSection from "../components/home/PodcastSection";
import AudiobookSection from "../components/home/AudiobookSection";
import type { Album, Track } from "../types";

const FILTER_TABS = ["Всі", "Треки", "Інше"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("Всі");
  const navigate = useNavigate();

  const handleAlbumClick = (item: Album | Track) => {
    if ("coverUrl" in item) {
      navigate({ to: "/album/$id", params: { id: item.id } });
    }
  };

  const handleArtistClick = (item: (typeof artists)[0]) => {
    navigate({ to: "/artist/$id", params: { id: item.id } });
  };

  return (
    <div className="px-6 pt-5 pb-4">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeTab === tab
                ? "bg-[#0a1929] border-white/40 text-white"
                : "border-[#1a3050] text-white/60 hover:text-white hover:border-white/30"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <HeroBanner />

      <MoodSection />

      <HorizontalSection
        title="Топ ВАША музика сьогодні!"
        accentWord="музика"
        items={tracks.slice(0, 5) as Track[]}
        onItemClick={handleAlbumClick}
      />

      <HorizontalSection
        title="Нові музичні релізи"
        accentWord="музичні"
        items={albums.slice(0, 6) as Album[]}
        onItemClick={handleAlbumClick}
      />

      <ArtistSection
        title="Твої улюблені виконавці"
        accentWord="виконавці"
        artists={artists}
        onArtistClick={handleArtistClick}
      />

      <PodcastSection />

      <AudiobookSection />
    </div>
  );
}
