# DEPLOYMENT_PLAN.md — ericaspaintandsip.com Pipeline Blueprint

This document defines the complete multi-environment deployment strategy and infrastructure setup for migrating the Next.js 15 + Payload CMS 3 pnpm monorepo from local development to active staging and production environments on Replit.

---

## Executive Architecture Summary

Rather than manipulating DNS entries for routine code updates—which introduces propagation latency and operational risk—this architecture relies on a static, branch-driven pipeline:

* **Staging Environment (`staging.ericaspaintandsip.com`):** Tracks the `main` branch automatically. Powered by a Replit Autoscale deployment (scales to zero when idle for cost-efficiency).
* **Production Environment (`ericaspaintandsip.com`):** Tracks a dedicated `production` branch. Powered by a Replit Reserved VM deployment (always-on to prevent cold-start latency, maintain persistent PostgreSQL connection pools, and ensure reliable PayPal webhook processing).

---

## Phase 1: Pre-Flight Code & Configuration Audit

Before triggering a deployment, the codebase must strictly adhere to the constraints defined in `CLAUDE.md`:

1. **Workspace Routing Check:**
   * Verify `artifacts/cms/next.config.mjs` retains `basePath: "/cms"`. Do not alter this value, as the workspace router will 404 all CMS administrative and API endpoints without it.
2. **Database Schema Sync Configuration:**
   * Open `artifacts/cms/payload.config.ts`. Ensure the PostgreSQL adapter configuration strictly implements the environment gate for schema pushes:
     ```ts
     push: process.env.NODE_ENV !== 'production'
     ```
   * *Constraint:* `push` must evaluate to `false` in production to safeguard live database schemas from accidental alteration or destructive syncs.
3. **Monorepo Compilation Verification:**
   * Execute the following compilation sequence from the repository root to guarantee zero build-time blockers:
     ```bash
     pnpm install
     pnpm run typecheck
     pnpm --filter ./artifacts/cms build
     ```

---

## Phase 2: Git Branch Lifecycle Setup

To decouple active development from the live public-facing application, map out your tracking environments using Git branches:

1. **`main` Branch (Staging Base):**
   * This remains your primary default branch. All feature integrations, pull requests, and exploratory updates are merged here first.
2. **`production` Branch (Production Base):**
   * Initialize a new long-lived tracking branch named `production` stemming directly from a stable point on `main`:
     ```bash
     git checkout main
     git checkout -b production
     git push origin production
     ```
   * *Workflow Rule:* Code is never written directly on the `production` branch. Upgrades to the live site are executed via a quick-forward Git merge: `main` $\rightarrow$ `production`.

---

## Phase 3: Replit Deployment Target Parameters

Configure your targets inside the Replit Publishing Interface exactly as specified below.

### Target 1: Staging Deployment Configuration

* **Custom Domain:** `staging.ericaspaintandsip.com`
* **Deployment Type:** Autoscale
* **Repository Branch Link:** `main`
* **Build Command:** `pnpm install && pnpm build`
* **Start Command:** `pnpm --prefix artifacts/cms start`
* **Required Secrets (Secrets Panel):**
  ```env
  NODE_ENV=development
  DATABASE_URL=postgresql://[your-staging-postgres-string]
  PAYPAL_CLIENT_ID=[your-paypal-sandbox-client-id]
  NEXT_PUBLIC_PAYPAL_CLIENT_ID=[your-paypal-sandbox-client-id]
  PAYPAL_MODE=sandbox
  R2_BUCKET=ericaspaintandsip-staging
  NEXT_PUBLIC_SITE_URL=[https://staging.ericaspaintandsip.com](https://staging.ericaspaintandsip.com)

  Secret / Resource Scope,Staging Context (main),Production Context (production)
PostgreSQL Instance,Isolated Staging Database Cluster,Fully Isolated Production Database Cluster
Cloudflare R2 Bucket,ericaspaintandsip-staging,ericaspaintandsip-production
PayPal Gateway Environment,Sandbox (Simulated transaction testing),Live (Real-world merchant capture)
Payload Configuration,push: true (Auto migrations active),push: false (Strict database protection)


```markdown
# DEPLOYMENT_PLAN.md — ericaspaintandsip.com Pipeline Blueprint

This document defines the complete multi-environment deployment strategy and infrastructure setup for migrating the Next.js 15 + Payload CMS 3 pnpm monorepo from local development to active staging and production environments on Replit.

---

## Executive Architecture Summary

Rather than manipulating DNS entries for routine code updates—which introduces propagation latency and operational risk—this architecture relies on a static, branch-driven pipeline:

* **Staging Environment (`staging.ericaspaintandsip.com`):** Tracks the `main` branch automatically. Powered by a Replit Autoscale deployment (scales to zero when idle for cost-efficiency).
* **Production Environment (`ericaspaintandsip.com`):** Tracks a dedicated `production` branch. Powered by a Replit Reserved VM deployment (always-on to prevent cold-start latency, maintain persistent PostgreSQL connection pools, and ensure reliable PayPal webhook processing).

---

## Phase 1: Pre-Flight Code & Configuration Audit

