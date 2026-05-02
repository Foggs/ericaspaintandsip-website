# ericaspaintandsip.com — Website Redesign PRD

**Version:** 1.0 Draft
**Date:** May 2, 2026
**Stack:** Next.js · Payload CMS · Replit
**Status:** Draft

---

## 1. Project Overview

Erica's Paint & Sip is a paint-and-sip entertainment business. The existing WordPress site is being replaced with a modern, dynamic web presence built on Next.js and Payload CMS. The new site must feel vibrant and energetic, reflect the brand's fun personality, and give the business owner full control over content without touching code.

### 1.1 Goals

- Deliver a modern, dynamic visual experience that stands out in the paint-and-sip market
- Enable self-service content management for all key content types via Payload CMS admin
- Streamline the public event registration and private event inquiry workflows
- Grow the email list through an integrated newsletter signup
- Establish a solid technical foundation (Next.js + Payload CMS) that is maintainable and extensible

### 1.2 Out of Scope

- E-commerce / merchandise store (future phase)
- User accounts or member login portal
- Migration of any content from the existing WordPress site — all content starts fresh
- SEO URL redirects — fresh URL structure, no redirect mapping needed

---

## 2. Technical Architecture

### 2.1 Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router, React Server Components) |
| CMS / Backend | Payload CMS 3.x (headless, runs inside Next.js) |
| Database | MongoDB Atlas (recommended) or PostgreSQL |
| Payments | PayPal (public event registration fees) |
| Email Notifications | Nodemailer or Resend for transactional email |
| Media Storage | Payload local storage (dev) → S3-compatible bucket (prod) |
| Styling | Tailwind CSS |
| Dev / Staging | Replit (Reserved VM or Autoscale) |
| Production | Separate host — Vercel, Railway, or Render (TBD) |

### 2.2 Deployment Architecture

Development and staging will run on Replit. The production environment will be hosted on a separate platform (Vercel, Railway, or Render) to ensure performance, uptime SLAs, and cost efficiency at scale. Environment variables will be managed separately per environment.

#### Required Environment Variables

- `DATABASE_URI` — MongoDB or Postgres connection string
- `PAYLOAD_SECRET` — JWT secret for Payload CMS
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` — PayPal API credentials
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` — transactional email
- `NEXT_PUBLIC_SITE_URL` — canonical site URL per environment

---

## 3. Site Map & Pages

| Route | Description |
|---|---|
| `/` | Hero, featured events, gallery preview, newsletter signup CTA |
| `/events` | Paginated list of all upcoming public events |
| `/events/[slug]` | Single event detail — description, date/time, price, registration form |
| `/private-events` | Private event info page + booking inquiry form |
| `/gallery` | Photo gallery grid — filterable by category |
| `/blog` | Blog post listing page |
| `/blog/[slug]` | Single blog post |
| `/contact` | Contact info + optional general inquiry form |
| `/admin` | Payload CMS admin panel (staff only) |

---

## 4. Feature Specifications

### 4.1 Feature Priority Matrix

| Feature | Priority | Complexity | Notes |
|---|---|---|---|
| Event Listings & Calendar | P0 — Must Have | Medium | Core business feature |
| Private Event Booking Form | P0 — Must Have | Low | Primary lead-gen form |
| Public Event Registration + PayPal | P0 — Must Have | Medium | Revenue-generating |
| Photo Gallery | P1 — Should Have | Low | Brand showcase |
| Blog / News | P1 — Should Have | Low | SEO + engagement |
| Newsletter Signup | P1 — Should Have | Low | Email list growth |
| Homepage Hero + Animations | P1 — Should Have | Low | Modern feel |
| Payload CMS Admin | P0 — Must Have | Medium | Content control |

### 4.2 Public Event Listings

Events are created and managed entirely in Payload CMS. The public `/events` page shows all upcoming events in chronological order.

#### Event Data Model (`events` collection)

