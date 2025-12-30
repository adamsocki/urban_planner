# Implementation Plan: Add Separate Project Model

## Overview
Add a new `Project` model as a completely separate entity from `WrappedFeatureCollection` (Maps). Projects are **containers that hold Maps** and will have project-specific functionality like SS4A analysis and document generation.

## Architecture
- **Organization** → has many Projects
- **Organization** → has many Maps (WrappedFeatureCollections)
- **Project** → has many Maps (one-to-many relationship)
- Maps can optionally belong to a Project

## Requirements
- ✅ Separate `Project` model (not a discriminator)
- ✅ Projects contain Maps (one-to-many relationship)
- ✅ Separate routes: `/project/[id]` vs `/map/[id]`
- ✅ Share organization relationships
- ✅ Start minimal (name, description, timestamps)
- ✅ Documentation guide for adding new models

---

## Implementation Steps

### 1. Database Schema Changes

**File:** `apps/fullstack/db/schema.prisma`

**Add new Project model** (after `WrappedFeatureCollection`, around line 194):

```prisma
model Project {
  id             String                     @id @default(cuid())
  name           String                     @default("Untitled Project")
  description    String                     @default("")

  // Organization relationship
  organization   Organization               @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId Int

  // Creator tracking
  createdBy      User?                      @relation(fields: [createdById], references: [id])
  createdById    Int?

  // Timestamps
  createdAt      DateTime                   @default(now())
  updatedAt      DateTime                   @updatedAt

  // Relationships
  maps           WrappedFeatureCollection[] // One project has many maps

  @@index(fields: [organizationId])
  @@index(fields: [createdById])
}
```

**Update WrappedFeatureCollection model** (add optional project relationship):

```prisma
model WrappedFeatureCollection {
  id              String                         @id
  wrappedFeatures WrappedFeature[]
  organization    Organization                   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId  Int

  // Add project relationship (optional)
  project         Project?                       @relation(fields: [projectId], references: [id], onDelete: SetNull)
  projectId       String?

  // ... rest of fields unchanged

  @@index(fields: [projectId])  // Add index for project queries
}
```

**Update Organization model** (add projects relationship):

Find the `Organization` model and add:
```prisma
model Organization {
  // ... existing fields ...
  wrappedFeatureCollections WrappedFeatureCollection[]
  projects                  Project[]  // Add this line
  // ... rest unchanged
}
```

**Update User model** (add projects relationship):

Find the `User` model and add:
```prisma
model User {
  // ... existing fields ...
  wrappedFeatureCollections WrappedFeatureCollection[]
  projects                  Project[]  // Add this line
  // ... rest unchanged
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_project_model
```

**Why this works:**
- Completely separate `Project` table from `WrappedFeatureCollection`
- Maps can optionally belong to a Project via `projectId`
- Projects are organizational containers for Maps
- Backward compatible (existing Maps have `projectId = null`)

---

### 2. Backend: Create Project Directory Structure

Create the following new directory structure:
```
apps/fullstack/app/projects/
├── mutations/
│   ├── createProject.ts
│   ├── updateProject.ts
│   └── deleteProject.ts
├── queries/
│   ├── getProjects.ts
│   └── getProject.ts
└── validations.ts
```

---

### 3. Backend: Create Project Validation Schemas

**New File:** `apps/fullstack/app/projects/validations.ts`

```typescript
import { z } from "zod";
import { name } from "app/core/utils";

export const CreateProject = z.object({
  name,
  description: z.string().optional().default(""),
});

export const UpdateProject = z.object({
  id: z.string(),
  name: z.optional(name),
  description: z.optional(z.string()),
});

export const DeleteProject = z.object({
  id: z.string(),
});

export const GetProject = z.object({
  id: z.string(),
});
```

---

### 4. Backend: Create Project Mutations

**New File:** `apps/fullstack/app/projects/mutations/createProject.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { CreateProject } from "../validations";
import { nanoid } from "nanoid";

export default resolver.pipe(
  resolver.zod(CreateProject),
  resolver.authorize(),
  async ({ name, description }, ctx) => {
    const project = await db.project.create({
      data: {
        id: nanoid(),
        name,
        description,
        organization: {
          connect: { id: ctx.session.orgId! },
        },
        createdBy: {
          connect: { id: ctx.session.userId },
        },
      },
    });

    return project.id;
  }
);
```

