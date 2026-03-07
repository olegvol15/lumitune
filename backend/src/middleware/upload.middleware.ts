import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { audioFileFilter, imageFileFilter } from '../utils/upload.utils';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000') // 500MB default
  },
  fileFilter: audioFileFilter
});

export const adminSongUpload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000'),
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      return audioFileFilter(req, file, cb);
    }
    if (file.fieldname === 'cover') {
      return imageFileFilter(req, file, cb);
    }

    cb(new Error('Unsupported file field'));
  },
});
