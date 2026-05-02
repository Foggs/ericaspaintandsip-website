# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## CMS (`artifacts/cms`)

Standalone Next.js 15 + Payload CMS 3.x app. Single `pnpm dev` boots Next.js
and Payload together; admin lives at `/admin`.

- **Database**: Replit's built-in PostgreSQL via `@payloadcms/db-postgres`
  (`DATABASE_URL` env var). Schema auto-pushes on boot (`push: true`). No
  MongoDB — adapter was swapped from `@payloadcms/db-mongodb`.
- **Versions**: Next.js `15.3.9` (must be in Payload's allowed peer range, e.g.
  `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.2 <17`),
  React `19.1.0`, Payload `3.84.1`.
- **Required route files** (Payload won't render the admin without all of these):
  - `src/app/(payload)/layout.tsx` — wraps children in `RootLayout` from
    `@payloadcms/next/layouts`. **This file is mandatory** — without it
    `<ConfigProvider>` never mounts and `PageConfigProvider` crashes with
    `Cannot destructure property 'config' of 'se(...)' as it is undefined`
    (the source map misleadingly points at `CodeEditor.tsx:87`, which is a
    red herring — the real failure is in `src/providers/Config/index.tsx`'s
    `PageConfigProvider`).
  - `src/app/(payload)/admin/[[...segments]]/page.tsx`
  - `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
  - `src/app/(payload)/api/[...slug]/route.ts`
  - `src/app/(payload)/admin/importMap.js`
- **Secrets**: `PAYLOAD_SECRET` (required), `DATABASE_URL` (auto-provided by
  Replit Postgres).
