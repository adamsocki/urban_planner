# Design Language Guide

## Overview

The Urban Planner application uses a **utility-first CSS approach with Tailwind** combined with **Radix UI** for accessible, headless components. All styled components are centralized in a single design system to ensure consistency across the application.

This guide documents the design system, provides patterns for common use cases, and explains the decisions behind component choices.

---

## Design System Architecture

### Core Files

| File | Purpose |
|------|---------|
| [`tailwind.config.js`](../apps/fullstack/tailwind.config.js) | Tailwind configuration with color tokens and plugins |
| [`styles/globals.css`](../apps/fullstack/styles/globals.css) | Global styles, CSS variables, dark mode, animations |
| [`app/components/elements.tsx`](../apps/fullstack/app/components/elements.tsx) | Complete design system library (900+ lines) |
| [`app/core/layouts/`](../apps/fullstack/app/core/layouts/) | Page layout templates (StandaloneFormLayout, etc.) |

### Why Centralized?

All styled components are defined in **one file** (`elements.tsx`) to:
- Ensure consistency across all UI elements
- Make design updates simple and safe
- Provide a clear reference for available components
- Reduce CSS duplication and bundle size
- Make dark mode implementation straightforward

---

## Design Tokens

### Color Palette

The application uses a **limited, purposeful color set**:

#### Primary Colors
- **Purple** - Brand color, primary actions, focus states
  - `purple-500`: Main interactive elements, buttons, links
  - `purple-600`: Hover states
  - `purple-700`: Dark mode alternatives
  - `purple-100`: Light backgrounds, disabled states

#### Neutral Colors
- **Gray/Neutral** - UI structure, text, backgrounds
  - `gray-50, gray-100, gray-200`: Light backgrounds
  - `gray-500`: Secondary text
  - `gray-700`: Primary text
  - `gray-800, gray-900`: Dark mode backgrounds

#### Semantic Colors
- **Red** - Destructive actions, errors
- **Yellow** - Highlights, important information
- **White/Black** - Maximum contrast, overlays

### Typography

- **Sans Font:** `Inter` - Default body text, UI labels
- **Mono Font:** `Source Code Pro` - Code, raw data, monospace content

### Sizing System

All components support a consistent size scale:

```typescript
type B3Size = "xxs" | "xs" | "sm" | "md" | "lg"
```

**Usage:**
- **xxs/xs:** Compact UI, inline elements, secondary buttons
- **sm:** Standard UI, most form inputs, normal buttons
- **md:** Large form inputs, significant actions
- **lg:** Hero sections, major CTAs

### Variant System

Components support multiple visual variants for different contexts:

```typescript
type B3Variant = "default" | "primary" | "quiet" | "code" | "quiet/mode" | "destructive"
```

- **default:** Neutral, secondary actions
- **primary:** Main actions, brand colored
- **quiet:** Minimal visual weight, often inside other components
- **destructive:** Red, for delete/dangerous actions
- **code:** Monospace styling for technical content
- **quiet/mode:** Toggle states (e.g., light/dark mode switcher)

---

## Dark Mode

### Implementation

The application uses Tailwind's `darkMode: "class"` strategy:
- Dark mode is triggered by `.dark` class on the root element
- CSS custom properties defined in `:root` and `.dark` for color variables
- Every component automatically supports dark mode via `dark:` prefixes

### Dark Mode Colors

```css
/* Light Mode */
:root {
  --highlight-purple: theme("colors.purple.500");
  --highlight-background: theme("colors.white");
  --highlight-tooltip-text: theme("colors.black");
}

/* Dark Mode */
.dark {
  --highlight-purple: theme("colors.purple.300");
  --highlight-background: theme("colors.gray.800");
  --highlight-tooltip-text: theme("colors.white");
}
```

### Dark Mode Guidelines

- **Never hardcode colors** - Always use Tailwind classes with dark: variants
- **Test dark mode** - Every UI change should be tested in dark mode
- **Contrast first** - Ensure sufficient contrast in both light and dark modes

---

## Component Library

