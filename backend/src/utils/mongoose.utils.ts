import mongoose from 'mongoose';
import { ServiceError } from '../types/error/service-error';

export const ensureObjectId = (value: string, fieldName: string) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ServiceError(400, `Invalid ${fieldName}`);
  }
};
