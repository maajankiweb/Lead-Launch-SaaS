<div align="center">

# 🚀 Lead → Launch SaaS Platform
### AI-Powered Client Acquisition Operating System for Web Designers, SEO Agencies & IT Firms

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Cloud-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Turn under-performing local business websites into ₹1,50,000+ / $1,000–$5,000 paid web design retainers with automated proof-first outreach.</strong>
</p>

[Explore Landing Page](https://lead-to-launch.com) · [Report Bug](https://github.com/your-username/lead-to-launch/issues) · [Request Feature](https://github.com/your-username/lead-to-launch/issues)

</div>

---

## 📌 What is Lead → Launch?

**Lead → Launch** is a complete, production-ready B2B SaaS platform engineered to solve the #1 bottleneck for web designers, freelancers, and growth agencies: **"How do I consistently acquire high-paying clients without cold calling?"**

Instead of sending generic cold emails that get less than a 1% reply rate, Lead → Launch automates a **proof-of-work upfront methodology**:
1. Scrapes local businesses from Google Maps.
2. Identifies critical Core Web Vitals speed penalties, broken mobile viewports, and lost monthly revenue.
3. Generates instant Next.js redesign prompts (for Lovable, Bolt.new, v0, Claude Code).
4. Delivers personalized multi-channel WhatsApp and email scripts pre-filled with the prospect's real data.
5. Tracks deals through a built-in multi-tenant Deals CRM pipeline.

---

## 🌟 Key Features

### 🔀 Dynamic Dual-Persona Mode Switcher
- **Solo Freelancer OS**: Tailored for solo designers closing $500–$2,000 projects with zero cold calling, pre-written WhatsApp scripts, and personal CRM tracking.
- **Agency Team Suite**: Tailored for digital marketing agencies, SEO studios, and IT firms scaling $10k–$50k/mo retainers with white-label audit reports, SDR workflows, and multi-campaign database isolation.

### ⚡ 5-Phase Automated Pipeline
- **Phase 1 (Precision Scraping)**: Scrape Google Places by city, category, and radius with verified phone, website, and review counts.
- **Phase 2 (Core Web Vitals & SEO Audit)**: Automated performance diagnostics testing load speed, mobile touch UX, SSL, and schema tags.
- **Phase 3 (AI Opportunity Ranking)**: 0–100 algorithm score prioritizing high-ticket businesses with great ratings but slow, revenue-leaking websites.
- **Phase 4 (AI Redesign Prompt Generator)**: 1-click prompts ready for Lovable.dev, Bolt.new, v0.dev, or Claude Code CLI to produce live client previews in 60s.
- **Phase 5 (Multi-Channel Outreach Hub)**: Instant 1-click WhatsApp launch with pre-filled numbers, cold email teardowns, and LinkedIn DMs.

### 🍱 Interactive Bento Grid & Live Demo Hero
- **Above-The-Fold Live Scanner**: Visitors can test any live URL directly on the landing page to experience the audit engine before signing up.
- **Before / After Split Showcase**: Interactive comparison slider demonstrating the client's slow site (6.8s load time) vs the new AI Next.js redesign (0.6s instant load).
- **Agency ROI Profit Calculator**: Real-time monthly revenue and annualized run-rate simulator.

### 💳 Dual-Currency 4-Tier Monetization
- **🇮🇳 INR (₹ / UPI)** via Razorpay & **🌐 Global ($ USD)** via Stripe.
- **Monthly** & **Annual (Save 20% / 2 Months Free)** billing cycles.
- Tiers: `Starter Free`, `Freelancer Pro` ($29 / ₹1,499), `Agency Scale` ($99 / ₹4,999), and `Enterprise IT Firm` ($149 / ₹9,999).

### 📈 Built-in SEO & AEO (AI Engine Optimization)
- Automated `sitemap.xml` and `robots.txt` granting explicit crawler access to modern AI engines (`GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`).
- Schema.org JSON-LD structured data (`SoftwareApplication`, `Organization`, `FAQPage`) for Google Knowledge Panels and AI search citations.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack & React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Lucide Icons & Framer Motion
- **Database**: [MongoDB Atlas](https://www.mongodb.com/) via Mongoose (Multi-Tenant Workspace Isolation)
- **Authentication**: JWT Sessions with Role-Based Access Control (`FREELANCER`, `AGENCY`, `ADMIN`)
- **Scraping Engine**: Apify Google Maps Scraper Actor API
- **AI Engine**: Anthropic Claude 3.5 Sonnet / OpenAI API Integration + Claude Code CLI
- **Payments**: Stripe & Razorpay Checkout Integration

---

## ⚡ Quick Start & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/lead-to-launch.git
cd lead-to-launch/app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your database and API keys in `.env.local`:
```env
# MongoDB Atlas Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/lead-to-launch?retryWrites=true&w=majority"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Apify API Token (For Google Places Scraping)
APIFY_API_TOKEN="your_apify_api_token"

# Admin Master Credentials
ADMIN_EMAIL="admin@lead-to-launch.com"
ADMIN_PASSWORD="YourSecureAdminPassword123!"

# Public Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 1-Click Demo Accounts

For testing without creating an account, use the built-in 1-click demo buttons on the landing page or login with:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Freelancer Demo** | `demo.freelancer@lead-to-launch.io` | `demo123456` | Freelancer Solo OS |
| **Agency Demo** | `demo.agency@lead-to-launch.io` | `demo123456` | Agency Scale Suite |
| **Master Admin** | `admin@lead-to-launch.com` | `admin123456` | Super Admin Console (`/admin`) |

---

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub.
2. Import the project into [Vercel](https://vercel.com/).
3. Add the environment variables from `.env.local`.
4. Click **Deploy**.

### Deploy to Hostinger / VPS
Run the build script:
```bash
npm run build
npm start
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