### Button

The foundational interactive component. Always use the `Button` component, never `<button>`.

```tsx
// Primary action (most common)
<Button variant="primary" size="sm">
  Save Changes
</Button>

// Secondary action
<Button variant="default" size="sm">
  Cancel
</Button>

// Destructive action
<Button variant="destructive" size="sm">
  Delete
</Button>

// Quiet/minimal button
<Button variant="quiet" size="xs">
  More Options
</Button>

// Code-related button
<Button variant="code" size="sm">
  Copy
</Button>
```

**Button Sizes:**
- **xxs:** Very compact, inline elements like action icons
- **xs:** Small buttons, secondary UI
- **sm:** Standard button size (most common)
- **md:** Large, important CTAs
- **full-width:** Full width container button

**Features:**
- Automatic focus ring with purple highlight
- Disabled state with opacity reduction
- Smooth transitions on hover
- Full keyboard navigation support

### Form Components

#### LabeledTextField

Complete input with label, validation, and error handling:

```tsx
<LabeledTextField
  name="email"
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  required
/>
```

Uses Formik integration for validation and state management.

#### Input

Bare input element (when label not needed):

```tsx
<Input
  type="text"
  placeholder="Search..."
  size="sm"
/>
```

#### Checkbox

Accessible checkbox:

```tsx
<FieldCheckbox name="agree" label="I agree to terms" />
```

#### Radio

Radio button styling:

```tsx
<label>
  <input type="radio" {...styledRadio()} />
  Option
</label>
```

#### Code Textarea

For multi-line code input:

```tsx
<StyledFieldTextareaCode
  name="code"
  label="Enter Code"
  variant="code"
/>
```

### Typography

#### Headings

```tsx
<H1>Page Title</H1>
<H2>Section Title</H2>
```

#### Labels

```tsx
<CapsLabel>Important Label</CapsLabel>
<StyledLabelSpan size="sm">Secondary Text</StyledLabelSpan>
```

#### Info Box

```tsx
<TextWell>
  This provides context or additional information.
</TextWell>
```

### Dialogs & Modals

#### Basic Dialog

```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <StyledDialogOverlay />
    <StyledDialogContent>
      <StyledDialogClose />
      <h2>Dialog Title</h2>
      {/* content */}
    </StyledDialogContent>
  </Dialog.Portal>
</Dialog.Root>
```

#### Alert Dialog

For confirmations:

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <StyledDialogOverlay />
    <StyledAlertDialogContent>
      <AlertDialog.Title>Are you sure?</AlertDialog.Title>
      <AlertDialog.Cancel asChild>
        <Button variant="default">Cancel</Button>
      </AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialog.Action>
    </StyledAlertDialogContent>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Dropdown Menu

```tsx
<DD.Root>
  <DD.Trigger asChild>
    <Button variant="quiet" size="xs">
      Options
    </Button>
  </DD.Trigger>
  <DDContent align="start">
    <StyledItem>Edit</StyledItem>
    <StyledItem>Duplicate</StyledItem>
    <DDSeparator />
    <StyledItem variant="destructive">Delete</StyledItem>
  </DDContent>
</DD.Root>
```

### Context Menu

Right-click menu patterns:

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger>
    <div>{element}</div>
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <CMContent>
      <StyledCMItem>Copy</StyledCMItem>
      <StyledCMItem>Paste</StyledCMItem>
    </CMContent>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

### Popover & Tooltip

#### Popover (Click-triggered)

```tsx
<Popover.Root>
  <Popover.Trigger asChild>
    <Button size="xs">Help</Button>
  </Popover.Trigger>
  <Popover.Portal>
    <StyledPopoverContent>
      <StyledPopoverArrow />
      Additional information...
    </StyledPopoverContent>
  </Popover.Portal>
</Popover.Root>
```

#### Tooltip (Hover-triggered)

