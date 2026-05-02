# Erica's Paint & Sip — Website

## Overview

Full-stack website for Erica's Paint & Sip, a paint-and-sip entertainment business. Built as a React + Vite frontend with a shared Express API server and PostgreSQL database.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, Framer Motion, Wouter routing)
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

## Site Map

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, upcoming events, gallery preview, recent posts, newsletter signup |
| `/events` | Paginated list of all upcoming public events |
| `/events/:slug` | Single event detail with booking form |
| `/private-events` | Private event info + inquiry form |
| `/gallery` | Photo gallery with category filters and lightbox |
| `/blog` | Blog post listing |
| `/blog/:slug` | Single blog post |
| `/contact` | Contact info + general inquiry form |

## Database Collections (PostgreSQL)

| Table | Purpose |
|---|---|
| `events` | Public events managed by the business |
| `bookings` | Event registrations (PayPal integration — future) |
| `private_inquiries` | Private event booking form submissions |
| `gallery_photos` | Gallery images with category + sort order |
| `posts` | Blog articles |
| `newsletter_subscribers` | Email list |

## API

- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- Routes: `artifacts/api-server/src/routes/`

## Artifacts

- **paint-and-sip** — React + Vite frontend at `/`
- **api-server** — Express API server at `/api`

## Future Phases (per PRD)

- PayPal integration for event registration payments
- Payload CMS admin panel
- Email notifications (booking confirmations, inquiry receipts)
- S3-compatible media storage (Cloudflare R2)
- SEO metadata, sitemap, OG images
- Accessibility audit (WCAG 2.1 AA)

See `attached_assets/ericaspaintandsip_PRD_1777739554836.md` for the full PRD.
