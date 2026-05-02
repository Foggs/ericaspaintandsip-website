# CLAUDE.md — ericaspaintandsip.com

This file gives Claude (and any AI coding assistant) full context on how this project is structured, what conventions to follow, and what to avoid. **Read this before writing any code.** Also read `replit.md` for Replit-specific infrastructure, workspace routing, and known gotchas.

---

## Project Overview

**Site:** ericaspaintandsip.com
**Purpose:** Public website for a paint-and-sip entertainment business — event listings, online registration, private event inquiries, photo gallery, blog, and newsletter signup.

**Stack:**
- **Framework:** Next.js 15.3.9 (App Router, React Server Components)
- **CMS:** Payload CMS 3.84.1 — runs inside Next.js, same process
- **Database:** PostgreSQL — Replit's built-in Postgres via `@payloadcms/db-postgres`
- **Payments:** PayPal Orders API v2
- **Styling:** Tailwind CSS
- **Email:** Nodemailer or Resend (transactional only)
- **Media:** Cloudflare R2 (S3-compatible) for all uploads
- **Package manager:** pnpm (monorepo workspace)
- **Dev/Staging:** Replit (`artifacts/cms` workspace artifact)
- **Production:** Separate host (Vercel / Railway / Render — TBD)

---

## CMS Location in the Monorepo

The CMS lives at **`artifacts/cms/`** inside the pnpm monorepo — not at the repo root.

All paths below are relative to `artifacts/cms/` unless stated otherwise.

The app is registered as a workspace artifact with:
- `basePath: "/cms"` in `next.config.mjs`
- Admin panel at `/cms/admin`
- REST API at `/cms/api/...`
- Preview path `/cms` in `artifact.toml`

**Never remove or change `basePath: "/cms"`** — the workspace router will 404 all CMS URLs without it.

---

## Commands

Run all commands from `artifacts/cms/` unless noted.

```bash
# Install dependencies (from repo root)
pnpm install

# Run CMS dev server (Next.js + Payload together)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate Payload types
pnpm run generate:types

# Typecheck entire monorepo (from repo root)
pnpm run typecheck
```

> Payload CMS and Next.js share the same `pnpm dev` process. Do not run them separately.

---

## Project Structure

All paths relative to `artifacts/cms/`:

```
artifacts/cms/
├── src/
│   └── app/
│       ├── (frontend)/                  # Public-facing route group
│       │   ├── page.tsx                 # Homepage
│       │   ├── events/
│       │   │   ├── page.tsx             # Event listing
│       │   │   └── [slug]/
│       │   │       └── page.tsx         # Event detail + registration
│       │   ├── private-events/
│       │   │   └── page.tsx             # Private event inquiry form
│       │   ├── gallery/
│       │   │   └── page.tsx
│       │   ├── blog/
│       │   │   ├── page.tsx
│       │   │   └── [slug]/
│       │   │       └── page.tsx
│       │   └── contact/
│       │       └── page.tsx
│       ├── (payload)/                   # Payload admin route group — ALL FILES REQUIRED
│       │   ├── layout.tsx               # MANDATORY — wraps RootLayout from @payloadcms/next/layouts
│       │   ├── admin/
│       │   │   └── [[...segments]]/
│       │   │       ├── page.tsx
│       │   │       ├── not-found.tsx
│       │   │       └── importMap.js
│       │   └── api/
│       │       └── [...slug]/
│       │           └── route.ts         # REST API — see critical gotcha below
│       └── api/                         # App-level API routes
│           └── paypal/
│               ├── create-order/route.ts
│               └── capture-order/route.ts
├── collections/                         # Payload collection configs
│   ├── Events.ts
│   ├── Bookings.ts
│   ├── PrivateInquiries.ts
│   ├── GalleryPhotos.ts
│   ├── Posts.ts
│   ├── NewsletterSubscribers.ts
│   └── Media.ts
├── components/                          # Shared UI components
│   ├── ui/                              # Primitive components (buttons, inputs, etc.)
│   ├── layout/                          # Header, Footer, Nav
│   ├── events/
│   ├── gallery/
│   ├── blog/
│   └── forms/                           # All form components
├── lib/                                 # Shared utilities
│   ├── payload.ts                       # Payload local API helper
│   ├── paypal.ts                        # PayPal API helpers
│   ├── email.ts                         # Email sending helpers
│   └── utils.ts                         # General utilities (includes cn() helper)
├── payload.config.ts
├── next.config.mjs                      # Must keep basePath: "/cms"
├── tailwind.config.ts
└── .env.local                           # Local env vars (never commit)
```

