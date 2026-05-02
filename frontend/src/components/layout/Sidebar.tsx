import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import {
  Home,
  Library,
  Heart,
  ListPlus,
  AlignJustify,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import SongCoverImage from '../ui/SongCoverImage';
import PlaylistCover from '../ui/PlaylistCover';
import { staggerContainer, staggerItem } from '../../lib/motion';
import { usePlaylistsQuery, useCreatePlaylistMutation } from '../../hooks/playlists';
import { useI18n } from '../../lib/i18n';
import { useRecentlyPlayedQuery } from '../../hooks/recently-played';

const SIDEBAR_PLAYLIST_LIMIT = 3;

export default function Sidebar() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const play = usePlayerStore((s) => s.play);
  const { data: playlists = [] } = usePlaylistsQuery();
  const {
    data: recentlyPlayed = [],
    isFetching: isRecentlyPlayedFetching,
    refetch: refetchRecentlyPlayed,
  } = useRecentlyPlayedQuery(4);
  const recentTracks = recentlyPlayed.filter((item) => item.type === 'song').slice(0, 3);
  const createMutation = useCreatePlaylistMutation();
  const { copy } = useI18n();
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const personalPlaylists = playlists.filter((playlist) => playlist.kind === 'user');
  const curatedPlaylists = playlists.filter((playlist) => playlist.kind === 'curated');
  const visiblePersonalPlaylists = personalPlaylists.slice(0, SIDEBAR_PLAYLIST_LIMIT);
  const hiddenPlaylistCount = personalPlaylists.length - visiblePersonalPlaylists.length;
  const nextPlaylistName = `${copy.nav.createPlaylist} #${personalPlaylists.length + 1}`;

  const openCreateConfirmation = () => {
    setCreateError(null);
    setPlaylistName(nextPlaylistName);
    setConfirmCreateOpen(true);
  };

  const handleConfirmCreatePlaylist = async () => {
    const trimmedName = playlistName.trim();
    if (!trimmedName) {
      setCreateError(copy.library.playlistNameRequired);
      return;
    }

    try {
      setCreateError(null);
      const playlist = await createMutation.mutateAsync(trimmedName);
      setConfirmCreateOpen(false);
      navigate({ to: '/playlist/$id', params: { id: playlist.id } });
    } catch (error) {
      const errorWithMessage = error as { response?: { data?: { message?: string } }; message?: string };
      setCreateError(
        errorWithMessage.response?.data?.message ??
          errorWithMessage.message ??
          copy.library.createPlaylistError
      );
    }
  };

  const createPlaylistModal = confirmCreateOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (!createMutation.isPending && event.target === event.currentTarget) {
              setConfirmCreateOpen(false);
            }
          }}
        >
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-surface-alt shadow-2xl">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleConfirmCreatePlaylist();
              }}
            >
              <div className="px-6 py-5">
                <h2 className="mb-2 text-base font-semibold text-white">
                  {copy.library.createPlaylistTitle}
                </h2>
                <p className="text-sm leading-relaxed text-muted">{copy.library.createPlaylistBody}</p>
                <label className="mt-4 block text-xs font-medium text-muted" htmlFor="sidebar-playlist-name">
                  {copy.library.playlistName}
                </label>
                <input
                  id="sidebar-playlist-name"
                  autoFocus
                  value={playlistName}
                  onChange={(event) => {
                    setPlaylistName(event.target.value);
                    if (createError) setCreateError(null);
                  }}
                  disabled={createMutation.isPending}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-medium text-white placeholder:text-white/35 focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                {createError && <p className="mt-3 text-sm text-red-300">{createError}</p>}
              </div>
              <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setConfirmCreateOpen(false)}
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copy.common.no}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createMutation.isPending ? copy.library.creatingPlaylist : copy.common.yes}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 bg-[#060d19]/80 backdrop-blur-sm border-r border-[#1a3050] overflow-y-auto flex flex-col flex-shrink-0 z-[10]">
      {/* Меню */}
      <div className="px-5 pt-6 pb-5">
        <h2 className="text-white text-xl font-bold mb-4">{copy.nav.menu}</h2>

        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <motion.div variants={staggerItem}>
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-[#0d2a4a] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home size={18} />
              {copy.nav.home}
            </Link>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Link
              to="/library"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-1 ${
                pathname.startsWith('/library')
                  ? 'bg-[#0d2a4a] text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Library size={18} />
              {copy.nav.myLibrary}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="h-px bg-[#1a3050] mx-5" />

      {/* Плейлисти */}
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-white text-xl font-bold mb-4">{copy.nav.playlists}</h2>

        <Link
          to="/favorite"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname.startsWith('/favorite')
              ? 'bg-[#0d2a4a] text-white'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart size={18} />
          {copy.nav.favoriteTracks}
        </Link>

        <button
          onClick={openCreateConfirmation}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors mt-1"
        >
          <ListPlus size={18} />
          {copy.nav.createPlaylist}
        </button>

        {/* Ваші плейлисти header */}
        <div className="flex items-center justify-between px-3 mt-5 mb-1">
          <span className="text-white text-sm font-semibold">{copy.nav.yourPlaylists}</span>
          <AlignJustify size={15} className="text-white/50" />
        </div>

        {playlists.length === 0 ? (
          <p className="text-muted text-xs px-3 py-2">{copy.nav.noPlaylistsYet}</p>
        ) : (
          <AnimatePresence>
            {visiblePersonalPlaylists.map((playlist) => (
              <motion.div
                key={playlist.id}
                variants={staggerItem}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                layout
              >
                <button
                  onClick={() => navigate({ to: '/playlist/$id', params: { id: playlist.id } })}
                  className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-left transition-colors ${
                    pathname === `/playlist/${playlist.id}` ? 'bg-[#0d2a4a]' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1CA2EA]/30 to-[#0a1929] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <PlaylistCover
                      title={playlist.title}
                      trackCoverUrls={playlist.trackCoverUrls}
                      fallbackCoverUrl={playlist.coverUrl}
                      roundedClassName="rounded-lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{playlist.title}</p>
                    <p className="text-white/40 text-xs">{playlist.trackIds.length} {copy.common.tracks}</p>
                  </div>
                </button>
              </motion.div>
            ))}
            {curatedPlaylists.length > 0 && (
              <motion.div
                key="curated-playlists-header"
                variants={staggerItem}
                initial="initial"
                animate="animate"
                className="px-3 pt-4"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  Curated
                </span>
              </motion.div>
            )}
            {curatedPlaylists.map((playlist) => (
              <motion.div
                key={playlist.id}
                variants={staggerItem}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                layout
              >
                <button
                  onClick={() => navigate({ to: '/playlist/$id', params: { id: playlist.id } })}
                  className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-left transition-colors ${
                    pathname === `/playlist/${playlist.id}` ? 'bg-[#0d2a4a]' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#30b7aa]/30 to-[#0a1929] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <PlaylistCover
                      title={playlist.title}
                      trackCoverUrls={playlist.trackCoverUrls}
                      fallbackCoverUrl={playlist.coverUrl}
                      roundedClassName="rounded-lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{playlist.title}</p>
                    <p className="text-white/40 text-xs">Curated · {playlist.trackIds.length} {copy.common.tracks}</p>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {hiddenPlaylistCount > 0 && (
          <button
            onClick={() => navigate({ to: '/library' })}
            className="mt-1 flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-[#1CA2EA] transition-colors hover:bg-white/5 hover:text-white"
          >
            {copy.common.showAll}
          </button>
        )}
      </div>

      <div className="h-px bg-[#1a3050] mx-5" />

      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-semibold">{copy.nav.recentlyPlayed}</span>
          <button
            type="button"
            onClick={() => void refetchRecentlyPlayed()}
            className="rounded-full p-1 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Refresh recently played"
          >
            <RefreshCw size={15} className={isRecentlyPlayedFetching ? 'animate-spin' : ''} />
          </button>
        </div>

        {recentTracks.length > 0 ? (
          recentTracks.map((item) => (
            <button
              key={`song-${item.track.id}`}
              type="button"
              onClick={() => {
                play(item.track, [item.track]);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <SongCoverImage
                src={item.track.albumCover}
                alt={item.track.title}
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{item.track.title}</span>
                <span className="block truncate text-xs text-white/40">{item.track.artistName}</span>
              </span>
            </button>
          ))
        ) : (
          <div className="flex justify-center mt-4">
            <div className="w-20 h-20 rounded-full border-2 border-[#1a3050] flex items-center justify-center">
              <Clock size={100} className="text-white/20" />
            </div>
          </div>
        )}
      </div>

      {createPlaylistModal}
    </aside>
  );
}