**New File:** `apps/fullstack/app/projects/mutations/updateProject.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { UpdateProject } from "../validations";

export default resolver.pipe(
  resolver.zod(UpdateProject),
  resolver.authorize(),
  async ({ id, ...data }, ctx) => {
    // Verify project belongs to user's organization
    const project = await db.project.findFirst({
      where: { id, organizationId: ctx.session.orgId },
    });

    if (!project) throw new Error("Project not found");

    await db.project.update({
      where: { id },
      data,
    });

    return project;
  }
);
```

**New File:** `apps/fullstack/app/projects/mutations/deleteProject.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { DeleteProject } from "../validations";

export default resolver.pipe(
  resolver.zod(DeleteProject),
  resolver.authorize(),
  async ({ id }, ctx) => {
    // Verify project belongs to user's organization
    const project = await db.project.findFirst({
      where: { id, organizationId: ctx.session.orgId },
    });

    if (!project) throw new Error("Project not found");

    await db.project.delete({
      where: { id },
    });

    return project;
  }
);
```

---

### 5. Backend: Create Project Queries

**New File:** `apps/fullstack/app/projects/queries/getProjects.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";

export default resolver.pipe(
  resolver.authorize(),
  async (_, ctx) => {
    const projects = await db.project.findMany({
      where: {
        organizationId: ctx.session.orgId,
      },
      include: {
        createdBy: true,
        _count: {
          select: { maps: true }, // Count maps in each project
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  }
);
```

**New File:** `apps/fullstack/app/projects/queries/getProject.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { GetProject } from "../validations";

export default resolver.pipe(
  resolver.zod(GetProject),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const project = await db.project.findFirst({
      where: {
        id,
        organizationId: ctx.session.orgId,
      },
      include: {
        createdBy: true,
        maps: {
          include: {
            createdBy: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) throw new Error("Project not found");

    return project;
  }
);
```

---

### 6. Create Project Route

**New File:** `apps/fullstack/pages/project/[projectId].tsx`

This displays a **project dashboard/overview**. For the MVP, it shows maps (the only child entity that exists), but it's designed to be extensible for future additions (analyses, documents, etc.).

```typescript
import { gSSP } from "app/blitz-server";
import { getSession } from "@blitzjs/auth";
import { BlitzPage, Routes, useParam } from "@blitzjs/next";
import { Suspense } from "react";
import Layout from "app/core/layouts/Layout";
import { useQuery } from "@blitzjs/rpc";
import getProject from "app/projects/queries/getProject";

function ProjectDetail() {
  const projectId = useParam("projectId", "string")!;
  const [project] = useQuery(getProject, { id: projectId });

  return (
    <div className="p-8">
      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{project.description}</p>
      </div>

      {/* Project Dashboard - designed to be extensible */}
      <div className="space-y-8">
        {/* Maps Section - First child entity */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Maps</h2>
            <span className="text-sm text-gray-500">{project.maps.length} maps</span>
          </div>
          <div className="grid gap-4">
            {project.maps.length === 0 ? (
              <p className="text-gray-500 text-sm">No maps yet. Create one to get started.</p>
            ) : (
              project.maps.map((map) => (
                <div key={map.id} className="border rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <a
                    href={Routes.PersistedMap({ wrappedFeatureCollectionId: map.id })}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {map.name}
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {new Date(map.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Future sections can be added here:
         * - Analyses Section (SS4A analysis results, etc.)
         * - Documents Section (generated reports, PDFs, etc.)
         * - Settings Section (project configuration)
         * - Team Section (collaborators, permissions)
         */}
      </div>
    </div>
  );
}

const PersistedProject: BlitzPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectDetail />
    </Suspense>
  );
};

PersistedProject.authenticate = { redirectTo: Routes.SigninPage().pathname };
PersistedProject.getLayout = (page) => <Layout title="Project">{page}</Layout>;

export const getServerSideProps = gSSP(async ({ req, res }) => {
  const session = await getSession(req, res);
  if (!session.userId) {
    return {
      redirect: {
        destination: Routes.SigninPage().pathname,
        permanent: false,
      },
    };
  }
  return { props: {} };
});

export default PersistedProject;
```

