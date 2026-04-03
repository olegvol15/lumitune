import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';
import { ChevronLeft, Play, Shuffle, MoreHorizontal } from 'lucide-react';
import { getAlbum } from '../data/albums';
import { getArtist } from '../data/artists';
import TrackRow from '../components/ui/TrackRow';
import { usePlayerStore } from '../store/playerStore';
import Button from '../components/ui/Button';
import { useCatalogTracks } from '../hooks/tracks';
import { useI18n } from '../lib/i18n';

export const Route = createFileRoute('/album/$id')({
  component: AlbumPage,
});

function AlbumPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);
  const { tracks } = useCatalogTracks();
  const { copy, language } = useI18n();

  const staticAlbum = getAlbum(id);
  const albumTracks = tracks.filter((t) => t.albumId === id);
  const derivedAlbum = useMemo(() => {
    if (staticAlbum || albumTracks.length === 0) {
      return null;
    }

    const firstTrack = albumTracks[0];
    return {
      id,
      title: firstTrack.albumTitle,
      artistId: firstTrack.artistId,
      artistName: firstTrack.artistName,
      coverUrl: firstTrack.albumCover,
      year: new Date().getFullYear(),
      genre: 'Unknown',
      trackIds: albumTracks.map((track) => track.id),
    };
  }, [staticAlbum, albumTracks, id]);
  const album = staticAlbum ?? derivedAlbum;

  if (!album) {
    return (
      <div className="flex items-center justify-center h-screen text-muted">
        {copy.media.albumNotFound}
      </div>
    );
  }

  const artist = getArtist(album.artistId);

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
          {artist && (
            <button
              onClick={() => navigate({ to: '/artist/$id', params: { id: artist.id } })}
              className="flex items-center gap-1.5"
            >
              <img
                src={artist.image}
                alt={artist.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-white text-sm font-medium">{artist.name}</span>
            </button>
          )}
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
        </div>

        {/* Track list */}
        <div className="space-y-1">
          {albumTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} queue={albumTracks} showIndex />
          ))}
        </div>

        {/* Footer info */}
        {artist && (
          <div className="mt-8 flex items-center gap-3">
            <img
              src={artist.image}
              alt={artist.name}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="text-muted text-xs">{copy.common.artist}</p>
              <button
                onClick={() => navigate({ to: '/artist/$id', params: { id: artist.id } })}
                className="text-white font-semibold hover:text-brand transition-colors"
              >
                {artist.name}
              </button>
              <p className="text-muted text-xs">{artist.genre}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
