# spotify-clone — Development Rules

## Stack

**Backend:** Express 5, TypeScript, MongoDB (Mongoose), JWT, Multer, Zod
**Frontend:** React 19, Vite 7, TanStack Router (file-based), TanStack React Query, Zustand, Axios, Tailwind CSS
**Package manager:** pnpm (monorepo with `pnpm-workspace.yaml`)

---

## File & Folder Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Frontend components | PascalCase | `ProfileEditModal.tsx`, `TrackRow.tsx` |
| Frontend hooks | kebab-case | `api-keys.ts`, `admin-auth.ts` |
| Frontend stores | camelCase + `Store` suffix | `playerStore.ts`, `authStore.ts` |
| Frontend API modules | camelCase + `Api` suffix | `songsApi.ts`, `adminAuthApi.ts` |
| Backend controllers | kebab-case + `.controller.ts` | `song.controller.ts` |
| Backend services | kebab-case + `.service.ts` | `song.service.ts` |
| Backend models | kebab-case + `.model.ts` | `liked-song.model.ts` |
| Backend middleware | kebab-case + `.middleware.ts` | `auth.middleware.ts` |
| Backend utils | kebab-case + `.utils.ts` | `jwt.utils.ts`, `cookie.utils.ts` |
| Backend types | kebab-case + `.types.ts` | `song.types.ts`, `auth-service.types.ts` |
| Backend routes | kebab-case + `.routes.ts` | `admin-song.routes.ts` |

---

## TypeScript

- Strict mode always — no `any`, no type suppression
- Backend types live in `src/types/` grouped by domain (e.g. `types/song/`, `types/auth/`, `types/admin/`)
- Frontend types live in `src/types/` per domain
- Use `import type { ... }` for type-only imports

---

## Backend

### Controller / Service split

- Controllers handle HTTP only: parse request, call service, return response
- Services contain all business logic and DB operations — no `req`/`res` anywhere in a service
- Consistent response shape: `{ success: boolean, message: string, data?: T }`

### Error handling

- Throw `ServiceError` (from `src/types/error/service-error.ts`) in services with an HTTP status code
- The global `errorHandler` middleware in `error.middleware.ts` catches all errors and formats them
- Never send raw error messages to the client

### Validation

- All request bodies validated with Zod schemas from `src/utils/validation.schemas.ts`
- Use `validate.middleware.ts` to apply schemas — don't validate inline in controllers

### Adding a new resource

Follow the existing pattern: `model` → `service` → `controller` → `routes` → register in `app.ts`

### Auth middleware

- Use `protect` from `auth.middleware.ts` for user-protected routes
- Use `adminProtect` from `admin-auth.middleware.ts` for admin-only routes
- User and admin auth are completely separate — different secrets, tokens, and middleware

---

## Frontend

### State management

- **Zustand** for global client state (`src/store/`)
- **React Query** for all server state (`src/hooks/`)
- Never fetch data directly in components — use hooks that wrap React Query

### React Query

- Query key factories defined in `src/hooks/api-keys.ts` — never hardcode keys inline
- Invalidate queries via `queryClient.invalidateQueries` in mutation `onSuccess`

### API layer

- All HTTP calls go through `src/lib/apiClient.ts` (Axios instance, `baseURL: '/api'`)
- Group calls by domain in `src/api/` (e.g. `songsApi.ts`, `playlistsApi.ts`)
- Do **not** use `import.meta.env` inside `apiClient.ts` — hardcode `baseURL: '/api'`

### Routing

- TanStack Router with file-based routing — add new pages under `src/routes/`
- Dynamic segments use `$param` syntax (e.g. `artist.$id.tsx`)

### Styling

- Tailwind CSS with custom colors: `brand` (`#1A7B9E`), `surface` (`#232323`), `surface-alt` (`#2E2E2E`), `muted` (`#6B6B6B`)
- Use these semantic tokens instead of hardcoding hex values

### Audio playback

- All playback state lives in `playerStore`
- `<AudioEngine />` is the single audio element owner — do not create additional `<audio>` elements
- To trigger playback: update `playerStore`, the engine reacts automatically

---

## Imports

- Frontend: use `@/` alias — avoid relative `../` paths
- Backend: use relative paths (no path aliases configured)

---

## General

- No test framework — TypeScript strict mode is the correctness gate
- No unused variables, imports, or dead code (`noUnusedLocals` / `noUnusedParameters` enforced)
- Don't add comments unless logic is genuinely non-obvious
