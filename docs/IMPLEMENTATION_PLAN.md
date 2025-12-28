# Urban Planner - Project Setup Plan (Revised)

## Overview

Set up a new urban planning application at:

`/Users/adamsocki/dev/urban/planner`

using Placemark as the foundation, with both:

- **Play** (Vite, serverless) — quick iteration, cloned from Placemark
- **Fullstack** (Blitz.js + PostgreSQL) — production with database, **created fresh** (not copied from toluca)

End goal: automated urban planning document generation.

**Approach:** Start with a clean Blitz.js app and selectively implement features as needed, using toluca as a reference for patterns and inspiration rather than copying it wholesale.

---

## Architecture: Monorepo with pnpm Workspaces

```
/Users/adamsocki/dev/urban/planner/
├── apps/
│   ├── play/                       # Placemark Play (Vite) - quick iteration
│   └── fullstack/                  # Fresh Blitz.js app - production with database
├── packages/
│   ├── core/                       # Shared GIS/map functionality
│   ├── urban-planning/             # Document generation, census, zoning
│   └── ui/                         # Shared UI components
├── docker/
│   ├── docker-compose.yml          # Development
│   └── docker-compose.prod.yml     # Home server production
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                    # root workspace scripts
└── README.md
```

---

## Phase 1: Repository Setup

### Step 1.1: Initialize Monorepo

```bash
mkdir -p /Users/adamsocki/dev/urban/planner
cd /Users/adamsocki/dev/urban/planner

pnpm init
git init
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create `.gitignore`:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.next/
.turbo/
out/

# Environment files (keep .example files)
.env
.env.local
.env.docker
.env.production

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Database
*.db
*.sqlite

# Docker volumes (local)
docker/data/
```

Create a *real* root `package.json` (so `pnpm -w` + turbo work cleanly):

```json
{
  "name": "urban-planner",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

Create `turbo.json` (minimal, but useful):

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {},
    "typecheck": {}
  }
}
```

> Note: Turbo v2 uses `tasks` instead of `pipeline`. You can refine tasks later once each app/package has explicit build/typecheck scripts.

### Step 1.2: Add Placemark Play (avoid nested git repo)

**Important:** `git clone` creates a nested repo. Pick one approach:

**Option A (recommended): clone then strip `.git`**

```bash
git clone https://github.com/placemark/placemark apps/play
rm -rf apps/play/.git
cd apps/play && pnpm install
```

**Option B: submodule (if you want upstream pinning)**

```bash
git submodule add https://github.com/placemark/placemark apps/play
cd apps/play && pnpm install
```

### Step 1.3: Create Fresh Blitz.js App for Fullstack

Create a new Blitz.js app from scratch:

```bash
cd apps
pnpm create blitz-app fullstack
# Choose:
# - TypeScript
# - React
# - Tailwind CSS
# - PostgreSQL
cd ..
```

Or manually scaffold if you prefer more control:

```bash
mkdir -p apps/fullstack
cd apps/fullstack
pnpm init
# Then manually add dependencies and configure Next.js + Blitz
```

> **Note:** You can reference toluca (`/Users/adamsocki/dev/react/toluca`) for inspiration on features to implement later (auth patterns, database schema, UI components), but starting fresh avoids carrying over unnecessary code.

### Step 1.4: Create Packages (with package.json files)

```bash
mkdir -p packages/core/src
mkdir -p packages/urban-planning/src
mkdir -p packages/ui/src
```

Create `packages/core/package.json`:

```json
{
  "name": "@urban/core",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

Create `packages/ui/package.json`:

```json
{
  "name": "@urban/ui",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

Create `packages/urban-planning/package.json`:

```json
{
  "name": "@urban/urban-planning",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

---

## Phase 1.5: Workspace Smoke Test (prove linking works)

Goal: make Fullstack import a function from `@urban/core` without publishing anything.

### Step 1.5.1: Add a tiny export in `@urban/core`

Create `packages/core/src/index.ts`:

```ts
export function coreHello(name: string): string {
  return `hello from @urban/core, ${name}`
}
```

### Step 1.5.2: Declare the dependency in Fullstack

In `apps/fullstack/package.json`, add:

```json
{
  "dependencies": {
    "@urban/core": "workspace:*"
  }
}
```

Then from repo root:

```bash
pnpm install
```

### Step 1.5.3: Use it in a page (quickest possible proof)

In `apps/fullstack/pages/welcome.tsx` (or any page), add:

```tsx
import { coreHello } from "@urban/core"
```

and render:

```tsx
<p className="mt-2 text-gray-600 dark:text-gray-300">
  {coreHello("world")}
</p>
```

If the dev server runs and you see the string rendered, your workspace wiring is real.

---

## Phase 2: Docker Development Environment

Create `docker/docker-compose.yml`.

**Important bind-mount note:** When you mount `../apps/fullstack:/app`, it can shadow `node_modules` created in the image. Add an anonymous volume for `/app/node_modules`.

```yaml
version: "3.8"
services:
  db:
    image: postgres:16.1
    container_name: urban-planner-db
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: urban_planner
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  fullstack:
    build:
      context: ../apps/fullstack
      dockerfile: dev.Dockerfile
    container_name: urban-planner-fullstack
    env_file:
      - ../.env.docker
    volumes:
      - ../apps/fullstack:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - db

  prisma-studio:
    build:
      context: ../apps/fullstack
      dockerfile: dev.Dockerfile
    container_name: urban-planner-prisma-studio
    env_file:
      - ../.env.docker
    ports:
      - "5555:5555"
    depends_on:
      - db
    volumes:
      - ../apps/fullstack:/app
      - /app/node_modules
    command: npx prisma studio

volumes:
  db_data:
```

---

## Phase 3: Custom Welcome Page

Create `apps/fullstack/pages/welcome.tsx`.

**Notes:**
- If you reference `<FeatureCard />`, define it or import it.
- A Next/Blitz route like `/play` will not automatically route to the Vite app. For now, link directly to the Vite dev server. Later, proxy `/play` via Caddy or Next rewrites.

Example:

```tsx
import { BlitzPage } from "@blitzjs/next"

const FeatureCard = ({ title }: { title: string }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    <p className="mt-2 text-gray-600 dark:text-gray-300">
      Placeholder description.
    </p>
  </div>
)

const WelcomePage: BlitzPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Urban Planning Document Generation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Generate site plans, zoning analysis, and demographic reports.
        </p>
        <div className="flex gap-4">
          <a href="/signup" className="btn-primary">Get Started</a>
          <a href="http://localhost:5173" className="btn-secondary">Try Playground</a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <FeatureCard title="Site Plan Reports" />
        <FeatureCard title="Demographic Analysis" />
        <FeatureCard title="Zoning Compliance" />
      </section>
    </div>
  )
}

