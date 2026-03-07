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

export const playlistService = {
  async listByOwner(userId?: string): Promise<PlaylistListResult> {
    ensureUserId(userId);

    const playlists = await Playlist.find({ owner: userId })
      .populate('songs')
      .sort({ updatedAt: -1 });

    return { playlists };
  },

  async create(userId: string | undefined, input: PlaylistCreateInput): Promise<PlaylistResult> {
    ensureUserId(userId);

    if (!input.name?.trim()) {
      throw new ServiceError(400, 'Playlist name is required');
    }

    const playlist = await Playlist.create({
      name: input.name.trim(),
      description: input.description,
      coverImage: input.coverImage,
      isPublic: input.isPublic ?? true,
      owner: userId,
      songs: [],
    });

    return { playlist };
  },

  async getById(userId: string | undefined, playlistId: string): Promise<PlaylistResult> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId }).populate('songs');
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    return { playlist };
  },

  async update(userId: string | undefined, playlistId: string, input: PlaylistUpdateInput): Promise<PlaylistResult> {
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
      { _id: playlistId, owner: userId },
      updateData,
      { new: true, runValidators: true },
    ).populate('songs');

    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    return { playlist };
  },

  async remove(userId: string | undefined, playlistId: string): Promise<void> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, owner: userId });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }
  },

  async addSong(userId: string | undefined, playlistId: string, songId: string): Promise<PlaylistResult> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');
    ensureObjectId(songId, 'songId');

    const song = await Song.findById(songId);
    if (!song) {
      throw new ServiceError(404, 'Song not found');
    }

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    const hasSong = playlist.songs.some((id) => String(id) === songId);
    if (!hasSong) {
      playlist.songs.push(song._id);
      await playlist.save();
    }

    await playlist.populate('songs');
    return { playlist };
  },

  async removeSong(userId: string | undefined, playlistId: string, songId: string): Promise<PlaylistResult> {
    ensureUserId(userId);
    ensureObjectId(playlistId, 'playlistId');
    ensureObjectId(songId, 'songId');

    const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });
    if (!playlist) {
      throw new ServiceError(404, 'Playlist not found');
    }

    playlist.songs = playlist.songs.filter((id) => String(id) !== songId);
    await playlist.save();
    await playlist.populate('songs');

    return { playlist };
  },
};
