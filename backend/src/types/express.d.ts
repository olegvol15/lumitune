import { IUser } from './user/user.types';

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      user?: IUser;
    }
  }
}