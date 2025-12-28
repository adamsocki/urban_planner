# Planner namespacing (how we customize Placemark)

This repo uses Placemark’s fullstack app as an upstream-vendored base. To keep upstream updates easy and keep “what’s ours” obvious, we put custom work in a dedicated `planner/` namespace.

## Why we do this

- **Easier upstream updates**: fewer conflicts when pulling future Placemark changes.
- **Clear ownership**: it’s obvious which code is “Planner” vs “Placemark”.
- **Safer experimentation**: you can change Planner UI/UX without worrying about breaking upstream behavior.

## Folder conventions

### Routes (URLs)

Next.js/Blitz “pages router” maps files to URLs:

- `apps/fullstack/pages/planner/signin.tsx` → `/planner/signin`
- `apps/fullstack/pages/planner/about.tsx` → `/planner/about`

### Planner implementation code

Planner-only code lives under:

- `apps/fullstack/app/planner/`
  - `auth/components/*` (Planner versions of auth UI)
  - `components/*` (Planner-only UI helpers)
  - `layouts/*` (Planner layouts, which decide header/footer/branding)
  - future: `projects/*`, `modules/*`, `documents/*`, etc.

## “Copy-then-edit” workflow

When you want to customize something that already exists in Placemark:

1. **Duplicate the entry route** into `pages/planner/...` (keep the original route intact).
2. **Duplicate the implementation** into `app/planner/...` *only if you need to change it*.
3. Update the Planner page to import from `app/planner/...`.

Example in this repo:

- Planner sign-in route: `apps/fullstack/pages/planner/signin.tsx`
- Planner sign-in form: `apps/fullstack/app/planner/auth/components/SigninForm.tsx`
- Planner layout + branding: `apps/fullstack/app/planner/layouts/standalone_form_layout.tsx`
- Planner header: `apps/fullstack/app/planner/components/minimal_header.tsx`

## When it’s OK to change upstream files

Try to avoid it. If a change benefits both Placemark and Planner (bug fix, infra fix, Docker/dev ergonomics), it can be acceptable — but keep the diff small and document the rationale in PRs/notes.