```tsx
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <Button>Hover me</Button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <TContent>Helpful text</TContent>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

### Tables

For structured data display:

```tsx
<Table>
  <TableHead>
    <tr>
      <Th>Column 1</Th>
      <Th>Column 2</Th>
    </tr>
  </TableHead>
  <Tbody>
    <tr>
      <Td>Data 1</Td>
      <Td>Data 2</Td>
    </tr>
  </Tbody>
</Table>
```

### Badge

Inline badge for tags/labels:

```tsx
<Badge variant="primary">Active</Badge>
<Badge variant="default">Pending</Badge>
```

### Select

Dropdown select input:

```tsx
<StyledSelectItem value="opt1">
  Option 1
</StyledSelectItem>
```

### Switch

Toggle switch:

```tsx
<StyledSwitch
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>
```

---

## Layout Patterns

### Standalone Form Layout

For authentication and signup pages:

```tsx
import { StandaloneFormLayout } from "@/app/core/layouts/standalone_form_layout";

<StandaloneFormLayout>
  <Form onSubmit={handleSubmit}>
    {/* form fields */}
  </Form>
</StandaloneFormLayout>
```

- Centered, max-width constraint
- Responsive padding
- Minimal header with logo

### Authenticated Page Layout

For main app pages:

```tsx
import { AuthenticatedPageLayout } from "@/app/core/layouts/authenticated_page_layout";

<AuthenticatedPageLayout title="Page Title">
  {/* page content */}
</AuthenticatedPageLayout>
```

- Full-width layout
- Navigation sidebar (if applicable)
- Top header/navigation bar
- Page title and breadcrumbs

---

## Using Styled Components

### When to Create New Styled Components

1. **Component is reused** 2+ times in the codebase
2. **Component has complex styling** (multiple variants, state-based styles)
3. **Component is part of the design system** (buttons, inputs, etc.)

### When NOT to Create Styled Components

1. **One-off styling** - Use Tailwind classes directly in JSX
2. **Simple wrapper** - Use `<div className="...">` if only a few classes

### Example: Adding a New Styled Component

If you need a new component, add it to `elements.tsx`:

```tsx
// Typography component example
export const StyledCaption = styled.span`
  @apply text-xs font-medium uppercase tracking-wide
         text-gray-600 dark:text-gray-400;
`;

