# Project Plan: Blog Backend (.NET + MySQL + Redis)

## Goal
Build a production-ready ASP.NET Core backend for a blog platform using C#, MySQL, and Redis with clean architecture and secure role-based access.

## Decisions (confirmed)
- Authentication: JWT access token + refresh token rotation.
- API Versioning: URL-based (`/api/v1`).
- RBAC:
	- Guest: read-only.
	- Editor: CRUD posts/categories.
	- Admin: full access, including user management.
- Migrations: EF Core auto-apply in development, manual in production.

## Scope (v1)
- Entities: `User`, `Post`, `Category`.
- Full REST API.
- Sign-up/sign-in/refresh/logout.
- Authorization policies by role.
- Redis caching for GET requests only.
- Global exception handling middleware.
- Async/await end-to-end (no `.Result` / `.Wait()`).
- FluentValidation for all write operations.
- Rate limiting + request size limits.
- Strongly typed config via `IOptions<T>`.
- Swagger/OpenAPI.
- Unit tests for domain logic.
- Docker Compose for API + MySQL + Redis.

## Architecture (Clean / Hexagonal)
Projects:
- `Blog.Domain` (entities, domain rules, repository contracts)
- `Blog.Application` (use cases, DTOs, validators, interfaces)
- `Blog.Infrastructure` (EF Core MySQL, Redis, auth services)
- `Blog.Api` (controllers, middleware, DI, versioning, Swagger)

Rule: dependencies point inward only.

## Data Model (minimum)
- `User`: `Id`, `Email` (unique), `PasswordHash`, `Role`, timestamps.
- `Category`: `Id`, `Name`, `Slug` (unique), timestamps.
- `Post`: `Id`, `Title`, `Slug` (unique), `Content`, `Status`, `AuthorId`, `CategoryId`, `PublishedAt`, timestamps.

## API Endpoints (v1)
Base: `/api/v1`

Auth:
- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/refresh`
- `POST /auth/logout`

Posts:
- `GET /posts` (public, cached)
- `GET /posts/{slug}` (public, cached)
- `POST /posts` (editor/admin)
- `PUT /posts/{id}` (editor/admin)
- `DELETE /posts/{id}` (editor/admin)

Categories:
- `GET /categories` (public, cached)
- `GET /categories/{slug}` (public, cached)
- `POST /categories` (editor/admin)
- `PUT /categories/{id}` (editor/admin)
- `DELETE /categories/{id}` (editor/admin)

Users (admin only):
- `GET /users`
- `GET /users/{id}`
- `PATCH /users/{id}/role`

## Caching Rules (Redis)
- Cache successful GET responses only.
- TTL suggestion: lists 60s, details 300s.
- Invalidate related keys on create/update/delete.
- Prefix keys by version (e.g., `v1:posts:*`).

## Platform Controls
- Standardized error responses via global middleware (`ProblemDetails`).
- Rate limiter policy for public/authenticated traffic.
- Request body size limits.
- Environment-specific configuration via typed options:
	- `JwtOptions`, `MySqlOptions`, `RedisOptions`, `RateLimitOptions`, `RequestLimitsOptions`.

## Testing
- Required: unit tests for domain rules and core application logic.
- Optional next step: integration tests for auth + post lifecycle.

## Docker Compose
Services:
- `api`
- `mysql` (with persistent volume)
- `redis`

Include health checks and environment wiring.

## Milestones
1. Scaffold solution and projects.
2. Implement domain model + EF Core + migrations.
3. Implement auth + RBAC.
4. Implement posts/categories/users APIs with validation.
5. Add Redis caching + invalidation.
6. Add middleware, rate limiting, size limits, versioning, Swagger.
7. Add unit tests + docker-compose; verify end-to-end.

## Definition of Done
- All v1 endpoints implemented and documented.
- Role policies enforced.
- GET caching active with invalidation on writes.
- Validation + exception middleware + limits enabled.
- Unit tests pass.
- `docker-compose up` runs API, MySQL, and Redis successfully.
