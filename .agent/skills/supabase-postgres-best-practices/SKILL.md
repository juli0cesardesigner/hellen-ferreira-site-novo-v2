---
name: supabase-postgres-best-practices
description: Performance and security optimization guide for Postgres in Supabase projects. Covers query optimization, RLS, and schema design.
tags: [supabase, postgres, sql, rls, security, database]
version: 1.0.0
---

# Supabase Postgres Best Practices

Comprehensive guide for optimizing Postgres performance and security in Supabase environments.

## Goal
Design and maintain a high-performance, secure database schema using Postgres-specific features and Supabase's Row-Level Security (RLS).

## Requirements
- A Supabase project.
- Basic SQL and Postgres knowledge.

## Steps

### 1. Optimize Queries (Priority 1)
- Identify missing indexes on frequently queried columns.
- Use `EXPLAIN ANALYZE` to debug slow queries.
- Avoid `SELECT *`; only fetch necessary columns.

### 2. Implement Solid RLS (Priority 3)
- Always enable RLS on every table.
- Use `auth.uid()` for user-specific data.
- test RLS policies thoroughly to prevent data leaks.

### 3. Design the Schema (Priority 4)
- Use appropriate data types (e.g., `text` over `varchar`).
- Implement foreign key constraints to maintain data integrity.
- Use UUIDs for primary keys in distributed systems.

### 4. Manage Connections (Priority 2)
- Use connection pooling for serverless functions (Next.js Edge/Server Actions).
- Monitor active connections to avoid hitting limits.

## Verification
- [ ] All tables have RLS enabled with specific policies (no `TO authenticated using (true)` unless public).
- [ ] Slow queries are analyzed with `EXPLAIN` and optimized with partial or composite indexes.
- [ ] Foreign keys are correctly indexed to speed up joins.
- [ ] Connection strings for serverless environments specify `pgbouncer=true` if using the pooler port.
