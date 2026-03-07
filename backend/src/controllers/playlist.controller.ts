import { Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { playlistService } from '../services/playlist.service';

export const getPlaylists = async (req: AuthRequest, res: Response) => {
  try {
    const { playlists } = await playlistService.listByOwner(req.user?._id ? String(req.user._id) : undefined);
    return res.status(200).json({ success: true, playlists });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching playlists') });
  }
};

export const createPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { playlist } = await playlistService.create(
      req.user?._id ? String(req.user._id) : undefined,
      req.body,
    );
    return res.status(201).json({ success: true, playlist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error creating playlist') });
  }
};

export const getPlaylistById = async (req: AuthRequest, res: Response) => {
  try {
    const { playlist } = await playlistService.getById(
      req.user?._id ? String(req.user._id) : undefined,
      String(req.params.id),
    );
    return res.status(200).json({ success: true, playlist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching playlist') });
  }
};

export const updatePlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { playlist } = await playlistService.update(
      req.user?._id ? String(req.user._id) : undefined,
      String(req.params.id),
      req.body,
    );
    return res.status(200).json({ success: true, playlist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating playlist') });
  }
};

export const deletePlaylist = async (req: AuthRequest, res: Response) => {
  try {
    await playlistService.remove(
      req.user?._id ? String(req.user._id) : undefined,
      String(req.params.id),
    );
    return res.status(200).json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting playlist') });
  }
};

export const addSongToPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { songId } = req.body as { songId?: string };
    if (!songId) {
      return res.status(400).json({ success: false, message: 'songId is required' });
    }

    const { playlist } = await playlistService.addSong(
      req.user?._id ? String(req.user._id) : undefined,
      String(req.params.id),
      songId,
    );
    return res.status(200).json({ success: true, playlist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error adding song to playlist') });
  }
};

export const removeSongFromPlaylist = async (req: AuthRequest, res: Response) => {
  try {
    const { playlist } = await playlistService.removeSong(
      req.user?._id ? String(req.user._id) : undefined,
      String(req.params.id),
      String(req.params.songId),
    );
    return res.status(200).json({ success: true, playlist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error removing song from playlist') });
  }
};
