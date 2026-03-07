import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';
import { ServiceError } from '../types/error/service-error';
import { normalizeEmail } from '../utils/email.utils';
import { toAuthUserResponse } from '../utils/auth.utils';
import {
  AuthLoginResult,
  AuthMeResult,
  LoginUserInput,
  RegisterUserInput,
} from '../types/auth/auth-service.types';

export const authService = {
  async register(input: RegisterUserInput): Promise<AuthLoginResult> {
    const { email, password, username } = input;
    if (!email || !password || !username) {
      throw new ServiceError(400, 'Email, password and username are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      throw new ServiceError(400, 'User with this email or username already exists');
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
      username,
    });

    const token = generateToken({
      id: String(user._id),
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: toAuthUserResponse(user),
    };
  },

  async login(input: LoginUserInput): Promise<AuthLoginResult> {
    const { email, password } = input;
    if (!email || !password) {
      throw new ServiceError(400, 'Email and password are required');
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw new ServiceError(401, 'Invalid credentials');
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new ServiceError(401, 'Invalid credentials');
    }

    const token = generateToken({
      id: String(user._id),
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: toAuthUserResponse(user),
    };
  },

  async getMe(userId?: string): Promise<AuthMeResult> {
    if (!userId) {
      throw new ServiceError(401, 'Not authorized to access this route');
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ServiceError(404, 'User not found');
    }

    return { user };
  },
};
