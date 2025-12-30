# Project Model Implementation Progress Guide

**Reference Plan**: [ADD_PROJECT_MODEL_PLAN.md](./ADD_PROJECT_MODEL_PLAN.md)

**Goal**: Add a separate `Project` model as a container for Maps, enabling project-specific functionality like SS4A analysis and document generation.

---

## 📊 Overall Progress

**Current Phase**: 🔴 Not Started

- [ ] Phase 1: Database Schema ⏸️
- [ ] Phase 2: Backend (Validations, Mutations, Queries) ⏸️
- [ ] Phase 3: Routing ⏸️
- [ ] Phase 4: Frontend Components ⏸️
- [ ] Phase 5: Integration & Polish ⏸️
- [ ] Phase 6: Testing & Verification ⏸️

**Estimated Completion**: 0% (0/6 phases)

---

## 🎯 Current Step

**Next Action**: Start Phase 1 - Database Schema Changes

**Quick Start Command**:
```bash
# Open the schema file
code apps/fullstack/db/schema.prisma
```

---

## Phase 1: Database Schema Changes

**Goal**: Add Project model and update relationships in Prisma schema

### Step 1.1: Add Project Model
- [ ] Open `apps/fullstack/db/schema.prisma`
- [ ] Locate the `WrappedFeatureCollection` model (around line 160-194)
- [ ] Add the Project model **after** `WrappedFeatureCollection` (see plan lines 30-53)
- [ ] Verify all fields are present:
  - [ ] `id` (String, @id, @default(cuid()))
  - [ ] `name` (String, default "Untitled Project")
  - [ ] `description` (String, default "")
  - [ ] `organization` relationship
  - [ ] `organizationId` (Int)
  - [ ] `createdBy` relationship
  - [ ] `createdById` (Int?)
  - [ ] `createdAt` (DateTime, @default(now()))
  - [ ] `updatedAt` (DateTime, @updatedAt)
  - [ ] `maps` relationship (WrappedFeatureCollection[])
  - [ ] Indexes for organizationId and createdById

### Step 1.2: Update WrappedFeatureCollection Model
- [ ] Find the `WrappedFeatureCollection` model
- [ ] Add optional project relationship fields (see plan lines 58-72):
  - [ ] `project` (Project?, relation with projectId)
  - [ ] `projectId` (String?, nullable)
  - [ ] `@@index([projectId])` to indexes section

### Step 1.3: Update Organization Model
- [ ] Find the `Organization` model
- [ ] Add `projects Project[]` to the model (see plan lines 78-84)
- [ ] Verify it's added alongside `wrappedFeatureCollections`

### Step 1.4: Update User Model
- [ ] Find the `User` model
- [ ] Add `projects Project[]` to the model (see plan lines 90-96)
- [ ] Verify it's added alongside `wrappedFeatureCollections`

### Step 1.5: Run Migration
```bash
# Generate and apply migration
npx prisma migrate dev --name add_project_model

# Expected output: Migration successful, database updated
```

**Checklist**:
- [ ] Migration created successfully (no errors)
- [ ] Migration applied to database
- [ ] Check migration file in `apps/fullstack/db/migrations/`

### Step 1.6: Verify in Prisma Studio
```bash
# Open Prisma Studio (or use existing at localhost:5555)
npx prisma studio
```

**Verification**:
- [ ] `Project` table exists
- [ ] `Project` table has all expected columns
- [ ] `WrappedFeatureCollection` has `projectId` column (nullable)
- [ ] Relationships appear correct

**Common Issues**:
- ❌ **"Field already exists"**: Check if you've run this before
- ❌ **"Relation error"**: Verify both sides of relation are defined
- ❌ **"Index error"**: Check @@index syntax matches other models

---

## Phase 2: Backend Implementation

**Goal**: Create validations, mutations, and queries for Project model

### Step 2.1: Create Directory Structure
```bash
# Create the projects directory structure
mkdir -p apps/fullstack/app/projects/mutations
mkdir -p apps/fullstack/app/projects/queries
```

**Verification**:
- [ ] `apps/fullstack/app/projects/` exists
- [ ] `apps/fullstack/app/projects/mutations/` exists
- [ ] `apps/fullstack/app/projects/queries/` exists

### Step 2.2: Create Validation Schemas
- [ ] Create `apps/fullstack/app/projects/validations.ts`
- [ ] Add imports: `z` from "zod", `name` from "app/core/utils"
- [ ] Add validation schemas (see plan lines 134-154):
  - [ ] `CreateProject` schema
  - [ ] `UpdateProject` schema
  - [ ] `DeleteProject` schema
  - [ ] `GetProject` schema

**Verification**:
- [ ] File compiles without errors
- [ ] All schemas export correctly

### Step 2.3: Create Mutations

