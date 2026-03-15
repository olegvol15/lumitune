import { Request, Response } from 'express';

const parseCookieHeader = (header?: string): Record<string, string> => {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValueParts] = part.trim().split('=');
    if (!rawName) {
      return acc;
    }

    acc[decodeURIComponent(rawName)] = decodeURIComponent(rawValueParts.join('='));
    return acc;
  }, {});
};

const getCookieSecure = (): boolean => process.env.NODE_ENV === 'production';

const getRefreshCookieMaxAgeMs = (envKey: string, fallbackKey?: string): number => {
  const days = Number(process.env[envKey] || (fallbackKey ? process.env[fallbackKey] : undefined) || 30);
  return days * 24 * 60 * 60 * 1000;
};

export const USER_REFRESH_COOKIE_NAME = 'user_refresh_token';
export const ADMIN_REFRESH_COOKIE_NAME = 'admin_refresh_token';

export const getCookieValue = (req: Request, cookieName: string): string | undefined => {
  const cookies = parseCookieHeader(req.headers.cookie);
  return cookies[cookieName];
};

export const setUserRefreshCookie = (res: Response, token: string): void => {
  res.cookie(USER_REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getCookieSecure(),
    path: '/api/auth',
    maxAge: getRefreshCookieMaxAgeMs('REFRESH_TOKEN_EXPIRES_DAYS'),
  });
};

export const clearUserRefreshCookie = (res: Response): void => {
  res.clearCookie(USER_REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getCookieSecure(),
    path: '/api/auth',
  });
};

export const setAdminRefreshCookie = (res: Response, token: string): void => {
  res.cookie(ADMIN_REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getCookieSecure(),
    path: '/api/admin/auth',
    maxAge: getRefreshCookieMaxAgeMs('ADMIN_REFRESH_TOKEN_EXPIRES_DAYS', 'REFRESH_TOKEN_EXPIRES_DAYS'),
  });
};

export const clearAdminRefreshCookie = (res: Response): void => {
  res.clearCookie(ADMIN_REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getCookieSecure(),
    path: '/api/admin/auth',
  });
};
