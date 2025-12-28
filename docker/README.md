# Docker Development Environment

This directory contains Docker configuration for the Urban Planner development environment.

## Services

- **db**: PostgreSQL 16.1 database
- **fullstack**: Blitz.js application (port 3000)
- **prisma-studio**: Database GUI (port 5555)

## Quick Start

### 1. Start all services

```bash
cd /Users/adamsocki/dev/urban/planner
./docker/up.sh
```

Or via pnpm:

```bash
pnpm docker:up
```

### 2. Run database migrations (first time only)

In a new terminal while containers are running:

```bash
docker compose -f docker/docker-compose.yml exec fullstack npx prisma migrate dev --name init
```

### 3. Access the applications

- Fullstack app: http://localhost:3000
- Prisma Studio: http://localhost:5555
- PostgreSQL: localhost:5432

## Common Commands

### Start in background
```bash
docker compose -f docker/docker-compose.yml up -d
```

### View logs
```bash
docker compose -f docker/docker-compose.yml logs -f
docker compose -f docker/docker-compose.yml logs -f fullstack
```

### Stop all services
```bash
docker compose -f docker/docker-compose.yml down
```

### Restart a service
```bash
docker compose -f docker/docker-compose.yml restart fullstack
```

### Run Prisma commands
```bash
docker compose -f docker/docker-compose.yml exec fullstack npx prisma studio
docker compose -f docker/docker-compose.yml exec fullstack npx prisma migrate dev
docker compose -f docker/docker-compose.yml exec fullstack npx prisma db push
```

### Access database directly
```bash
docker compose -f docker/docker-compose.yml exec db psql -U postgres -d urban_planner
```

## Troubleshooting

### Database connection errors
Make sure the `db` service is healthy before the fullstack app starts. The `depends_on` is configured but doesn't wait for PostgreSQL to be ready.

### Port conflicts
If ports 3000, 5432, or 5555 are already in use, stop the conflicting services or modify the ports in `docker-compose.yml`.

### Node modules issues
The compose file uses an anonymous volume for `/app/node_modules` to prevent the host directory from shadowing container dependencies.

### Missing module errors
The containers auto-install dependencies on startup. If you still see "Cannot find module" errors, restart the services to retry the install.

### pnpm lockfile mismatch
If Docker build fails with `ERR_PNPM_OUTDATED_LOCKFILE`, run `./docker/up.sh` (or `pnpm docker:up`) to sync `pnpm-lock.yaml` before building.

## Environment Variables

Environment variables are loaded from `../.env.docker`. Key variables:

- `DATABASE_URL`: PostgreSQL connection string (uses `db` hostname)
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox API token
- `NODE_ENV`: development
