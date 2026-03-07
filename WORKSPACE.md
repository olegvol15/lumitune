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

## Frontend Structure Rules

- `types/`: shared interfaces, route types, component prop types
- `utils/`: shared helper functions
- `store/`: state only (no duplicated type/helper definitions)

## Notes

- Prefer package-name filters over directory filters in root scripts.
- Keep `backend/tsconfig.json` as the source of TS compiler options (not `package.json`).
