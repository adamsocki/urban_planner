# Claude Notes

## Learning & Development Approach

This project is a learning environment for TypeScript and modern web development. When Claude provides responses:

- **Explain the "why"** - Include reasoning for architectural and implementation decisions
- **Teach concepts** - Clarify TypeScript patterns, types, and design decisions used
- **Annotate changes** - Comment on non-obvious code and explain type choices
- **Share trade-offs** - Discuss why one approach was chosen over alternatives
- **Add code comments** - Include comments in application code explaining what's happening, why certain patterns are used, and how different pieces fit together

The goal is to build understanding alongside functionality. Code should be readable and educational, not just functional.

## Design Language & UI Consistency

All UI components follow a centralized design system documented in [`docs/DESIGN_LANGUAGE.md`](./docs/DESIGN_LANGUAGE.md).

- **Use existing components** - All styled components are in `apps/fullstack/app/components/elements.tsx`
- **Follow design tokens** - Colors, typography, sizing (B3Size), and variants (B3Variant) are consistent
- **Dark mode everywhere** - All components support dark mode via Tailwind's `dark:` prefix
- **Accessibility first** - Focus rings, keyboard navigation, semantic HTML are built-in

When building UI, check the design language guide for:
- Available components and their usage
- Design tokens and color palette
- Best practices for consistency
- Common patterns and examples

This ensures the application has a cohesive, professional appearance while maintaining educational clarity through code comments and patterns.

## Fullstack source

`apps/fullstack` is based on the Placemark fullstack app, vendored from:

- Repo: `https://github.com/placemark/placemark`
- Commit: `24fbf52aca8eea8eb742c2d9469886b8a9846e19` (2024-05-26)

## Local customization policy (Planner)

We keep Placemark code recognizable by putting custom work in a dedicated namespace:

- Routes: `apps/fullstack/pages/planner/*` → `/planner/*`
- Implementation: `apps/fullstack/app/planner/*`
- Default approach: copy the relevant Placemark page/component into `planner/`, then modify there.

See `docs/PLANNER_NAMESPACE.md`.

## Runbook

- Start everything (db + app + studio): `./docker/up.sh`
- App: `http://localhost:3000` (sign-in at `/signin`; `/login` is an alias)
- Prisma Studio: `http://localhost:5555`