**What this creates:**
- Route: `/project/[projectId]` → `Routes.PersistedProject({ projectId })`
- Displays project dashboard with extensible sections
- MVP shows Maps section (can add Analyses, Documents, etc. later)
- Maps link to `/map/[id]` (the existing map editor)

**Future expansion:**
Add new sections as you create more data types:
- `<AnalysesSection />` - SS4A analysis results
- `<DocumentsSection />` - Generated reports and PDFs
- `<SettingsSection />` - Project configuration
- `<TeamSection />` - Collaborators and permissions

---

### 7. Update use_create_project Hook

**File:** `apps/fullstack/app/hooks/use_create_project.ts`

**Complete rewrite:**

```typescript
import { Routes } from "@blitzjs/next";
import { useMutation } from "@blitzjs/rpc";
import { UNTITLED } from "app/lib/constants";
import createProjectMutation from "app/projects/mutations/createProject";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useCreateProject() {
  const [createProject] = useMutation(createProjectMutation);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  return {
    createProject: useCallback(async () => {
      setIsSubmitting(true);
      await toast.promise(
        (async () => {
          try {
            const projectId = await createProject({
              name: UNTITLED,
              description: "",
            });
            await router.push(
              Routes.PersistedProject({ projectId })
            );
          } catch (e: any) {
            setIsSubmitting(false);
            throw e;
          }
        })(),
        {
          loading: "Creating project",
          success: "Created project",
          error: "Failed to create project",
        }
      );
    }, [router, createProject]),
    isSubmitting,
  };
}
```

---

### 8. Simplify create_project.tsx Component

**File:** `apps/fullstack/app/components/create_project.tsx`

**Simplify to just a button:**

```typescript
import { Button } from "app/components/elements";
import { useCreateProject } from "app/hooks/use_create_project";

export function CreateProject({ mini = false }: { mini?: boolean }) {
  const { createProject, isSubmitting } = useCreateProject();

  return (
    <Button variant="primary" disabled={isSubmitting} onClick={createProject}>
      New Project
    </Button>
  );
}
```

**Note:** Remove clipboard/dropdown functionality. Projects don't contain geodata directly - they're containers for maps.

---

### 9. Add View Switcher to Index Page

**File:** `apps/fullstack/pages/index.tsx`

Add a tab/dropdown switcher to toggle between Projects view and Maps view (extensible for future entity types).

```typescript
import { useState } from "react";
import { useQuery } from "@blitzjs/rpc";
import getProjects from "app/projects/queries/getProjects";
import { CreateProject } from "app/components/create_project";
import { CreateMap } from "app/components/create_map";
import { Routes } from "@blitzjs/next";
import Link from "next/link";

// View type for the switcher
type ViewType = "projects" | "maps";

function IndexContent() {
  const [currentView, setCurrentView] = useState<ViewType>("projects");
  const [projects] = useQuery(getProjects, {});

  return (
    <div className="p-8">
      {/* View Switcher - Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentView("projects")}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${currentView === "projects"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
                }
              `}
            >
              Projects
            </button>
            <button
              onClick={() => setCurrentView("maps")}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${currentView === "maps"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
                }
              `}
            >
              Maps
            </button>
            {/* Future tabs can be added here:
             * - Analyses
             * - Templates
             * - Documents
             */}
          </nav>
        </div>
      </div>

      {/* Content based on selected view */}
      {currentView === "projects" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Projects</h2>
            <CreateProject />
          </div>

          <div className="grid gap-4">
            {projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No projects yet. Create your first project to get started.</p>
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={Routes.PersistedProject({ projectId: project.id })}
                  className="border rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {project.description || "No description"}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-gray-500">
                    <span>{project._count.maps} {project._count.maps === 1 ? "map" : "maps"}</span>
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {currentView === "maps" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Maps</h2>
            <CreateMap />
          </div>

          {/* Reuse your existing maps list component here */}
          <div className="text-gray-500">
            <p>Your existing maps list component goes here...</p>
            {/* <WrappedFeatureCollectionList /> */}
          </div>
        </div>
      )}
    </div>
  );
}
```

**What this creates:**
- Tab-based view switcher (Projects / Maps / future tabs)
- Clean separation between different entity types
- Easy to extend with more tabs (Analyses, Templates, Documents, etc.)
- Better UX than showing everything at once

