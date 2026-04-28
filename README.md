# LumiTune

Full-stack Spotify-style music streaming app built as a pnpm workspace. The app includes a React web client, an Express REST API, user and admin authentication, media uploads, streaming playback, playlists, likes, search, albums, podcasts, audiobooks, genres, moods, and an admin dashboard.

## Stack

**Frontend:** React 19, Vite 7, TypeScript, TanStack Router, TanStack Query, Zustand, Tailwind CSS, Axios, Framer Motion, Recharts

**Backend:** Node.js, Express 5, TypeScript, MongoDB/Mongoose, JWT auth with refresh tokens, Passport OAuth, Multer, music-metadata, Nodemailer, Zod

## Workspace

```txt
spotify-clone/
  frontend/              React SPA
  backend/               Express API
  uploads/               Root upload placeholder
  postman/               Postman globals/environments
  pnpm-workspace.yaml    Workspace package list
  WORKSPACE.md           Architecture notes for contributors
```

Workspace packages:

- `@lumitune/frontend`
- `@lumitune/backend`

## Requirements

- Node.js 18+
- pnpm
- MongoDB, local or hosted

## Setup

Install dependencies from the repository root:

```bash
pnpm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

At minimum, set `MONGODB_URI` and `JWT_SECRET` in `backend/.env`. OAuth and SMTP settings are optional unless you need social login or email delivery.

Start both development servers in separate terminals:

```bash
pnpm dev:backend
pnpm dev:frontend
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

The Vite dev server proxies `/api` and `/uploads` to the backend, so frontend API clients use `/api` as their base URL.

## Root Scripts

| Command | Description |
| --- | --- |
| `pnpm dev:backend` | Start the backend with nodemon and ts-node |
| `pnpm dev:frontend` | Start the Vite dev server |
| `pnpm build:backend` | Compile backend TypeScript to `backend/dist` |
| `pnpm build:frontend` | Type-check and build the frontend |
| `pnpm typecheck:backend` | Run backend TypeScript checks |
| `pnpm typecheck:frontend` | Run frontend TypeScript checks |
| `pnpm typecheck` | Run type checks across workspace packages |
| `pnpm lint:frontend` | Run frontend ESLint |
| `pnpm build` | Build all workspace packages |

## Backend Environment

Required for local API startup:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/lumitune
JWT_SECRET=replace-with-a-long-random-secret
```

Common optional values:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000
ADMIN_JWT_SECRET=replace-with-a-long-random-admin-secret
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=524288000
```

See [backend/.env.example](/Users/olegvolostnyh/spotify-clone/backend/.env.example) for the full list, including refresh token, reset code, SMTP, and OAuth settings.

## Frontend Environment

```env
VITE_API_URL=/api
```

Current API clients use `/api` directly, with Vite proxying requests to the backend during development.

## API Overview

All API routes are mounted under `/api` except `/health` and `/uploads`.

| Area | Base path | Notes |
| --- | --- | --- |
| User auth | `/api/auth` | Register, login, refresh, logout, profile, password reset |
| OAuth | `/api/auth/oauth` | Google, Facebook, and Apple when provider env vars are configured |
| Admin auth | `/api/admin/auth` | Separate admin session and refresh flow |
| Songs | `/api/songs` | Public catalog, user uploads, own songs, streaming |
| Admin songs | `/api/admin/songs` | Protected song CRUD for admin screens |
| Playlists | `/api/playlists` | Authenticated user playlists |
| Admin playlists | `/api/admin/playlists` | Protected playlist management |
| Likes | `/api/likes` | Authenticated liked-song operations |
| Recently played | `/api/recently-played` | Authenticated listening history |
| Search | `/api/search` | Catalog search |
| Podcasts | `/api/podcasts` | Public podcast content |
| Admin podcasts | `/api/admin/podcasts` | Protected podcast management |
| Albums | `/api/albums` | Public album content |
| Admin albums | `/api/admin/albums` | Protected album management |
| Audiobooks | `/api/audiobooks` | Public audiobook content |
| Admin audiobooks | `/api/admin/audiobooks` | Protected audiobook management |
| Moods | `/api/moods` | Public mood content |
| Admin moods | `/api/admin/moods` | Protected mood management |
| Admin users | `/api/admin/users` | Protected user management |
| Admin dashboard | `/api/admin/dashboard` | Protected dashboard metrics |

