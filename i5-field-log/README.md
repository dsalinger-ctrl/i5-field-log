# I-5 Field Production Log

Mobile-first production tracking for I-5 Design install teams.
**PPMPH** = Points / (Men x Hours) - Target: 0.65

## Quick Start (local dev)

```bash
git clone <your-repo>
cd i5-field-log
npm install
cp .env.example .env.local
# Fill in your Supabase keys (see Setup below)
npm run dev
```

## Step-by-Step Deploy Guide

### 1. Create a Supabase project

1. Go to supabase.com and sign up.
2. Click New project, choose a name (e.g. i5-field-log), pick a region, set a DB password.
3. Wait ~2 min for the project to provision.
4. Go to Project Settings -> API and copy:
   - Project URL -> NEXT_PUBLIC_SUPABASE_URL
   - anon / public key -> NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key (secret) -> SUPABASE_SERVICE_ROLE_KEY

### 2. Run the migrations

In the Supabase dashboard -> SQL Editor -> run each migration in order:

1. Paste and run supabase/migrations/001_init.sql
2. Paste and run supabase/migrations/002_seed.sql

### 3. Configure email auth

1. Supabase dashboard -> Authentication -> Providers -> Email -> make sure Enable Email is on.
2. Under Auth -> Settings set Site URL to your Vercel domain.
3. Make sure Magic Link is enabled (it is by default).

### 4. Deploy to Vercel

1. Push your code to GitHub.
2. Go to vercel.com -> Add New Project -> import your repo.
3. In Vercel project settings -> Environment Variables, add:

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | your anon key |
| SUPABASE_SERVICE_ROLE_KEY | your service role key |
| NEXT_PUBLIC_SITE_URL | your Vercel app URL |

4. Click Deploy. Vercel auto-detects Next.js.
5. After deploy, copy your Vercel URL back into Supabase -> Auth -> Settings -> Site URL and Redirect URLs.

### 5. First sign-in

1. Go to your app URL -> enter dsalinger@i5design.com -> click Send sign-in link.
2. Check email, click the magic link.
3. Your account is automatically assigned the admin role.

### 6. Invite teammates

1. Sign in as admin -> Users in the nav.
2. Enter teammate email -> Invite. They will receive a Supabase invite email.

## Features

| Feature | Route |
|---------|-------|
| Dashboard (KPIs + charts) | /dashboard |
| Log a day | /log |
| Entries table + rollups | /entries |
| CSV export / import | /export |
| Projects admin | /admin/projects |
| User management | /admin/users |

## PPMPH Formula

```
PPMPH = Points / (Men x Hours)
Man-Hours = Men x Hours
Points per Man-Day = Points / Men
```

Computed as Postgres GENERATED columns -- the math is always correct and cannot drift.

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS for styling
- Recharts for charts
- Supabase -- Postgres + Auth + Row-Level Security
- Vercel for hosting

## CSV Import Format

```csv
entry_date,project,men,hours,points,notes
2025-01-15,Legends,6,9,38.5,Good day
2025-01-16,Legends,5,8,31,Short day
```

- entry_date: YYYY-MM-DD
- project: must match existing project name exactly
- notes: optional
