import { ServiceError } from '../types/error/service-error';

export const toPositiveInt = (value: unknown, fallback: number): number => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }
  return Math.floor(number);
};

export const parseRangeHeader = (rangeHeader: string, fileSize: number) => {
  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || end >= fileSize) {
    throw new ServiceError(416, 'Invalid range');
  }

  return { start, end };
};
