# 🚀 Lead → Launch SaaS: Live Deployment & Multi-User Guide

This guide explains how to run, customize, and deploy **Lead $\rightarrow$ Launch** as a multi-tenant SaaS application so that freelancers, agencies, and businesses can create accounts, run automated lead audits, build AI redesigns, and manage deals in their persistent CRM.

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies & Set Environment
Install dependencies from the repository root:
```bash
npm install
```

Ensure your `.env.local` contains:
```env
# Apify Token for Google Maps Lead Scraping (Optional: fallback generator works automatically)
APIFY_TOKEN=apify_api_...
APIFY_ACTOR=compass~crawler-google-places

# Database Connection (Zero config SQLite default)
DATABASE_URL="file:./dev.db"

# JWT Secret Key for Session Authentication
JWT_SECRET="your-secure-jwt-secret-key-32-chars-long"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Start the SaaS App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏢 Multi-Tenant Features Included

1. **SaaS Landing Page (`/`)**:
   - High-impact Hero, 5-Phase pipeline overview, interactive Revenue Calculator, Transparent Pricing tiers, and FAQ.
2. **Authentication System (`/login` & `/signup`)**:
   - Separate roles for **Freelancers** (Solo OS) and **Agencies** (Team Suite with custom agency branding).
   - 1-Click Instant Demo login buttons for both Freelancer and Agency accounts.
   - Secure HTTP-only JWT sessions.
3. **Database Persistence (`lib/db.ts`)**:
   - Multi-tenant data isolation: Each user owns their own campaigns, leads, audits, and deals.
   - Zero-dependency embedded database storage in `data/database.json` with support for PostgreSQL.
4. **Campaign Switcher & Saved Pipelines**:
   - Ability to save scraped leads as distinct campaigns (e.g. *"Austin Dentists"*, *"Miami Spas"*).
   - Load and switch between campaigns anytime from the top bar.
5. **Deals CRM & Revenue Tracking**:
   - Persistent Kanban pipeline stages (*Prospect*, *Demo Built*, *Pitch Sent*, *Call Booked*, *Closed Won*).
6. **Workspace Settings**:
   - Customize Agency Name, Logo, Anthropic Claude API Key, and OpenAI API Key.

---

## 🌐 Deploying Live to Production

### Option A: Deploy on Vercel (Recommended - 2 Minutes)
1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) $\rightarrow$ **Add New Project**.
3. Ensure the **Root Directory** is set to `./` (repository root, default). **Do NOT set it to `app`**.
4. Add Environment Variables:
   - `JWT_SECRET`: A random 32+ character string.
   - `DATABASE_URL`: `file:./dev.db` (or PostgreSQL URL from Neon/Supabase).
   - `APIFY_TOKEN`: Your Apify Google Maps scraping token.
5. Click **Deploy**. Your SaaS is now live with an SSL certificate!

> **Note for Existing Vercel Deployments**: If you previously configured Vercel with **Root Directory: `app`** when the repo was nested, navigate to **Project Settings $\rightarrow$ General $\rightarrow$ Root Directory**, click **Edit**, reset it to `./` (empty / repo root), and save. Then redeploy with **"Redeploy with uncheck Use build cache"** to ensure clean build artifacts.

### Option B: Deploy on Hostinger / VPS / Render
1. SSH into your VPS or open Hostinger Node.js panel.
2. Clone repository and run:
   ```bash
   npm install
   npm run build
   npm run start
   ```
3. Use PM2 or systemd for auto-restart:
   ```bash
   pm2 start "npm run start" --name "lead-to-launch-saas"
   ```

---

## 🔑 Demo Accounts
- **Freelancer Demo**: `demo.freelancer@lead-to-launch.io` (Password: `demo123456`)
- **Agency Demo**: `demo.agency@lead-to-launch.io` (Password: `demo123456`)
*(Or click the 1-click demo buttons on the login page!)*
