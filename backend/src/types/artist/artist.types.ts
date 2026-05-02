import mongoose from 'mongoose';

export interface IArtist extends mongoose.Document {
  name: string;
  slug: string;
  image?: string;
  bannerImage?: string;
  genre?: string;
  bio?: string;
  verified: boolean;
  artistUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
