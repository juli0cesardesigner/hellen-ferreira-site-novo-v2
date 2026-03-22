---
name: ui-ux-pro-max
description: Pro-level UI/UX intelligence for creating premium designs, including accessibility, touch-friendly patterns, and performance protocols.
tags: [ui, ux, design, accessibility, interaction]
version: 1.0.0
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide and quality control framework for building high-end web and mobile applications.

## Goal
Elevate the visual and experiential quality of applications by applying rigorous design standards, accessibility checks, and interaction patterns.

## Requirements
- Basic design knowledge.
- Access to SVG icon libraries (e.g., Lucide, Heroicons).
- Knowledge of HSL or OKLCH for color management.

## Steps

### 1. Establish Visual Hierarchy
- Use a consistent typography scale.
- Apply high-contrast foreground/background pairs (min 4.5:1).
- Use spacing (4/8pt grid) to group or separate information.

### 2. Prioritize Accessibility (CRITICAL)
- Ensure all interactive elements have visible focus rings.
- Provide descriptive alt-text for images.
- Use aria-labels for icon-only buttons.
- Ensure touch targets are at least 44x44px.

### 3. Implement Responsive & Fluid Layouts
- Design mobile-first.
- Avoid fixed widths; use `max-w-*` containers.
- Use `clamp()` for fluid typography and spacing if possible.

### 4. Polish Interactions
- Add micro-animations (150-300ms) for state changes.
- Provide immediate feedback on user actions (e.g., hover/active states).
- Use skeleton screens for loading instead of spinners when possible.

## Verification Checklist
- [ ] Accessibility: Run a lighthouse audit; check for missing alt text and low contrast.
- [ ] Touchability: Verify all interactive elements are easily clickable on a small screen.
- [ ] Performance: Images are optimized (WebP/AVIF) and layout shift (CLS) is minimized.
- [ ] Consistency: The UI uses a unified color palette and icon set across all pages.