---

## Critical Payload Gotchas

These are hard-won lessons documented in `replit.md`. Do not deviate from them.

### 1. `(payload)/layout.tsx` is MANDATORY

This file must exist and wrap children in `RootLayout` from `@payloadcms/next/layouts`. Without it, `<ConfigProvider>` never mounts and the admin crashes with:

```
Cannot destructure property 'config' of 'se(...)' as it is undefined
```

The error misleadingly points at `CodeEditor.tsx:87` — that's a red herring. The real failure is the missing layout.

### 2. REST route must call `REST_GET(config)` — NOT `REST_GET({ config })`

In `src/app/(payload)/api/[...slug]/route.ts`:

```ts
// ✅ CORRECT
export const GET = REST_GET(config)

// ❌ WRONG — wrapping in object breaks every /cms/api/* request
export const GET = REST_GET({ config })
```

Passing `{ config }` leaves `awaitedConfig.endpoints` undefined and every REST request fails with `TypeError: Cannot read properties of undefined (reading 'some')`.

### 3. All Payload route files must exist

The admin will not render without all of these:
- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- `src/app/(payload)/api/[...slug]/route.ts`
- `src/app/(payload)/admin/importMap.js`

### 4. DB schema push is dev-only

In `payload.config.ts`, the postgres adapter must have:

```ts
push: process.env.NODE_ENV !== 'production'
```

Never push schema automatically in production.

---

## Import Conventions

Use **absolute imports** for anything in `components/`, `lib/`, or `collections/`:

```ts
import { Button } from '@/components/ui/Button'
import { getPayloadClient } from '@/lib/payload'
import { sendEmail } from '@/lib/email'
```

Use **relative imports** for files within the same feature folder:

```ts
// Inside components/events/EventCard.tsx
import { formatDate } from './utils'
```

`tsconfig.json` must have `"@/*": ["./src/*"]` — note the `src/` prefix.

---

## Environment Variables

Secrets are set in Replit's **Secrets panel** — not in `.env` files committed to the repo. For local dev, use `.env.local` inside `artifacts/cms/`.

