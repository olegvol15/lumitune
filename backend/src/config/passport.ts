import passport from 'passport';
import { User } from '../models/user.model';
import { OAuthProfile } from '../types/auth/oauth.types';
import { normalizeEmail } from '../utils/email.utils';

// passport-apple has no @types package — require bypasses the TS error
// eslint-disable-next-line @typescript-eslint/no-require-imports
const AppleStrategy = require('passport-apple');

// ─── Shared: find-or-create logic ─────────────────────────────────────────

const toUsernameBase = (profile: OAuthProfile): string => {
  const source = profile.displayName || profile.email.split('@')[0] || 'user';
  const normalized = source
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);

  return normalized.length >= 3 ? normalized : `user_${normalized}`.slice(0, 24);
};

const createUniqueUsername = async (profile: OAuthProfile): Promise<string> => {
  const baseUsername = toUsernameBase(profile);

  for (let i = 0; i < 10; i += 1) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${baseUsername}_${suffix}`.slice(0, 30);
    const existingUser = await User.exists({ username });

    if (!existingUser) {
      return username;
    }
  }

  return `${baseUsername}_${Date.now().toString(36)}`.slice(0, 30);
};

const findOrCreateOAuthUser = async (profile: OAuthProfile) => {
  const email = normalizeEmail(profile.email);
  const displayName = String(profile.displayName ?? '').trim() || email.split('@')[0] || 'OAuth User';

  let user = await User.findOne({
    oauthProvider: profile.provider,
    oauthId: profile.oauthId,
  }).select('+oauthProvider +oauthId');

  if (user) return user;

  user = await User.findOne({ email }).select('+oauthProvider +oauthId');
  if (user) {
    user.oauthProvider = profile.provider;
    user.oauthId = profile.oauthId;
    await user.save({ validateBeforeSave: false });
    return user;
  }

  const username = await createUniqueUsername({ ...profile, email, displayName });

  user = await User.create({
    email,
    username,
    displayName,
    profilePicture: profile.profilePicture || 'default-avatar.png',
    role: 'user',
    oauthProvider: profile.provider,
    oauthId: profile.oauthId,
  });

  return user;
};

// ─── Register strategies only if credentials are present ──────────────────
// This prevents a crash at startup when env vars aren't filled in yet.

export const initPassport = () => {
  // ── Google ──────────────────────────────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.API_BASE_URL}/api/auth/oauth/google/callback`,
        },
        async (_at: string, _rt: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(null, false);
            }

            const user = await findOrCreateOAuthUser({
              provider: 'google',
              oauthId: profile.id,
              email,
              displayName: profile.displayName ?? email.split('@')[0] ?? 'Google User',
              profilePicture: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) { done(err); }
        }
      )
    );
    console.log('✅ Google OAuth strategy registered');
  } else {
    console.warn('⚠️  Google OAuth skipped — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set');
  }

  // ── Facebook ────────────────────────────────────────────────────────────
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    const { Strategy: FacebookStrategy } = require('passport-facebook');
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: `${process.env.API_BASE_URL}/api/auth/oauth/facebook/callback`,
          profileFields: ['id', 'emails', 'displayName', 'photos'],
        },
        async (_at: string, _rt: string, profile: any, done: any) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: 'facebook',
              oauthId: profile.id,
              email: profile.emails?.[0]?.value ?? '',
              displayName: profile.displayName,
              profilePicture: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) { done(err); }
        }
      )
    );
    console.log('✅ Facebook OAuth strategy registered');
  } else {
    console.warn('⚠️  Facebook OAuth skipped — FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set');
  }

  // ── Apple ───────────────────────────────────────────────────────────────
  if (
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY_PATH
  ) {
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
          callbackURL: `${process.env.API_BASE_URL}/api/auth/oauth/apple/callback`,
          passReqToCallback: false,
        },
        async (_at: string, _rt: string, _idt: string, profile: any, done: any) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: 'apple',
              oauthId: profile.id,
              email: profile.email ?? '',
              displayName: profile.displayName ?? profile.email ?? 'Apple User',
            });
            done(null, user);
          } catch (err) { done(err); }
        }
      )
    );
    console.log('✅ Apple OAuth strategy registered');
  } else {
    console.warn('⚠️  Apple OAuth skipped — APPLE_* env vars not set');
  }
};

export default passport;
