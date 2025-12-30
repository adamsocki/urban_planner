# Agent Guidance for Planner Project

This document provides guidance for AI agents (Claude, GPT, etc.) working with the Planner codebase.

## Quick Context

**What is this project?**
- AI-powered urban planning document generation platform
- MVP: SS4A (Safe Streets and Roads for All) plan generator
- Built on Placemark (TypeScript/Blitz.js/Next.js GIS platform)
- Goal: Automate 70-80% of $400k+ planning work through crash data analysis + LLM synthesis

**Key Documents:**
- [`docs/VISION.md`](./docs/VISION.md) - Comprehensive project vision, technical architecture, roadmap
- [`CLAUDE.md`](./CLAUDE.md) - Learning approach, design system, namespace conventions
- [`README.md`](./README.md) - Quick start and project overview
- [`docs/DESIGN_LANGUAGE.md`](./docs/DESIGN_LANGUAGE.md) - UI component library and design system

## Architecture Overview

### Codebase Structure

```
planner/
├── apps/fullstack/          # Main Blitz.js application (vendored from Placemark)
│   ├── pages/
│   │   └── planner/         # Custom routes → /planner/*
│   ├── app/
│   │   ├── components/
│   │   │   └── elements.tsx # All styled UI components
│   │   └── planner/         # Custom application code
│   ├── db/
│   │   └── schema.prisma    # Database schema
│   └── ...
├── docs/                    # Documentation
├── docker/                  # Docker setup
└── AGENTS.md               # This file
```

### Namespace Convention

**Critical:** Keep Placemark code recognizable by namespacing custom work:

- ✅ **Routes:** `pages/planner/*` → `/planner/*`
- ✅ **Implementation:** `app/planner/*`
- ✅ **Pattern:** Copy Placemark page/component into `planner/`, then modify

See [`docs/PLANNER_NAMESPACE.md`](./docs/PLANNER_NAMESPACE.md) for details.

## Working with This Codebase

### Before Starting Work

1. **Understand the goal** - Review [`docs/VISION.md`](./docs/VISION.md) for project context
2. **Check existing patterns** - Look for similar functionality in `apps/fullstack/app/planner/`
3. **Review design system** - Use components from `elements.tsx` (see [`docs/DESIGN_LANGUAGE.md`](./docs/DESIGN_LANGUAGE.md))
4. **Follow namespace rules** - Put custom work in `planner/` directory

### Code Style & Practices

**Learning Environment:**
- Explain architectural decisions in responses
- Add code comments explaining "why" not just "what"
- Teach TypeScript patterns and design choices
- Discuss trade-offs between approaches

**UI Development:**
- Use existing components from `apps/fullstack/app/components/elements.tsx`
- Follow design tokens (B3Size, B3Variant, color palette)
- Support dark mode via Tailwind's `dark:` prefix
- Ensure accessibility (focus rings, keyboard nav, semantic HTML)

**TypeScript Patterns:**
- Prefer explicit types over `any`
- Use Zod for validation schemas (Blitz.js convention)
- Follow existing patterns in similar files
- Comment on non-obvious type choices

### Common Workflows

#### Adding a New Feature Page

```typescript
// 1. Create route in pages/planner/
// pages/planner/my-feature.tsx
import { BlitzPage } from "@blitzjs/next"
import PlannerLayout from "app/planner/layouts/PlannerLayout"
import MyFeature from "app/planner/components/MyFeature"

const MyFeaturePage: BlitzPage = () => {
  return <MyFeature />
}

MyFeaturePage.getLayout = (page) => (
  <PlannerLayout title="My Feature">{page}</PlannerLayout>
)

export default MyFeaturePage

// 2. Implement in app/planner/components/
// app/planner/components/MyFeature.tsx
import { B3Button, B3Card } from "app/components/elements"

export default function MyFeature() {
  // Implementation using design system components
}
```

#### Adding Database Models

```prisma
// db/schema.prisma
// Add new models for SS4A/planning features
model Project {
  id          String   @id @default(cuid())
  name        String
  type        ProjectType
  // ... follow existing patterns
}
```