- `title` — Text (required)
- `slug` — Auto-generated from title
- `date` — Date/Time (required)
- `duration` — Number in minutes
- `location` — Text (e.g., "Main Studio" or full address)
- `price` — Number (USD)
- `capacity` — Number (max attendees)
- `description` — Rich text
- `coverImage` — Upload (Payload Media)
- `isPublished` — Boolean toggle

### 4.3 Public Event Registration

On each event detail page, users can register and pay via PayPal. The flow is:

1. User fills out name, email, phone, number of seats
2. User is redirected to PayPal to complete payment
3. On PayPal return (success), a Booking record is created in Payload
4. Confirmation email sent to the user via transactional email
5. Admin receives a notification email with booking details

#### Booking Data Model (`bookings` collection)

- `event` — Relationship to Event
- `name` — Text
- `email` — Email
- `phone` — Text
- `seats` — Number
- `paypalOrderId` — Text (from PayPal)
- `status` — Select: `pending` | `paid` | `cancelled`
- `createdAt` — Auto timestamp

### 4.4 Private Event Booking Form

A standalone inquiry form on `/private-events`. No payment is taken upfront. The admin reviews the submission and replies manually by phone or email.

#### Form Fields

| Field | Type |
|---|---|
| First & Last Name | Text — Required |
| Email Address | Email — Required |
| Phone Number | Tel — Required |
| Preferred Date | Date picker — Optional |
| Number of Guests | Number or "Not sure yet" select — Optional |
| Event Details / Message | Textarea — Required |

**On submission:**

- Inquiry saved to Payload CMS (`privateInquiries` collection)
- Admin receives notification email with all form details
- User receives auto-reply: "Thank you! We'll be in touch within 24 hours."

#### PrivateInquiry Data Model (`privateInquiries` collection)

- `name` — Text
- `email` — Email
- `phone` — Text
- `preferredDate` — Date (optional)
- `guestCount` — Number or "Not sure" (optional)
- `message` — Textarea
- `createdAt` — Auto timestamp

### 4.5 Photo Gallery

A filterable grid of images managed in Payload CMS. Each photo has an optional category tag (e.g., "Events," "Behind the Scenes," "Paintings"). Clicking an image opens a lightbox.

#### GalleryPhoto Data Model (`galleryPhotos` collection)

- `image` — Upload (Payload Media)
- `caption` — Text (optional)
- `category` — Select or relationship to Category
- `sortOrder` — Number (drag-to-reorder in admin)

### 4.6 Blog / News

A standard blog with rich text posts. Used for event recaps, tips, and announcements.

#### Post Data Model (`posts` collection)

- `title` — Text
- `slug` — Auto-generated
- `publishedDate` — Date
- `excerpt` — Text (for listing cards)
- `content` — Rich text (Payload Lexical editor)
- `coverImage` — Upload
- `isPublished` — Boolean

### 4.7 Newsletter Signup

A signup form (name + email) appears in the site footer and as a CTA section on the homepage. Submissions are stored in a Payload collection (`newsletterSubscribers`). The admin exports or manages this list manually.

#### NewsletterSubscriber Data Model (`newsletterSubscribers` collection)

- `name` — Text
- `email` — Email (unique)
- `subscribedAt` — Auto timestamp

---

## 5. Payload CMS Configuration

### 5.1 Collections Summary

| Collection | Purpose |
|---|---|
| `events` | Upcoming public events |
| `bookings` | Public event registrations (auto-created on PayPal success) |
| `privateInquiries` | Private event booking form submissions |
| `galleryPhotos` | Gallery images with category and sort order |
| `posts` | Blog articles |
| `newsletterSubscribers` | Email list |
| `media` | Payload built-in media library |
| `users` | Admin users (Payload built-in auth) |

### 5.2 Admin Access

Only the site owner has access to the Payload admin panel at `/admin`. Role: `admin`. Future staff accounts can be added with `editor` role restrictions.

