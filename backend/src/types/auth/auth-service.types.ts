import { IUser } from '../user/user.types';

export interface RegisterUserInput {
  email?: string;
  password?: string;
  username?: string;
}

export interface LoginUserInput {
  email?: string;
  password?: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
}

export interface AuthLoginResult {
  token: string;
  user: AuthUserResponse;
}

export interface AuthMeResult {
  user: IUser;
}
