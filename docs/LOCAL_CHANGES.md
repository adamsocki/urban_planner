# Local changes vs upstream Placemark

`apps/fullstack` is vendored from Placemark. When we *do* diverge from upstream, we note it here so future upstream updates are easier.

## Planner namespacing

- Added Planner namespace routes under `apps/fullstack/pages/planner/*` and implementation under `apps/fullstack/app/planner/*` (see `docs/PLANNER_NAMESPACE.md`).

## Dev workflow

- `docker/docker-compose.yml`: mount `apps/fullstack` into the `fullstack` and `prisma-studio` containers for live reload in Docker.

## Small UI experiments / tweaks

- `apps/fullstack/pages/about.tsx` and `apps/fullstack/app/core/layouts/standalone_form_layout.tsx`: added a simple `/about` page and switched the standalone footer link to it.
- `apps/fullstack/app/auth/components/SigninForm.tsx`: small sign-in form copy tweak (used for learning/hot reload checks).

