import { Request } from 'express';
import { IUser } from '../user/user.types';

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}