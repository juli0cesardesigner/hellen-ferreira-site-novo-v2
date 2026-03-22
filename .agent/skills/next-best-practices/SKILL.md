---
name: next-best-practices
description: Best practices for Next.js 15+ development, including App Router, RSC boundaries, data fetching patterns, and performance optimization.
tags: [nextjs, react, rsc, performance, vercel]
version: 1.0.0
---

# Next.js Best Practices

Apply these rules when writing or reviewing Next.js code to ensure high performance, maintainability, and correct implementation of modern React patterns.

## Goal
Ensure Next.js applications follow the latest conventions (App Router, RSC) to maximize performance, SEO, and developer experience.

## Requirements
- Next.js 15+ project.
- Knowledge of React Server Components (RSC) and Client Components.

## Steps

### 1. Follow RSC Boundaries
Identify where to use `'use client'` and where to keep components as Server Components.
- Use Server Components by default for data fetching and static content.
- Use Client Components only for interactivity (hooks, event listeners) or browser-specific APIs.

### 2. Handle Async APIs correctly
Next.js 15+ requires many previously synchronous APIs to be awaited.
- `params` and `searchParams` in `page.tsx` or `layout.tsx` must be awaited.
- `cookies()` and `headers()` from `next/headers` must be awaited.

### 3. Optimize Data Fetching
- Avoid waterfalled fetches; use `Promise.all()` or parallel fetching when possible.
- Use `<Suspense>` boundaries to stream slow data parts.
- Prefer Server Actions over Route Handlers for forms and mutations unless an API is external.

### 4. Implement Error Handling & Loading
- Create `error.tsx` for error boundaries.
- Create `loading.tsx` for instant loading states.
- Use `notFound()` and `redirect()` for flow control.

## Verification
- [ ] No `'use client'` directives are present on components that don't need interactivity.
- [ ] All async props (params, searchParams) and cookies/headers are awaited.
- [ ] LCP (Largest Contentful Paint) is optimized using `next/image` with `priority`.
- [ ] Search engines can correctly index content fetched in Server Components.
