import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { getErrorMessage } from '../utils/error.utils';

export const listUsersByAdmin = async (_req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('email username displayName role country city profilePicture createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      users: users.map((user) => ({
        id: String(user._id),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        country: user.country ?? '',
        city: user.city ?? '',
        profilePicture: user.profilePicture ?? 'default-avatar.png',
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching users'),
    });
  }
};
