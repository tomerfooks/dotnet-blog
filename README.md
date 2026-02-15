# Blog Backend (.NET + MySQL + Redis)

This repository contains a clean-architecture backend scaffold for a blog platform.

## Projects
- `src/Blog.Domain`
- `src/Blog.Application`
- `src/Blog.Infrastructure`
- `src/Blog.Api`
- `tests/Blog.Domain.Tests`

## Requirements
- .NET 9 SDK
- Docker + Docker Compose

## Run with Docker
```bash
docker compose up --build
```

API should be available at:
- `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`

## Notes
- This environment did not have `dotnet` installed, so the scaffold was created manually.
- In `Development`, the API auto-applies pending EF migrations on startup.
- In `Production`, keep migrations as a manual deployment step.
- Generate the initial migration once:
```bash
dotnet ef migrations add InitialCreate -p src/Blog.Infrastructure -s src/Blog.Api
```