**Alternative: Dropdown Switcher**

If you prefer a dropdown instead of tabs:

```typescript
<select
  value={currentView}
  onChange={(e) => setCurrentView(e.target.value as ViewType)}
  className="border rounded px-4 py-2"
>
  <option value="projects">Projects</option>
  <option value="maps">Maps</option>
  {/* Future options: Analyses, Templates, Documents, etc. */}
</select>
```

**Recommendation:** Use **tabs** for better discoverability and cleaner UX. Dropdowns work well when you have many options (5+), but tabs are better for 2-4 main views.

---

### 10. Create Documentation Guide

**New File:** `docs/HOW_TO_ADD_NEW_MODEL.md`

```markdown
# How to Add a New Model to Planner

This guide documents the process for adding a completely new database model/entity to the Planner application, using the `Project` model as a reference implementation.

## Overview

Planner uses:
- **Blitz.js** for full-stack TypeScript framework
- **Prisma** for database ORM and migrations
- **Next.js** for file-based routing
- **Zod** for validation schemas

## Steps to Add a New Model

### 1. Database Schema (Prisma)

**File:** `apps/fullstack/db/schema.prisma`

Add your new model:

```prisma
model YourModel {
  id             String       @id @default(cuid())
  name           String       @default("Untitled")
  description    String       @default("")

  // Organization relationship (if needed)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId Int

  // Creator tracking
  createdBy      User?        @relation(fields: [createdById], references: [id])
  createdById    Int?

  // Timestamps
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Indexes
  @@index(fields: [organizationId])
  @@index(fields: [createdById])
}
```

**Update related models:**
- Add `yourModels YourModel[]` to `Organization` model
- Add `yourModels YourModel[]` to `User` model (if applicable)

**Run migration:**
```bash
npx prisma migrate dev --name add_your_model
```

### 2. Backend: Directory Structure

Create directory structure:
```
apps/fullstack/app/your-models/
├── mutations/
│   ├── createYourModel.ts
│   ├── updateYourModel.ts
│   └── deleteYourModel.ts
├── queries/
│   ├── getYourModels.ts
│   └── getYourModel.ts
└── validations.ts
```

### 3. Backend: Validation Schemas

**File:** `apps/fullstack/app/your-models/validations.ts`

```typescript
import { z } from "zod";
import { name } from "app/core/utils";

export const CreateYourModel = z.object({
  name,
  description: z.string().optional().default(""),
  // ... other fields
});

export const UpdateYourModel = z.object({
  id: z.string(),
  name: z.optional(name),
  description: z.optional(z.string()),
});

export const DeleteYourModel = z.object({
  id: z.string(),
});

export const GetYourModel = z.object({
  id: z.string(),
});
```

### 4. Backend: Mutations

**File:** `apps/fullstack/app/your-models/mutations/createYourModel.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { CreateYourModel } from "../validations";
import { nanoid } from "nanoid";

export default resolver.pipe(
  resolver.zod(CreateYourModel),
  resolver.authorize(),
  async (input, ctx) => {
    const yourModel = await db.yourModel.create({
      data: {
        id: nanoid(),
        ...input,
        organization: {
          connect: { id: ctx.session.orgId! },
        },
        createdBy: {
          connect: { id: ctx.session.userId },
        },
      },
    });

    return yourModel.id;
  }
);
```

Create similar files for `updateYourModel.ts` and `deleteYourModel.ts`.

### 5. Backend: Queries

**File:** `apps/fullstack/app/your-models/queries/getYourModels.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";

