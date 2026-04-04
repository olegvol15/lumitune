import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { ChevronLeft, UserCheck, Share2, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getArtist, artists } from '../data/artists';
import { albums } from '../data/albums';
import TrackRow from '../components/ui/TrackRow';
import MediaCard from '../components/ui/MediaCard';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { useCatalogTracks } from '../hooks/tracks';
import { useI18n } from '../lib/i18n';

export const Route = createFileRoute('/artist/$id')({
  component: ArtistPage,
});

function ArtistPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const { tracks } = useCatalogTracks();
  const { copy } = useI18n();

  const staticArtist = getArtist(id);
  const derivedArtist = useMemo(() => {
    if (staticArtist) {
      return null;
    }

    const firstTrack = tracks.find((track) => track.artistId === id);
    if (!firstTrack) {
      return null;
    }

    const monthlyListeners = tracks
      .filter((track) => track.artistId === id)
      .reduce((sum, track) => sum + track.playCount, 0);

    return {
      id,
      name: firstTrack.artistName,
      image: firstTrack.albumCover,
      genre: 'Unknown',
      monthlyListeners,
      followers: 0,
      bio: `Tracks by ${firstTrack.artistName}`,
      verified: false,
    };
  }, [id, staticArtist, tracks]);
  const artist = staticArtist ?? derivedArtist;

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-screen text-muted">
        {copy.media.artistNotFound}
      </div>
    );
  }

  const artistTracks = tracks.filter((t) => t.artistId === id).slice(0, 5);
  const artistAlbums = albums.filter((a) => a.artistId === id);
  const similarArtists = artists.filter((a) => a.id !== id && a.genre === artist.genre).slice(0, 5);

  const fmtListeners = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    return `${(n / 1_000).toFixed(0)}K`;
  };

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="relative">
        <img src={artist.image} alt={artist.name} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-surface" />

        {/* Back button */}
        <button
          onClick={() => router.history.back()}
          className="absolute top-4 left-4 p-2.5 bg-black/40 backdrop-blur-sm rounded-full"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <button className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-sm rounded-full">
          <MoreHorizontal size={20} className="text-white" />
        </button>

        {/* Artist info */}
        <div className="absolute bottom-4 left-4 right-4">
          {artist.verified && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-brand text-xs font-semibold">
                ✓ {copy.media.verifiedArtist}
              </span>
            </div>
          )}
          <h1 className="text-white text-3xl font-bold">{artist.name}</h1>
          <p className="text-white/70 text-sm mt-1">
            {fmtListeners(artist.monthlyListeners)} {copy.media.monthlyListeners}
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Follow + share */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant={following ? 'secondary' : 'outline'}
            shape="pill"
            leftIcon={following ? <UserCheck size={16} /> : undefined}
            onClick={() => setFollowing(!following)}
          >
            {following ? copy.media.following : copy.media.follow}
          </Button>
          <button className="p-2.5 border border-white/20 rounded-full">
            <Share2 size={18} className="text-white" />
          </button>
        </div>

        {/* Popular tracks */}
        {artistTracks.length > 0 && (
          <>
            <SectionHeader title={copy.media.popularTracks} />
            <div className="space-y-1 mb-6">
              {artistTracks.map((t, i) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  index={i}
                  queue={artistTracks}
                  showIndex
                  showPlayCount
                />
              ))}
            </div>
          </>
        )}

        {/* Albums */}
        {artistAlbums.length > 0 && (
          <>
            <SectionHeader title={copy.search.albums} />
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none mb-6">
              {artistAlbums.map((al) => (
                <MediaCard
                  key={al.id}
                  image={al.coverUrl}
                  title={al.title}
                  subtitle={`${al.year}`}
                  onClick={() => navigate({ to: '/album/$id', params: { id: al.id } })}
                />
              ))}
            </div>
          </>
        )}

        {/* Similar artists */}
        {similarArtists.length > 0 && (
          <>
            <SectionHeader title={copy.media.similarArtists} />
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none mb-6">
              {similarArtists.map((a) => (
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
          </>
        )}

        {/* About */}
        <div className="bg-surface-alt rounded-2xl p-4">
          <h2 className="text-white font-bold mb-2">{copy.media.aboutArtist}</h2>
          <p className="text-muted text-sm leading-relaxed">{artist.bio}</p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-white font-bold text-sm">{fmtListeners(artist.followers)}</p>
              <p className="text-muted text-xs">{copy.media.followers}</p>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{artist.genre}</p>
              <p className="text-muted text-xs">{copy.common.genre}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