### Important Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Backend health check |
| `POST` | `/api/auth/register` | No | Register user |
| `POST` | `/api/auth/login` | No | Login user |
| `POST` | `/api/auth/refresh` | Cookie | Refresh user access token |
| `POST` | `/api/auth/logout` | Cookie | Logout current session |
| `GET` | `/api/auth/me` | Bearer | Get current user |
| `PATCH` | `/api/auth/me` | Bearer | Update current user profile |
| `POST` | `/api/admin/auth/login` | No | Login admin |
| `POST` | `/api/admin/auth/refresh` | Cookie | Refresh admin access token |
| `GET` | `/api/admin/auth/me` | Admin Bearer | Get current admin |
| `GET` | `/api/songs` | No | List songs |
| `GET` | `/api/songs/:id` | No | Get song details |
| `GET` | `/api/songs/:id/stream` | No | Stream audio with range support |
| `GET` | `/api/songs/mine` | Bearer | List current user's uploads |
| `POST` | `/api/songs/upload` | Bearer | Upload a song with `audio` and optional `cover` files |
| `PUT` | `/api/songs/:id` | Bearer | Update one of the user's songs |
| `GET` | `/api/admin/songs` | Admin Bearer | List songs for admin |
| `POST` | `/api/admin/songs/upload` | Admin Bearer | Create a song with `audio` and optional `cover` files |
| `PUT` | `/api/admin/songs/:id` | Admin Bearer | Update song metadata and optional cover |
| `DELETE` | `/api/admin/songs/:id` | Admin Bearer | Delete a song and local files |

## File Uploads

Uploads are handled by Multer and served from `/uploads`.

- Audio upload field: `audio`
- Cover image upload field: `cover`
- Supported audio extensions: `mp3`, `wav`, `m4a`, `flac`, `aac`, `ogg`
- Supported image extensions: `jpg`, `jpeg`, `png`, `webp`, `gif`
- Default max file size: 500 MB
- Song duration is extracted automatically with `music-metadata`

## Frontend Routes

| Path | Description |
| --- | --- |
| `/` | Home and discovery |
| `/search` | Search |
| `/library` | User library |
| `/favorite` | Favorite content |
| `/profile` | Profile |
| `/settings` | Settings |
| `/notifications` | Notifications |
| `/player` | Full-screen player |
| `/artist/:id` | Artist detail |
| `/album/:id` | Album detail |
| `/playlist/:id` | Playlist detail |
| `/podcast/:id` | Podcast detail |
| `/audiobook/:id` | Audiobook detail |
| `/auth/signin` | User sign in |
| `/auth/signup` | User sign up |
| `/auth/forgot-password` | User password reset |
| `/admin` | Admin dashboard |
| `/admin/tracks` | Track management |
| `/admin/albums` | Album management |
| `/admin/playlists` | Playlist management |
| `/admin/podcasts` | Podcast management |
| `/admin/audiobooks` | Audiobook management |
| `/admin/authors` | Author management |
| `/admin/genres` | Genre management |
| `/admin/moods` | Mood management |
| `/admin/users` | User management |
| `/admin/settings` | Admin settings |
| `/admin/login` | Admin sign in |
| `/admin/signup` | Admin sign up |
| `/admin/forgot-password` | Admin password reset |
| `/admin/reset-password` | Admin reset-code flow |

## Architecture Notes

- Backend route handlers stay thin and delegate business logic to services.
- Auth uses short-lived access tokens plus refresh-token cookies.
- User and admin auth are separate flows with separate stores and API refresh handling.
- Frontend server state is fetched through API modules and hooks, with TanStack Query used for cacheable flows.
- Player state lives in Zustand, while `AudioEngine` owns the single global audio element.
- Uploaded media is streamed from the backend instead of bundled into the frontend.
- Generated TanStack Router file `frontend/src/routeTree.gen.ts` should not be edited by hand.

More contributor notes are in [WORKSPACE.md](/Users/olegvolostnyh/spotify-clone/WORKSPACE.md) and [frontend/docs/FRONTEND_ONBOARDING.md](/Users/olegvolostnyh/spotify-clone/frontend/docs/FRONTEND_ONBOARDING.md).