Then run:
```bash
pnpm prisma migrate dev --name add_project_model
```

#### Working with LLMs (Future)

When adding LLM integration:
- Use Claude API (Anthropic) for document synthesis
- Implement prompt engineering in dedicated modules
- Add RAG (Retrieval Augmented Generation) for planning domain knowledge
- Track token usage and costs
- Add validation and quality control

See [`docs/VISION.md`](./docs/VISION.md) Section 4.2 for detailed LLM architecture.

## MVP Development Phases

The project follows a 13-week MVP plan (see [`docs/VISION.md`](./docs/VISION.md) Section 6.1):

- **Phase 0 (Weeks 1-2):** Architecture & Setup
  - Database schema for SS4A
  - LLM integration setup
  - Choose analysis engine (Python vs TypeScript)
  - Choose document generation library

- **Phase 1 (Weeks 3-5):** Input Layer & Analysis
  - Project creation UI
  - Crash data upload & processing
  - Hotspot detection algorithms
  - Corridor analysis

- **Phase 2 (Weeks 6-10):** LLM Synthesis & Writing
  - Section-specific prompts
  - RAG pipeline
  - Review/edit UI

- **Phase 3 (Weeks 11-13):** Document Assembly & Export
  - Template engine
  - Visualization generation
  - PDF/Word export

## Key Technical Decisions Needed

Before implementing major features, these need resolution:

1. **Analysis Engine:** Python (better ML/spatial libs) vs TypeScript (single language)?
2. **Document Generation:** Docx library vs Pandoc vs LaTeX?
3. **LLM Provider:** Claude (primary) vs GPT-4 vs both?
4. **RAG Approach:** Vector DB vs simple embeddings?

Document decisions with rationale when making them.

## Common Patterns

### Authentication & Authorization

```typescript
// Blitz.js provides authentication out of the box
import { useSession } from "@blitzjs/auth"

export default function MyComponent() {
  const session = useSession()

  if (!session.userId) {
    // Handle unauthenticated state
  }
}
```

### Data Fetching

```typescript
// Use Blitz queries/mutations
import { useQuery, useMutation } from "@blitzjs/rpc"
import getProjects from "app/planner/queries/getProjects"

export default function ProjectList() {
  const [projects] = useQuery(getProjects, {})
  // ...
}
```

### Styling

```typescript
// Use Tailwind CSS with design system patterns
<B3Button
  variant="primary"
  size="md"
  className="additional-tailwind-classes"
>
  Action
</B3Button>
```

## Testing Approach

- Unit tests for business logic
- Integration tests for data workflows
- End-to-end tests for critical user flows
- Manual testing for LLM output quality

## Deployment

- Docker-based development (see `./docker/up.sh`)
- App: `http://localhost:3000`
- Prisma Studio: `http://localhost:5555`
- Environment variables in `.env.docker`

## Resources

- **Blitz.js Docs:** https://blitzjs.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/
- **Project Vision:** [`docs/VISION.md`](./docs/VISION.md)
- **Design System:** [`docs/DESIGN_LANGUAGE.md`](./docs/DESIGN_LANGUAGE.md)

## Working with Multiple Agents

When multiple agents collaborate on this codebase:

1. **Read context first** - Check `CLAUDE.md`, this file, and recent git commits
2. **Communicate scope** - Clearly state what you're working on
3. **Avoid conflicts** - Work in separate namespaces when possible
4. **Document decisions** - Add comments and update docs for future agents
5. **Follow conventions** - Consistency matters more than individual preferences

## Questions & Clarifications

If you're unsure about:
- **Architecture decisions** → Ask user, document answer in vision doc
- **Design patterns** → Check existing similar code first
- **Scope/priorities** → Refer to vision doc roadmap or ask user
- **Technical approach** → Consider trade-offs, explain options to user

---

**Remember:** This is a project being developed to be a business application but also will allow for the developer to learn TypeScript and modern web development. Code should be clear, well-commented, and educational, not just operational. When you make changes, explain the reasoning behind them. Documentation is key.