#### Create createProject.ts
- [ ] Create `apps/fullstack/app/projects/mutations/createProject.ts`
- [ ] Implement resolver (see plan lines 163-189)
- [ ] Import: `resolver`, `db`, `CreateProject`, `nanoid`
- [ ] Pipe: zod validation → authorize → create logic
- [ ] Return: `project.id`

**Key Points**:
- Uses `nanoid()` for ID generation
- Connects to organization via `ctx.session.orgId`
- Connects to creator via `ctx.session.userId`

#### Create updateProject.ts
- [ ] Create `apps/fullstack/app/projects/mutations/updateProject.ts`
- [ ] Implement resolver (see plan lines 193-217)
- [ ] Verify project belongs to user's organization before updating
- [ ] Throw error if project not found

#### Create deleteProject.ts
- [ ] Create `apps/fullstack/app/projects/mutations/deleteProject.ts`
- [ ] Implement resolver (see plan lines 221-244)
- [ ] Verify project belongs to user's organization before deleting
- [ ] Throw error if project not found

**Verification**:
- [ ] All three mutation files created
- [ ] No TypeScript errors
- [ ] All imports resolve correctly

### Step 2.4: Create Queries

#### Create getProjects.ts
- [ ] Create `apps/fullstack/app/projects/queries/getProjects.ts`
- [ ] Implement resolver (see plan lines 253-275)
- [ ] Filter by organizationId
- [ ] Include: `createdBy`, `_count.maps`
- [ ] Order by: `createdAt desc`

#### Create getProject.ts
- [ ] Create `apps/fullstack/app/projects/queries/getProject.ts`
- [ ] Implement resolver (see plan lines 280-309)
- [ ] Filter by id AND organizationId (security)
- [ ] Include: `createdBy`, `maps` with their `createdBy`
- [ ] Order maps by: `createdAt desc`
- [ ] Throw error if not found

**Verification**:
- [ ] Both query files created
- [ ] No TypeScript errors
- [ ] All imports resolve correctly

**Test Backend (Optional)**:
```bash
# Start dev server and test in browser console
npm run dev

# In browser console (after signing in):
# await fetch('/api/rpc/getProjects', { method: 'POST' }).then(r => r.json())
```

---

## Phase 3: Routing

**Goal**: Create project detail page route

### Step 3.1: Create Project Route File
```bash
# Create pages directory if needed
mkdir -p apps/fullstack/pages/project
```

- [ ] Create `apps/fullstack/pages/project/[projectId].tsx`
- [ ] Copy template from plan (lines 321-405)

### Step 3.2: Implement Route Components

**Add imports**:
- [ ] `gSSP` from "app/blitz-server"
- [ ] `getSession` from "@blitzjs/auth"
- [ ] `BlitzPage`, `Routes`, `useParam` from "@blitzjs/next"
- [ ] `Suspense` from "react"
- [ ] `Layout` from "app/core/layouts/Layout"
- [ ] `useQuery` from "@blitzjs/rpc"
- [ ] `getProject` from "app/projects/queries/getProject"

**Implement ProjectDetail component**:
- [ ] Get projectId from URL params
- [ ] Query project data with `useQuery`
- [ ] Render project header (name, description)
- [ ] Render maps section with count
- [ ] Map each map to a clickable card
- [ ] Link to existing map route: `Routes.PersistedMap()`

**Implement PersistedProject page**:
- [ ] Wrap ProjectDetail in Suspense
- [ ] Add authentication requirement
- [ ] Add Layout wrapper
- [ ] Implement getServerSideProps with auth redirect

**Verification**:
- [ ] File compiles without TypeScript errors
- [ ] No missing imports
- [ ] Route helper `Routes.PersistedProject({ projectId })` should be available after next restart

**Test Route**:
```bash
# Restart dev server to register new route
# (Ctrl+C in terminal, then npm run dev again)

# After creating a project, verify URL works:
# http://localhost:3000/project/[some-project-id]
```

---

## Phase 4: Frontend Components

**Goal**: Create hook and component for project creation, update index page

### Step 4.1: Update useCreateProject Hook

- [ ] Open/Create `apps/fullstack/app/hooks/use_create_project.ts`
- [ ] Replace entire contents with new implementation (plan lines 430-471)
- [ ] Import: `Routes`, `useMutation`, `UNTITLED`, `createProjectMutation`, `useRouter`, `useState`, `useCallback`, `toast`
- [ ] Return: `createProject` callback and `isSubmitting` state
- [ ] Use `toast.promise` for loading/success/error states
- [ ] Navigate to `Routes.PersistedProject({ projectId })` on success

**Key Points**:
- Uses `UNTITLED` constant from constants
- Creates project with empty description
- Handles loading state properly
- Navigates on success

