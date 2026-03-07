# Workspace Baseline

This repo uses a pnpm workspace with two packages:

- `@lumitune/backend`
- `@lumitune/frontend`

## Root Commands

- `pnpm dev:backend`
- `pnpm dev:frontend`
- `pnpm build:backend`
- `pnpm build:frontend`
- `pnpm typecheck`
- `pnpm lint:frontend`
- `pnpm build`

## Backend Structure Rules

- `controllers/`: HTTP layer only (req/res, status codes)
- `services/`: business logic
- `types/`: interfaces/types only
- `utils/`: reusable helpers only
- `middleware/`: auth/upload/validation middleware only

## Frontend Structure Rules

- `types/`: shared interfaces, route types, component prop types
- `utils/`: shared helper functions
- `store/`: state only (no duplicated type/helper definitions)
- `api/`: transport layer (axios calls only)
- `components/player/AudioEngine.tsx`: single global audio element and sync logic

## Current Architecture Notes

- Admin song CRUD lives under `/api/admin/songs` and is protected by admin auth middleware.
- Song create/update in admin uses `multipart/form-data`:
  - create: `audio` (required), `cover` (optional)
  - update: metadata fields + `cover` (optional)
- Public catalog is loaded from `/api/songs` via `songsCatalogStore`.
- Backend song payloads are mapped to frontend `Track` by `utils/song-catalog.utils.ts`.
- Fallback image rendering for song/media covers is centralized in `components/ui/SongCoverImage.tsx`.
- Playback is store-driven with a global audio engine:
  - UI dispatches actions to `playerStore`
  - `AudioEngine` streams `/api/songs/:id/stream`
  - progress/play state is synchronized from audio events

## Known Gaps / Next Improvements

- Likes are local UI state and not persisted to backend.
- Artist/album entities are partly derived from song strings for dynamic catalog items.
- Audio replacement on admin edit is not yet implemented (metadata + cover replacement is supported).

## Notes

- Prefer package-name filters over directory filters in root scripts.
- Keep `backend/tsconfig.json` as the source of TS compiler options (not `package.json`).
