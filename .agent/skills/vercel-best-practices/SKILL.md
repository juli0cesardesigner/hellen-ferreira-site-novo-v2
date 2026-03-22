---
name: vercel-best-practices
description: Optimization and composition patterns by Vercel. Focuses on eliminating waterfalls, bundle size, and reusable React architecture.
tags: [react, performance, vercel, architecture, composition]
version: 1.0.0
---

# Vercel & React Best Practices

A collection of high-impact optimization and architecture patterns for modern React applications.

## Goal
Optimize application performance and code scalability by eliminating waterfalls, reducing bundle sizes, and using robust component composition patterns.

## Requirements
- React 18/19 environment.
- Knowledge of modern React hooks and patterns.

## Steps

### 1. Eliminate Waterfalls
- Move `await` into specific branches where data is used.
- Use `Promise.all()` for independent data fetches.
- Leverage Streaming and Suspense to allow partial page rendering.

### 2. Optimize Bundle Size
- Avoid barrel files (`index.ts` that exports everything) as they break tree-shaking.
- Use dynamic imports (`next/dynamic` or `lazy`) for heavy components or those below the fold.

### 3. Use Robust Composition Patterns
- Avoid "prop drilling" and complex boolean flags.
- Use **Compound Components** to structure complex UI elements (header, content, footer).
- Use `children` for composition instead of fixed render props.

### 4. React 19 Patterns
- Use the `ref` prop as a regular prop instead of `forwardRef`.
- Use the `use()` hook for consuming context or promises.

## Verification
- [ ] No serial waterfalls are present in Server Components.
- [ ] Heavy third-party libraries (e.g., charts, editors) are dynamically imported.
- [ ] Complex components are structured as compound components for better flexibility.
- [ ] No `forwardRef` usage in React 19 components.
