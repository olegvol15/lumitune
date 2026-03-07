import { IUser } from './user/user.types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