```bash
# Database — auto-provided by Replit Postgres, do not set manually on Replit
DATABASE_URL=postgresql://...

# Payload
PAYLOAD_SECRET=a-long-random-secret

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...   # Safe to expose — used in PayPal JS SDK

# Email
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
ADMIN_EMAIL=erica@ericaspaintandsip.com

# Media (Cloudflare R2)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_URL=https://...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Payload CMS Collections

Each collection lives in `collections/` and is registered in `payload.config.ts`. Do not create new collections without updating both files and the PRD.

| Collection | Slug | Notes |
|---|---|---|
| Events | `events` | Public paint-and-sip events |
| Bookings | `bookings` | Created server-side after PayPal capture — never by users directly |
| Private Inquiries | `private-inquiries` | Form submissions from `/private-events` |
| Gallery Photos | `gallery-photos` | Ordered by `sortOrder` field asc |
| Posts | `posts` | Blog articles |
| Newsletter Subscribers | `newsletter-subscribers` | `email` field must be unique |
| Media | `media` | Payload built-in, configured with R2 adapter |
| Users | `users` | Admin only — Payload built-in auth |

### Key rules for collections

- Always define `admin.useAsTitle` on every collection
- Always add `timestamps: true` to every collection
- Use `access: { read: () => true }` only on public-facing collections (`events`, `posts`, `gallery-photos`)
- `bookings` and `private-inquiries` are admin-only from the public API:

```ts
access: {
  read: isAdmin,
  create: () => true,   // Created via server-side API route only
  update: isAdmin,
  delete: isAdmin,
}
```

---

## PayPal Integration

Use **PayPal Orders API v2** (not legacy NVP/SOAP). Flow:

1. Client clicks "Register" → calls `POST /cms/api/paypal/create-order` with `eventId` and `seats`
2. Server creates PayPal order, returns `orderID`
3. Client completes payment in PayPal JS SDK
4. Client calls `POST /cms/api/paypal/capture-order` with `orderID`
5. Server captures payment, verifies amount server-side, creates `Booking` record, sends confirmation email
6. Client receives success response and shows confirmation UI

**Never trust the client** for the amount — always re-derive price from the Event record server-side.

---

## Email

All transactional emails are sent from `lib/email.ts`. Three triggers:

| Trigger | Recipients | Template |
|---|---|---|
| Booking confirmed (PayPal capture success) | Customer + admin | Booking confirmation |
| Private inquiry submitted | Admin | Inquiry details |
| Private inquiry submitted | Customer | Auto-reply / "we'll be in touch" |

Keep email templates as plain HTML strings in `lib/email.ts` — no external template engine needed.

---

## Forms

All forms are in `components/forms/`. Use **React controlled components** with `useState` or `useReducer`. No form library.

### Private Event Booking Form fields

| Field | Required | Type | Notes |
|---|---|---|---|
| First & Last Name | Yes | text | |
| Email | Yes | email | |
| Phone | Yes | tel | |
| Preferred Date | No | date | |
| Number of Guests | No | number or select | Include "Not sure yet" option |
| Message / Details | Yes | textarea | |

Validate required fields client-side before submit. Re-validate server-side before saving to Payload.

---

## Styling Conventions

- Use **Tailwind utility classes** directly on JSX elements — no custom CSS files unless unavoidable
- **No inline `style` props** unless for truly dynamic values
- Component variants use `cn()` — a `clsx` + `twMerge` wrapper in `lib/utils.ts`
- Responsive design is **mobile-first**: base classes are mobile, `md:` and `lg:` override upward
- Animation: use **Framer Motion** for page transitions and micro-interactions

---

## TypeScript

- **Strict mode on** — `"strict": true` in `tsconfig.json`
- Always type props explicitly — no `any`, no untyped function params
- Use Payload's **generated types** (`pnpm run generate:types`) — import from `@/payload-types`
- Prefer `type` over `interface` for component props; use `interface` for extendable data shapes

---

## Code Style

- 2-space indentation
- Single quotes for strings
- No semicolons
- Trailing commas in multi-line objects and arrays
- **Named exports** for all components — no default exports except Next.js pages and layouts
- **Server Components by default** — only add `'use client'` for browser APIs, event handlers, or state
- Keep Server Components lean: fetch data at the top, pass as props to Client Components

---

## What Not to Do

- **Don't** change `basePath: "/cms"` in `next.config.mjs` — the workspace router breaks
- **Don't** call `REST_GET({ config })` — use `REST_GET(config)` (see Critical Gotchas)
- **Don't** omit `(payload)/layout.tsx` — the admin will crash without it
- **Don't** set `push: true` in the postgres adapter outside of dev
- **Don't** store secrets in committed files — use Replit Secrets panel
- **Don't** use `npm` — this is a `pnpm` workspace
- **Don't** create Booking records from the client — only from the server-side capture route
- **Don't** use `fetch('/cms/api/...')` in Server Components — use Payload's local API via `lib/payload.ts`
- **Don't** use `getServerSideProps` or `getStaticProps` — App Router only
- **Don't** add `'use client'` to layout or page files unless absolutely necessary

---

## Build Cycle

Every feature follows this exact cycle. Do not skip steps.

### The 6-Step Cycle

**1. Specify** — Write a feature spec (template below) before any code. Paste the relevant PRD section as context.

**2. Plan Mode** — Ask Claude to plan, not implement. Review:
- Is the data flow correct?
- Does it touch files it shouldn't?
- Does it match the data models in this file?
- Are there side effects on existing features?

**3. Implement** — Approve the plan. Review every changed file in the diff. If a file wasn't in the spec, ask why before accepting.

**4. Test** — Happy path first, then deliberately break it:
- What happens when required fields are missing?
- What happens with unexpected input?
- What happens when PayPal or email is unavailable?
- Does it work on mobile?

**5. Correct** — Be precise. Not *"the form doesn't work"* but *"submitting the private inquiry form with no date returns a 500 — `preferredDate` is optional but the API route is treating it as required."*

**6. Advance** — Commit to Git before the next feature. Every working milestone gets its own commit.

---

### Feature Spec Template

```
## Feature: [Name]

### Description
[What this feature does. 1–3 sentences.]

### PRD Reference
[Paste the relevant section from ericaspaintandsip_PRD.md]

