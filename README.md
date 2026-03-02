# Spotify Clone

A full-stack music streaming application built with React and Express in a pnpm monorepo.

## Tech Stack

**Frontend** — React 19, Vite 7, TypeScript, TanStack Router, TanStack Query, Zustand, Tailwind CSS, Axios

**Backend** — Node.js, Express 5, TypeScript, MongoDB/Mongoose, JWT, Multer, music-metadata

## Project Structure

```
spotify-clone/
├── frontend/        # React SPA (Vite)
├── backend/         # Express REST API
├── uploads/         # Audio file storage
├── package.json     # Monorepo root
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

**Backend:**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/spotify-clone
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=524288000
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

`frontend/.env` (default works for local dev):
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start development servers

```bash
# Terminal 1 — backend (http://localhost:3000)
pnpm dev:backend

# Terminal 2 — frontend (http://localhost:5173)
pnpm dev:frontend
```

Check the backend is up: `http://localhost:3000/health` → `{"status":"OK"}`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:backend` | Start backend with nodemon (auto-restart) |
| `pnpm dev:frontend` | Start Vite dev server |
| `pnpm build:backend` | Compile backend TypeScript to `dist/` |
| `pnpm build:frontend` | Build frontend for production |

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | Bearer | Get current user |

### Songs — `/api/songs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List songs (supports `page`, `limit`, `search`, `genre`) |
| GET | `/:id` | — | Get song by ID |
| GET | `/:id/stream` | — | Stream audio (supports HTTP range requests) |
| POST | `/upload` | Bearer | Upload song (`multipart/form-data`) |

### Playlists — `/api/playlists`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get user's playlists |
| POST | `/` | Bearer | Create playlist |
| GET | `/:id` | Bearer | Get playlist |
| PUT | `/:id` | Bearer | Update playlist |
| DELETE | `/:id` | Bearer | Delete playlist |
| POST | `/:id/songs` | Bearer | Add song to playlist |
| DELETE | `/:id/songs/:songId` | Bearer | Remove song from playlist |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/uploads/*` | Serve uploaded audio files |

## Frontend Routes

| Path | Description |
|------|-------------|
| `/` | Home / discover |
| `/search` | Search tracks |
| `/library` | User library |
| `/profile` | User profile |
| `/settings` | Settings |
| `/notifications` | Notifications |
| `/player` | Full-screen player |
| `/artist/:id` | Artist page |
| `/album/:id` | Album page |
| `/playlist/:id` | Playlist page |
| `/auth/signin` | Sign in |
| `/auth/signup` | Sign up |
| `/auth/forgot-password` | Password reset |
| `/admin` | Admin dashboard |
| `/admin/tracks` | Admin track management |

## State Management (Zustand)

| Store | Responsibility |
|-------|---------------|
| `authStore` | User auth state — token, user profile, setAuth/logout |
| `playerStore` | Playback — current track, queue, volume, shuffle/repeat |
| `playlistStore` | Playlist management |
| `adminAuthStore` | Admin panel authentication (session-based, separate from user auth) |
| `adminTracksStore` | Admin track upload/management |

## Authentication

JWT-based auth. Tokens are stored in `localStorage` under the key `auth_token` and automatically attached to requests via the Axios interceptor in `frontend/src/lib/apiClient.ts`. A 401 response clears the stored token.

## File Uploads

Audio uploads are handled by Multer. Supported formats: `mp3`, `wav`, `m4a`, `flac`, `aac`. Duration is extracted automatically using `music-metadata`. Files are stored in the `uploads/` directory and served at `/uploads/*`.

## Database Models

**User** — email, username, hashed password, profilePicture

**Song** — title, artist, album, genre, duration, filePath, coverImage, plays, uploadedBy

**Playlist** — name, description, coverImage, owner, songs[], isPublic
