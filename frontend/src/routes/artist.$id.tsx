import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { ChevronLeft, UserCheck, Share2, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import TrackCard from '../components/ui/TrackCard';
import MediaCard from '../components/ui/MediaCard';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { useCatalogTracks } from '../hooks/tracks';
import { useI18n } from '../lib/i18n';
import { useAlbumsQuery } from '../hooks/albums';
import { useArtistsQuery } from '../hooks/artists';
import { formatDuration, formatPlayCount } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import {
  useArtistFollowMutation,
  useArtistFollowStatusQuery,
  useFollowMutation,
  useUserProfileQuery,
} from '../hooks/follows';

export const Route = createFileRoute('/artist/$id')({
  component: ArtistPage,
});

function ArtistPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const { tracks } = useCatalogTracks();
  const { data: albums = [] } = useAlbumsQuery();
  const { data: artists = [], isLoading: artistsLoading } = useArtistsQuery();
  const { copy } = useI18n();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);
  const followMutation = useFollowMutation();
  const artistFollowMutation = useArtistFollowMutation();

  const derivedArtist = useMemo(() => {
    const catalogArtist = artists.find((item) => item.id === id);
    if (catalogArtist) return catalogArtist;

    const firstTrack = tracks.find((track) => track.artistId === id);
    if (!firstTrack) {
      return null;
    }

    const trackArtistUserId =
      firstTrack.uploadedById || albums.find((album) => album.artistName === firstTrack.artistName)?.artistUserId;

    return {
      id,
      name: firstTrack.artistName,
      image: firstTrack.albumCover,
      bannerImage: firstTrack.albumCover,
      genre: albums.find((album) => album.artistName === firstTrack.artistName)?.genre || '',
      monthlyListeners: 0,
      followers: 0,
      bio: '',
      verified: false,
      artistUserId: trackArtistUserId,
      isFollowable: Boolean(trackArtistUserId),
    };
  }, [albums, artists, id, tracks]);
  const artist = derivedArtist;
  const artistUserId = artist?.artistUserId;
  const artistProfileQuery = useUserProfileQuery(artistUserId);
  const artistStatusQuery = useArtistFollowStatusQuery(artist?.id);
  const isOwnArtist = Boolean(artistUserId && currentUser?.id === artistUserId);
  const canFollowArtist = Boolean(artist && !isOwnArtist);
  const following = artistUserId
    ? Boolean(artistProfileQuery.data?.isFollowing)
    : Boolean(artistStatusQuery.data?.following);
  const followerCount = artistUserId
    ? artistProfileQuery.data?.followerCount ?? artist?.followers ?? 0
    : artistStatusQuery.data?.followerCount ?? artist?.followers ?? 0;
  const isFollowBusy =
    followMutation.isPending ||
    artistFollowMutation.isPending ||
    (artistUserId ? artistProfileQuery.isFetching : artistStatusQuery.isFetching);

  if (!artist && artistsLoading) {
    return <div className="flex items-center justify-center h-screen text-muted">{copy.common.loading}</div>;
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-screen text-muted">
        {copy.media.artistNotFound}
      </div>
    );
  }

  const artistTracks = tracks
    .filter((t) => t.artistId === id || t.artistName === artist.name)
    .slice(0, 5);
  const artistAlbums = albums.filter((a) => a.artistId === id || a.artistName === artist.name);
  const similarArtists = artist.genre
    ? artists.filter((a) => a.id !== id && a.genre === artist.genre).slice(0, 5)
    : [];

  const fmtListeners = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n < 1_000) return n.toString();
    return `${(n / 1_000).toFixed(0)}K`;
  };

  const heroImage = artist.bannerImage || artist.image;

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden bg-[#07111f]">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-2xl"
        />
        <div className="absolute inset-0 bg-black/30" />
        <img
          src={heroImage}
          alt={artist.name}
          className="relative h-full w-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-surface" />

        {/* Back button */}
        <button
          type="button"
          aria-label={copy.common.back}
          onClick={() => router.history.back()}
          className="absolute left-4 top-4 rounded-full bg-[rgba(20,20,28,0.68)] p-2.5 shadow-lg backdrop-blur-md"
        >
          <ChevronLeft size={20} className="!text-white" />
        </button>

        <button
          type="button"
          aria-label="More options"
          className="absolute right-4 top-4 rounded-full bg-[rgba(20,20,28,0.68)] p-2.5 shadow-lg backdrop-blur-md"
        >
          <MoreHorizontal size={20} className="!text-white" />
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
          <h1 className="text-3xl font-bold !text-white">{artist.name}</h1>
          <p className="mt-1 text-sm !text-white/70">
            {fmtListeners(artist.monthlyListeners)} {copy.media.monthlyListeners}
          </p>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Follow + share */}
        <div className="flex items-center gap-3 mb-6">
          {canFollowArtist && (
            <Button
              variant={following ? 'secondary' : 'outline'}
              shape="pill"
              leftIcon={following ? <UserCheck size={16} /> : undefined}
              loading={isFollowBusy}
              disabled={isFollowBusy}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate({ to: '/auth/signin' });
                  return;
                }
                if (artistUserId) {
                  followMutation.mutate({ userId: artistUserId, following });
                  return;
                }
                artistFollowMutation.mutate({
                  artistId: artist.id,
                  artistName: artist.name,
                  image: artist.image,
                  genre: artist.genre,
                  following,
                });
              }}
            >
              {following ? copy.media.following : copy.media.follow}
            </Button>
          )}
          <button className="p-2.5 border border-white/20 rounded-full">
            <Share2 size={18} className="text-white" />
          </button>
        </div>

        {/* Popular tracks */}
        {artistTracks.length > 0 && (
          <>
            <SectionHeader title={copy.media.popularTracks} />
            <div className="space-y-1 mb-6">
              {artistTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  queue={artistTracks}
                  metadata={[
                    { key: 'plays', label: formatPlayCount(track.playCount), className: 'w-16 text-right' },
                    { key: 'duration', label: formatDuration(track.duration), className: 'w-12 text-right' },
                  ]}
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
        {(artist.bio || artist.genre || followerCount > 0) && (
        <div className="bg-surface-alt rounded-2xl p-4">
          <h2 className="text-white font-bold mb-2">{copy.media.aboutArtist}</h2>
          {artist.bio && <p className="text-muted text-sm leading-relaxed">{artist.bio}</p>}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-white font-bold text-sm">{fmtListeners(followerCount)}</p>
              <p className="text-muted text-xs">{copy.media.followers}</p>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{artist.genre}</p>
              <p className="text-muted text-xs">{copy.common.genre}</p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
