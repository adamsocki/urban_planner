# Urban Planner

A learning-focused TypeScript project built on **Placemark** (Blitz.js/Next.js) for urban planning document generation.

**Vision:** AI-powered platform that automates 70-80% of expensive planning documents (starting with SS4A plans). See [`docs/VISION.md`](./docs/VISION.md) for the comprehensive project vision, roadmap, and technical architecture.

**Note:** This is a learning environment for TypeScript and modern web development. Code includes comments explaining what's happening and why patterns are chosen. Responses explain the reasoning behind architectural choices and TypeScript patterns.

This repo currently runs only the **Placemark fullstack app** (Blitz.js) as `apps/fullstack`.

**Upstream source:** vendored from `placemark/placemark` commit `24fbf52aca8eea8eb742c2d9469886b8a9846e19` (2024-05-26, “Support URL API (#72)”).

## Customization strategy (Planner)

We treat `apps/fullstack` as *upstream Placemark* and keep our changes small by namespacing anything custom under `planner/`.

- Routes (URL entry points): `apps/fullstack/pages/planner/*` → `/planner/*`
- App code (components, layouts, features): `apps/fullstack/app/planner/*`
- Pattern: copy the Placemark page/component into `planner/`, then customize there, instead of editing the original.

See `docs/PLANNER_NAMESPACE.md` for the conventions and examples.

## Quick start (Docker)

1. Ensure you have Docker running.
2. Create/update `.env.docker` (see `.env.example` for required vars).
3. Run `pnpm dev` (or `./docker/up.sh`).

Then open:
- App: `http://localhost:3000` (redirects to the stylized sign-in screen at `/signin`; `/login` is an alias)
- Prisma Studio: `http://localhost:5555`

## Design System

For consistent UI design across the application, refer to [Design Language Guide](./docs/DESIGN_LANGUAGE.md). This documents:
- Component library and usage patterns
- Design tokens (colors, typography, sizing)
- Dark mode implementation
- Accessibility guidelines
- Common patterns and best practices

## Useful commands

- Start Docker stack: `pnpm dev`
- Start app locally (requires Postgres + env vars): `pnpm dev:app`
- Build the app (non-Docker): `pnpm build:app`
