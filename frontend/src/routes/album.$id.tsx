import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Play, Shuffle, MoreHorizontal } from 'lucide-react';
import TrackRow from '../components/ui/TrackRow';
import { usePlayerStore } from '../store/playerStore';
import Button from '../components/ui/Button';
import { useI18n } from '../lib/i18n';
import { useAlbumQuery, useSaveAlbumMutation } from '../hooks/albums';

export const Route = createFileRoute('/album/$id')({
  component: AlbumPage,
});

function AlbumPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);
  const { copy, language } = useI18n();
  const { data, isLoading } = useAlbumQuery(id);
  const saveAlbumMutation = useSaveAlbumMutation();
  const album = data?.album;
  const albumTracks = data?.tracks ?? [];

  if (!album && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted">
        {copy.media.albumNotFound}
      </div>
    );
  }

  if (!album) {
    return <div className="flex items-center justify-center h-screen text-muted">{copy.common.loading}</div>;
  }

  const totalDuration = albumTracks.reduce((acc, t) => acc + t.duration, 0);
  const fmtTotal = (s: number) => {
    const m = Math.floor(s / 60);
    if (language === 'uk') {
      if (m >= 60) return `${Math.floor(m / 60)} год ${m % 60} хв`;
      return `${m} хв`;
    }
    if (m >= 60) return `${Math.floor(m / 60)} h ${m % 60} min`;
    return `${m} min`;
  };

  const playAll = () => {
    if (albumTracks.length > 0) play(albumTracks[0], albumTracks);
  };

  const shufflePlay = () => {
    const shuffled = [...albumTracks].sort(() => Math.random() - 0.5);
    if (shuffled.length > 0) play(shuffled[0], shuffled);
  };

  return (
    <div className="pb-4">
      {/* Cover header */}
      <div className="relative">
        <img src={album.coverUrl} alt={album.title} className="w-full aspect-square object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-surface" />

        <button
          onClick={() => router.history.back()}
          className="absolute top-4 left-4 p-2.5 bg-black/40 backdrop-blur-sm rounded-full"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-sm rounded-full">
          <MoreHorizontal size={20} className="text-white" />
        </button>
      </div>

      <div className="px-4 -mt-4">
        {/* Album info */}
        <h1 className="text-white text-2xl font-bold">{album.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white text-sm font-medium">{album.artistName}</span>
          <span className="text-muted text-sm">·</span>
          <span className="text-muted text-sm">{album.year}</span>
          <span className="text-muted text-sm">·</span>
          <span className="text-muted text-sm">
            {albumTracks.length} {copy.common.tracks}
          </span>
          <span className="text-muted text-sm">·</span>
          <span className="text-muted text-sm">{fmtTotal(totalDuration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4 mb-5">
          <Button
            variant="secondary"
            shape="pill"
            leftIcon={<Play size={16} fill="white" />}
            onClick={playAll}
            className="px-6"
          >
            {copy.common.play}
          </Button>
          <button onClick={shufflePlay} className="p-2.5 bg-surface-alt rounded-full">
            <Shuffle size={18} className="text-white" />
          </button>
          <Button
            variant={album.saved ? 'secondary' : 'outline'}
            shape="pill"
            onClick={() => saveAlbumMutation.mutate({ albumId: album.id, saved: Boolean(album.saved) })}
          >
            {album.saved ? copy.common.saved : copy.common.save}
          </Button>
        </div>

        {album.description ? (
          <p className="mb-5 text-sm leading-6 text-muted">{album.description}</p>
        ) : null}

        {/* Track list */}
        <div className="space-y-1">
          {albumTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} queue={albumTracks} showIndex />
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center gap-3">
          <div>
            <p className="text-muted text-xs">{copy.common.artist}</p>
            <button
              onClick={() => navigate({ to: '/artist/$id', params: { id: album.artistId } })}
              className="text-white font-semibold hover:text-brand transition-colors"
            >
              {album.artistName}
            </button>
            <p className="text-muted text-xs">{album.genre}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
