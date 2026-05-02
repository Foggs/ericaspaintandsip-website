# CLAUDE.md — ericaspaintandsip.com

This file gives Claude (and any AI coding assistant) full context on how this project is structured, what conventions to follow, and what to avoid. Read this before writing any code.

---

## Project Overview

**Site:** ericaspaintandsip.com
**Purpose:** Public website for a paint-and-sip entertainment business — event listings, online registration, private event inquiries, photo gallery, blog, and newsletter signup.

**Stack:**
- **Framework:** Next.js (App Router, React Server Components)
- **CMS:** Payload CMS 3.x — runs inside Next.js, same process
- **Database:** MongoDB Atlas
- **Payments:** PayPal Orders API v2
- **Styling:** Tailwind CSS
- **Email:** Nodemailer or Resend (transactional only)
- **Media:** Cloudflare R2 (S3-compatible) for all uploads
- **Dev/Staging:** Replit
- **Production:** Separate host (Vercel / Railway / Render — TBD)

---

## Commands

```bash
# Install dependencies
npm install

# Run dev server (Next.js + Payload together)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Payload types
npm run generate:types
```

> Payload CMS and Next.js share the same `npm run dev` process. Do not run them separately.

---

## Project Structure

```
/
├── app/                        # Next.js App Router
│   ├── (frontend)/             # Public-facing route group
│   │   ├── page.tsx            # Homepage
│   │   ├── events/
│   │   │   ├── page.tsx        # Event listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Event detail + registration
│   │   ├── private-events/
│   │   │   └── page.tsx        # Private event inquiry form
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── (payload)/              # Payload admin route group
│   │   └── admin/[[...segments]]/
│   │       └── page.tsx
│   └── api/                    # API routes
│       ├── paypal/
│       │   ├── create-order/route.ts
│       │   └── capture-order/route.ts
│       └── [...payload]/       # Payload REST API catch-all
│           └── route.ts
├── collections/                # Payload collection configs
│   ├── Events.ts
│   ├── Bookings.ts
│   ├── PrivateInquiries.ts
│   ├── GalleryPhotos.ts
│   ├── Posts.ts
│   ├── NewsletterSubscribers.ts
│   └── Media.ts
├── components/                 # Shared UI components
│   ├── ui/                     # Primitive components (buttons, inputs, etc.)
│   ├── layout/                 # Header, Footer, Nav
│   ├── events/                 # Event-specific components
│   ├── gallery/
│   ├── blog/
│   └── forms/                  # All form components
├── lib/                        # Shared utilities
│   ├── payload.ts              # Payload client / local API helper
│   ├── paypal.ts               # PayPal API helpers
│   ├── email.ts                # Email sending helpers
│   └── utils.ts                # General utilities
├── payload.config.ts           # Payload CMS config (root level)
├── tailwind.config.ts
├── next.config.ts
└── .env.local                  # Local env vars (never commit)
```

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
import './EventCard.css'
import { formatDate } from './utils'
```

`tsconfig.json` should have `"@/*": ["./*"]` path alias configured.

---

## Environment Variables

All secrets live in `.env.local` (dev) and are set in the host dashboard (staging/prod). Never hardcode them, never expose `PAYPAL_CLIENT_SECRET` or `PAYLOAD_SECRET` to the client.

```bash
# Database
DATABASE_URI=mongodb+srv://...

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

Each collection lives in `collections/` and is registered in `payload.config.ts`. These are the canonical collections — do not create new ones without updating this file and the PRD.

| Collection | Slug | Notes |
|---|---|---|
| Events | `events` | Public paint-and-sip events |
| Bookings | `bookings` | Created server-side after PayPal capture — never by users directly |
| Private Inquiries | `private-inquiries` | Form submissions from `/private-events` |
| Gallery Photos | `gallery-photos` | Ordered by `sortOrder` field asc |
| Posts | `posts` | Blog articles |
| Newsletter Subscribers | `newsletter-subscribers` | Email list — `email` field must be unique |
| Media | `media` | Payload built-in, configured with R2 adapter |
| Users | `users` | Admin only — Payload built-in auth |

### Key rules for collections

- Always define `admin.useAsTitle` on every collection
- Always add `timestamps: true` to every collection
- Use `access: { read: () => true }` only on public-facing collections (`events`, `posts`, `gallery-photos`)
- `bookings` and `private-inquiries` should be **admin-read-only** from the public API:
  ```ts
  access: {
    read: isAdminOrSelf,
    create: () => true,   // Created via server action / API route only
    update: isAdmin,
    delete: isAdmin,
  }
  ```

