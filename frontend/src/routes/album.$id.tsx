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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="h-full w-full object-cover opacity-20 blur-[88px] scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-surface/55 to-surface" />

        <div className="relative z-10 px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.history.back()}
              className="rounded-full bg-black/40 p-2.5 backdrop-blur-sm"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button className="rounded-full bg-black/40 p-2.5 backdrop-blur-sm">
              <MoreHorizontal size={20} className="text-white" />
            </button>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl bg-white/5 shadow-2xl ring-1 ring-white/10 sm:h-56 sm:w-56">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <p className="mb-2 text-xs uppercase tracking-[0.28em] text-white/45">{copy.common.album}</p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{album.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-white">{album.artistName}</span>
                <span className="text-sm text-muted">·</span>
                <span className="text-sm text-muted">{album.year}</span>
                <span className="text-sm text-muted">·</span>
                <span className="text-sm text-muted">
                  {albumTracks.length} {copy.common.tracks}
                </span>
                <span className="text-sm text-muted">·</span>
                <span className="text-sm text-muted">{fmtTotal(totalDuration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 sm:px-6">
        <div className="mb-5 flex items-center gap-3">
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
