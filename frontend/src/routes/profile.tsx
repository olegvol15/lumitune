import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Disc3, Library, Music2, Pencil, Radio, UserRoundPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import ProfileAlbumCard from '../components/profile/ProfileAlbumCard';
import ProfileAlbumUploadModal from '../components/profile/ProfileAlbumUploadModal';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileHeroActions from '../components/profile/ProfileHeroActions';
import ProfileSectionArrows from '../components/profile/ProfileSectionArrows';
import ProfileSectionTitle from '../components/profile/ProfileSectionTitle';
import ProfileStat from '../components/profile/ProfileStat';
import ProfileTopTrackRow from '../components/profile/ProfileTopTrackRow';
import ProfileTrackCard from '../components/profile/ProfileTrackCard';
import ProfileTrackEditorModal from '../components/profile/ProfileTrackEditorModal';
import ProfileTrackSectionTools from '../components/profile/ProfileTrackSectionTools';
import { useThemeStore } from '../store/themeStore';
import { useCreatorTracksQuery, useUpdateCreatorTrackMutation, useUploadCreatorTrackMutation } from '../hooks/tracks';
import type { CreatorTrack, TrackModalState } from '../types/profile/profile.types';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { mapBackendSongToCreatorTrack } from '../utils/profile.utils';
import { useI18n } from '../lib/i18n';
import { useAlbumsQuery, useCreateAlbumMutation, useMyAlbumsQuery } from '../hooks/albums';
import { useMoodsQuery } from '../hooks/moods';
import { useFollowedArtistsQuery, useFollowingQuery, useUserProfileQuery } from '../hooks/follows';
import Avatar from '../components/ui/Avatar';