---

## 6. Design Direction

### 6.1 Visual Principles

- Modern and dynamic — the site should feel alive, not static
- Reflect the energy of a paint-and-sip experience: color, joy, creativity
- Strong typography hierarchy; generous use of imagery and gallery photos
- Smooth page transitions and micro-animations (Framer Motion recommended)
- Mobile-first responsive design

### 6.2 Suggested Design Tokens

| Token | Value |
|---|---|
| Primary color | Deep purple or magenta — to be finalized with brand |
| Accent | Warm gold or coral for CTAs |
| Background | Off-white or soft cream (avoids clinical white) |
| Typography | Display font for headings (e.g., Playfair Display or Fraunces) + clean sans for body |
| Imagery | Full-bleed hero images, overlapping photo cards, masonry gallery |

---

## 7. Non-Functional Requirements

| Requirement | Details |
|---|---|
| Performance | Lighthouse score ≥ 85 on mobile; images served via Next.js Image with lazy loading |
| SEO | Metadata API via Next.js `generateMetadata`; OG images per page; `sitemap.xml` |
| Accessibility | WCAG 2.1 AA minimum; keyboard navigable; proper ARIA on forms |
| Security | Payload admin behind auth; PayPal webhooks verified by signature; env vars never exposed to client |
| Email | Transactional emails for: booking confirmation, private inquiry receipt, admin notifications |
| Uptime (Prod) | 99.9% — handled by separate production host (Vercel/Railway/Render) |

---

## 8. Risks & Trade-offs

| Risk | Mitigation |
|---|---|
| Replit cold starts | Use Reserved VM or Autoscale for staging to mimic prod and avoid cold-start latency |
| PayPal webhook reliability | PayPal IPN/webhooks can be delayed. Implement a polling fallback or use PayPal Orders API v2 with client-side capture confirmation |
| Payload + Next.js on same process | Payload 3.x is designed to run inside Next.js. Monitor memory on Replit — may need to increase dyno size |
| Media storage on Replit | Replit filesystem is ephemeral on some plans. Use an S3-compatible bucket (Cloudflare R2 recommended — free tier) for all uploaded media from day one |
| No URL migration | Starting fresh means losing any SEO equity from the old WordPress site. Acceptable given the decision to start fresh |

---

## 9. Suggested Build Phases

### Phase 1 — Foundation

- Replit project setup: Next.js + Payload CMS + MongoDB
- Payload collections: `events`, `bookings`, `privateInquiries`, `media`, `users`
- Core pages: Home, Events list, Event detail, Private Events
- Private event booking form + admin email notification
- Payload admin panel working end-to-end

### Phase 2 — Commerce & Content

- PayPal integration for public event registration
- Booking confirmation emails
- Gallery collection + `/gallery` page with lightbox
- Blog collection + `/blog` and `/blog/[slug]` pages
- Newsletter signup form + subscriber collection

### Phase 3 — Polish & Launch Prep

- Full design implementation (animations, final typography, color system)
- Mobile QA across iOS and Android
- Accessibility audit
- SEO metadata, sitemap, OG images
- Production environment setup (separate host)
- DNS cutover from WordPress to new site

---

## 10. Open Questions

| Question | Notes |
|---|---|
| Production host | Vercel, Railway, or Render? Needs decision before Phase 3 |
| Database | MongoDB Atlas vs PostgreSQL? MongoDB Atlas free tier is easiest to start |
| Brand colors | Final color palette not yet defined. Needed before Phase 3 design polish |
| Media storage | Confirm S3-compatible bucket provider (Cloudflare R2 recommended) |
| Event capacity enforcement | Should the registration form block signups when capacity is full, or just warn? |
| Private inquiry response SLA | What is the expected response time to communicate to inquirers? |

---

*Document prepared for ericaspaintandsip.com — Version 1.0 Draft*
