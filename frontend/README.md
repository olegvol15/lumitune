# LumiTune Frontend

React/Vite client for the LumiTune workspace.

## Quick Start

From the repository root:

```bash
pnpm install
pnpm dev:frontend
```

Or from this package:

```bash
pnpm dev
```

The dev server runs at `http://localhost:5173`. Requests to `/api` and `/uploads` are proxied to `http://localhost:3000` by Vite.

## Environment

Create `frontend/.env` from the example:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=/api
```

The current API clients use `/api` directly, so the default works for local development.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Vite |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript project checks |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build locally |

Root equivalents are available as `pnpm dev:frontend`, `pnpm lint:frontend`, `pnpm typecheck:frontend`, and `pnpm build:frontend`.

## Project Guide

Read [FRONTEND_ONBOARDING.md](/Users/olegvolostnyh/spotify-clone/frontend/docs/FRONTEND_ONBOARDING.md) for:

- folder conventions
- routing conventions
- API/hook/store patterns
- media and styling conventions
- delivery checklist
