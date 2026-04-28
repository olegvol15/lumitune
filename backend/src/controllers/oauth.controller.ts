import { Request, Response } from 'express';
import { IUser } from '../types/user/user.types';
import { generateToken } from '../utils/jwt.utils';
import { createRefreshToken } from '../utils/refresh-token.utils';
import { setUserRefreshCookie } from '../utils/cookie.utils';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Called after Passport has successfully authenticated the user.
 * Issues a JWT access token + refresh token, then redirects to the
 * frontend with the access token in the URL so the SPA can store it.
 *
 * Redirect: FRONTEND_URL/oauth/callback?token=<accessToken>
 * On error: FRONTEND_URL/oauth/callback?error=auth_failed
 */
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/oauth/callback?error=auth_failed`);
    }

    const accessToken = generateToken({
      id: String(user._id),
      email: user.email,
      username: user.username,
    });

    const refreshToken = await createRefreshToken(String(user._id));

    // Refresh token goes in the HttpOnly cookie (same as regular login)
    setUserRefreshCookie(res, refreshToken);

    // Access token goes in the URL for the frontend SPA to pick up
    return res.redirect(`${FRONTEND_URL}/oauth/callback?token=${encodeURIComponent(accessToken)}`);
  } catch {
    return res.redirect(`${FRONTEND_URL}/oauth/callback?error=auth_failed`);
  }
};

/**
 * Handles OAuth failures (user denied permission, provider error, etc.)
 */
export const oauthFailure = (_req: Request, res: Response) => {
  return res.redirect(`${FRONTEND_URL}/oauth/callback?error=auth_failed`);
};
