import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

// FIX: Check extension only — mimetypes vary by OS/browser (e.g. audio/mpeg, audio/wav, application/octet-stream)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = /\.(mp3|wav|m4a|flac|aac)$/i;
  const isValidExt = allowedExtensions.test(path.extname(file.originalname));

  if (isValidExt) {
    return cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed (mp3, wav, m4a, flac, aac)'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000') // 500MB default
  },
  fileFilter: fileFilter
});