export default resolver.pipe(
  resolver.authorize(),
  async (_, ctx) => {
    const yourModels = await db.yourModel.findMany({
      where: {
        organizationId: ctx.session.orgId,
      },
      include: {
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return yourModels;
  }
);
```

**File:** `apps/fullstack/app/your-models/queries/getYourModel.ts`

```typescript
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { GetYourModel } from "../validations";

export default resolver.pipe(
  resolver.zod(GetYourModel),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const yourModel = await db.yourModel.findFirst({
      where: {
        id,
        organizationId: ctx.session.orgId,
      },
      include: {
        createdBy: true,
      },
    });

    if (!yourModel) throw new Error("Not found");

    return yourModel;
  }
);
```

### 6. Frontend: Route

**File:** `apps/fullstack/pages/your-model/[yourModelId].tsx`

```typescript
import { gSSP } from "app/blitz-server";
import { getSession } from "@blitzjs/auth";
import { BlitzPage, Routes, useParam } from "@blitzjs/next";
import { Suspense } from "react";
import Layout from "app/core/layouts/Layout";
import { useQuery } from "@blitzjs/rpc";
import getYourModel from "app/your-models/queries/getYourModel";

function YourModelDetail() {
  const yourModelId = useParam("yourModelId", "string")!;
  const [yourModel] = useQuery(getYourModel, { id: yourModelId });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{yourModel.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{yourModel.description}</p>
      {/* Add your content here */}
    </div>
  );
}

const PersistedYourModel: BlitzPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YourModelDetail />
    </Suspense>
  );
};

PersistedYourModel.authenticate = { redirectTo: Routes.SigninPage().pathname };
PersistedYourModel.getLayout = (page) => <Layout title="Your Model">{page}</Layout>;

export const getServerSideProps = gSSP(async ({ req, res }) => {
  const session = await getSession(req, res);
  if (!session.userId) {
    return {
      redirect: {
        destination: Routes.SigninPage().pathname,
        permanent: false,
      },
    };
  }
  return { props: {} };
});

export default PersistedYourModel;
```

**What this creates:**
- Route: `/your-model/[id]` → `Routes.PersistedYourModel({ yourModelId })`
- Blitz.js auto-generates the route helper from the file path

### 7. Frontend: Create Hook

**File:** `apps/fullstack/app/hooks/use_create_your_model.ts`

```typescript
import { Routes } from "@blitzjs/next";
import { useMutation } from "@blitzjs/rpc";
import createYourModelMutation from "app/your-models/mutations/createYourModel";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useCreateYourModel() {
  const [createYourModel] = useMutation(createYourModelMutation);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  return {
    createYourModel: useCallback(async () => {
      setIsSubmitting(true);
      await toast.promise(
        (async () => {
          try {
            const id = await createYourModel({
              name: "Untitled",
              description: "",
            });
            await router.push(
              Routes.PersistedYourModel({ yourModelId: id })
            );
          } catch (e: any) {
            setIsSubmitting(false);
            throw e;
          }
        })(),
        {
          loading: "Creating...",
          success: "Created!",
          error: "Failed to create",
        }
      );
    }, [router, createYourModel]),
    isSubmitting,
  };
}
```

### 8. Frontend: Create Component

**File:** `apps/fullstack/app/components/create_your_model.tsx`

```typescript
import { Button } from "app/components/elements";
import { useCreateYourModel } from "app/hooks/use_create_your_model";

export function CreateYourModel() {
  const { createYourModel, isSubmitting } = useCreateYourModel();

  return (
    <Button variant="primary" disabled={isSubmitting} onClick={createYourModel}>
      New Item
    </Button>
  );
}
```

### 9. Testing Checklist

- [ ] Migration runs successfully
- [ ] Can create new entity
- [ ] Entity appears in database (check Prisma Studio)
- [ ] Can query list of entities
- [ ] Can query single entity
- [ ] Can update entity
- [ ] Can delete entity
- [ ] Route navigation works
- [ ] TypeScript types are correct
- [ ] Authorization checks work (can't access other org's data)

## Key Patterns

### Blitz.js Routing

- File path determines route helper name
- `pages/foo/[barId].tsx` → `Routes.PersistedFoo({ barId })`
- Dynamic segments use `[paramName]` syntax
- Access params with `useParam("paramName", "string")`

### Prisma Patterns

- Use `@id @default(cuid())` for IDs
- Use `@default(now())` for timestamps
- Use `@relation` for foreign keys
- Add `@@index` for frequently queried fields

### Blitz Mutations/Queries

- Use `resolver.pipe()` to chain middleware
- Use `resolver.zod()` for validation
- Use `resolver.authorize()` to require auth
- Always verify organization ownership in mutations

### TypeScript

- Prisma auto-generates types after migration
- Import types from `@prisma/client`
- Use Zod schemas for input validation

## Reference Implementation

See the `Project` model (added in migration `add_project_model`) for a complete reference.

**Key files:**
- Schema: `apps/fullstack/db/schema.prisma` (Project model)
- Validations: `apps/fullstack/app/projects/validations.ts`
- Mutations: `apps/fullstack/app/projects/mutations/`
- Queries: `apps/fullstack/app/projects/queries/`
- Route: `apps/fullstack/pages/project/[projectId].tsx`
- Hook: `apps/fullstack/app/hooks/use_create_project.ts`
- Component: `apps/fullstack/app/components/create_project.tsx`
```

