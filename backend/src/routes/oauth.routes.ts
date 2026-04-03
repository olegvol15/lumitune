import express from 'express';
import passport from '../config/passport';
import { oauthCallback, oauthFailure } from '../controllers/oauth.controller';

const router = express.Router();

const FAILURE_REDIRECT = '/api/auth/oauth/failure';

// ─── Google ────────────────────────────────────────────────────────────────

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: FAILURE_REDIRECT, session: false }),
  oauthCallback
);

// ─── Facebook ──────────────────────────────────────────────────────────────

router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: FAILURE_REDIRECT, session: false }),
  oauthCallback
);

// ─── Apple ─────────────────────────────────────────────────────────────────
// Apple requires POST for the callback (it sends a form, not a query string)

router.get(
  '/apple',
  passport.authenticate('apple', { session: false })
);

router.post(
  '/apple/callback',
  passport.authenticate('apple', { failureRedirect: FAILURE_REDIRECT, session: false }),
  oauthCallback
);

// ─── Failure fallback ──────────────────────────────────────────────────────

router.get('/failure', oauthFailure);

export default router;