### Files Involved
- [Every file to be created or modified — if not listed, Claude shouldn't touch it]

### Constraints
- [Implementation rules]
- [Dependencies that must exist first]
- [Things Claude must NOT do]

### Acceptance Criteria
- [ ] [Specific, testable condition]
- [ ] [Specific, testable condition]
- [ ] [Specific, testable condition]
```

---

### Feature Build Order

| # | Feature | Phase | Depends On |
|---|---|---|---|
| 1 | Verify project scaffold — Next.js + Payload + PostgreSQL | 1 | Nothing |
| 2 | Events collection + Payload admin | 1 | #1 |
| 3 | `/events` listing page | 1 | #2 |
| 4 | `/events/[slug]` detail page | 1 | #2 |
| 5 | Private inquiry form + email notification | 1 | #1 |
| 6 | Homepage | 1 | #2, #5 |
| 7 | PayPal event registration | 2 | #4 |
| 8 | Booking confirmation email | 2 | #7 |
| 9 | Gallery collection + `/gallery` page | 2 | #1 |
| 10 | Blog collection + `/blog` + `/blog/[slug]` | 2 | #1 |
| 11 | Newsletter signup | 2 | #1 |
| 12 | `/contact` page | 2 | #1 |
| 13 | Design polish + animations | 3 | All of Phase 2 |
| 14 | SEO metadata + sitemap | 3 | #13 |
| 15 | Mobile QA + accessibility audit | 3 | #13 |
| 16 | Production environment + DNS cutover | 3 | #14, #15 |

---

### Pre-Written Feature Specs

---

#### Feature 1 — Verify Project Scaffold

```
## Feature: Verify Project Scaffold

### Description
The CMS lives at artifacts/cms/ and is already bootstrapped by Replit as a
Next.js 15 + Payload CMS 3.x workspace artifact. Verify the scaffold is
correct and all mandatory Payload route files exist and are properly wired.

### Files to Verify (do not recreate if already correct)
- artifacts/cms/src/app/(payload)/layout.tsx           — must wrap RootLayout
- artifacts/cms/src/app/(payload)/admin/[[...segments]]/page.tsx
- artifacts/cms/src/app/(payload)/admin/[[...segments]]/not-found.tsx
- artifacts/cms/src/app/(payload)/admin/importMap.js
- artifacts/cms/src/app/(payload)/api/[...slug]/route.ts  — REST_GET(config) not REST_GET({ config })
- artifacts/cms/payload.config.ts                      — postgres adapter with push: NODE_ENV !== 'production'
- artifacts/cms/next.config.mjs                        — must have basePath: "/cms"

### Constraints
- Package manager is pnpm — do not use npm
- basePath: "/cms" must not change
- Database is Replit's built-in PostgreSQL via DATABASE_URL — not MongoDB
- REST_GET must receive config directly, not wrapped in an object
- (payload)/layout.tsx is mandatory — do not skip it
- @/* path alias must resolve to ./src/*

### Acceptance Criteria
- [ ] pnpm dev starts without errors from artifacts/cms/
- [ ] /cms loads (even a blank page is fine)
- [ ] /cms/admin loads the Payload login screen
- [ ] A new admin user can be created on first visit
- [ ] /cms/api/globals returns a valid response (not a 500)
- [ ] No TypeScript errors on build
```

---

#### Feature 2 — Events Collection

```
## Feature: Events Collection

### Description
Create the Events Payload collection with all fields from the PRD data model.
Seed one test event via the admin panel to verify the collection works.

### PRD Reference
Section 4.2 — Event Data Model

### Files Involved
- artifacts/cms/collections/Events.ts
- artifacts/cms/payload.config.ts (register the collection)

### Constraints
- Use Payload's local API for all data access — never fetch /cms/api/events from client components
- isPublished must default to false
- slug must auto-generate from title using Payload's slugField hook
- coverImage must use the Media collection (relationship field)
- Do not build any frontend pages yet

### Acceptance Criteria
- [ ] Events collection appears in Payload admin sidebar at /cms/admin
- [ ] All PRD fields are present and correctly typed
- [ ] A test event can be created and saved without errors
- [ ] slug auto-populates from the title field
- [ ] pnpm run generate:types reflects the new collection
```

---

#### Feature 3 — Events Listing Page

```
## Feature: /events Listing Page

### Description
A public page at /cms/events showing all published upcoming events in
chronological order, each as a card with cover image, title, date, location, and price.

### PRD Reference
Section 3 — Site Map, Section 4.2

### Files Involved
- artifacts/cms/src/app/(frontend)/events/page.tsx
- artifacts/cms/components/events/EventCard.tsx
- artifacts/cms/lib/payload.ts (getPayloadClient helper if not present)

### Constraints
- Server Component — no 'use client'
- Only show events where isPublished === true and date >= today
- Use Next.js Image for cover images
- No pagination in this pass

### Acceptance Criteria
- [ ] /cms/events loads and displays the seeded test event
- [ ] Only published events are shown
- [ ] Past events are not shown
- [ ] Empty state message renders when no events exist
- [ ] Each card links to /cms/events/[slug]
- [ ] No TypeScript errors
```

---

#### Feature 4 — Event Detail Page

```
## Feature: /events/[slug] Detail Page

### Description
A public page for a single event showing all details and a registration form UI.
No PayPal wiring yet — that is Feature 7.

### PRD Reference
Section 3, Section 4.2, Section 4.3 (form fields only)

### Files Involved
- artifacts/cms/src/app/(frontend)/events/[slug]/page.tsx
- artifacts/cms/components/events/EventDetail.tsx
- artifacts/cms/components/forms/RegistrationForm.tsx (UI shell only)

### Constraints
- generateMetadata must be implemented
- Return notFound() if slug doesn't match a published event
- RegistrationForm is a Client Component — submits to nothing yet
- Do not implement PayPal or booking creation

### Acceptance Criteria
- [ ] /cms/events/[slug] loads the correct event data
- [ ] notFound() is returned for unknown slugs
- [ ] All event fields render correctly
- [ ] Registration form shows name, email, phone, seats fields
- [ ] Page title and meta description set via generateMetadata
```

---

#### Feature 5 — Private Event Inquiry Form

```
## Feature: Private Event Inquiry Form

### Description
Form at /cms/private-events for private event inquiries. On submission: save to
Payload, send admin notification email, send user auto-reply.

### PRD Reference
Section 4.4 — Private Event Booking Form

### Files Involved
- artifacts/cms/collections/PrivateInquiries.ts
- artifacts/cms/payload.config.ts (register collection)
- artifacts/cms/src/app/(frontend)/private-events/page.tsx
- artifacts/cms/components/forms/PrivateEventForm.tsx
- artifacts/cms/src/app/api/private-inquiry/route.ts
- artifacts/cms/lib/email.ts (create if not exists)

### Constraints
- preferredDate is optional — API route must not reject submissions without it
- guestCount accepts a number OR the string "Not sure yet"
- name, email, phone, message are required — validate client AND server side
- Admin email is ADMIN_EMAIL env var
- No third-party form library

### Acceptance Criteria
- [ ] Form renders all fields per PRD spec
- [ ] Missing required fields shows inline validation errors
- [ ] Valid submission saves a record in Payload admin
- [ ] Admin receives notification email with all fields
- [ ] User receives auto-reply email
- [ ] Submission without date or guest count succeeds
- [ ] Success message shown after submission
```

---

#### Feature 7 — PayPal Event Registration

```
## Feature: PayPal Event Registration

### Description
Wire the registration form to PayPal Orders API v2. On successful payment
capture, create a Booking record and send confirmation email.

### PRD Reference
Section 4.3 — Public Event Registration

### Files Involved
- artifacts/cms/src/app/api/paypal/create-order/route.ts
- artifacts/cms/src/app/api/paypal/capture-order/route.ts
- artifacts/cms/collections/Bookings.ts
- artifacts/cms/payload.config.ts (register Bookings)
- artifacts/cms/components/forms/RegistrationForm.tsx (add PayPal SDK)
- artifacts/cms/lib/paypal.ts
- artifacts/cms/lib/email.ts (booking confirmation templates)

### Constraints
- Price must be derived server-side from the Event record — never trust client amount
- Use PayPal Orders API v2 (not legacy NVP)
- Booking record created only after successful server-side capture
- PAYPAL_CLIENT_SECRET must never appear in client-side code
- Handle PayPal cancel gracefully — no booking created, no error shown

### Acceptance Criteria
- [ ] Clicking Register opens PayPal payment flow
- [ ] Completing payment creates a Booking with status: paid
- [ ] Customer receives confirmation email
- [ ] Admin receives notification email
- [ ] Cancelling returns user to event page with no error
- [ ] 0 or negative seats are rejected
- [ ] Duplicate paypalOrderIds are rejected (idempotency check)
```

---

## Reference

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Payload CMS 3.x docs](https://payloadcms.com/docs)
- [PayPal Orders API v2](https://developer.paypal.com/docs/api/orders/v2/)
- [Cloudflare R2 + Payload adapter](https://payloadcms.com/docs/upload/storage-adapters)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- Full PRD: `ericaspaintandsip_PRD.md`
- Replit infrastructure & gotchas: `replit.md`
