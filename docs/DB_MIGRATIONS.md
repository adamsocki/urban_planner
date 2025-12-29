# DB Migrations (Prisma + Postgres)

This repo uses Prisma migrations to evolve the Postgres schema for `apps/fullstack`.

## Quick checklist (the “happy path”)

1. Ensure Postgres is running and reachable from where you’re running commands.
2. Ensure `DATABASE_URL` is set (Prisma refuses to run without it).
3. Edit `apps/fullstack/db/schema.prisma`.
4. Create/apply a migration:
   - `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma migrate dev --name <short_name>`
5. Prisma client is generated automatically, but if you hit runtime errors, re-run:
   - `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma generate`
6. Verify:
   - `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma migrate status`
   - optionally: `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma studio`

## Which command should I use?

- **Local development (create new migrations):** `blitz prisma migrate dev`
  - Creates new migration files and applies them.
  - Uses a **shadow database** to validate that migrations replay cleanly.
- **Production/CI (apply existing migrations only):** `blitz prisma migrate deploy`
  - Applies migrations that already exist in `apps/fullstack/db/migrations`.
  - Does not try to create new migrations.

If you’re using Docker for dev, the fullstack container already runs `migrate deploy` on startup. If you create a new migration on your host, you’ll need to restart the container or run `migrate deploy` again so it picks it up.

## Repo-specific env setup

Prisma reads `DATABASE_URL` from the environment (and in dev it loads env files).

Common patterns in this repo:

- **Running Prisma on your host machine (connecting to Docker Postgres via published port):**
  - Put `DATABASE_URL=postgres://postgres:postgres@localhost:5432/urban_planner` in `apps/fullstack/.env.local` (this file is git-ignored).
  - Start Postgres: `./docker/up.sh db`
  - Run migrations: `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma migrate dev`
- **Running everything inside Docker:**
  - Root `.env.docker` is used by `docker/docker-compose.yml`.
  - Run migrations inside the container: `docker compose -f docker/docker-compose.yml exec fullstack blitz prisma migrate deploy`

## Data migrations / backfills (how to avoid pain)

Schema changes are easy; **schema + existing data** is where migrations fail.

Recommended approach:

- Use `--create-only` if you expect to edit SQL:
  - `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma migrate dev --create-only --name <name>`
  - Edit the generated `apps/fullstack/db/migrations/*/migration.sql`
  - Then apply: `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma migrate dev`
- If a migration depends on an old column, **backfill before dropping** the old column.
- For big tables, avoid long locks:
  - add a nullable column
  - backfill in a separate migration (or batched job)
  - then add `NOT NULL` / constraints later

## Common “why is this failing” errors

### `P1012 Environment variable not found: DATABASE_URL`

Prisma validates `schema.prisma` before doing anything else. If `DATABASE_URL` isn’t set/loaded, it stops immediately.

Fix: set `DATABASE_URL` (usually via `apps/fullstack/.env.local` for host commands, or `.env.docker` for Docker).

### “Schema engine error” / “Connection refused”

`DATABASE_URL` exists, but Postgres isn’t reachable at that host/port.

Fix: start Postgres, or point `DATABASE_URL` at the correct server (host vs Docker DNS name).

### `P3006 failed to apply cleanly to the shadow database`

`migrate dev` replays migrations into a shadow DB. If the SQL isn’t replayable, it fails here.

Common causes:
- Postgres enum type mismatches (string literals are `text` unless cast)
- migrations that assume data/state that won’t exist on a fresh replay
- insufficient DB permissions to create a shadow database

Example (enum cast):

```sql
UPDATE "User"
SET "themePreference" = CASE
  WHEN "darkMode" = true THEN 'DARK'::"ThemePreference"
  ELSE 'LIGHT'::"ThemePreference"
END;
```

### `Cannot find module '.prisma/client/index'`

The Prisma client wasn’t generated in your environment.

Fix: `pnpm --ignore-workspace -C apps/fullstack exec blitz prisma generate`

## Rules of thumb

- Don’t edit an already-applied migration on shared environments; create a new migration.
- If you remove/rename a field, `rg` for it and update:
  - queries/selects
  - session public data types
  - validation schemas
  - tests

