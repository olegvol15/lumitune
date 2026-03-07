import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { songService } from '../services/song.service';

export const uploadSong = async (req: AuthRequest, res: Response) => {
  try {
    const { song } = await songService.uploadSong({
      file: req.file,
      body: req.body,
      uploadedBy: req.user?._id ? String(req.user._id) : '',
    });

    res.status(201).json({
      success: true,
      song
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error uploading song'),
    });
  }
};

export const getAllSongs = async (req: Request, res: Response) => {
  try {
    const { songs, pagination } = await songService.listSongs(req.query);

    res.status(200).json({
      success: true,
      songs,
      pagination,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching songs'),
    });
  }
};

export const getSongById = async (req: Request, res: Response) => {
  try {
    const { song } = await songService.getSongById(String(req.params.id));

    res.status(200).json({
      success: true,
      song
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching song'),
    });
  }
};

export const streamSong = async (req: Request, res: Response) => {
  try {
    const { statusCode, headers, stream } = await songService.streamSong(String(req.params.id), req.headers.range);
    res.writeHead(statusCode, headers);
    stream.pipe(res);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error streaming song'),
    });
  }
};

export const uploadSongByAdmin = async (req: Request, res: Response) => {
  try {
    const { song } = await songService.uploadSong({
      file: req.file,
      body: req.body,
      uploadedBy: '',
      allowEmptyUploader: true,
    });

    res.status(201).json({
      success: true,
      song,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error uploading song'),
    });
  }
};

export const updateSongByAdmin = async (req: Request, res: Response) => {
  try {
    const { song } = await songService.updateSong(String(req.params.id), req.body);
    res.status(200).json({
      success: true,
      song,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error updating song'),
    });
  }
};

export const deleteSongByAdmin = async (req: Request, res: Response) => {
  try {
    await songService.deleteSong(String(req.params.id));
    res.status(200).json({
      success: true,
      message: 'Song deleted successfully',
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error deleting song'),
    });
  }
};
