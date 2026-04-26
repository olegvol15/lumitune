import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import ProfileAlbumCard from '../components/profile/ProfileAlbumCard';
import ProfileAlbumUploadModal from '../components/profile/ProfileAlbumUploadModal';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileFollowingCard from '../components/profile/ProfileFollowingCard';
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
import { artists } from '../data/artists';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { mapBackendSongToCreatorTrack, PROFILE_GENRES, PROFILE_MOODS } from '../utils/profile.utils';
import { useI18n } from '../lib/i18n';
import { useCreateAlbumMutation, useMyAlbumsQuery } from '../hooks/albums';
import { useMoodsQuery } from '../hooks/moods';

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80';
const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80';

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
  const { copy, language } = useI18n();
  const user = useAuthStore((state) => state.user);
  const { theme } = useThemeStore();
  const isLight = theme === 'ice';
  const play = usePlayerStore((state) => state.play);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [trackModal, setTrackModal] = useState<TrackModalState>({ open: false });
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const creatorTracksQuery = useCreatorTracksQuery();
  const myAlbumsQuery = useMyAlbumsQuery();
  const moodsQuery = useMoodsQuery();
  const uploadCreatorTrackMutation = useUploadCreatorTrackMutation();
  const updateCreatorTrackMutation = useUpdateCreatorTrackMutation();
  const createAlbumMutation = useCreateAlbumMutation();

  const displayName = user?.displayName || user?.username || 'Oleh';
  const bio =
    user?.bio ||
    copy.profile.defaultBio;
  const avatar =
    user?.profilePicture && user.profilePicture !== 'default-avatar.png'
      ? user.profilePicture
      : FALLBACK_AVATAR;
  const cover = user?.coverImage || FALLBACK_COVER;

  const creatorTracks = creatorTracksQuery.data ?? [];
  const profileMoods = moodsQuery.data && moodsQuery.data.length > 0 ? moodsQuery.data : PROFILE_MOODS;
  const creatorAlbums = (myAlbumsQuery.data ?? []).map((album) => ({
    id: album.id,
    backendId: album.id,
    title: album.title,
    coverImage: album.coverUrl,
    trackIds: album.trackIds,
    artistName: album.artistName,
    year: album.year,
  }));

  const topTracks = useMemo(() => creatorTracks.slice(0, 3), [creatorTracks]);
  const followingArtists = useMemo(() => artists.slice(0, 4), []);
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
        playCount: track.likes,
        liked: true,
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
        playCount: item.likes,
        liked: true,
      }))
    );
  };

  return (
    <>
      <div className="px-6 pb-10 pt-5">
        <div
          className="overflow-hidden rounded-[28px] border border-[#27465d] shadow-[0_28px_90px_rgba(0,0,0,0.42)]"
          style={{ background: isLight ? '#c8dff0' : 'linear-gradient(180deg,#0d1c29 0%,#08141d 100%)' }}
        >
          <section
            className="relative overflow-hidden border-b border-[#30586f] px-6 py-4"
            style={{
              backgroundImage: isLight
                ? `linear-gradient(180deg,rgba(184,211,230,0.55),rgba(200,221,237,0.7)), url(${cover})`
                : `linear-gradient(180deg,rgba(8,22,30,0.58),rgba(12,58,74,0.66)), url(${cover})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            {!isLight && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(61,150,177,0.16),transparent_25%),radial-gradient(circle_at_70%_0%,rgba(164,219,233,0.12),transparent_22%)]" />
            )}
            <div className="relative">
              <div className="mb-2 text-[11px] font-medium text-white">{copy.profile.title}</div>

              <div className="grid gap-4 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-start">
                <div className="flex items-center">
                  <div className="rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.2),transparent_65%),linear-gradient(180deg,#cce8f2,#6d98ab)] p-[3px] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                    <img
                      src={avatar}
                      alt={displayName}
                      className="h-[84px] w-[84px] rounded-full object-cover"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                    <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-white">
                      {displayName}
                    </h1>

                    <div className="flex gap-6 pb-1">
                      <ProfileStat value="66" label={copy.profile.following} />
                      <ProfileStat
                        value={String(Math.max(creatorTracks.length, 6))}
                        label={copy.profile.music}
                      />
                      <ProfileStat value="666" label={copy.profile.listeners} />
                    </div>
                  </div>
                </div>

                <ProfileHeroActions
                  onEditProfile={() => setIsEditProfileOpen(true)}
                  onOpenSettings={() => navigate({ to: '/settings' })}
                />
              </div>

              <div className="mt-2 flex justify-end">
                <div className={`max-w-[440px] rounded-[8px] px-4 py-3 text-[11px] italic leading-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] ${isLight ? 'bg-[#c8dded]/40 text-[#0a1929]' : 'bg-black/22 text-[#e8f1f8]'}`}>
                  {bio}
                </div>
              </div>
            </div>
          </section>

          <section className="px-7 py-6">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant="auth-outline"
                  size="sm"
                  shape="rect"
                  onClick={() => setTrackModal({ open: true, mode: 'create' })}
                  className="rounded-md border-[#365a7a] bg-[#12283a] px-4 text-[12px] text-[#dbeaf8] hover:bg-[#173247]"
                >
                  {copy.profile.uploadTrack}
                </Button>
                <Button
                  variant="auth-outline"
                  size="sm"
                  shape="rect"
                  onClick={() => setIsAlbumModalOpen(true)}
                  className="rounded-md border-[#365a7a] bg-[#12283a] px-4 text-[12px] text-[#dbeaf8] hover:bg-[#173247]"
                >
                  {copy.profile.createAlbum}
                </Button>
              </div>
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

            <section className="mb-12">
              <ProfileSectionTitle title={copy.profile.yourTracks} right={<ProfileTrackSectionTools />} />

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {creatorTracks.map((track) => (
                  <ProfileTrackCard
                    key={track.id}
                    track={track}
                    onPlay={() => playTrack(track)}
                    onEdit={() => setTrackModal({ open: true, mode: 'edit', trackId: track.id })}
                  />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <ProfileSectionTitle
                title={copy.profile.topTracks}
                right={
                  <div className="grid grid-cols-[120px_110px_50px] gap-4 pr-4 text-sm font-semibold text-[#d2dce8]">
                    <span>{copy.profile.releaseDate}</span>
                    <span>{copy.profile.likes}</span>
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
            </section>

            <section>
              <ProfileSectionTitle title={copy.profile.followingArtists} right={<ProfileSectionArrows />} />

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {followingArtists.map((artist) => (
                  <ProfileFollowingCard
                    key={artist.id}
                    name={artist.name}
                    image={artist.image}
                    listeners={artist.monthlyListeners.toLocaleString(language === 'en' ? 'en-US' : 'uk-UA')}
                    onClick={() => navigate({ to: '/artist/$id', params: { id: artist.id } })}
                  />
                ))}
              </div>
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
        genres={PROFILE_GENRES}
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
