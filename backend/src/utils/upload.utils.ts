import path from 'path';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg']);
const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/ogg',
  'application/ogg',
]);
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const AUDIO_MIME_BY_EXTENSION: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
};

export const audioFileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExtension = AUDIO_EXTENSIONS.has(ext);
  const isAllowedMime = AUDIO_MIME_TYPES.has(String(file.mimetype).toLowerCase());

  if (isAllowedExtension && isAllowedMime) {
    return cb(null, true);
  }

  cb(new Error('Only audio files are allowed'));
};

export const imageFileFilter = (req: any, file: any, cb: any) => {
  const isAllowedMime = IMAGE_MIME_TYPES.has(String(file.mimetype).toLowerCase());
  if (isAllowedMime) {
    return cb(null, true);
  }

  cb(new Error('Only image files are allowed for cover'));
};

export const getAudioContentType = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  return AUDIO_MIME_BY_EXTENSION[ext] ?? 'audio/mpeg';
};
