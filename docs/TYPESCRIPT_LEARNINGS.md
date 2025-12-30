# TypeScript Learnings

A collection of TypeScript patterns, techniques, and concepts learned while building this application. Each entry explains the "why" behind the code, not just the "what."

---

## Table of Contents

- [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
  - [Queries vs Mutations in SSR Context](#queries-vs-mutations-in-ssr-context)
  - [Suspense Boundaries and Dynamic Server Usage](#suspense-boundaries-and-dynamic-server-usage)
  - [Blitz.js Route Generation](#blitzjs-route-generation)
- [Type Utilities & React Props](#type-utilities--react-props)
  - [React.HTMLAttributes for SVG Components](#reacthtmlattributes-for-svg-components)
- [Const Assertions](#const-assertions)
  - [Sharing Props with `as const`](#sharing-props-with-as-const)
- [SVG Composition & Animation](#svg-composition--animation)
  - [Urban Nodes Network Icon](#urban-nodes-network-icon)

---

## Server-Side Rendering (SSR)

### Queries vs Mutations in SSR Context

**Problem Encountered**: `DYNAMIC_SERVER_USAGE` error when loading the index page after adding theme preference support.

**Location**: [`apps/fullstack/app/core/layouts/authenticated_page_layout.tsx`](../apps/fullstack/app/core/layouts/authenticated_page_layout.tsx), [`apps/fullstack/app/components/footer.tsx`](../apps/fullstack/app/components/footer.tsx)

**The Bug:**
```typescript
// ❌ BROKEN - Causes DYNAMIC_SERVER_USAGE error
const AuthenticatedPageLayout = ({ children }) => {
  const { user, setUser } = useUpdateUser(); // ⚠️ useQuery outside Suspense!

  return (
    <Provider>
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
      <Footer user={user} onThemePreferenceChange={(pref) => setUser({ themePreference: pref })} />
    </Provider>
  );
};

// Inside useUpdateUser hook:
export function useUpdateUser() {
  const [user] = useQuery(getCurrentUser, null); // ⚠️ Fetches from DB during SSR!
  // ...
}
```

**What was happening:**

1. Next.js tries to server-render the page
2. React starts rendering `AuthenticatedPageLayout` component
3. `useUpdateUser()` is called **outside any Suspense boundary**
4. This hook calls `useQuery(getCurrentUser)` which needs to:
   - Access session cookies from the request
   - Query the database for user data
5. This is "dynamic server usage" - it depends on runtime request data
6. Next.js/React can't handle this outside a Suspense boundary during SSR
7. Error: `DYNAMIC_SERVER_USAGE` → page returns 500

**The Fix:**
```typescript
// ✅ FIXED - Mutation is safe during SSR
export function Footer({ maxWidthClassName }: { maxWidthClassName: string }) {
  // useMutation doesn't fetch - just prepares a function to call later
  const [updateUserOptionsMutation] = useMutation(updateUserOptions);

  return (
    <footer className={maxWidthClassName}>
      <ThemeSwitcher
        onChange={(themePreference) => {
          // Mutation only runs when user clicks - not during SSR
          void updateUserOptionsMutation({ themePreference });
        }}
      />
    </footer>
  );
}
```

**Why this works:**

| Hook Type | SSR Behavior | Safe Outside Suspense? | Use Case |
|-----------|--------------|------------------------|----------|
| `useQuery` | Tries to fetch data immediately | ❌ No - needs Suspense | Reading data from server |
| `useMutation` | Just prepares a function | ✅ Yes - no side effects | Writing data to server |

**Key Insight: Queries vs Mutations**

```typescript
// useQuery = "I need data NOW"
const [data] = useQuery(getData, params);
// ↑ Executes immediately when component renders
// During SSR: tries to access cookies/database → ERROR

// useMutation = "I might need to save data LATER"
const [saveMutation] = useMutation(saveData);
// ↑ Just creates a function, doesn't execute anything
// During SSR: perfectly safe, no side effects
// Later: onClick={() => saveMutation(data)} ← runs on user interaction
```

**Mental Model:**
- **Queries are eager**: They fetch when the component renders
- **Mutations are lazy**: They only run when you explicitly call them
- During SSR, "eager" operations outside Suspense cause errors

---

### Suspense Boundaries and Dynamic Server Usage

**Location**: [`apps/fullstack/app/core/layouts/authenticated_page_layout.tsx`](../apps/fullstack/app/core/layouts/authenticated_page_layout.tsx)

**Understanding Suspense as "Loading Zones":**

```typescript
const AuthenticatedPageLayout = () => {
  // ⚠️ OUTSIDE SUSPENSE - Must be synchronously available during SSR
  const syncData = useSomeHook(); // ← Must not access cookies/DB/dynamic data

  return (
    <div>
      {/* ✅ INSIDE SUSPENSE - Can fetch data asynchronously */}
      <Suspense fallback={<div>Loading...</div>}>
        <ComponentThatUsesQuery /> {/* ← Safe to use useQuery here */}
      </Suspense>

      <Footer data={syncData} /> {/* ← Uses data from outside Suspense */}
    </div>
  );
};
```

**Why Suspense boundaries matter:**

1. **Outside Suspense**: Code runs during server-side rendering
   - Must complete synchronously
   - Cannot access request-specific data (cookies, headers)
   - Cannot make database queries
   - Think: "static" or "universal" code

2. **Inside Suspense**: Code can defer/suspend
   - Can access request data
   - Can make async database queries
   - Shows fallback while loading
   - Think: "dynamic" or "personalized" code

**The Architecture We Ended Up With:**

```typescript
// Layout: No queries, stays lightweight
const AuthenticatedPageLayout = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        {children} {/* Pages can use queries */}
      </Suspense>
      <Footer /> {/* No query needed */}
      <DarkModeEffect /> {/* Has its own Suspense wrapper inside */}
    </div>
  );
};

// DarkModeEffect: Query wrapped in Suspense
export const DarkModeEffect = memo(function DarkModeEffect() {
  return (
    <Suspense fallback={null}>
      <DarkModeEffectInner /> {/* ← useQuery is safe here */}
    </Suspense>
  );
});

// Footer: Only needs mutations, no queries
export function Footer() {
  const [updateUserOptions] = useMutation(updateUserOptions);
  return <ThemeSwitcher onChange={(pref) => updateUserOptions({ themePreference: pref })} />;
}
```

**Why this architecture works:**

- **Progressive loading**: Static parts render immediately, dynamic parts load in background
- **No flash of wrong content**: Theme sync happens via `DarkModeEffect` which has Suspense
- **Clean separation**: Reading data (queries) vs writing data (mutations) are separate concerns

**Pattern to remember:**
- Queries (reading data) → need Suspense boundary during SSR
- Mutations (writing data) → safe anywhere, they're just functions
- "Can I call this during SSR?" → If it touches cookies/DB/request data, it needs Suspense

---

### Blitz.js Route Generation

**Problem Encountered**: `Routes.PlacemarkIndex is not a function`

**What happened:**

Blitz.js auto-generates route helper functions from your page components:

```typescript
// File: pages/index.tsx
const PlacemarkIndex: BlitzPage = () => { /* ... */ };
export default PlacemarkIndex;

// Blitz auto-generates:
Routes.PlacemarkIndex() → "/"
Routes.PlacemarkIndex({ parent: "123" }) → "/?parent=123"
```

**The Bug:**

We had two files with the same component name:
- `pages/index.tsx` → exports `PlacemarkIndex`
- `pages/index_originial.tsx` → exports `PlacemarkIndex` (commented out, but file existed)

**Error from Next.js:**
```
The page component is named "PlacemarkIndex" on the following routes:
  /
  /index_originial

The page component must have a unique name across all routes
```

**Why this breaks route generation:**
- Blitz tries to create `Routes.PlacemarkIndex()`
- But which file should it point to? `index.tsx` or `index_originial.tsx`?
- Unable to resolve ambiguity → **doesn't generate the route helper at all**
- Code that calls `Routes.PlacemarkIndex()` → runtime error: "not a function"

**The Fix:**

Rename the backup file to a pattern Next.js ignores:

```bash
# ❌ Next.js processes these:
index_originial.tsx
index.backup.tsx

# ✅ Next.js ignores these:
index_reference.tsx.backup  # Double extension
index.tsx.bak
index.txt
```

**File patterns Next.js processes:**
- `.tsx` → TypeScript + JSX
- `.ts` → TypeScript
- `.jsx` → JavaScript + JSX
- `.js` → JavaScript

Everything else is ignored.

**Pattern to remember:**
1. Page component names must be **unique across all route files**
2. Blitz generates `Routes.ComponentName()` from your component's name
3. Use `.backup`, `.bak`, or move files outside `pages/` to keep them as reference
4. Duplicate names = no route generation = runtime errors

---

## Type Utilities & React Props

### React.HTMLAttributes for SVG Components

**Location**: [`apps/fullstack/app/components/elements.tsx:68`](../apps/fullstack/app/components/elements.tsx#L68)

```typescript
export function PlacemarkIcon({ className }: React.HTMLAttributes<SVGElement>) {
  // ...
}
```

**What's happening:**
- `React.HTMLAttributes<SVGElement>` is a built-in React type utility that provides all standard HTML/SVG attributes for an element
- By destructuring `{ className }`, we explicitly extract the one prop we care about
- TypeScript still knows the full type, so we get autocomplete and type checking for all SVG attributes

**Why this approach:**

1. **Type Safety**: TypeScript ensures only valid SVG attributes are passed
2. **Flexibility**: The component accepts any standard SVG prop (id, aria-*, data-*, etc.) even though we only use `className`
3. **IntelliSense**: IDEs provide autocomplete for all valid SVG attributes
4. **Future-proof**: If we later need to support onClick, onMouseEnter, etc., they're already typed

**Alternative approaches:**

```typescript
// ❌ Too restrictive - only allows className
function PlacemarkIcon({ className }: { className?: string }) {}

// ❌ Too permissive - allows anything, no type safety
function PlacemarkIcon(props: any) {}

// ✅ Just right - typed, extensible
function PlacemarkIcon({ className }: React.HTMLAttributes<SVGElement>) {}
```

**Pattern to remember**: Use `React.HTMLAttributes<T>` for components that wrap HTML/SVG elements and want to accept standard DOM props.

---

## Const Assertions

### Sharing Props with `as const`

**Location**: [`apps/fullstack/app/components/elements.tsx:69-73`](../apps/fullstack/app/components/elements.tsx#L69-L73)

```typescript
const circleAttrs = {
  r: "17.5",
  stroke: "currentColor",
  strokeWidth: "15",
} as const;
```

**What's happening:**
- `as const` is a TypeScript assertion that makes the object deeply readonly and narrows types to their literal values
- Without `as const`, TypeScript infers `{ r: string, stroke: string, strokeWidth: string }`
- With `as const`, TypeScript knows exactly: `{ readonly r: "17.5", readonly stroke: "currentColor", readonly strokeWidth: "15" }`

**Why this matters:**

1. **Prevents mutations**: The object is now immutable - trying to modify it will cause a compile error
2. **Literal types**: Each property has a specific literal type, not just `string`
3. **Better error messages**: TypeScript can give more specific errors if values don't match
4. **Optimization hint**: Signals to TypeScript (and readers) that this value never changes

**Example without `as const`:**

```typescript
// TypeScript infers: { r: string, stroke: string, strokeWidth: string }
const circleAttrs = {
  r: "17.5",
  stroke: "currentColor",
  strokeWidth: "15",
};

// This would be allowed (but probably wrong):
circleAttrs.r = "999";
```

**Example with `as const`:**

```typescript
const circleAttrs = {
  r: "17.5",
  stroke: "currentColor",
  strokeWidth: "15",
} as const;

// ✅ Spread it onto elements
<circle cx="75" cy="75" {...circleAttrs} />

// ❌ Compile error - cannot modify readonly property
circleAttrs.r = "999";
```

**When to use `as const`:**

- Configuration objects that never change
- Props that are spread to multiple elements (like our circle attributes)
- Enum-like constants
- Literal values you want to preserve as types

**Pattern to remember**: Use `as const` when you're defining constant values you'll reuse, especially when spreading them as props. It prevents bugs and gives better type inference.

---

## SVG Composition & Animation

### Urban Nodes Network Icon

**Location**: [`apps/fullstack/app/components/elements.tsx:68-171`](../apps/fullstack/app/components/elements.tsx#L68-L171)

This icon demonstrates SVG composition, animation choreography, and how design thinking translates into code. It represents an urban planning network with a central hub and satellite zones.

**Key Concepts:**

#### 1. SVG Rendering Order (Z-Index via Source Order)

```typescript
return (
  <svg>
    {/* Lines drawn FIRST - appear behind nodes */}
    <g stroke="currentColor" strokeWidth="8">
      <line x1="150" y1="150" x2="75" y2="75" />
      {/* ... more lines */}
    </g>

    {/* Nodes drawn SECOND - appear on top of lines */}
    <circle cx="75" cy="75" r="25" fill="currentColor" />
    {/* ... more circles */}
  </svg>
);
```

**Why this matters:**
- SVG has no z-index property - elements are painted in source order
- Later elements appear on top of earlier elements
- We draw connection lines first, then nodes, so nodes visually "connect" the lines
- This creates depth and clarity in the network visualization

#### 2. Using `<g>` for Grouping and Shared Attributes

```typescript
<g
  stroke="currentColor"
  strokeWidth="8"
  className="opacity-60 transition-opacity duration-300 group-hover:opacity-80"
>
  <line x1="150" y1="150" x2="75" y2="75" />
  <line x1="150" y1="150" x2="225" y2="75" />
  {/* All lines inherit stroke and strokeWidth */}
</g>
```

**What's happening:**
- `<g>` (group) element applies attributes to all children
- All lines inherit `stroke` and `strokeWidth` - DRY principle
- The entire group can be styled/animated together via className
- Children can still have individual attributes that override the group's

**Why use groups:**
- Reduces repetition - define shared attributes once
- Makes it easy to animate related elements together
- Creates semantic structure (these lines are conceptually related)
- Easier to maintain - change strokeWidth in one place

#### 3. Tailwind's `group` + `group-hover:` Pattern

```typescript
<svg
  className={clsx(
    className,
    "transition-all duration-300 ease-out",
    "hover:scale-105",
    "group"  // ← Marks this as a group parent
  )}
>
  {/* ... */}
  <circle
    className="transition-transform duration-600 group-hover:scale-125"
    //                                           ↑ Responds to parent hover
  />
</svg>
```

**How it works:**
- Adding `group` to a parent element marks it as the hover target
- Child elements use `group-hover:` to respond when the parent is hovered
- This allows complex coordinated animations without JavaScript
- Multiple children can have different `group-hover:` behaviors

**Why this approach:**
- **Declarative**: Animation logic is in the markup, not imperative JS
- **Performance**: CSS transitions are GPU-accelerated
- **Maintainable**: Easy to see what animates and how
- **Composable**: Mix group-hover with regular hover for layered effects

#### 4. Staggered Animation Timings

```typescript
<circle
  r="25"
  className="transition-transform duration-400 group-hover:scale-110"
/>
<circle
  r="22"
  className="transition-transform duration-450 group-hover:scale-110"
  //                              ↑ Slightly longer
/>
<circle
  r="20"
  className="transition-transform duration-500 group-hover:scale-110"
  //                              ↑ Even longer
/>
```

**Why stagger timings:**
- Creates a "ripple" or "cascade" effect
- Adds visual interest and polish
- Draws the eye through the composition
- Makes the animation feel organic, not mechanical
- Small variations (400ms, 450ms, 500ms) are subtle but effective

**Design principle**: The central hub (600ms, scale-125) has the longest duration and largest scale, reinforcing its importance in the hierarchy.

#### 5. Design Decisions Embedded in Code

**Hierarchical sizing:**
```typescript
// Central hub - most important
<circle cx="150" cy="150" r="35" />

// Satellite nodes - varying sizes suggest different zone types
<circle cx="75" cy="75" r="25" />    // Larger district
<circle cx="240" cy="180" r="20" />  // Smaller zone
```

**Why varying sizes:**
- Creates visual hierarchy (what's important)
- Suggests different types/scales of urban zones
- Breaks symmetry for more organic feel
- Mimics real urban planning where districts vary in size/importance

**Network topology:**
```typescript
// Hub-and-spoke: central node connects to all satellites
<line x1="150" y1="150" x2="75" y2="75" />

// Mesh: satellites also connect to each other
<line x1="75" y1="75" x2="225" y2="75" />
```

**Why hybrid topology:**
- Pure hub-and-spoke feels rigid, centralized
- Pure mesh is too complex/busy for a small icon
- Hybrid suggests both central planning and distributed connections
- More realistic for urban systems (highways + local roads)

#### 6. Dark Mode Consideration

```typescript
<circle
  fill="none"
  stroke="white"  // ← Always white, regardless of theme
  strokeWidth="3"
  className="opacity-30"  // ← Low opacity makes it subtle on both themes
/>
```

**Why `stroke="white"` with low opacity:**
- On light mode: white at 30% opacity = light gray (works against dark icon)
- On dark mode: white at 30% opacity = dim white (works against light icon)
- Alternative would be `stroke="currentColor"` but that doesn't provide enough contrast
- Low opacity is a trick for "inversion-safe" colors

---

**Patterns to remember:**

1. **SVG source order = z-index**: Draw background elements first, foreground last
2. **`<g>` for DRY**: Group related elements to share attributes
3. **`group` + `group-hover:`**: Coordinate child animations from parent hover
4. **Stagger timings**: Small variations (50-200ms) create ripple effects
5. **Hierarchy through sizing**: Size = importance/significance
6. **Low-opacity white**: Works on both light and dark backgrounds

---

## Adding New Entries

When you discover a new TypeScript pattern or technique:

1. Add it to the appropriate section (or create a new section)
2. Include the file location as a link
3. Show the actual code
4. Explain what's happening
5. Explain why it's done this way
6. Show alternatives or common mistakes
7. Provide a "pattern to remember" summary

This document grows with your understanding of TypeScript!
