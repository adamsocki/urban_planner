# Urban Planner

This repo currently runs only the **Placemark fullstack app** (Blitz.js) as `apps/fullstack`.

**Upstream source:** vendored from `placemark/placemark` commit `24fbf52aca8eea8eb742c2d9469886b8a9846e19` (2024-05-26, “Support URL API (#72)”).

## Quick start (Docker)

1. Ensure you have Docker running.
2. Create/update `.env.docker` (see `.env.example` for required vars).
3. Run `pnpm dev` (or `./docker/up.sh`).

Then open:
- App: `http://localhost:3000` (redirects to the stylized sign-in screen at `/signin`; `/login` is an alias)
- Prisma Studio: `http://localhost:5555`

## Useful commands

- Start Docker stack: `pnpm dev`
- Start app locally (requires Postgres + env vars): `pnpm dev:app`
- Build the app (non-Docker): `pnpm build:app`
