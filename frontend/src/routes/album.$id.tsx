import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Play, Shuffle, X } from 'lucide-react';
import TrackCard from '../components/ui/TrackCard';
import { usePlayerStore } from '../store/playerStore';
import Button from '../components/ui/Button';
import { useI18n } from '../lib/i18n';
import { useAlbumQuery, useDeleteAlbumMutation, useSaveAlbumMutation, useUpdateAlbumMutation } from '../hooks/albums';
import { formatDuration } from '../utils/format';
import { useAuthStore } from '../store/authStore';

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
  const user = useAuthStore((state) => state.user);
  const saveAlbumMutation = useSaveAlbumMutation();
  const updateAlbumMutation = useUpdateAlbumMutation();
  const deleteAlbumMutation = useDeleteAlbumMutation();
  const album = data?.album;
  const albumTracks = data?.tracks ?? [];
  const isOwner = Boolean(album?.artistUserId && user?.id === album.artistUserId);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const removeTrackFromAlbum = async (trackId: string) => {
    if (!album) return;
    const formData = new FormData();
    formData.append('title', album.title);
    formData.append('artistName', album.artistName);
    formData.append('trackIds', JSON.stringify(albumTracks.filter((track) => track.id !== trackId).map((track) => track.id)));
    if (album.description) formData.append('description', album.description);
    if (album.genre) formData.append('genre', album.genre);
    if (album.releaseDate) formData.append('releaseDate', album.releaseDate);

    await updateAlbumMutation.mutateAsync({ id: album.id, formData });
  };

  const deleteAlbum = async () => {
    if (!album) return;
    await deleteAlbumMutation.mutateAsync(album.id);
    navigate({ to: '/profile' });
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
            {isOwner && confirmDelete ? (
              <div className="flex items-center gap-2 rounded-xl border border-[#1a3050] bg-[#0a1929]/95 px-3 py-2">
                <span className="text-sm text-white/80">{copy.media.deleteQuestion}</span>
                <button
                  onClick={() => void deleteAlbum()}
                  disabled={deleteAlbumMutation.isPending}
                  className="text-sm font-semibold text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                >
                  {copy.common.yes}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-muted transition-colors hover:text-white"
                >
                  {copy.common.no}
                </button>
              </div>
            ) : (
              <button
                onClick={() => isOwner && setConfirmDelete(true)}
                className="rounded-full bg-black/40 p-2.5 backdrop-blur-sm"
                title={isOwner ? copy.common.delete : undefined}
              >
                <MoreHorizontal size={20} className="text-white" />
              </button>
            )}
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
          {albumTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              queue={albumTracks}
              onPlay={() => play(track, albumTracks)}
              metadata={[
                { key: 'album', label: track.albumTitle, className: 'w-36' },
                { key: 'duration', label: formatDuration(track.duration), className: 'w-12 text-right' },
              ]}
              action={
                isOwner ? (
                  <button
                    type="button"
                    onClick={() => void removeTrackFromAlbum(track.id)}
                    disabled={updateAlbumMutation.isPending || albumTracks.length <= 1}
                    className="rounded-full p-1.5 text-muted opacity-0 transition-all hover:bg-white/10 hover:text-red-400 group-hover:opacity-100"
                    title={copy.media.removeFromPlaylist}
                  >
                    <X size={14} />
                  </button>
                ) : null
              }
            />
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
