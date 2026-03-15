import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { songService } from '../services/song.service';

const getFileFromField = (req: Request, field: string): Express.Multer.File | undefined => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files) return undefined;
  const target = files[field];
  return Array.isArray(target) ? target[0] : undefined;
};

export const uploadSong = async (req: AuthRequest, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');

    const { song } = await songService.uploadSong({
      file: audioFile,
      body: req.body,
      uploadedBy: req.user?._id ? String(req.user._id) : '',
      coverImage: coverFile?.path,
    });
    res.status(201).json({ success: true, song });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error uploading song') });
  }
};

export const updateOwnSong = async (req: AuthRequest, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');

    const { song } = await songService.updateSongForUploader(
      String(req.params.id),
      req.user?._id ? String(req.user._id) : undefined,
      {
        ...req.body,
        audioFile,
        ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
      }
    );

    res.status(200).json({ success: true, song });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error updating song') });
  }
};

export const getAllSongs = async (req: Request, res: Response) => {
  try {
    const { songs, pagination } = await songService.listSongs(req.query);
    res.status(200).json({ success: true, songs, pagination });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error fetching songs') });
  }
};

export const getSongById = async (req: Request, res: Response) => {
  try {
    const { song } = await songService.getSongById(String(req.params.id));
    res.status(200).json({ success: true, song });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error fetching song') });
  }
};

// Stream is public but optionally authenticated so history can be recorded
export const streamSong = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id ? String(req.user._id) : undefined;
    const { statusCode, headers, stream } = await songService.streamSong(
      String(req.params.id),
      req.headers.range,
      userId
    );
    res.writeHead(statusCode, headers);
    stream.pipe(res);
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error streaming song') });
  }
};

export const uploadSongByAdmin = async (req: Request, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');

    const { song } = await songService.uploadSong({
      file: audioFile,
      body: req.body,
      uploadedBy: '',
      allowEmptyUploader: true,
      coverImage: coverFile?.path,
    });

    res.status(201).json({ success: true, song });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error uploading song') });
  }
};

export const updateSongByAdmin = async (req: Request, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');
    const { song } = await songService.updateSong(String(req.params.id), {
      ...req.body,
      ...(audioFile ? { audioFile } : {}),
      ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
    });
    res.status(200).json({ success: true, song });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error updating song') });
  }
};

export const deleteSongByAdmin = async (req: Request, res: Response) => {
  try {
    await songService.deleteSong(String(req.params.id));
    res.status(200).json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error deleting song') });
  }
};
