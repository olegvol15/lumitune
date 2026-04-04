import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import {
  Home,
  Library,
  Heart,
  ListPlus,
  AlignJustify,
  RefreshCw,
  Clock,
  Music2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import SongCoverImage from '../ui/SongCoverImage';
import { staggerContainer, staggerItem } from '../../lib/motion';
import { usePlaylistsQuery, useCreatePlaylistMutation } from '../../hooks/playlists';
import { useI18n } from '../../lib/i18n';

export default function Sidebar() {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const queue = usePlayerStore((s) => s.queue);
  const { data: playlists = [] } = usePlaylistsQuery();
  const createMutation = useCreatePlaylistMutation();
  const { copy } = useI18n();

  const handleCreatePlaylist = async () => {
    const playlist = await createMutation.mutateAsync(
      `${copy.nav.createPlaylist} #${playlists.length + 1}`
    );
    navigate({ to: '/playlist/$id', params: { id: playlist.id } });
  };

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
          onClick={() => void handleCreatePlaylist()}
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
            {playlists.map((playlist) => (
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
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1CA2EA]/30 to-[#0a1929] flex items-center justify-center flex-shrink-0">
                    <Music2 size={16} className="text-[#1CA2EA]/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{playlist.title}</p>
                    <p className="text-white/40 text-xs">{playlist.trackIds.length} {copy.common.tracks}</p>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="h-px bg-[#1a3050] mx-5" />

      {/* Нещодавно прослухані */}
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-semibold">{copy.nav.recentlyPlayed}</span>
          <RefreshCw size={15} className="text-white/50" />
        </div>

        {queue.length > 0 ? (
          queue.slice(0, 3).map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
            >
              <SongCoverImage
                src={track.albumCover}
                alt={track.title}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{track.title}</p>
                <p className="text-white/40 text-xs truncate">{track.artistName}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center mt-4">
            <div className="w-20 h-20 rounded-full border-2 border-[#1a3050] flex items-center justify-center">
              <Clock size={100} className="text-white/20" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
