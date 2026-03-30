# FACTION — Deployment Guide

## What you need before starting

- A **GitHub** account (free) — github.com
- A **Vercel** account (free) — vercel.com
- An **Upstash** account (free) — upstash.com
- Your `.env.local` file with `ADMIN_PASSWORD` and `AUTH_SECRET` already set

---

## Step 1 — Create a GitHub repository

Go to **github.com/new** and create a new repository called `faction`.
Leave it public or private (either works with Vercel).
Do NOT initialise it with a README — you'll push your existing code.

Then in your Terminal, drag the `faction` folder in and run:

```bash
git init
git add .
git commit -m "Initial FACTION commit"
git remote add origin https://github.com/YOUR_USERNAME/faction.git
git push -u origin main
```

---

## Step 2 — Set up Upstash Redis (your database)

1. Go to **console.upstash.com** and sign in
2. Click **Create Database**
3. Name it `faction`, choose **Global** type, pick your closest region
4. Click **Create**
5. On the database page, click the **REST API** tab
6. Copy both values — you'll need them in Step 4:
   - `UPSTASH_REDIS_REST_URL` → this is your `KV_REST_API_URL`
   - `UPSTASH_REDIS_REST_TOKEN` → this is your `KV_REST_API_TOKEN`

> **Free tier limits:** 10,000 commands/day, 256MB storage. More than enough for FACTION.

---

## Step 3 — Import into Vercel

1. Go to **vercel.com/new**
2. Click **Import Git Repository** and connect your GitHub account
3. Select the `faction` repository
4. Framework preset: **Next.js** (auto-detected)
5. Root directory: set to `faction` if your repo root contains a wrapper folder, otherwise leave blank
6. **Do not deploy yet** — add environment variables first (Step 4)

---

## Step 4 — Set environment variables in Vercel

In **Project → Settings → Environment Variables**, add all five:

| Variable | Value | Where to get it |
|---|---|---|
| `ADMIN_PASSWORD` | Your chosen password | Your `.env.local` file |
| `AUTH_SECRET` | 64-char hex string | Your `.env.local` file |
| `KV_REST_API_URL` | `https://xxx.upstash.io` | Upstash REST API tab |
| `KV_REST_API_TOKEN` | Long token string | Upstash REST API tab |
| `NEXT_PUBLIC_BASE_URL` | `https://faction.vercel.app` | Your Vercel project URL (set after first deploy, then redeploy) |
| `CRON_SECRET` | Any random string | Generate: `openssl rand -base64 32` |

> Set all variables for **Production**, **Preview**, and **Development** environments.

---

## Step 5 — Deploy

Click **Deploy**. Vercel runs `next build` and serves the site globally via CDN.

On first page load after deploy, the KV auto-bootstrap kicks in — it reads all 9 fact files from the built filesystem and seeds them into your Upstash Redis database automatically. No manual migration needed.

---

## Step 6 — Update NEXT_PUBLIC_BASE_URL

After the first deploy completes:
1. Vercel gives you a URL like `https://faction-abc123.vercel.app`
2. Go to **Project → Settings → Environment Variables**
3. Update `NEXT_PUBLIC_BASE_URL` to that exact URL
4. Go to **Deployments → Redeploy** to apply it

This ensures OG images, the sitemap, and canonical URLs all point to the correct domain.

---

## Step 7 (optional) — Add a custom domain

In **Project → Settings → Domains**, add your domain (e.g. `faction.news`).
Follow Vercel's DNS instructions (usually one CNAME record).
Once verified, update `NEXT_PUBLIC_BASE_URL` to `https://faction.news` and redeploy.

---

## How it works in production

| Feature | How it runs |
|---|---|
| Public fact-file pages | Fully static — served from Vercel's global CDN |
| Admin panel edits | Write to Upstash Redis via KV REST API |
| Submissions | Stored in Upstash Redis |
| Link health results | Stored in Upstash Redis |
| View counts | Atomic INCR in Upstash Redis — no cookies |
| Daily link check | Vercel Cron → `/api/cron/check-links` at 3 AM UTC |
| OG images | Node.js serverless function |
| Session auth | httpOnly cookie, verified against `AUTH_SECRET` |

---

## Admin workflow in production

Since Vercel's filesystem is ephemeral, the correct workflow for editing fact files is:

1. Edit JSON files locally in `content/fact-files/`
2. Commit and push to GitHub
3. Vercel auto-deploys — the new build includes your changes
4. The KV bootstrap updates Redis with the new content on next cold start

OR: use the admin panel UI for small edits (adding evidence, timeline events) — those write directly to Upstash Redis and are immediately live.

---

## Verify cron setup

After deploying, check: **Vercel Dashboard → Project → Settings → Crons**

You should see:
- Path: `/api/cron/check-links`
- Schedule: `0 3 * * *` (3:00 AM UTC daily)

Trigger manually to test:
```bash
curl -X GET https://your-project.vercel.app/api/cron/check-links \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Local development

```bash
cp .env.local.example .env.local
# Edit .env.local with your values

npm install
npm run dev
# → http://localhost:3000
```

Without `KV_REST_API_URL` set, the app uses filesystem storage automatically.
All features work locally except view count tracking (which silently skips).
