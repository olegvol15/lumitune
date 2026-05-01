import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Music2, UserCheck } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import TrackCard from '../components/ui/TrackCard';
import { useFollowMutation, useUserProfileQuery } from '../hooks/follows';
import { useI18n } from '../lib/i18n';
import { useAuthStore } from '../store/authStore';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';

export const Route = createFileRoute('/user/$id')({
  component: UserProfilePage,
});

const toImageUrl = (value?: string, fallback = '/vite.svg') => {
  if (!value || value === 'default-avatar.png') return fallback;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return `/${value}`;
};

function UserProfilePage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const { copy } = useI18n();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);
  const profileQuery = useUserProfileQuery(id);
  const followMutation = useFollowMutation();

  const profile = profileQuery.data;
  const targetUser = profile?.user;
  const displayName = targetUser?.displayName || targetUser?.username || '';
  const isOwnProfile = currentUser?.id === id;
  const canFollow = Boolean(targetUser && !isOwnProfile);
  const following = Boolean(profile?.isFollowing);
  const tracks = (profile?.tracks ?? []).map(mapBackendSongToTrack);

  if (profileQuery.isLoading) {
    return <div className="flex h-screen items-center justify-center text-muted">{copy.common.loading}</div>;
  }

  if (!targetUser) {
    return <div className="flex h-screen items-center justify-center text-muted">{copy.common.noResults}</div>;
  }

  return (
    <div className="pb-8">
      <section
        className="relative min-h-[260px] overflow-hidden bg-[#07111f]"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(7,17,31,0.38),#07111f), url(${toImageUrl(targetUser.coverImage)})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <button
          type="button"
          aria-label={copy.common.back}
          onClick={() => router.history.back()}
          className="absolute left-4 top-4 rounded-full bg-[rgba(20,20,28,0.68)] p-2.5 shadow-lg backdrop-blur-md"
        >
          <ChevronLeft size={20} className="!text-white" />
        </button>

        <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
          <Avatar src={toImageUrl(targetUser.profilePicture, '')} alt={displayName} size={92} />
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-normal text-white/70">
              {targetUser.role === 'creator' ? copy.profile.title : copy.nav.profile}
            </p>
            <h1 className="truncate text-4xl font-black text-white">{displayName}</h1>
            <p className="mt-2 text-sm text-white/70">
              {profile.followerCount} {copy.media.followers} · {profile.followingCount} {copy.profile.following}
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 pt-5">
        <div className="mb-8 flex items-center gap-3">
          {canFollow && (
            <Button
              variant={following ? 'secondary' : 'outline'}
              shape="pill"
              leftIcon={following ? <UserCheck size={16} /> : undefined}
              loading={followMutation.isPending}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate({ to: '/auth/signin' });
                  return;
                }
                followMutation.mutate({ userId: id, following });
              }}
            >
              {following ? copy.media.following : copy.media.follow}
            </Button>
          )}
          {isOwnProfile && (
            <Button variant="outline" shape="pill" onClick={() => navigate({ to: '/profile' })}>
              {copy.nav.profile}
            </Button>
          )}
        </div>

        {targetUser.bio && (
          <section className="mb-8 rounded-lg bg-surface-alt p-4">
            <p className="text-sm leading-relaxed text-white/70">{targetUser.bio}</p>
          </section>
        )}

        {tracks.length > 0 ? (
          <section>
            <SectionHeader title={copy.profile.yourTracks} />
            <div className="space-y-1">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} queue={tracks} />
              ))}
            </div>
          </section>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-10 text-sm text-muted">
            <Music2 size={18} />
            {copy.common.noResults}
          </div>
        )}
      </div>
    </div>
  );
}