Before triggering a deployment, the codebase must strictly adhere to the constraints defined in `CLAUDE.md`:

1. **Workspace Routing Check:**
   * Verify `artifacts/cms/next.config.mjs` retains `basePath: "/cms"`. Do not alter this value, as the workspace router will 404 all CMS administrative and API endpoints without it.
2. **Database Schema Sync Configuration:**
   * Open `artifacts/cms/payload.config.ts`. Ensure the PostgreSQL adapter configuration strictly implements the environment gate for schema pushes:
     ```ts
     push: process.env.NODE_ENV !== 'production'
     ```
   * *Constraint:* `push` must evaluate to `false` in production to safeguard live database schemas from accidental alteration or destructive syncs.
3. **Monorepo Compilation Verification:**
   * Execute the following compilation sequence from the repository root to guarantee zero build-time blockers:
     ```bash
     pnpm install
     pnpm run typecheck
     pnpm --filter ./artifacts/cms build
     ```

---

## Phase 2: Git Branch Lifecycle Setup

To decouple active development from the live public-facing application, map out your tracking environments using Git branches:

1. **`main` Branch (Staging Base):**
   * This remains your primary default branch. All feature integrations, pull requests, and exploratory updates are merged here first.
2. **`production` Branch (Production Base):**
   * Initialize a new long-lived tracking branch named `production` stemming directly from a stable point on `main`:
     ```bash
     git checkout main
     git checkout -b production
     git push origin production
     ```
   * *Workflow Rule:* Code is never written directly on the `production` branch. Upgrades to the live site are executed via a quick-forward Git merge: `main` $\rightarrow$ `production`.

---

## Phase 3: Replit Deployment Target Parameters

Configure your targets inside the Replit Publishing Interface exactly as specified below.

### Target 1: Staging Deployment Configuration

* **Custom Domain:** `staging.ericaspaintandsip.com`
* **Deployment Type:** Autoscale
* **Repository Branch Link:** `main`
* **Build Command:** `pnpm install && pnpm build`
* **Start Command:** `pnpm --prefix artifacts/cms start`
* **Required Secrets (Secrets Panel):**
  ```env
  NODE_ENV=development
  DATABASE_URL=postgresql://[your-staging-postgres-string]
  PAYPAL_CLIENT_ID=[your-paypal-sandbox-client-id]
  NEXT_PUBLIC_PAYPAL_CLIENT_ID=[your-paypal-sandbox-client-id]
  PAYPAL_MODE=sandbox
  R2_BUCKET=ericaspaintandsip-staging
  NEXT_PUBLIC_SITE_URL=[https://staging.ericaspaintandsip.com](https://staging.ericaspaintandsip.com)

```

### Target 2: Production Deployment Configuration

* **Custom Domain:** `ericaspaintandsip.com`
* **Deployment Type:** Reserved VM (Select a tier with at least 1–2 vCPU and 2 GB RAM to guarantee standard Next.js Server Side Rendering and Payload memory footprints)
* **Repository Branch Link:** `production`
* **Build Command:** `pnpm install && pnpm build`
* **Start Command:** `pnpm --prefix artifacts/cms start`
* **Required Secrets (Secrets Panel):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://[your-isolated-production-postgres-string]
PAYPAL_CLIENT_ID=[your-paypal-live-client-id]
NEXT_PUBLIC_PAYPAL_CLIENT_ID=[your-paypal-live-client-id]
PAYPAL_MODE=live
R2_BUCKET=ericaspaintandsip-production
NEXT_PUBLIC_SITE_URL=[https://ericaspaintandsip.com](https://ericaspaintandsip.com)

```



---

## Phase 4: Operational Environment & Secret Segregation

To maintain absolute data integrity, secrets and resources must never overlap between environments:

| Secret / Resource Scope | Staging Context (`main`) | Production Context (`production`) |
| --- | --- | --- |
| **PostgreSQL Instance** | Isolated Staging Database Cluster | Fully Isolated Production Database Cluster |
| **Cloudflare R2 Bucket** | `ericaspaintandsip-staging` | `ericaspaintandsip-production` |
| **PayPal Gateway Environment** | Sandbox (Simulated transaction testing) | Live (Real-world merchant capture) |
| **Payload Configuration** | `push: true` (Auto migrations active) | `push: false` (Strict database protection) |

---

## Phase 5: Step-by-Step Execution Guide

Follow this sequence to execute the deployment initialization:

1. **Initialize Environments:** Pass this markdown file directly to the Replit Agent to execute the Phase 1 validation checks and auto-create the `production` branch.
2. **Deploy Staging:** Open the Replit Deploy panel, create an Autoscale setup targeting the `main` branch, input your staging credentials, and connect `staging.ericaspaintandsip.com`.
3. **Verify Staging:** Access `/cms/admin` on staging, execute a test event registration using a PayPal Sandbox buyer account, and confirm that media uploads accurately land inside your staging R2 storage bucket.
4. **Go Live:** Merge `main` into `production`. Return to the Replit Deploy panel, spin up a Reserved VM targeting the `production` branch, insert your production credentials, and link `ericaspaintandsip.com`.

```

```