**Verification**:
- [ ] No TypeScript errors
- [ ] All imports resolve
- [ ] Hook compiles correctly

### Step 4.2: Simplify CreateProject Component

- [ ] Open/Create `apps/fullstack/app/components/create_project.tsx`
- [ ] Replace with simplified button-only version (plan lines 482-494)
- [ ] Remove clipboard/dropdown functionality (not needed)
- [ ] Import: `Button`, `useCreateProject`
- [ ] Accept `mini` prop (for future use)
- [ ] Render single button: "New Project"

**Verification**:
- [ ] Component renders a button
- [ ] No TypeScript errors
- [ ] Uses design system Button component

### Step 4.3: Add Projects to Index Page

- [ ] Open `apps/fullstack/pages/index.tsx`
- [ ] Add view switcher state: `useState<ViewType>("projects")`
- [ ] Import `getProjects` query
- [ ] Import `CreateProject` component
- [ ] Add tab navigation (plan lines 525-558)
- [ ] Add Projects view section (plan lines 562-593)
- [ ] Add Maps view section (plan lines 596-609)

**View Switcher**:
- [ ] Tab-based UI (not dropdown)
- [ ] Two tabs: "Projects" and "Maps"
- [ ] Active tab styling with blue underline
- [ ] Comment for future tabs (Analyses, Templates, Documents)

**Projects View**:
- [ ] Header with "Projects" title
- [ ] CreateProject button in header
- [ ] Empty state message
- [ ] Project cards with:
  - [ ] Project name (clickable link)
  - [ ] Description
  - [ ] Map count
  - [ ] Created date
- [ ] Hover effects

**Maps View**:
- [ ] Header with "Maps" title
- [ ] Placeholder for existing maps list component
- [ ] Comment showing where existing code goes

**Verification**:
- [ ] Tabs switch between views
- [ ] Projects query loads
- [ ] CreateProject button appears
- [ ] Can navigate to project detail

---

## Phase 5: Integration & Polish

**Goal**: Ensure everything works together smoothly

### Step 5.1: Test Full Flow
- [ ] Start app: `./docker/up.sh`
- [ ] Sign in at http://localhost:3000/signin
- [ ] Navigate to index page
- [ ] Click "Projects" tab
- [ ] Click "New Project" button
- [ ] Verify redirect to `/project/[id]`
- [ ] Verify project appears with "Untitled Project" name
- [ ] Go back to index
- [ ] Verify project appears in list

### Step 5.2: Check TypeScript
```bash
# Run TypeScript check
cd apps/fullstack
npm run type-check

# Should complete with no errors
```

- [ ] No type errors
- [ ] All imports resolve
- [ ] All Routes helpers work

### Step 5.3: Verify Dark Mode
- [ ] Toggle dark mode in app
- [ ] Check project list styling
- [ ] Check project detail page styling
- [ ] Check tab navigation styling
- [ ] Ensure all text is readable
- [ ] Verify hover states work

### Step 5.4: Add Type Safety (Optional Enhancement)
- [ ] Check if Prisma client types are current
- [ ] Verify zod schemas match Prisma types
- [ ] Ensure all queries have proper typing

---

## Phase 6: Testing & Verification

**Goal**: Comprehensive testing of all functionality

