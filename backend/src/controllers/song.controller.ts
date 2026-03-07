import { Request, Response } from 'express';
import { Song } from '../models/song.model';
import { AuthRequest } from '../types/auth/auth.types';
import path from 'path';
import fs from 'fs';
import * as musicMetadata from 'music-metadata';

export const uploadSong = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Extract metadata from audio file
    const metadata = await musicMetadata.parseFile(req.file.path);
    
    // Get audio duration
    const duration = metadata.format.duration;
    
    if (!duration) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Could not read audio file duration'
      });
    }

    // Create song entry in database
    const song = await Song.create({
      title: req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
      artist: req.body.artist || 'Unknown Artist',
      album: req.body.album,
      genre: req.body.genre,
      duration: Math.round(duration),
      filePath: req.file.path,
      uploadedBy: req.user!._id
    });

    res.status(201).json({
      success: true,
      song
    });
  } catch (error: any) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading song'
    });
  }
};

export const getAllSongs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, genre } = req.query;
    
    const query: any = {};
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (genre) {
      query.genre = genre;
    }
    
    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await Song.countDocuments(query);
    
    res.status(200).json({
      success: true,
      songs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching songs'
    });
  }
};

export const getSongById = async (req: Request, res: Response) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username');
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }
    
    res.status(200).json({
      success: true,
      song
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching song'
    });
  }
};

export const streamSong = async (req: Request, res: Response) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Update play count
    await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } });

    const filePath = path.resolve(song.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Audio file not found'
      });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const file = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });
      
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error streaming song'
    });
  }
};
