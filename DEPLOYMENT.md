# Amphibian Unite — Deployment Guide

## Quick Start: Deploy to Vercel (30 minutes)

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import the `flyingkiwisd/amphibian-unite` repository
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy** — the app will be live at `amphibian-unite.vercel.app`

> **Custom domain**: In Vercel → Settings → Domains → add `unite.amphibiancapital.com`

### Step 2: Set Up Clerk Authentication (2 hours)
1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new **Application** → name it "Amphibian Unite"
3. In Clerk Dashboard → **API Keys**, copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)
4. In Vercel → **Settings → Environment Variables**, add:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
   CLERK_SECRET_KEY = sk_live_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
   ```
5. Redeploy (Vercel → Deployments → Redeploy)

### Step 3: Add Team Members to Clerk
In Clerk Dashboard → **Users**, create accounts for each team member:

| Name | Email | Maps to |
|------|-------|---------|
| James Hodges | james@amphibiancapital.com | `james` (CEO) |
| David Langer | david@amphibiancapital.com | `david` (Chair) |
| Mark Wagner | mark@amphibiancapital.com | `mark` (CFO) |
| Todd Bendell | todd@amphibiancapital.com | `todd` (President) |
| Paola Origel | paola@amphibiancapital.com | `paola` (BD Lead) |
| Andrew Hoppin | andrew@amphibiancapital.com | `andrew` (Strategy) |
| Ty | ty@amphibiancapital.com | `ty` (CIO) |
| Ross | ross@amphibiancapital.com | `ross` (PM) |
| Thao | thao@amphibiancapital.com | `thao` (Ops Lead) |
| Timon | timon@amphibiancapital.com | `timon` (Engineer) |
| Sahir | sahir@amphibiancapital.com | `sahir` (Prod Ops) |

> **Email mapping**: The app maps Clerk emails to team member IDs via `src/lib/auth.ts`.
> To add a new email (e.g., personal Gmail), update the `emailToMemberMap` in that file.
> Alternatively, set `publicMetadata.memberId` on the user in Clerk Dashboard.

### Step 4: Verify
1. Open your Vercel URL
2. You should see the Clerk sign-in page (branded with Amphibian Unite design)
3. Sign in with a team member email
4. You should land on that team member's personalized dashboard

---

## Dev Mode (No Clerk)
When running locally without Clerk keys, the app automatically falls back to the profile selector login screen. No configuration needed:

```bash
npm run dev  # Profile selector works without any .env
```

To test with Clerk locally, copy `.env.local.example` to `.env.local` and fill in keys.

---

## Phase 2: Supabase Database (When Ready)

### Setup
1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Go to **Settings → API** and copy the keys
4. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   ```

### Database Tables
| Table | Purpose | Priority |
|-------|---------|----------|
| `tasks` | Task Commander CRUD | 1 — Ship first |
| `notes` | Personal notes per user | 2 |
| `decisions` | Decision log entries | 3 |
| `journal_entries` | Morning/EOD/weekly/monthly | 4 |
| `okr_progress` | Weekly KR updates | 5 |
| `kpi_snapshots` | KPI values over time | 6 |
| `activity_log` | Audit trail | 7 |
| `meetings` | Meeting Intelligence | 8 |

---

## Architecture Overview

```
Browser → Vercel Edge (middleware.ts)
           ├── Clerk Auth check
           └── Next.js App Router
                ├── page.tsx (21 views, client-side routing)
                ├── /sign-in (Clerk sign-in page)
                └── /api/* (API routes)

Auth Flow:
  Clerk keys set?
    YES → Clerk middleware → Sign-in page → Email → resolveTeamMember() → Dashboard
    NO  → Profile selector (dev mode) → Dashboard
```
