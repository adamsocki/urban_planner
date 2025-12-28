#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    corepack prepare pnpm@10.26.2 --activate >/dev/null 2>&1
  else
    echo "pnpm not found. Install pnpm@10.26.2 (or enable corepack) and retry." >&2
    exit 1
  fi
fi

echo "Syncing fullstack pnpm lockfile (if needed)..."
pnpm -C apps/fullstack install --lockfile-only --ignore-scripts --ignore-workspace

echo "Starting Docker services..."
docker compose -f docker/docker-compose.yml up --build "$@"
