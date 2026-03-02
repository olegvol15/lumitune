import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Settings, Edit3 } from "lucide-react";
import { tracks } from "../data/tracks";
import { albums } from "../data/albums";
import { artists } from "../data/artists";
import TrackRow from "../components/ui/TrackRow";
import MediaCard from "../components/ui/MediaCard";

const user = {
  id: "user1",
  name: "Олег Волостних",
  username: "@oleg_music",
  avatarUrl: "https://picsum.photos/seed/user1/200/200",
  followers: 1_240,
  following: 487,
  totalStreams: 23_400,
};

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const navigate = useNavigate();
  const topTracks = tracks.filter((t) => t.liked).slice(0, 5);
  const topAlbums = albums.slice(0, 4);
  const favArtists = artists.slice(0, 4);

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-b from-brand/60 to-surface" />
        <div className="px-4 -mt-12">
          <div className="flex items-end justify-between">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-surface object-cover"
            />
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => navigate({ to: "/settings" })}
                className="p-2.5 bg-surface-alt rounded-full"
              >
                <Settings size={18} className="text-white" />
              </button>
              <button className="p-2.5 bg-surface-alt rounded-full">
                <Edit3 size={18} className="text-white" />
              </button>
            </div>
          </div>

          <h1 className="text-white text-xl font-bold mt-2">{user.name}</h1>
          <p className="text-muted text-sm">{user.username}</p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-white font-bold">
                {user.followers.toLocaleString("uk")}
              </p>
              <p className="text-muted text-xs">Підписники</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">
                {user.following.toLocaleString("uk")}
              </p>
              <p className="text-muted text-xs">Підписки</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">
                {user.totalStreams.toLocaleString("uk")}
              </p>
              <p className="text-muted text-xs">Прослухань</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top tracks */}
      <div className="px-4 mt-6">
        <h2 className="text-white font-bold text-lg mb-3">Улюблені треки</h2>
        <div className="space-y-1">
          {topTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} queue={tracks} showIndex />
          ))}
        </div>
      </div>

      {/* Top albums */}
      <div className="px-4 mt-6">
        <h2 className="text-white font-bold text-lg mb-3">Альбоми</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {topAlbums.map((al) => (
            <MediaCard
              key={al.id}
              image={al.coverUrl}
              title={al.title}
              subtitle={al.artistName}
              onClick={() =>
                navigate({ to: "/album/$id", params: { id: al.id } })
              }
            />
          ))}
        </div>
      </div>

      {/* Favorite artists */}
      <div className="px-4 mt-6">
        <h2 className="text-white font-bold text-lg mb-3">
          Улюблені виконавці
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {favArtists.map((a) => (
            <MediaCard
              key={a.id}
              image={a.image}
              title={a.name}
              subtitle={a.genre}
              rounded
              onClick={() =>
                navigate({ to: "/artist/$id", params: { id: a.id } })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