---

## PayPal Integration

Use **PayPal Orders API v2** (not legacy NVP/SOAP). Flow:

1. Client clicks "Register" → calls `POST /api/paypal/create-order` with `eventId` and `seats`
2. Server creates PayPal order, returns `orderID`
3. Client completes payment in PayPal JS SDK
4. Client calls `POST /api/paypal/capture-order` with `orderID`
5. Server captures payment, verifies amount, creates `Booking` record in Payload, sends confirmation email
6. Client receives success response and shows confirmation UI

**Never trust the client** for the amount — always re-derive price from the event record server-side before creating the PayPal order.

---

## Email

All transactional emails are sent from `lib/email.ts`. Three triggers:

| Trigger | Recipients | Template |
|---|---|---|
| Booking confirmed (PayPal capture success) | Customer + admin | Booking confirmation |
| Private inquiry submitted | Admin | Inquiry details |
| Private inquiry submitted | Customer | Auto-reply / "we'll be in touch" |

Keep email templates as plain HTML strings in `lib/email.ts` — no external template engine needed at this scale.

---

## Forms

All forms are in `components/forms/`. Use **React controlled components** with `useState` or `useReducer`. No form library is required — keep it simple.

### Private Event Booking Form fields

| Field | Required | Type | Notes |
|---|---|---|---|
| First & Last Name | Yes | text | |
| Email | Yes | email | |
| Phone | Yes | tel | |
| Preferred Date | No | date | |
| Number of Guests | No | number or select | Include "Not sure yet" option |
| Message / Details | Yes | textarea | |

Validate required fields client-side before submit. Re-validate server-side in the API route before saving to Payload.

---

## Styling Conventions

- Use **Tailwind utility classes** directly on JSX elements — no custom CSS files unless unavoidable
- **No inline `style` props** unless for truly dynamic values (e.g., computed widths)
- Component variants should use `clsx` or `cn` (a `clsx` + `twMerge` wrapper in `lib/utils.ts`)
- Responsive design is **mobile-first**: base classes are mobile, `md:` and `lg:` override upward
- Animation: use **Framer Motion** for page transitions and micro-interactions

---

## TypeScript

- **Strict mode on** — `"strict": true` in `tsconfig.json`
- Always type props explicitly — no `any`, no untyped function params
- Use Payload's **generated types** (`npm run generate:types`) — import from `@/payload-types`
- Prefer `type` over `interface` for component props; use `interface` for extendable data shapes

---

## Code Style

- **No linter is configured yet** — follow these rules manually until one is added:
  - 2-space indentation
  - Single quotes for strings
  - No semicolons (Next.js default style)
  - Trailing commas in multi-line objects and arrays
- **Named exports** for all components — no default exports except Next.js pages and layouts (required by the framework)
- **Server Components by default** — only add `'use client'` when the component needs browser APIs, event handlers, or React state
- Keep Server Components lean: fetch data at the top, pass as props to Client Components

---

## Replit-Specific Notes

- The app runs as a single process — Next.js and Payload share the same Node server
- **Media uploads must go to Cloudflare R2** — Replit's filesystem is ephemeral and will lose files on restart
- Set all environment variables in Replit's **Secrets** panel, not in `.env` files committed to the repo
- If the dev server is slow to start, it's normal — Payload initializes the DB connection on first boot
- Use Replit's **Reserved VM** (not the free tier) for staging to avoid cold starts

---

## What Not to Do

- **Don't** create API routes that expose raw Payload collection data without access checks
- **Don't** store PayPal credentials or `PAYLOAD_SECRET` in any file that gets committed
- **Don't** use `getServerSideProps` or `getStaticProps` — this is App Router only
- **Don't** add `'use client'` to layout or page files unless absolutely necessary
- **Don't** write Booking records from the client — only from the server-side capture route
- **Don't** use `fetch` inside Client Components to hit Payload's local API — use Server Components or Server Actions instead

---

## Reference

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [Payload CMS 3.x docs](https://payloadcms.com/docs)
- [PayPal Orders API v2](https://developer.paypal.com/docs/api/orders/v2/)
- [Cloudflare R2 + Payload adapter](https://payloadcms.com/docs/upload/storage-adapters)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- Full PRD: `ericaspaintandsip_PRD.md`
