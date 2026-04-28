# Workspace Baseline

This repo uses a pnpm workspace with two packages:

- `@lumitune/backend`
- `@lumitune/frontend`

## Root Commands

- `pnpm dev:backend`
- `pnpm dev:frontend`
- `pnpm build:backend`
- `pnpm build:frontend`
- `pnpm typecheck:backend`
- `pnpm typecheck:frontend`
- `pnpm typecheck`
- `pnpm lint:frontend`
- `pnpm build`

Prefer package-name filters over directory filters when adding root scripts.

## Backend Structure Rules

- `controllers/`: HTTP layer only (req/res, status codes)
- `services/`: business logic
- `types/`: interfaces/types only
- `utils/`: reusable helpers only
- `middleware/`: auth/upload/validation middleware only
- `routes/`: route registration and middleware composition only
- `models/`: Mongoose schemas/models only

## Frontend Structure Rules

- `api/`: transport layer (axios calls only)
- `hooks/`: query/mutation and UI-facing data hooks
- `lib/`: configured clients and framework setup helpers
- `types/`: shared interfaces, route types, component prop types
- `utils/`: shared helper functions
- `store/`: state only (no duplicated type/helper definitions)
- `components/player/AudioEngine.tsx`: single global audio element and sync logic

## Current Architecture Notes

- User auth lives under `/api/auth`; admin auth lives under `/api/admin/auth`.
- Auth uses access tokens plus refresh-token cookies. Frontend Axios interceptors refresh eligible `401` responses.
- Admin content management lives under `/api/admin/*` and is protected by admin auth middleware.
- Song create/update in admin uses `multipart/form-data`:
  - create: `audio` (required), `cover` (optional)
  - update: metadata fields + `cover` (optional)
- User song upload/update lives under `/api/songs` and is protected by user auth middleware.
- Public catalog is loaded from backend APIs, primarily `/api/songs`, `/api/albums`, `/api/podcasts`, `/api/audiobooks`, `/api/moods`, and `/api/search`.
- Backend song payloads are mapped to frontend UI models by `utils/song-catalog.utils.ts` and related mapper utilities.
- Fallback image rendering for song/media covers is centralized in `components/ui/SongCoverImage.tsx`.
- Playback is store-driven with a global audio engine:
  - UI dispatches actions to `playerStore`
  - `AudioEngine` streams `/api/songs/:id/stream`
  - progress/play state is synchronized from audio events
- Vite proxies `/api` and `/uploads` to the backend in development.

## Known Gaps / Next Improvements

- `frontend/.env.example` defines `VITE_API_URL`, but current API clients use `/api` directly.
- There is no backend test runner configured yet.
- Audio replacement on admin edit is not yet implemented (metadata + cover replacement is supported).

## Notes

- Keep `backend/tsconfig.json` as the source of TS compiler options (not `package.json`).
- Keep generated router output (`frontend/src/routeTree.gen.ts`) out of manual edits.