### Database Testing
- [ ] Open Prisma Studio (http://localhost:5555)
- [ ] Navigate to Project table
- [ ] Verify columns match schema
- [ ] Create a test project manually
- [ ] Verify foreign keys work
- [ ] Check organization relationship
- [ ] Check user relationship
- [ ] Delete test project

### Backend Testing

**Mutations**:
- [ ] Create project via UI → check database
- [ ] Update project name (implement UI or test manually)
- [ ] Delete project (implement UI or test manually)
- [ ] Try to access another org's project (should fail)

**Queries**:
- [ ] List projects → verify only current org's projects
- [ ] Get single project → verify data includes maps
- [ ] Verify authorization (try accessing non-existent project)

### Frontend Testing

**Routing**:
- [ ] `/project/[id]` route works
- [ ] `Routes.PersistedProject({ projectId })` generates correct URL
- [ ] Dynamic parameter extracted correctly
- [ ] Auth redirect works (sign out, try to access project)

**UI Components**:
- [ ] "New Project" button works
- [ ] Loading state shows during creation
- [ ] Success toast appears
- [ ] Error toast appears on failure (test by breaking backend)
- [ ] Tab switcher toggles views
- [ ] Project cards link correctly
- [ ] Empty state shows when no projects

**Data Display**:
- [ ] Project name displays
- [ ] Description displays (even if empty)
- [ ] Map count is accurate
- [ ] Created date formats correctly
- [ ] Maps list displays on project page

### Edge Cases
- [ ] Project with no maps (should show "No maps yet")
- [ ] Project with many maps (check layout)
- [ ] Very long project name (should not break layout)
- [ ] Very long description (should not break layout)
- [ ] Special characters in name/description

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

### Authorization Testing
```bash
# Test cross-organization security
# 1. Create project in org A
# 2. Sign in as user in org B
# 3. Try to access project from org A by URL
# Expected: Error or redirect
```

- [ ] Cannot access other org's projects
- [ ] Cannot update other org's projects
- [ ] Cannot delete other org's projects
- [ ] Can only see own org's projects in list

---

## ✅ Completion Checklist

### Required for MVP
- [ ] Database migration successful
- [ ] All backend files created and working
- [ ] Project detail route working
- [ ] Can create projects
- [ ] Projects appear in index
- [ ] Can navigate to project detail
- [ ] Maps display on project page
- [ ] Authorization working
- [ ] No TypeScript errors
- [ ] Dark mode working

### Optional Enhancements (Post-MVP)
- [ ] Edit project name/description inline
- [ ] Delete project with confirmation modal
- [ ] Add maps to project from project page
- [ ] Remove maps from project
- [ ] Search/filter projects
- [ ] Sort projects (by name, date, etc.)
- [ ] Project templates
- [ ] Bulk actions

---

## 📝 Documentation

### Files Created
```
New Files:
✓ apps/fullstack/db/migrations/[timestamp]_add_project_model/
✓ apps/fullstack/app/projects/validations.ts
✓ apps/fullstack/app/projects/mutations/createProject.ts
✓ apps/fullstack/app/projects/mutations/updateProject.ts
✓ apps/fullstack/app/projects/mutations/deleteProject.ts
✓ apps/fullstack/app/projects/queries/getProjects.ts
✓ apps/fullstack/app/projects/queries/getProject.ts
✓ apps/fullstack/pages/project/[projectId].tsx
✓ docs/HOW_TO_ADD_NEW_MODEL.md (see plan line 642)

Modified Files:
✓ apps/fullstack/db/schema.prisma
✓ apps/fullstack/app/hooks/use_create_project.ts
✓ apps/fullstack/app/components/create_project.tsx
✓ apps/fullstack/pages/index.tsx
```

### Update Documentation
- [ ] Create `docs/HOW_TO_ADD_NEW_MODEL.md` (use template from plan lines 642-1008)
- [ ] Update main README if needed
- [ ] Add migration notes
- [ ] Document any deviations from plan

---

## 🐛 Troubleshooting Guide

### "Module not found" errors
**Solution**:
```bash
# Restart TypeScript server in VS Code
# Or restart dev server
npm run dev
```

### "prisma.project is not a function"
**Solution**: Regenerate Prisma client
```bash
npx prisma generate
```

### Route helper not available
**Solution**: Restart Next.js dev server (routes are generated at startup)
```bash
# Ctrl+C then
npm run dev
```

### TypeScript errors about missing types
**Solution**:
```bash
# Regenerate Prisma types
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Migration fails
**Solution**:
- Check for syntax errors in schema.prisma
- Ensure database is running
- Check migration doesn't conflict with existing data
- Try: `npx prisma migrate reset` (⚠️ destroys all data)

### Can't access project (404 or error)
**Solution**:
- Verify project exists in database (Prisma Studio)
- Check project belongs to your organization
- Verify Routes.PersistedProject generates correct URL
- Check browser console for errors

---

## 📊 Progress Updates

### Session 1: [Date]
**Completed**:
- [ ] List what you completed

**Blocked on**:
- [ ] List any blockers

**Next session**:
- [ ] List what to do next

### Session 2: [Date]
**Completed**:
- [ ] ...

**Blocked on**:
- [ ] ...

**Next session**:
- [ ] ...

---

## 🎉 Success Criteria

You're done when you can:
1. ✅ Click "New Project" and get redirected to a project page
2. ✅ See the project in the index page list
3. ✅ Click a project to view its details
4. ✅ See maps count on the project page
5. ✅ Navigate from project page to a map
6. ✅ Switch between Projects and Maps tabs
7. ✅ All in dark mode with proper styling
8. ✅ No console errors or TypeScript errors

**Final Verification**: Can you complete this user flow end-to-end?
1. Sign in
2. Go to index page
3. Click "New Project"
4. View project detail page
5. Go back to index
6. See your project in the list
7. Switch to "Maps" tab
8. Switch back to "Projects" tab
9. Click your project again
10. Everything works smoothly

If yes, congratulations! 🎊 The Project Model is successfully implemented.

---

**Next Steps After Completion**:
- Review [VISION.md](./VISION.md) for next features to implement
- Consider adding project edit/delete functionality
- Plan for adding maps to projects
- Start thinking about SS4A analysis integration
