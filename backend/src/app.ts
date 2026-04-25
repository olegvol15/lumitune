import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import passport, { initPassport } from './config/passport';

// Routes
import authRoutes from './routes/auth.routes';
import oauthRoutes from './routes/oauth.routes';
import adminAuthRoutes from './routes/admin-auth.routes';
import adminSongRoutes from './routes/admin-song.routes';
import songRoutes from './routes/song.routes';
import playlistRoutes from './routes/playlist.routes';
import likesRoutes from './routes/likes.routes';
import recentlyPlayedRoutes from './routes/recently-played.routes';
import searchRoutes from './routes/search.routes';
import podcastRoutes from './routes/podcast.routes';
import adminPodcastRoutes from './routes/admin-podcast.routes';
import audiobookRoutes from './routes/audiobook.routes';
import adminAudiobookRoutes from './routes/admin-audiobook.routes';
import adminUserRoutes from './routes/admin-user.routes';
import adminDashboardRoutes from './routes/admin-dashboard.routes';
import albumRoutes from './routes/album.routes';
import adminAlbumRoutes from './routes/admin-album.routes';

import { errorHandler } from './middleware/error.middleware';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport — initialise strategies (skips any provider missing credentials)
initPassport();
app.use(passport.initialize());

// Static uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/songs', adminSongRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/recently-played', recentlyPlayedRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/admin/podcasts', adminPodcastRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/admin/albums', adminAlbumRoutes);
app.use('/api/audiobooks', audiobookRoutes);
app.use('/api/admin/audiobooks', adminAudiobookRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