---

## Implementation Sequence

**Phase 1: Database**
1. ✅ Update schema.prisma (Project model, relationships)
2. ✅ Run migration
3. ✅ Verify in Prisma Studio

**Phase 2: Backend**
4. ✅ Create projects directory structure
5. ✅ Create validations.ts
6. ✅ Create mutations (create, update, delete)
7. ✅ Create queries (getProjects, getProject)
8. ✅ Test mutations/queries work

**Phase 3: Routing**
9. ✅ Create pages/project/[projectId].tsx
10. ✅ Verify Routes.PersistedProject() works

**Phase 4: Frontend**
11. ✅ Update use_create_project.ts hook
12. ✅ Simplify create_project.tsx component
13. ✅ Update index.tsx to show projects list

**Phase 5: Documentation**
14. ✅ Create HOW_TO_ADD_NEW_MODEL.md

**Phase 6: Testing**
15. ✅ Test creating projects
16. ✅ Test navigating to project detail page
17. ✅ Test projects list on index
18. ✅ Verify authorization (can't access other org's projects)

---

## Testing Checklist

**Database:**
- [ ] Migration runs successfully
- [ ] Project table exists in database
- [ ] Can create projects via Prisma Studio
- [ ] Foreign keys work (organization, user)
- [ ] WrappedFeatureCollection has optional projectId

**Backend:**
- [ ] Can create project via mutation
- [ ] Can query projects list
- [ ] Can query single project with maps
- [ ] Can update project
- [ ] Can delete project
- [ ] Authorization prevents cross-org access

**Routing:**
- [ ] `Routes.PersistedProject()` is available
- [ ] `/project/[id]` route loads correctly
- [ ] Dynamic route parameter works

**Frontend:**
- [ ] Can create new project → navigates to /project/[id]
- [ ] Project detail page shows name/description
- [ ] Projects appear in index page list
- [ ] Click project → navigates to detail page
- [ ] Map count displays correctly

---

## Key Files Summary

### New Files
- `apps/fullstack/db/schema.prisma` - Add Project model
- `apps/fullstack/app/projects/validations.ts` - Validation schemas
- `apps/fullstack/app/projects/mutations/createProject.ts` - Create mutation
- `apps/fullstack/app/projects/mutations/updateProject.ts` - Update mutation
- `apps/fullstack/app/projects/mutations/deleteProject.ts` - Delete mutation
- `apps/fullstack/app/projects/queries/getProjects.ts` - List query
- `apps/fullstack/app/projects/queries/getProject.ts` - Single query
- `apps/fullstack/pages/project/[projectId].tsx` - Project detail route
- `docs/HOW_TO_ADD_NEW_MODEL.md` - Documentation guide

### Modified Files
- `apps/fullstack/app/hooks/use_create_project.ts` - Update to use new mutation
- `apps/fullstack/app/components/create_project.tsx` - Simplify to button
- `apps/fullstack/pages/index.tsx` - Add projects list

---

## Future Enhancements

Once this foundation is in place:

1. **Add Maps to Projects** - Ability to create maps within a project context
2. **Project Settings** - Edit name, description, settings
3. **Project Sharing** - Access control for projects
4. **Project Templates** - Pre-configured project types (SS4A, etc.)
5. **Project Export** - Generate documents from project data
6. **Project Analytics** - Dashboard showing project statistics

---

## Summary

This implementation creates a completely separate `Project` model that serves as a container for Maps. The approach:

1. ✅ Clean separation of concerns (Projects ≠ Maps)
2. ✅ Follows Blitz.js patterns (mutations, queries, routes)
3. ✅ Scalable (easy to add project-specific features)
4. ✅ Type-safe (leverages Prisma and TypeScript)
5. ✅ Documented (comprehensive guide for future models)

Projects are containers that organize Maps, enabling project-specific features like SS4A analysis and document generation while keeping the map editing functionality separate.
