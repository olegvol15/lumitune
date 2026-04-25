import { Playlist } from '../models/playlist.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import {
  PlaylistCreateInput,
  PlaylistListResult,
  PlaylistResult,
  PlaylistUpdateInput,
} from '../types/playlist-service.types';
import { ensureObjectId } from '../utils/mongoose.utils';

const ensureUserId = (userId?: string) => {
  if (!userId) {
    throw new ServiceError(401, 'Not authorized to access this route');
  }
};

const populateSongs = 'songs';

const ensurePlaylistName = (name?: string) => {
  if (!name?.trim()) {
    throw new ServiceError(400, 'Playlist name is required');
  }
  return name.trim();
};

export const playlistService = {
  async listByOwner(userId?: string): Promise<PlaylistListResult> {
    ensureUserId(userId);

    const playlists = await Playlist.find({
      $or: [
        { kind: 'user', owner: userId },
        { kind: 'curated', isPublic: true },
      ],
    })
      .populate(populateSongs)
      .sort({ updatedAt: -1 });

    return { playlists };
  },

  async create(userId: string | undefined, input: PlaylistCreateInput): Promise<PlaylistResult> {
    ensureUserId(userId);

    const playlist = await Playlist.create({
      name: ensurePlaylistName(input.name),
      description: input.description,
      coverImage: input.coverImage,
      isPublic: input.isPublic ?? true,
      kind: 'user',
      owner: userId,
      songs: [],
    });

    return { playlist };
  },

  async getById(userId: string | undefined, playlistId: string): Promise<PlaylistResult> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');

    const playlist = await Playlist.findOne({
      _id: playlistId,
      $or: [
        { kind: 'user', owner: userId },
        { kind: 'curated', isPublic: true },
      ],
    }).populate(populateSongs);
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    return { playlist };
  },

  async update(
    userId: string | undefined,
    playlistId: string,
    input: PlaylistUpdateInput
  ): Promise<PlaylistResult> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');

    const updateData: PlaylistUpdateInput = {};
    if (typeof input.name === 'string') updateData.name = input.name.trim();
    if (typeof input.description === 'string') updateData.description = input.description;
    if (typeof input.coverImage === 'string') updateData.coverImage = input.coverImage;
    if (typeof input.isPublic === 'boolean') updateData.isPublic = input.isPublic;

    if (updateData.name !== undefined && updateData.name.length === 0) {
      throw new ServiceError(400, 'Playlist name cannot be empty');
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: userId, kind: 'user' },
      updateData,
      { new: true, runValidators: true }
    ).populate(populateSongs);

    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    return { playlist };
  },

  async remove(userId: string | undefined, playlistId: string): Promise<void> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner: userId, kind: 'user' });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }
  },

  async addSong(
    userId: string | undefined,
    playlistId: string,
    songId: string
  ): Promise<PlaylistResult> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');
    ensureObjectId(songId, 'songId');

    const song = await Song.findById(songId);
    if (!song) {
      throw new ServiceError(404, 'Song not found');
    }

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId, kind: 'user' });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    const hasSong = playlist.songs.some((id) => String(id) === songId);
    if (!hasSong) {
      playlist.songs.push(song._id);
      await playlist.save();
    }

    await playlist.populate(populateSongs);
    return { playlist };
  },

  async removeSong(
    userId: string | undefined,
    playlistId: string,
    songId: string
  ): Promise<PlaylistResult> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');
    ensureObjectId(songId, 'songId');

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId, kind: 'user' });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    playlist.songs = playlist.songs.filter((id) => String(id) !== songId);
    await playlist.save();
    await playlist.populate(populateSongs);

    return { playlist };
  },

  async listCurated(): Promise<PlaylistListResult> {
    const playlists = await Playlist.find({ kind: 'curated' })
      .populate(populateSongs)
      .sort({ updatedAt: -1 });

    return { playlists };
  },

  async getCuratedById(playlistId: string): Promise<PlaylistResult> {
    ensureObjectId(playlistId, 'playlistId');

    const playlist = await Playlist.findOne({ _id: playlistId, kind: 'curated' }).populate(populateSongs);
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    return { playlist };
  },

  async createCurated(input: PlaylistCreateInput): Promise<PlaylistResult> {
    const playlist = await Playlist.create({
      name: ensurePlaylistName(input.name),
      description: input.description,
      coverImage: input.coverImage,
      isPublic: input.isPublic ?? true,
      kind: 'curated',
      songs: [],
    });

    await playlist.populate(populateSongs);
    return { playlist };
  },

  async updateCurated(playlistId: string, input: PlaylistUpdateInput): Promise<PlaylistResult> {
    ensureObjectId(playlistId, 'playlistId');

    const updateData: PlaylistUpdateInput = {};
    if (typeof input.name === 'string') updateData.name = input.name.trim();
    if (typeof input.description === 'string') updateData.description = input.description;
    if (typeof input.coverImage === 'string') updateData.coverImage = input.coverImage;
    if (typeof input.isPublic === 'boolean') updateData.isPublic = input.isPublic;

    if (updateData.name !== undefined && updateData.name.length === 0) {
      throw new ServiceError(400, 'Playlist name cannot be empty');
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, kind: 'curated' },
      updateData,
      { new: true, runValidators: true }
    ).populate(populateSongs);

    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    return { playlist };
  },

  async removeCurated(playlistId: string): Promise<void> {
    ensureObjectId(playlistId, 'playlistId');

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, kind: 'curated' });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }
  },

  async addSongToCurated(playlistId: string, songId: string): Promise<PlaylistResult> {
    ensureObjectId(playlistId, 'playlistId');
    ensureObjectId(songId, 'songId');

    const song = await Song.findById(songId);
    if (!song) {
      throw new ServiceError(404, 'Song not found');
    }

    const playlist = await Playlist.findOne({ _id: playlistId, kind: 'curated' });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    const hasSong = playlist.songs.some((id) => String(id) === songId);
    if (!hasSong) {
      playlist.songs.push(song._id);
      await playlist.save();
    }

    await playlist.populate(populateSongs);
    return { playlist };
  },

  async removeSongFromCurated(playlistId: string, songId: string): Promise<PlaylistResult> {
    ensureObjectId(playlistId, 'playlistId');
    ensureObjectId(songId, 'songId');

    const playlist = await Playlist.findOne({ _id: playlistId, kind: 'curated' });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    playlist.songs = playlist.songs.filter((id) => String(id) !== songId);
    await playlist.save();
    await playlist.populate(populateSongs);

    return { playlist };
  },
};
