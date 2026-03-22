---
name: tailwind-design-system
description: Build production-ready design systems with Tailwind CSS v4, including CSS-first configuration, design tokens, component variants, and accessibility.
tags: [tailwind, css, design-system, ui, v4]
version: 1.0.0
---

# Tailwind Design System (v4)

Build production-ready design systems with Tailwind CSS v4, including CSS-first configuration, design tokens, component variants, responsive patterns, and accessibility.

## Goal
Standardize UI development using Tailwind CSS v4 patterns, ensuring consistency, accessibility, and high-performance styling through a centralized design system.

## Requirements
- Tailwind CSS v4 installed in the project.
- Basic understanding of CSS variables and `@theme` configuration.
- React 19 (for modern component patterns like no `forwardRef`).

## Steps

### 1. Configure the Theme
Use the CSS-first configuration approach in your main CSS file (e.g., `app.css`).

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(14.5% 0.025 264);
  --color-primary: oklch(14.5% 0.025 264);
  --radius-md: 0.375rem;
  
  /* Animations */
  --animate-fade-in: fade-in 0.2s ease-out;
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-background: oklch(14.5% 0.025 264);
  --color-foreground: oklch(98% 0.01 264);
}
```

### 2. Implement Component Variants (CVA)
Use `class-variance-authority` (CVA) to manage complex component states and variants.

```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
```

### 3. Create Accessible Components
Ensure components use semantic tokens and proper ARIA attributes.

```typescript
export function Button({ className, variant, size, ref, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}
```

## Verification
- [ ] Tailwind v4 is correctly importing and the `@theme` variables are accessible in the inspector.
- [ ] Dark mode toggle correctly switches the `@custom-variant dark`.
- [ ] Components respond correctly to variant and size props.
- [ ] Accessibility: Contrast ratios meet WCAG standards; interactive elements have visible focus rings.
