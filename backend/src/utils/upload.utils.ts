import path from 'path';

export const audioFileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /mp3|wav|m4a|flac|aac/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only audio files are allowed'));
};
