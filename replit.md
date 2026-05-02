> **Also read `CLAUDE.md`** before working on any feature. It contains the project's data models, collection definitions, build cycle, feature specs, code conventions, and what not to do. `replit.md` covers infrastructure; `CLAUDE.md` covers everything else.

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
and Payload together. Registered as a workspace artifact at preview path
`/cms` — admin lives at `/cms/admin`, REST API at `/cms/api/...`.

- **Database**: Replit's built-in PostgreSQL via `@payloadcms/db-postgres`
  (`DATABASE_URL` env var). Schema auto-pushes on boot in dev only
  (`push: process.env.NODE_ENV !== 'production'`). No MongoDB — adapter was
  swapped from `@payloadcms/db-mongodb`.
- **Versions**: Next.js `15.3.9` (must be in Payload's allowed peer range, e.g.
  `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.2 <17`),
  React `19.1.0`, Payload `3.84.1`.
- **Artifact registration & routing**: `artifacts/cms/.replit-artifact/artifact.toml`
  registers the CMS with `kind = "web"`, `previewPath = "/cms"`, and
  `paths = ["/cms"]` — without this file the workspace router returns 404
  for any CMS URL even though the dev server is running. Two pieces must
  agree on the prefix: the artifact `paths`, and Next.js'
  `basePath: "/cms"` in `next.config.mjs`. The dev script binds to
  `${PORT:-3000}` so the workspace can assign the port.
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
  - `src/app/(payload)/api/[...slug]/route.ts` — **must call**
    `REST_GET(config)`, NOT `REST_GET({ config })`. The
    `@payloadcms/next@3.84.1` `handlerBuilder` takes `config` directly;
    wrapping it in an object leaves `awaitedConfig.endpoints` undefined and
    every `/cms/api/*` request fails with
    `TypeError: Cannot read properties of undefined (reading 'some')`.
  - `src/app/(payload)/admin/importMap.js`
- **Secrets**: `PAYLOAD_SECRET` (required), `DATABASE_URL` (auto-provided by
  Replit Postgres). Optional email vars (used by `lib/email.ts`):
  `ADMIN_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `EMAIL_FROM`. When SMTP is unset, `sendEmail()` logs the message to the
  workflow logs instead of sending — forms still succeed end-to-end.
- **Module resolution**: `package.json` sets `"type": "module"` so the
  `payload` CLI (used by `pnpm run generate:types`) can load the ESM config.
  Together with `next.config.mjs`'s `webpack.resolve.extensionAlias` mapping
  `.js → .ts/.tsx`, all relative imports inside the artifact use explicit
  `.js` extensions (e.g. `'./collections/Events.js'`). Both Next webpack and
  TS resolve them to the underlying `.ts` file.
- **Path aliases** (`tsconfig.json`): `@/*` → `./src/*`,
  `@payload-config` → `./payload.config.ts`,
  `@payload-types` → `./payload-types.ts`,
  `@/lib/*` → `./lib/*`, `@/components/*` → `./components/*`.
- **Collections**: `users` (Payload auth), `events`, `media`,
  `private-inquiries` (public create, admin read/update/delete; stored in
  the `payload` Postgres schema), `bookings` (server-side create only via
  PayPal capture route — `access.create: () => false` blocks public REST;
  `paypalOrderId` is `unique` + `index` for idempotency).
- **Frontend routes**: `/cms`, `/cms/events`, `/cms/events/[slug]`,
  `/cms/private-events`. Custom APIs: `POST /cms/api/private-inquiry`,
  `POST /cms/api/paypal/create-order`, `POST /cms/api/paypal/capture-order`.
- **Dependencies added beyond the Payload defaults**: `nodemailer` (+
  `@types/nodemailer`), `@paypal/react-paypal-js`.
- **PayPal**: server-side helpers in `lib/paypal.ts` use the PayPal Orders
  API v2 directly via `fetch` (no server SDK — PayPal deprecated
  `@paypal/checkout-server-sdk`). Env vars: `PAYPAL_CLIENT_ID`,
  `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (safe to expose),
  `PAYPAL_ENV` (`sandbox` default, `live` for production). Without
  credentials, the `RegistrationForm` renders a disabled "online
  registration is being set up" panel and the create-order API returns
  503; the rest of the site keeps working. Booking creation only happens
  after a `COMPLETED` capture and a server-side amount-match check
  against `event.price * seats`.