export default WelcomePage
```

Redirect unauthenticated users from `/` to `/welcome` (server-side) by updating `apps/fullstack/pages/index.tsx`
with a `getServerSideProps` that checks auth/session and redirects as needed.

---

## Phase 4: Environment Configuration (Host vs Docker)

Create two env templates to avoid confusion:

### `.env.example` (host/dev machine)

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/urban_planner

NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
NODE_ENV=development
```

### `.env.docker` (docker compose)

```bash
DATABASE_URL=postgres://postgres:postgres@db:5432/urban_planner

POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_HOST=db
POSTGRES_DB=urban_planner

NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
NODE_ENV=development
```

---

## Phase 5: Home Server Setup

Create `docker/docker-compose.prod.yml` for deployment to home PC:

- PostgreSQL with persistent volume
- Fullstack app in production mode
- Caddy reverse proxy for SSL
- (Optional) static proxy path for Play, if you want `/play` to be one URL

Access workflow:

```bash
# From MacBook
ssh user@home-server-ip
cd /path/to/urban-planner
docker compose -f docker/docker-compose.prod.yml up -d
```

---

## Document Generation Approach (Backwards)

Working backwards from desired output:

1. **Output**: PDF/DOCX documents with maps, tables, charts
2. **Processor**: Renders populated templates to documents
3. **Extractor**: Pulls data from Projects/Modules
4. **Templates**: JSON template definitions with variables
5. **Project/Module System**: Already exists in toluca
6. **GIS Foundation**: Placemark core

---

## Key Files to Reference (from Toluca & Other Projects)

Use these as inspiration and patterns when implementing similar features:

| Purpose | File |
|---------|------|
| Database schema patterns | `/Users/adamsocki/dev/react/toluca/db/schema.prisma` |
| Document gen plan | `/Users/adamsocki/dev/react/toluca/URBAN_PLANNING_DOCUMENT_GENERATION_PLAN.md` |
| Home tabs UI pattern | `/Users/adamsocki/dev/react/toluca/app/components/home_tabs.tsx` |
| Docker pattern | `/Users/adamsocki/dev/react/placemark-fullstack/docker-compose.yml` |
| Play integration pattern | `/Users/adamsocki/dev/react/toluca/pages/play.tsx` |
| UI style guide | `/Users/adamsocki/dev/react/toluca/UI_STYLE_GUIDE.md` |

---

## Features to Implement (Reference Toluca for Patterns)

**High Priority:**
- Authentication & User Management (reference toluca auth patterns)
- Project System (reference `app/projects/` in toluca)
- Module System (reference `app/modules/` in toluca)
- Home Tabs UI (reference `app/components/home_tabs.tsx` in toluca)
- Play Mode integration strategy (either proxy or direct link, reference `pages/play.tsx` in toluca)

**Document Generation (New):**
- Document Templates
- Document Generation Engine
- PDF Export
- Template Builder UI

---

## Development Commands

```bash
# Start everything
docker compose -f docker/docker-compose.yml up

# Play only (lightweight)
cd apps/play && pnpm dev

# Database migrations (inside container)
docker compose exec fullstack npx prisma migrate dev

# Access
# - Fullstack: http://localhost:3000
# - Play: http://localhost:5173
# - Prisma Studio: http://localhost:5555
```

---

## Next Steps After Setup

1. Verify both Play and Fullstack run correctly
2. Confirm pnpm workspace linking works (e.g., fullstack imports `@urban/core`)
3. Set up the welcome page
4. Create the first document template (Site Plan Report)
5. Implement document generation for that template
6. Iterate based on actual usage needs
