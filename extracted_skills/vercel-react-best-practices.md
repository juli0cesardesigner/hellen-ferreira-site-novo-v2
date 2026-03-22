# Vercel React Best Practices

Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel. Contains 62 rules across 8 categories, prioritized by impact.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
| :--- | :--- | :--- | :--- |
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)
- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use Promise.all() for independent operations
- `async-suspense-boundaries` - Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)
- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-dynamic-imports` - Use next/dynamic for heavy components

### 3. Server-Side Performance (HIGH)
- `server-auth-actions` - Authenticate server actions
- `server-cache-react` - Use React.cache() for deduplication

## How to Use
Read individual rule files:
```text
[rules/async-parallel.md](https://github.com/vercel-labs/agent-skills/blob/main/skills/vercel-react-best-practices/rules/async-parallel.md)
[rules/bundle-barrel-imports.md](https://github.com/vercel-labs/agent-skills/blob/main/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md)
```
*Note: Full list of 62 rules is categorized by the prefixes above.*

## Full Compiled Document

For the complete guide with all rules expanded: [AGENTS.md](https://github.com/vercel-labs/agent-skills/blob/main/skills/vercel-react-best-practices/AGENTS.md)
