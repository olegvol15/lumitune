import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, SortAsc } from "lucide-react";
import { tracks } from "../data/tracks";
import TrackRow from "../components/ui/TrackRow";
import { usePlayerStore } from "../store/playerStore";
import Button from "../components/ui/Button";
import type { FavoriteSortKey } from "../types/routes/route.types";

export const Route = createFileRoute("/favorite")({ component: FavoritePage });

function FavoritePage() {
  const [sort, setSort] = useState<FavoriteSortKey>("recent");
  const play = usePlayerStore((s) => s.play);

  const likedTracks = tracks.filter((t) => t.liked);

  const sorted = [...likedTracks].sort((a, b) => {
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "artist") return a.artistName.localeCompare(b.artistName);
    return 0; // recent = original order
  });

  const playAll = () => {
    if (sorted.length > 0) play(sorted[0], sorted);
  };

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-14 h-14 bg-gradient-to-br from-brand to-purple-600 rounded-2xl flex items-center justify-center">
          <Heart size={28} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="text-white text-xl font-bold">Улюблені треки</h1>
          <p className="text-muted text-sm">{likedTracks.length} треків</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <Button
          variant="secondary"
          shape="pill"
          onClick={playAll}
          className="px-6"
        >
          Відтворити все
        </Button>
        <div className="relative">
          <button className="flex items-center gap-1.5 p-2.5 bg-surface-alt rounded-full text-muted text-sm">
            <SortAsc size={16} />
          </button>
        </div>
      </div>

      {/* Sort pills */}
      <div className="flex gap-2 mb-4">
        {(["recent", "az", "artist"] as FavoriteSortKey[]).map((s) => (
          <Button
            key={s}
            variant={sort === s ? "secondary" : "ghost"}
            shape="pill"
            size="sm"
            onClick={() => setSort(s)}
            className={sort !== s ? "bg-surface-alt" : ""}
          >
            {s === "recent" ? "Нещодавні" : s === "az" ? "А — Я" : "Виконавець"}
          </Button>
        ))}
      </div>

      {/* Track list */}
      <div className="space-y-1">
        {sorted.map((t, i) => (
          <TrackRow key={t.id} track={t} index={i} queue={sorted} showIndex />
        ))}
      </div>

      {likedTracks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={48} className="text-muted mb-4" />
          <p className="text-white font-semibold">Немає улюблених треків</p>
          <p className="text-muted text-sm mt-1">
            Натисніть ❤️ поруч із треком
          </p>
        </div>
      )}
    </div>
  );
}