const FALLBACK_AVATAR = '/vite.svg';
const FALLBACK_COVER = '/vite.svg';
const toImageUrl = (value?: string) => {
  if (!value || value === 'default-avatar.png') return undefined;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return `/${value}`;
};

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/auth/signin' });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { copy } = useI18n();
  const user = useAuthStore((state) => state.user);
  const { theme } = useThemeStore();
  const isLight = theme === 'ice';
  const play = usePlayerStore((state) => state.play);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [trackModal, setTrackModal] = useState<TrackModalState>({ open: false });
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const creatorTracksQuery = useCreatorTracksQuery();
  const myAlbumsQuery = useMyAlbumsQuery();
  const albumsQuery = useAlbumsQuery();
  const moodsQuery = useMoodsQuery();
  const uploadCreatorTrackMutation = useUploadCreatorTrackMutation();
  const updateCreatorTrackMutation = useUpdateCreatorTrackMutation();
  const createAlbumMutation = useCreateAlbumMutation();
  const followingQuery = useFollowingQuery(user?.id);
  const followedArtistsQuery = useFollowedArtistsQuery();
  const userProfileQuery = useUserProfileQuery(user?.id);

  const displayName = user?.displayName || user?.username || user?.email || '';
  const bio =
    user?.bio ||
    copy.profile.defaultBio;
  const avatar =
    user?.profilePicture && user.profilePicture !== 'default-avatar.png'
      ? user.profilePicture
      : FALLBACK_AVATAR;
  const cover = user?.coverImage || FALLBACK_COVER;

  const creatorTracks = useMemo(() => creatorTracksQuery.data ?? [], [creatorTracksQuery.data]);
  const profileMoods = moodsQuery.data ?? [];
  const profileGenres = Array.from(
    new Set([
      ...creatorTracks.map((track) => track.genre).filter(Boolean),
      ...(albumsQuery.data ?? []).map((album) => album.genre).filter(Boolean),
    ])
  );
  const creatorAlbums = (myAlbumsQuery.data ?? []).map((album) => ({
    id: album.id,
    backendId: album.id,
    title: album.title,
    coverImage: album.coverUrl,
    trackIds: album.trackIds,
    artistName: album.artistName,
    year: album.year,
  }));
  const followingUsers = followingQuery.data?.following ?? [];
  const followedArtists = followedArtistsQuery.data ?? [];
  const followingTotal = (userProfileQuery.data?.followingCount ?? followingUsers.length) + followedArtists.length;
  const musicTotal = creatorTracks.length;
  const listenerTotal = creatorTracks.reduce((sum, track) => sum + track.plays, 0);

  const topTracks = useMemo(() => creatorTracks.slice(0, 3), [creatorTracks]);
  const editingTrack = creatorTracks.find((track) => track.id === trackModal.trackId);

  const playTrack = (track: CreatorTrack) => {
    play(
      {
        id: track.id,
        title: track.title,
        artistId: 'creator',
        artistName: track.artistName,
        albumId: track.id,
        albumTitle: track.title,
        albumCover: track.albumCover,
        duration: track.duration,
        playCount: track.plays,
        liked: false,
      },
      creatorTracks.map((item) => ({
        id: item.id,
        title: item.title,
        artistId: 'creator',
        artistName: item.artistName,
        albumId: item.id,
        albumTitle: item.title,
        albumCover: item.albumCover,
        duration: item.duration,
        playCount: item.plays,
        liked: false,
      }))
    );
  };

  const statCards = [
    { label: copy.profile.following, value: followingTotal, icon: UserRoundPlus },
    { label: copy.profile.music, value: musicTotal, icon: Music2 },
    { label: copy.profile.listeners, value: listenerTotal, icon: Radio },
  ];

  return (
    <>
      <div className="px-4 pb-10 pt-5 sm:px-6">
        <div className="mx-auto max-w-[1320px]">
          <section
            className="relative overflow-hidden rounded-[24px] border border-[#284964] shadow-[0_26px_85px_rgba(0,0,0,0.38)]"
            style={{
              backgroundImage: isLight
                ? `linear-gradient(135deg,rgba(186,213,231,0.78),rgba(205,225,239,0.9)), url(${cover})`
                : `linear-gradient(135deg,rgba(8,18,31,0.72),rgba(10,45,61,0.62) 48%,rgba(8,15,28,0.92)), url(${cover})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            {!isLight && (
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,18,0.05),rgba(3,8,18,0.74))]" />
            )}
            <div className="relative flex min-h-[300px] flex-col justify-between p-5 sm:p-7">
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-normal text-white/80 backdrop-blur">
                  <Disc3 size={14} />
                  {copy.profile.title}
                </div>
                <ProfileHeroActions
                  onEditProfile={() => setIsEditProfileOpen(true)}
                  onOpenSettings={() => navigate({ to: '/settings' })}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="rounded-full bg-[linear-gradient(180deg,#d9eef7,#6f9db3)] p-[4px] shadow-[0_22px_55px_rgba(0,0,0,0.42)]">
                    <img
                      src={avatar}
                      alt={displayName}
                      className="h-28 w-28 rounded-full object-cover sm:h-36 sm:w-36"
                    />
                  </div>

                  <div className="min-w-0 pb-1">
                    <h1 className="truncate text-4xl font-black leading-none tracking-normal text-white sm:text-6xl">
                      {displayName}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:text-[15px]">
                      {bio}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        shape="rect"
                        onClick={() => setTrackModal({ open: true, mode: 'create' })}
                        className="rounded-lg px-4"
                      >
                        {copy.profile.uploadTrack}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        shape="rect"
                        onClick={() => setIsAlbumModalOpen(true)}
                        className="rounded-lg border-white/20 bg-white/5 px-4 backdrop-blur hover:bg-white/10"
                      >
                        {copy.profile.createAlbum}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#071522]/68 p-2 backdrop-blur-md">
                  {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl bg-white/[0.055] px-3 py-4 text-center">
                        <Icon size={16} className="mx-auto mb-2 text-[#7fd8ff]" />
                        <ProfileStat value={String(stat.value)} label={stat.label} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[24px] border border-[#18344d] bg-[#071320]/88 px-4 py-5 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:px-6">
            <section className="mb-10">
              <ProfileSectionTitle
                title={copy.profile.yourTracks}
                right={
                  <div className="flex items-center gap-2">
                    <ProfileTrackSectionTools />
                    <Button
                      variant="ghost"
                      size="sm"
                      shape="pill"
                      onClick={() =>
                        creatorTracks[0] &&
                        setTrackModal({ open: true, mode: 'edit', trackId: creatorTracks[0].id })
                      }
                      className="!h-8 !w-8 !rounded-full !p-0 !text-white hover:!bg-white/5"
                    >
                      <Pencil size={16} />
                    </Button>
                  </div>
                }
              />

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
                {creatorTracks.map((track) => (
                  <ProfileTrackCard
                    key={track.id}
                    track={track}
                    onPlay={() => playTrack(track)}
                    onEdit={() => setTrackModal({ open: true, mode: 'edit', trackId: track.id })}
                  />
                ))}
              </div>
              {creatorTracks.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#2b4b64] px-4 py-10 text-center text-sm text-[#9fb8c9]">
                  {copy.common.noResults}
                </div>
              )}
            </section>

            <section className="mb-12">
              <ProfileSectionTitle
                title={copy.profile.topTracks}
                right={
                  <div className="grid grid-cols-[120px_110px_50px] gap-4 pr-4 text-sm font-semibold text-[#d2dce8]">
                    <span>{copy.profile.releaseDate}</span>
                    <span>{copy.profile.plays}</span>
                    <span className="text-right">{copy.profile.time}</span>
                  </div>
                }
              />

              <div className="space-y-3">
                {topTracks.map((track, index) => (
                  <ProfileTopTrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    onPlay={() => playTrack(track)}
                  />
                ))}
              </div>
              {topTracks.length === 0 && (
                <div className="rounded-xl border border-[#1d3850] px-4 py-8 text-center text-sm text-[#9fb8c9]">
                  {copy.common.noResults}
                </div>
              )}
            </section>

            <section className="mb-12">
              <ProfileSectionTitle
                title={copy.profile.yourAlbums}
                right={<ProfileSectionArrows />}
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {creatorAlbums.map((album) => (
                  <ProfileAlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => navigate({ to: '/album/$id', params: { id: album.id } })}
                  />
                ))}
              </div>
              {creatorAlbums.length === 0 && (
                <div className="rounded-xl border border-[#1d3850] px-4 py-8 text-center text-sm text-[#9fb8c9]">
                  {copy.common.noResults}
                </div>
              )}
            </section>

            <section>
              <ProfileSectionTitle title={copy.profile.followingArtists} right={<ProfileSectionArrows />} />
              {followingUsers.length > 0 || followedArtists.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {followedArtists.map((followedArtist) => (
                    <button
                      key={followedArtist._id}
                      type="button"
                      onClick={() => navigate({ to: '/artist/$id', params: { id: followedArtist.artistId } })}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-[#25435a] bg-[#0d2038]/88 p-3 text-left transition-colors hover:bg-[#14304a]"
                    >
                      <Avatar src={toImageUrl(followedArtist.image)} alt={followedArtist.artistName} size={44} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">{followedArtist.artistName}</span>
                        <span className="block truncate text-xs text-white/45">
                          {followedArtist.genre || copy.search.artists}
                        </span>
                      </span>
                    </button>
                  ))}
                  {followingUsers.map((followedUser) => {
                    const name = followedUser.displayName || followedUser.username;
                    return (
                      <button
                        key={followedUser.id}
                        type="button"
                        onClick={() => navigate({ to: '/user/$id', params: { id: followedUser.id } })}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-[#25435a] bg-[#0d2038]/88 p-3 text-left transition-colors hover:bg-[#14304a]"
                      >
                        <Avatar src={toImageUrl(followedUser.profilePicture)} alt={name} size={44} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-white">{name}</span>
                          <span className="block truncate text-xs text-white/45">{followedUser.role}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-[#1d3850] px-4 py-8 text-center text-sm text-[#9fb8c9]">
                  <Library size={17} />
                  <span>{copy.common.noResults}</span>
                </div>
              )}
            </section>
          </section>
        </div>
      </div>

      <ProfileEditModal
        open={isEditProfileOpen}
        fallbackAvatar={FALLBACK_AVATAR}
        fallbackCover={FALLBACK_COVER}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <ProfileTrackEditorModal
        open={trackModal.open}
        mode={trackModal.open ? trackModal.mode : 'create'}
        initialTrack={trackModal.open && trackModal.mode === 'edit' ? editingTrack : undefined}
        fallbackCover={FALLBACK_COVER}
        artistName={displayName}
        genres={profileGenres}
        moods={profileMoods}
        onClose={() => setTrackModal({ open: false })}
        onSave={async (track) => {
          const formData = new FormData();
          formData.append('title', track.title);
          formData.append('artist', track.artistName || displayName);
          formData.append('genre', track.genre);
          formData.append('mood', track.mood);
          if (track.coverFile) {
            formData.append('cover', track.coverFile);
          }
          if (track.audioFile) {
            formData.append('audio', track.audioFile);
          }

          const response =
            trackModal.open && trackModal.mode === 'edit' && track.id
              ? await updateCreatorTrackMutation.mutateAsync({
                  songId: track.id,
                  formData,
                })
              : await uploadCreatorTrackMutation.mutateAsync(formData);

          mapBackendSongToCreatorTrack(response.data.song);
          setTrackModal({ open: false });
        }}
      />
      <ProfileAlbumUploadModal
        open={isAlbumModalOpen}
        tracks={creatorTracks}
        fallbackCover={FALLBACK_COVER}
        onClose={() => setIsAlbumModalOpen(false)}
        onSave={async (album) => {
          const formData = new FormData();
          formData.append('title', album.title);
          formData.append('artistName', displayName);
          formData.append('trackIds', JSON.stringify(album.trackIds));
          if (album.coverFile) {
            formData.append('cover', album.coverFile);
          }

          await createAlbumMutation.mutateAsync(formData);
          setIsAlbumModalOpen(false);
        }}
      />
    </>
  );
}
