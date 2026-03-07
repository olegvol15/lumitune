import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Library,
  Heart,
  ListPlus,
  AlignJustify,
  RefreshCw,
  Clock,
  Music2,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { usePlaylistStore } from "../../store/playlistStore";
import SongCoverImage from "../ui/SongCoverImage";

export default function Sidebar() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const queue = usePlayerStore((s) => s.queue);
  const { playlists, createPlaylist } = usePlaylistStore();

  const handleCreatePlaylist = () => {
    const id = createPlaylist();
    navigate({ to: "/playlist/$id", params: { id } });
  };

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 bg-[#060d19] border-r border-[#1a3050] overflow-y-auto flex flex-col flex-shrink-0">
      {/* Меню */}
      <div className="px-5 pt-6 pb-5">
        <h2 className="text-white text-xl font-bold mb-4">Меню</h2>

        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-[#0d2a4a] text-white"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Home size={18} />
          Головна
        </Link>

        <Link
          to="/library"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-1 ${
            pathname.startsWith("/library")
              ? "bg-[#0d2a4a] text-white"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Library size={18} />
          Моя медіатека
        </Link>
      </div>

      <div className="h-px bg-[#1a3050] mx-5" />

      {/* Плейлисти */}
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-white text-xl font-bold mb-4">Плейлисти</h2>

        <Link
          to="/favorite"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname.startsWith("/favorite")
              ? "bg-[#0d2a4a] text-white"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <Heart size={18} />
          Улюблені треки
        </Link>

        <button
          onClick={handleCreatePlaylist}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors mt-1"
        >
          <ListPlus size={18} />
          Створити плейлист
        </button>

        {/* Ваші плейлисти header */}
        <div className="flex items-center justify-between px-3 mt-5 mb-1">
          <span className="text-white text-sm font-semibold">
            Ваші плейлисти
          </span>
          <AlignJustify size={15} className="text-white/50" />
        </div>

        {playlists.length === 0 ? (
          <p className="text-muted text-xs px-3 py-2">Ще немає плейлистів</p>
        ) : (
          playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() =>
                navigate({ to: "/playlist/$id", params: { id: playlist.id } })
              }
              className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-left transition-colors ${
                pathname === `/playlist/${playlist.id}`
                  ? "bg-[#0d2a4a]"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1CA2EA]/30 to-[#0a1929] flex items-center justify-center flex-shrink-0">
                <Music2 size={16} className="text-[#1CA2EA]/70" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {playlist.title}
                </p>
                <p className="text-white/40 text-xs">
                  {playlist.trackIds.length} треків
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="h-px bg-[#1a3050] mx-5" />

      {/* Нещодавно прослухані */}
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-semibold">
            Нещодавно прослухані
          </span>
          <RefreshCw size={15} className="text-white/50" />
        </div>

        {queue.length > 0 ? (
          queue.slice(0, 3).map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
            >
              <SongCoverImage
                src={track.albumCover}
                alt={track.title}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {track.title}
                </p>
                <p className="text-white/40 text-xs truncate">
                  {track.artistName}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center mt-4">
            <div className="w-20 h-20 rounded-full border-2 border-[#1a3050] flex items-center justify-center">
              <Clock size={100} className="text-white/20" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
