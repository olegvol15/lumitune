# Lumitune (Spotify clone)

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

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in the values in `backend/.env` — see `backend/.env.example` for all required keys.

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
| `pnpm typecheck` | Run TypeScript checks across workspace |
| `pnpm lint:frontend` | Run frontend ESLint |
| `pnpm build` | Build all workspace packages |

## API Reference

### Admin Auth — `/api/admin/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | — | Register admin |
| POST | `/login` | — | Login admin, returns token |
| GET | `/me` | Bearer | Get current admin |
| POST | `/forgot-password` | — | Request reset code |
| POST | `/verify-reset-code` | — | Verify reset code |
| POST | `/reset-password` | — | Reset password |

### Admin Songs — `/api/admin/songs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin Bearer | List songs for admin table |
| GET | `/:id` | Admin Bearer | Get song by ID |
| POST | `/upload` | Admin Bearer | Create song (`multipart/form-data`, `audio` required, `cover` optional) |
| PUT | `/:id` | Admin Bearer | Update song metadata and optional `cover` (`multipart/form-data`) |
| DELETE | `/:id` | Admin Bearer | Delete song and associated local files |

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
| GET | `/uploads/*` | Serve uploaded audio and cover files |

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
| `playerStore` | Playback state — current track, queue, play/pause, seek/progress, volume, shuffle/repeat |
| `playlistStore` | Playlist management |
| `adminAuthStore` | Admin panel authentication (session-based, separate from user auth) |
| `adminTracksStore` | Admin track upload/management |
| `songsCatalogStore` | Public songs catalog loaded from backend (`/api/songs`) |

## Authentication

JWT-based auth. Tokens are stored in `localStorage` under the key `auth_token` and automatically attached to requests via the Axios interceptor in `frontend/src/lib/apiClient.ts`. A 401 response clears the stored token.

## File Uploads

Uploads are handled by Multer.

- Audio formats: `mp3`, `wav`, `m4a`, `flac`, `aac`, `ogg`
- Cover image formats: `jpg`, `jpeg`, `png`, `webp`, `gif`
- Duration is extracted automatically using `music-metadata`
- Files are stored in `uploads/` and served from `/uploads/*`

## Playback Flow (Frontend)

- UI actions call `playerStore` (`play`, `togglePlay`, `seek`, `next`, `prev`)
- A single global audio engine component (`frontend/src/components/player/AudioEngine.tsx`) is mounted in root layout
- The audio engine streams current track from `GET /api/songs/:id/stream`
- Audio element events update store progress and playback state
- Controls in mini player, desktop player, track rows, and player page stay synchronized through store state

## Catalog Data Flow (Frontend)

- User-facing track pages now load songs from backend (not static `data/tracks.ts`)
- Mapping layer: `frontend/src/utils/song-catalog.utils.ts` converts backend song payloads to `Track`
- Cover fallback UI component: `frontend/src/components/ui/SongCoverImage.tsx`
- Applied in track and media UI so missing/broken cover images render a designed placeholder

## Recent Changes

- Backend architecture normalized to controller/service split for songs
- Added full admin song CRUD API with auth protection
- Added admin song create/edit support for optional cover image upload
- Admin panel now reads/writes real backend songs
- User-facing app now reads songs from backend catalog
- Added real streamed audio playback via global audio engine
- Added reusable song-cover fallback component across UI

## Database Models

**User** — email, username, hashed password, profilePicture

**Song** — title, artist, album, genre, duration, filePath, coverImage, plays, uploadedBy

**Playlist** — name, description, coverImage, owner, songs[], isPublic
