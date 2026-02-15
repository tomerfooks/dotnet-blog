## Frontend Plan (Angular) — Expanded and Backend-Aligned

### Goal
Build a modern, clean, minimal Angular frontend for the blog backend with JWT auth, role-based UX, strong form validation, and responsive design using pure CSS.

### Core Product Requirements
1. Use latest stable Angular.
2. Integrate JWT access token + refresh token flow.
3. Add practical client-side validation matching backend rules.
4. Keep the app responsive across mobile, tablet, and desktop.
5. Use pure CSS only (no UI libraries).

### Backend Constraints to Respect
- API base path: `/api/v1` (versioned API).
- Auth endpoints:
	- `POST /auth/signup`
	- `POST /auth/signin`
	- `POST /auth/refresh`
	- `POST /auth/logout`
- Authorization rules:
	- `Guest`: read-only (public content).
	- `Editor` / `Admin`: create/update/delete posts and categories.
	- `Admin`: users management endpoints.
- Main resources:
	- Posts: `GET /posts`, `GET /posts/{slug}`, plus protected write endpoints.
	- Categories: `GET /categories`, `GET /categories/{slug}`, plus protected write endpoints.
	- Users (admin only): `GET /users`, `GET /users/{id}`, `PATCH /users/{id}/role`.

### API Contracts (Frontend Models)
Create strict TS interfaces for all request/response payloads.

#### Auth
- `SignupRequest`: `{ email: string; password: string; role?: 'guest' | 'editor' | 'admin' }`
- `SigninRequest`: `{ email: string; password: string }`
- `RefreshRequest`: `{ refreshToken: string }`
- `AuthResponse`: `{ accessToken: string; refreshToken: string; expiresAtUtc: string }`

#### Posts
- `CreatePostRequest`: `{ title: string; slug: string; content: string; authorId: string; categoryId: string; publish: boolean }`
- `UpdatePostRequest`: `{ title: string; slug: string; content: string; categoryId: string; publish: boolean }`
- `Post`: include `id`, `title`, `slug`, `content`, `status`, `publishedAtUtc`, `authorId`, `categoryId`, `createdAtUtc`, `updatedAtUtc`.

#### Categories
- `CreateCategoryRequest`: `{ name: string; slug: string }`
- `UpdateCategoryRequest`: `{ name: string; slug: string }`
- `Category`: include `id`, `name`, `slug`, `createdAtUtc`, `updatedAtUtc`.

#### Users
- `UpdateUserRoleRequest`: `{ role: string }` with allowed values `guest | editor | admin`.
- `UserListItem`: `{ id: string; email: string; role: string; createdAtUtc: string; updatedAtUtc: string }`.

### App Structure
Use standalone APIs and feature-based folders.

Suggested structure:
- `src/app/core`
	- `api/` (http client wrappers)
	- `auth/` (token storage, auth state, guards, interceptor)
	- `config/` (environment + base URLs)
- `src/app/shared`
	- reusable ui primitives (button, input, card, form-error, loader)
	- shared pipes/utils/validators
- `src/app/features`
	- `auth/` (signin/signup)
	- `posts/` (list, details, editor, management)
	- `categories/` (list, management)
	- `admin-users/` (users list + role update)

### Routes and Access Control
- Public:
	- `/` → posts list
	- `/post/:slug` → post details
	- `/signin`, `/signup`
- Editor/Admin protected:
	- `/manage/posts`
	- `/manage/posts/new`
	- `/manage/posts/:id/edit`
	- `/manage/categories`
- Admin-only protected:
	- `/admin/users`

Guard strategy:
- `authGuard`: require authenticated user.
- `roleGuard`: require `editor|admin` or `admin` per route.
- Hide protected nav items for unauthorized users, but still enforce route guards.

### Authentication Design (JWT + Refresh)
- Store `accessToken`, `refreshToken`, and `expiresAtUtc` in local storage.
- Decode JWT payload client-side to derive role and basic identity claims for UI.
- Add an HTTP interceptor that:
	- injects `Authorization: Bearer <accessToken>` for protected calls.
	- catches `401`, tries one refresh request, then retries original call.
	- if refresh fails, clears session and redirects to `/signin`.
- On logout:
	- call `POST /auth/logout` with refresh token.
	- clear local auth state regardless of server response.

### Validation Rules (Match Backend)
Implement Angular reactive forms with validators aligned to backend:

- Sign up / Sign in
	- `email`: required, valid email, max 256.
	- `password`: required, min 8, max 128.
	- `role` (signup optional): one of `guest|editor|admin`.
- Category form
	- `name`: required, max 120.
	- `slug`: required, max 160.
- Post form
	- `title`: required, max 200.
	- `slug`: required, max 240.
	- `content`: required.
	- `categoryId`: required.
	- `authorId`: required on create.

Error UX:
- Show inline validation after touched/submit.
- Map backend `ValidationProblemDetails` errors to field-level messages.
- Show global error toast/banner for auth/network/server failures.

### UI/UX (Minimal + Modern + Pure CSS)
Design principles:
- clean spacing scale, clear typography hierarchy, subtle borders, soft radius.
- avoid visual noise; prioritize readability and content.

Pure CSS system:
- use CSS variables for color, spacing, radius, typography scale.
- create utility classes for layout (`.container`, `.grid`, `.stack`, `.cluster`).
- component-scoped styles for buttons/forms/cards/table.
- no Tailwind, no Bootstrap, no Material.

Responsive behavior:
- mobile-first breakpoints (example: 640, 768, 1024).
- collapse top navigation into compact mobile menu.
- forms and cards become single-column on small screens.
- management tables support horizontal scroll on narrow devices.

### Data Layer and State
- Keep server state in feature services using RxJS + `HttpClient`.
- Use small local component state for forms and filters.
- Cache low-risk read data in-memory where useful (posts list/categories list), with explicit refresh after successful create/update/delete.

### Error Handling and Empty States
- Standardize API error mapping in one utility.
- Provide explicit UI states for:
	- loading
	- empty list
	- unauthorized
	- not found (post/category not found)
	- general server error

### Environment and Configuration
- `environment.ts` / `environment.prod.ts`:
	- `apiBaseUrl` (example local: `http://localhost:8080/api/v1`).
- Keep API URLs centralized in one config token/service.

### Implementation Milestones
1. Bootstrap Angular project and define core architecture.
2. Implement auth models, service, interceptor, storage, guards.
3. Build public pages: posts list + post details.
4. Build editor/admin management for posts and categories.
5. Build admin users page and role update flow.
6. Add validation/error system and responsive CSS refinements.
7. Final pass: accessibility, UX polish, and production build verification.

### Definition of Done
- Auth works end-to-end (`signup`, `signin`, `refresh`, `logout`).
- Route guarding and role-based UI behavior correctly enforce backend rules.
- All forms validate per backend constraints and show clear errors.
- Fully responsive layout on mobile/tablet/desktop.
- Pure CSS styling only.
- Frontend can complete full CRUD workflows allowed by each role.