// Button-like component example
export const IconButton = ({ icon, onClick, variant = "default" }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center
      w-8 h-8 rounded-md transition-colors
      ${variant === "primary" ? "bg-purple-500 text-white hover:bg-purple-600" : ""}
      ${variant === "default" ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" : ""}
    `}
  >
    {icon}
  </button>
);
```

**Always include:**
- Dark mode support with `dark:` variants
- Size variants if applicable
- Proper spacing and padding
- Focus ring for accessibility
- Comments explaining the purpose

---

## Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Buttons, links, and form inputs should be easily Tab-navigable
- Use `disabled` attribute rather than styling non-functional elements

### Focus States
- Every interactive element shows a purple focus ring
- Focus indicators should have sufficient contrast (WCAG AA minimum)

### Semantic HTML
- Use semantic elements (`<button>`, `<input>`, `<label>`)
- Never use `<div>` for interactive elements
- Properly associate labels with form inputs using `htmlFor`

### Color Contrast
- Text must have sufficient contrast in both light and dark modes
- Avoid relying solely on color to communicate information
- Use text + visual indicators (icons, patterns)

### ARIA Attributes
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for additional descriptions
- Use `aria-expanded` for expandable/collapsible elements
- Use `aria-current` for active navigation items

---

## Animations & Transitions

### Predefined Animations

All animations respect `prefers-reduced-motion`:

```css
/* Slide animations */
slideDownAndFade
slideUpAndFade
slideLeftAndFade
slideRightAndFade

/* Fade animation */
fadeIn

/* Custom animations */
appear (opacity transition)
```

### Usage in Components

```tsx
<div className="animate-fadeIn">
  Content fades in on mount
</div>
```

### Guidelines

- Use animations to guide attention, not distract
- Keep animations under 300ms for UI interactions
- Respect user's motion preferences
- Never animate on mount unless necessary

---

## Responsive Design

### Tailwind Breakpoints

Use standard Tailwind breakpoints:

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Usage

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>

<div className="flex flex-col md:flex-row">
  Mobile: stacked, Desktop: side-by-side
</div>

<Button size="sm" className="md:size-md">
  Size changes at breakpoint
</Button>
```

### Mobile-First Approach

- **Default styles are mobile**
- Add `md:`, `lg:` prefixes for larger screens
- Avoid `max-w-*` overrides unless necessary

---

## Best Practices

### Do

✅ **Use existing components** - Check `elements.tsx` first before creating new UI
✅ **Follow the B3Size pattern** - Use xs, sm, md, lg consistently
✅ **Respect dark mode** - Always consider dark mode when styling
✅ **Keep components simple** - One responsibility per component
✅ **Name descriptors clearly** - `PrimaryButton` not `BigButton`
✅ **Test accessibility** - Use keyboard navigation, test with screen readers
✅ **Use semantic HTML** - `<button>` for buttons, not `<div>`
✅ **Centralize styling** - Add new components to `elements.tsx`

### Don't

❌ **Use `style={}` prop** - Use Tailwind classes or styled components
❌ **Create inline CSS** - No `<style>` tags in components
❌ **Hardcode colors** - Use the color palette and dark: variants
❌ **Create one-off components** - Reuse from design system
❌ **Mix styled-components and CSS modules** - Stick to Tailwind + elements.tsx
❌ **Add components to multiple files** - Centralize in `elements.tsx`
❌ **Ignore focus states** - Every interactive element needs focus styling
❌ **Use `!important`** - Re-examine your selector specificity

---

## Common Patterns

### Form with Validation

```tsx
import { Form } from "@/app/core/components/Form";
import { LabeledTextField } from "@/app/core/components/LabeledTextField";

<Form onSubmit={handleSubmit} submitText="Save">
  <LabeledTextField
    name="email"
    label="Email"
    type="email"
    required
  />
  <LabeledTextField
    name="password"
    label="Password"
    type="password"
    required
  />
</Form>
```

### Conditional Button State

```tsx
<Button
  variant={isLoading ? "quiet" : "primary"}
  disabled={isLoading}
  size="sm"
>
  {isLoading ? "Saving..." : "Save"}
</Button>
```

### Confirmation Dialog

```tsx
<AlertDialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
  <AlertDialog.Portal>
    <StyledDialogOverlay />
    <StyledAlertDialogContent>
      <AlertDialog.Title>Delete this item?</AlertDialog.Title>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This action cannot be undone.
      </p>
      <div className="flex gap-2 justify-end">
        <AlertDialog.Cancel asChild>
          <Button variant="default" size="sm">Cancel</Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action asChild>
          <Button variant="destructive" size="sm">Delete</Button>
        </AlertDialog.Action>
      </div>
    </StyledAlertDialogContent>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Responsive Card Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <div key={item.id} className="p-4 border rounded-lg dark:border-gray-700">
      <h3>{item.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
    </div>
  ))}
</div>
```

---

## Design System Evolution

### Adding New Components

When adding a new component to the design system:

1. **Add to `elements.tsx`** with clear JSDoc comments
2. **Support size variants** if the component scales
3. **Support dark mode** with `dark:` classes
4. **Ensure accessibility** with semantic HTML and ARIA
5. **Add to this guide** with examples and usage instructions
6. **Test thoroughly** in both light and dark modes

### Deprecating Components

- Mark deprecated components with `@deprecated` comments
- Update this guide to note alternatives
- Gradually migrate existing usage
- Remove only after all instances updated

---

## References

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Radix UI Components](https://radix-ui.com)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [`elements.tsx`](../apps/fullstack/app/components/elements.tsx) - Source of truth for all components
- [`globals.css`](../apps/fullstack/styles/globals.css) - Global styles and CSS variables

---

## Questions?

When in doubt:
1. Check `elements.tsx` for existing components
2. Review this guide for patterns
3. Look at similar features in the codebase for examples
4. Refer to component JSDoc comments for API details
