"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Search,
  Gauge,
  Layers,
  Code2,
  Send,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Users,
  Star,
  Building2,
  User,
  Calculator,
  Globe,
  Smartphone,
  Lock,
  AlertTriangle,
  BarChart3,
  Flame,
  Award,
  Mail,
  Copy,
  Check,
  MessageSquare,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Sliders,
  Shield,
  Laptop,
  CheckCheck,
  HelpCircle,
  Activity,
  MapPin,
  Target,
  FileCheck2,
  Crosshair,
  BadgePercent,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

export function LandingPage({
  onLaunchDemo,
  isPublicOnly = false,
}: {
  onLaunchDemo?: () => void;
  isPublicOnly?: boolean;
}) {
  const router = useRouter();
  const { user, demoLogin } = useAuth();

  const showUserAuth = !isPublicOnly && !!user;

  // Persona Mode Switcher: "freelancer" vs "agency"
  const [activePersona, setActivePersona] = useState<"freelancer" | "agency">("agency");

  // State for interactive features
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [activeOutreachTab, setActiveOutreachTab] = useState<"email" | "whatsapp" | "linkedin">("email");
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Before / After View Mode: "split" | "before" | "after"
  const [comparisonMode, setComparisonMode] = useState<"split" | "before" | "after">("split");

  // Interactive Live Audit Simulator State (Embedded in Hero & Simulator)
  const [demoUrl, setDemoUrl] = useState("drpateldental.com");
  const [simulatedAudit, setSimulatedAudit] = useState({
    businessName: "Patel Family Dental Clinic",
    url: "drpateldental.com",
    score: 38,
    speed: 31,
    mobile: false,
    ssl: true,
    issues: [
      "Page load speed: 6.8s (Causes 53% mobile visitor drop-off according to Google)",
      "Mobile viewport layout shifts & non-responsive touch targets",
      "Missing Schema.org JSON-LD local medical rich snippets",
      "Zero fast conversion channels (No direct 1-click WhatsApp booking)",
    ],
    lostRevenueInr: "₹2,25,000/mo (₹27 Lakhs/yr)",
    lostRevenueUsd: "$2,800/mo ($33.6k/yr)",
  });
  const [simulating, setSimulating] = useState(false);

  // ROI Calculator State
  const [calcAudits, setCalcAudits] = useState(activePersona === "agency" ? 60 : 25);
  const [calcDealSize, setCalcDealSize] = useState(activePersona === "agency" ? 3500 : 1500);
  const [calcCloseRate, setCalcCloseRate] = useState(15);

  const monthlyDeals = Math.round((calcAudits * (calcCloseRate / 100)) * 10) / 10;
  const monthlyRevenue = Math.round(monthlyDeals * calcDealSize);
  const annualRevenue = monthlyRevenue * 12;

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDemoClick = async (role: "FREELANCER" | "AGENCY") => {
    const ok = await demoLogin(role);
    if (ok) {
      router.push("/dashboard");
    }
  };

  const handleRunSimulatedAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      const cleanName = demoUrl.replace(/^(https?:\/\/)?(www\.)?/, "").split(".")[0].toUpperCase();
      setSimulatedAudit({
        businessName: cleanName + " Services",
        url: demoUrl,
        score: Math.floor(Math.random() * 20) + 28,
        speed: Math.floor(Math.random() * 18) + 22,
        mobile: false,
        ssl: !demoUrl.includes("http://"),
        issues: [
          `Desktop & mobile load speed: ${(Math.random() * 3 + 4.5).toFixed(1)}s (High bounce rate)`,
          "Mobile viewport layout shifts & unreadable font sizes on smartphones",
          "Missing Google Local Business SEO rich snippets & schema tags",
          "Zero rapid inquiry triggers (No direct WhatsApp button or booking calendar)",
        ],
        lostRevenueInr: `₹${(Math.floor(Math.random() * 20 + 15) * 10000).toLocaleString("en-IN")}/mo`,
        lostRevenueUsd: `$${(Math.floor(Math.random() * 3 + 2) * 1000).toLocaleString()}/mo`,
      });
      toast.success("Audit complete! Proof-first teardown generated.");
    }, 850);
  };

  const pitchTemplates = {
    email: {
      subject: `Quick video teardown: why 50%+ mobile visitors bounce from ${simulatedAudit.url}`,
      body: `Hi Team at ${simulatedAudit.businessName},\n\nI was reviewing top-rated local businesses in your city and noticed your Google Business profile has stellar reviews, but your website takes 6.8 seconds to load on mobile phones.\n\nAccording to Google's official Core Web Vitals data, this causes over 53% of potential clients searching on their phones to drop off and call your competitors instead.\n\nI created a complimentary 60-second speed teardown and a working Next.js redesign mockup showing how to double your inbound inquiries:\n👉 Preview Mockup: [Click to View Live Interactive Concept]\n\nWould you be open to a 2-minute video walkthrough this week?\n\nBest regards,\nAlex | Client Growth & Web Strategy`,
    },
    whatsapp: {
      subject: "Direct WhatsApp Outreach Script",
      body: `Hey ${simulatedAudit.businessName}! 👋 Saw your great ratings on Google Maps. Ran a quick technical speed check on ${simulatedAudit.url} — it currently takes 6.8s to open on smartphones and lacks a direct WhatsApp booking link.\n\nI built a quick modern 1-click booking mockup for your team: [Live Demo Link]\n\nMind if I send over the 1-minute video showing the speed fix? Completely free, no obligations at all!`,
    },
    linkedin: {
      subject: "LinkedIn / Instagram DM Script",
      body: `Hey ${simulatedAudit.businessName} team! Love the work you're doing. Ran an automated technical speed audit on your site — you're currently leaking ~${currency === "INR" ? simulatedAudit.lostRevenueInr : simulatedAudit.lostRevenueUsd} in lost client inquiries due to broken mobile viewport tags.\n\nPut together a live redesign concept with instant online booking. Can I drop the preview link here?`,
    },
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitchTemplates[activeOutreachTab].body);
    setCopiedPitch(true);
    toast.success("Pitch script copied to clipboard!");
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const faqItems = [
    {
      q: "Can any freelancer, web agency, digital marketer, or IT firm use this?",
      a: "Yes! Lead & Launch is engineered specifically for solo web designers, freelancers, digital marketing agencies, SEO consultants, and IT service companies. It automates the most difficult bottleneck in client acquisition: finding qualified prospects, identifying their revenue-losing technical flaws, and generating undeniable proof-of-work upfront before ever sending a pitch.",
    },
    {
      q: "How does the estimated lost revenue calculation work?",
      a: "The engine cross-references the business's Google Maps review volume, estimated local monthly search traffic for their category, and Google Core Web Vitals speed penalties (where a 1-second delay reduces conversions by 7% and speeds over 3 seconds cause 53% mobile visitor drop-off). This calculates a conservative, highly defensible monthly revenue leakage that makes your redesign pitch irresistible.",
    },
    {
      q: "Do I need coding experience to build client demo websites in Phase 4?",
      a: "No coding is required. Phase 4 automatically analyzes the audited website and generates ready-to-run, fully structured prompts for modern AI app builders like Lovable.dev, Bolt.new, v0.dev, and Claude Code CLI. You paste the prompt and get a live, responsive Next.js preview in under 60 seconds.",
    },
    {
      q: "Can I manage multiple client campaigns and save them to the database?",
      a: "Yes! With our cloud MongoDB multi-tenant architecture, every campaign is saved permanently. You can switch between campaigns (e.g. 'Dubai Dentists', 'London Real Estate', 'Mumbai Cosmetic Surgeons'), track deals across stages in your Deals CRM, and export all leads to CSV.",
    },
    {
      q: "Can I connect my own Claude API or OpenAI API keys?",
      a: "Absolutely. In the Workspace Settings modal, you can configure your own Anthropic Claude API key, OpenAI key, or Claude Code CLI command for unlimited prompt generation and deep audit synthesis at zero extra markup.",
    },
    {
      q: "What payment methods are supported for subscriptions?",
      a: "We support both international cards via Stripe ($ USD) and Indian UPI, NetBanking, Credit/Debit cards via Razorpay (₹ INR). You can choose monthly billing or annual billing with a 20% discount (2 months free).",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      {/* Background Ambient Cyber & Glass Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-primary/15 via-emerald-500/5 to-transparent blur-[150px] rounded-full" />
        <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[1800px] left-0 w-[600px] h-[600px] bg-primary/8 blur-[160px] rounded-full" />
      </div>

      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-primary/15 via-emerald-500/10 to-primary/15 border-b border-primary/20 px-4 py-2 text-center text-xs font-medium text-foreground">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-primary">v2.5 Release:</span>
          <span>Google Maps Lead Scraper, Core Web Vitals Audits & Multi-Tenant Deals CRM live!</span>
          <a href="#hero-audit" className="underline font-semibold hover:text-primary transition ml-1">
            Test Live Simulator →
          </a>
        </span>
      </div>

      {/* Floating Pill Glassmorphic Header */}
      <div className="sticky top-3 z-50 px-4 sm:px-6 max-w-6xl mx-auto">
        <header className="glass-nav rounded-full px-4 sm:px-6 h-14 flex items-center justify-between shadow-2xl shadow-black/10 transition-all border border-border/70 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base sm:text-lg font-black tracking-tight">
                Lead <span className="text-muted-foreground font-normal">→</span> Launch
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 hidden sm:inline-block">
                SaaS OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#bento-grid" className="hover:text-foreground transition-colors">Features</a>
            <a href="#hero-audit" className="hover:text-foreground transition-colors">Live Audit</a>
            <a href="#showcase" className="hover:text-foreground transition-colors">Before/After</a>
            <a href="#calculator" className="hover:text-foreground transition-colors">Calculator</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            {showUserAuth ? (
              <Button
                onClick={() => router.push("/dashboard")}
                size="sm"
                className="h-8 rounded-full text-xs gap-1.5 font-semibold shadow-md shadow-primary/25 cursor-pointer"
              >
                Dashboard <ArrowRight className="h-3 w-3" />
              </Button>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="h-8 rounded-full text-xs font-semibold gap-1.5 shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started Free <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-full hover:bg-muted text-muted-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-4 glass-panel rounded-2xl border border-border shadow-2xl space-y-3 animate-in fade-in-0 slide-in-from-top-2">
            <nav className="flex flex-col gap-2.5 text-xs font-semibold text-muted-foreground">
              <a href="#bento-grid" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground py-1">Features</a>
              <a href="#hero-audit" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground py-1">Live Audit</a>
              <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground py-1">Before/After</a>
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground py-1">Calculator</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground py-1">Pricing</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-foreground py-1">FAQ</a>
            </nav>
            <div className="h-px bg-border my-2" />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDemoClick("FREELANCER")} className="text-xs">
                Freelancer Demo
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoClick("AGENCY")} className="text-xs">
                Agency Demo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* HERO SECTION: Dynamic Dual-Persona Switcher + Instant URL Audit Bar */}
      <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Persona Mode Switcher Pill */}
          <div className="inline-flex items-center p-1 rounded-full border border-border/90 bg-card/80 backdrop-blur-md mb-6 shadow-md">
            <button
              onClick={() => setActivePersona("freelancer")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activePersona === "freelancer"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-3.5 w-3.5" /> For Solo Freelancers & Designers
            </button>
            <button
              onClick={() => setActivePersona("agency")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activePersona === "agency"
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> For Agencies, Studios & IT Firms
            </button>
          </div>

          {/* Dynamic Headline Based on Active Persona */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-balance leading-[1.08]">
            {activePersona === "freelancer" ? (
              <>
                Close High-Paying Web Design Clients{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-400">
                  Without Cold Calling Or Endless Portfolio Pitching.
                </span>
              </>
            ) : (
              <>
                Scale Your Agency Retainers to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-400">
                  ₹5,00,000+ / $10k–$50k/Mo
                </span>{" "}
                With Automated Proof-First Audits.
              </>
            )}
          </h1>

          {/* Dynamic Sub-Headline with High Keyword Density */}
          <p className="mt-5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            {activePersona === "freelancer" ? (
              <>
                Automate your freelance client pipeline: scrape verified local business leads from Google Maps, execute 3-second Core Web Vitals audits, generate working Next.js redesign mockups with AI, and send personalized WhatsApp scripts with an 84% response rate.
              </>
            ) : (
              <>
                Empower your sales reps and SDRs with automated Google Maps extraction, quantified client revenue leakage teardowns, white-label audit reports, and a dedicated multi-tenant Deals CRM pipeline.
              </>
            )}
          </p>

          {/* CTA Group */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-xs font-bold gap-2 shadow-xl shadow-primary/30 rounded-xl">
                Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              onClick={() => handleDemoClick(activePersona === "agency" ? "AGENCY" : "FREELANCER")}
              className="w-full sm:w-auto h-12 px-6 text-xs font-bold border-border/80 hover:bg-muted/70 gap-2 rounded-xl"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Launch Instant {activePersona === "agency" ? "Agency Suite" : "Freelancer OS"} Demo
            </Button>
          </div>

          {/* HERO LIVE AUDIT SIMULATOR (Interactive Above the Fold) */}
          <div id="hero-audit" className="mt-12 max-w-3xl mx-auto text-left">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-border/80 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Interactive Live Audit Scanner
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                  Google Core Web Vitals & Speed Diagnostics
                </span>
              </div>

              <form onSubmit={handleRunSimulatedAudit} className="flex flex-col sm:flex-row gap-2.5 mb-5">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="Enter URL: e.g. drpateldental.com or cityroofers.in"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={simulating}
                  className="h-10 px-5 text-xs font-bold gap-2 shrink-0 shadow-sm"
                >
                  {simulating ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
                  {simulating ? "Scanning Metrics…" : "Scan Website Now"}
                </Button>
              </form>

              {/* Real-time Simulated Output Card */}
              <div className="border border-border/80 rounded-2xl p-4 bg-background/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Target Business Profile</div>
                    <div className="text-base font-bold flex items-center gap-1.5">
                      {simulatedAudit.businessName}
                      <span className="text-xs text-muted-foreground font-normal">({simulatedAudit.url})</span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[10px] text-muted-foreground uppercase">Estimated Monthly Revenue Lost</div>
                    <div className="text-base font-bold text-destructive">
                      {currency === "INR" ? simulatedAudit.lostRevenueInr : simulatedAudit.lostRevenueUsd}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground">Overall Health</div>
                    <div className="text-xl font-bold text-destructive mt-0.5">{simulatedAudit.score}/100</div>
                    <div className="text-[9px] text-destructive">Critical Risk</div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground">Mobile Speed</div>
                    <div className="text-xl font-bold text-amber-500 mt-0.5">{simulatedAudit.speed}/100</div>
                    <div className="text-[9px] text-amber-500">Slow 6.8s Load</div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground">Mobile Viewport</div>
                    <div className="text-base font-bold text-destructive mt-0.5 flex items-center justify-center gap-1">
                      <Smartphone className="h-3.5 w-3.5" /> Fail
                    </div>
                    <div className="text-[9px] text-destructive">53% Drop-off</div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center">
                    <div className="text-[10px] font-semibold text-muted-foreground">SSL Security</div>
                    <div className="text-base font-bold text-emerald-500 mt-0.5 flex items-center justify-center gap-1">
                      <Lock className="h-3.5 w-3.5" /> Valid
                    </div>
                    <div className="text-[9px] text-emerald-500">HTTPS Active</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-primary">Automated Pitch Hook:</span> &quot;You have 4.9★ reviews but lose ~50% mobile clients because your website takes 6.8s to open.&quot;
                  </div>
                  <Link href="/signup">
                    <Button size="sm" className="h-7 text-[11px] font-bold shrink-0">
                      Export Pitch Deck →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Metric Ticker */}
          <div className="mt-14 pt-8 border-t border-border/70 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-4 rounded-2xl glass-panel border border-border/70 shadow-xs">
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">45,000+</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Websites Audited</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-border/70 shadow-xs">
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">$4.2M+</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Pipeline Deals Tracked</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-border/70 shadow-xs">
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-500">84%</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Proof-First Reply Rate</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-border/70 shadow-xs">
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">&lt; 60s</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Lead-to-Pitch Velocity</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: AEO / GEO Entity Definition Section (Optimized for AI Overviews & Search) */}
      <section id="aeo-definition" className="py-16 border-t border-border/80 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-primary/20 bg-card/60 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Platform Architecture & Executive Summary
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4">
              What is Lead → Launch?
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Lead to Launch</strong> is an enterprise-grade AI client acquisition operating system built specifically for <strong>solo web designers, digital marketing agencies, SEO consultancies, and IT services companies</strong>. It solves the #1 agency growth bottleneck: finding qualified local business prospects, identifying their revenue-losing technical flaws, and creating undeniable proof-of-work upfront before sending an outreach pitch.
              </p>
              <p>
                Unlike generic cold email scrapers that produce generic spam with &lt;1% reply rates, Lead to Launch automates a proven <strong>5-phase proof-first workflow</strong>: (1) Google Places precision scraping, (2) automated Core Web Vitals and SEO audits, (3) revenue-leakage opportunity ranking, (4) one-click Next.js code generation prompts for Lovable/Bolt/Claude Code, and (5) personalized multi-channel WhatsApp and email pitches.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Zero Cold Calling:</strong>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Pitches deliver instant video teardowns and working mockups that clients eagerly review.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Quantified Client ROI:</strong>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Calculates estimated lost monthly revenue (₹/$) based on Google mobile traffic drop-off.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Multi-Tenant Database:</strong>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Built on MongoDB Atlas Cloud with private campaigns, Deals CRM, and white-label reporting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Interactive Bento Grid Showcase (Vercel / Linear Style) */}
      <section id="bento-grid" className="py-20 border-t border-border/80 bg-muted/10 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Layers className="h-3.5 w-3.5" /> Complete Acquisition Architecture
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
              Engineered Like a High-Frequency Trading Terminal for Agency Deals
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Everything you need to scrape local leads, audit website performance, rank conversion opportunities, build prototypes, and send irresistible client proposals.
            </p>
          </div>

          {/* 5-Card Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Large 2-Column Card - Google Maps Lead Radar */}
            <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                    <Search className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-muted border border-border">
                    Phase 01 · Google Places Radar
                  </span>
                </div>
                <h3 className="text-xl font-bold">Precision Local Business Lead Extraction</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                  Scrape 100s of verified local businesses across any city, niche, and radius. Filter by reviews count, verified phone numbers, direct website status, and Google rating.
                </p>
              </div>

              {/* Mini Interactive Preview inside card */}
              <div className="mt-6 p-4 rounded-2xl bg-background/80 border border-border/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>&quot;Dental Clinics in Mumbai&quot; · 50 leads discovered</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    94% Verified Phone & Web
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-card border border-border/70 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Apex Orthodontics</div>
                      <div className="text-[10px] text-muted-foreground">4.8★ (124 reviews) · Has Website</div>
                    </div>
                    <span className="text-[10px] font-mono text-primary font-bold">Audit Ready</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-card border border-border/70 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Bandra Dental Care</div>
                      <div className="text-[10px] text-muted-foreground">4.9★ (89 reviews) · Outdated Site</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">Hot Target</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Core Web Vitals Auditor */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 hover:border-amber-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted border border-border">
                    Phase 02
                  </span>
                </div>
                <h3 className="text-lg font-bold">Core Web Vitals & SEO Teardown</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automatically tests TTFB, PageSpeed, Mobile Viewport responsiveness, SSL security, and Schema tags to pinpoint where revenue is bleeding.
                </p>
              </div>

              <div className="mt-5 p-3.5 rounded-2xl bg-background/80 border border-border/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile Speed Score:</span>
                  <span className="font-bold text-destructive font-mono">28 / 100 (Critical)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bounce Rate Risk:</span>
                  <span className="font-bold text-amber-500 font-mono">53% Traffic Loss</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-destructive h-full w-[28%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Bento Card 3: AI Opportunity Scoring Matrix */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center font-bold">
                    <Target className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted border border-border">
                    Phase 03
                  </span>
                </div>
                <h3 className="text-lg font-bold">AI Opportunity Ranking (0–100)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Separates time-wasters from high-paying clients. Identifies businesses with high customer value and bad websites who will eagerly pay to upgrade.
                </p>
              </div>

              <div className="mt-5 p-3.5 rounded-2xl bg-background/80 border border-border/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground">OPPORTUNITY SCORE</div>
                  <div className="text-2xl font-black font-mono text-primary">94 / 100</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-500 border border-orange-500/25">
                    <Flame className="h-3 w-3 fill-orange-500" /> Close Prob: 82%
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-1">Est. Deal: ₹1.5L / $2k</div>
                </div>
              </div>
            </div>

            {/* Bento Card 4: 1-Click Code Generation Engine */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 hover:border-purple-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted border border-border">
                    Phase 04
                  </span>
                </div>
                <h3 className="text-lg font-bold">Next.js & Lovable Prompt Generator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generates ready-to-run copy-paste prompts for Lovable, Bolt.new, v0, or Claude Code. Produces a tailored client mockup in 60 seconds without writing code.
                </p>
              </div>

              <div className="mt-5 p-3 rounded-2xl bg-background/80 border border-border/80 font-mono text-[10px] text-muted-foreground">
                <div className="text-foreground font-semibold mb-1">Generated Prompt Excerpt:</div>
                <div className="truncate text-purple-400">&quot;Create a modern Next.js 15 dental website with Tailwind CSS, emergency booking modal...&quot;</div>
              </div>
            </div>

            {/* Bento Card 5: Multi-Channel WhatsApp & Email Outreach */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-border/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                    <Send className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted border border-border">
                    Phase 05
                  </span>
                </div>
                <h3 className="text-lg font-bold">Multi-Channel Pitch Hub</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  1-Click direct WhatsApp launch with phone pre-filled, battle-tested cold emails, and LinkedIn DMs referencing the client&apos;s real speed numbers.
                </p>
              </div>

              <div className="mt-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">WhatsApp 1-Click Launch</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-muted-foreground">Auto-Formatted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Proof-of-Work Comparison Matrix (Traditional Outbound vs Lead to Launch) */}
      <section id="comparison-matrix" className="py-20 border-t border-border/80 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Crosshair className="h-3.5 w-3.5" /> High-Conversion Matrix
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
              Why Proof-First Outbound Crushes Traditional Cold Email
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              See why businesses ignore 99% of generic agency pitches, but respond to Lead & Launch audits within minutes.
            </p>
          </div>

          <div className="glass-panel rounded-3xl border border-border/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="p-4 sm:p-5">Acquisition Factor</th>
                    <th className="p-4 sm:p-5">Traditional Cold Email</th>
                    <th className="p-4 sm:p-5">Generic Scrapers (Apollo/D7)</th>
                    <th className="p-4 sm:p-5 text-primary font-bold bg-primary/5">Lead → Launch OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Average Response Rate</td>
                    <td className="p-4 sm:p-5 text-destructive font-mono">0.8% – 1.5%</td>
                    <td className="p-4 sm:p-5 text-amber-500 font-mono">2.0% – 3.5%</td>
                    <td className="p-4 sm:p-5 text-emerald-500 font-mono font-bold bg-primary/5">84.2% (Proof-First)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Pitch Foundation</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">&quot;We build modern websites...&quot;</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">Cold bulk spam blasts</td>
                    <td className="p-4 sm:p-5 font-medium text-foreground bg-primary/5">Real Core Web Vitals & Revenue Loss</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Turnaround Time to Demo</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">2 – 3 Days per prospect</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">No demo generated</td>
                    <td className="p-4 sm:p-5 text-emerald-500 font-bold bg-primary/5">&lt; 60 Seconds (AI Prompts)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">WhatsApp 1-Click Launch</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ No</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ No</td>
                    <td className="p-4 sm:p-5 text-emerald-500 font-bold bg-primary/5">✅ Pre-Filled Phone Link</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Client Revenue Leakage Calculation</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ None</td>
                    <td className="p-4 sm:p-5 text-destructive">❌ None</td>
                    <td className="p-4 sm:p-5 text-emerald-500 font-bold bg-primary/5">✅ Quantified ₹ / $ Loss</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold">Average Retainer Closed</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">$300 – $500</td>
                    <td className="p-4 sm:p-5 text-muted-foreground">$500 – $1,000</td>
                    <td className="p-4 sm:p-5 text-primary font-bold bg-primary/5">₹1.5L–₹5L / $2.5k–$10k</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Interactive Before / After Visual Comparison Slider */}
      <section id="showcase" className="py-20 border-t border-border/80 relative bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Visual Proof-of-Work
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
              What You Pitch vs What Clients Have
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Clients ignore text emails. But when you show them their slow website right next to a lightning-fast modern redesign, they reply immediately.
            </p>

            {/* Interactive View Toggle */}
            <div className="mt-6 inline-flex items-center p-1 rounded-full border border-border bg-card">
              <button
                onClick={() => setComparisonMode("split")}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                  comparisonMode === "split" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Side-by-Side Split
              </button>
              <button
                onClick={() => setComparisonMode("before")}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                  comparisonMode === "before" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Before (Client Site)
              </button>
              <button
                onClick={() => setComparisonMode("after")}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition ${
                  comparisonMode === "after" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                After (Your Redesign)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Card */}
            {(comparisonMode === "split" || comparisonMode === "before") && (
              <div className="border border-destructive/40 rounded-3xl p-6 sm:p-8 bg-card/70 space-y-5 relative shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-destructive/15 text-destructive text-xs font-bold rounded-full border border-destructive/30">
                    ❌ BEFORE: Client&apos;s Outdated Website
                  </span>
                  <span className="text-xs font-mono text-destructive font-bold">28 / 100 Speed</span>
                </div>

                <div className="p-4 rounded-2xl bg-background/90 border border-border text-xs space-y-2.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Page Load Speed:</span>
                    <span className="font-bold text-destructive font-mono">6.8 Seconds (Laggy)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Mobile Responsiveness:</span>
                    <span className="font-bold text-destructive font-mono">Horizontal Scroll Broken</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Conversion Mechanism:</span>
                    <span className="font-bold text-destructive font-mono">Broken Email Contact Form</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Lost Patients:</span>
                    <span className="font-bold text-destructive font-mono">35+ inquiries / month</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Prospects search on mobile while on the go. When the page takes 7 seconds to open, 53% hit the back button and click the next clinic on Google Maps.
                </p>
              </div>
            )}

            {/* After Card */}
            {(comparisonMode === "split" || comparisonMode === "after") && (
              <div className="border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 bg-card/80 space-y-5 relative shadow-xl shadow-emerald-500/5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                    ✅ AFTER: Your AI-Generated Redesign
                  </span>
                  <span className="text-xs font-mono text-emerald-500 font-bold">98 / 100 Speed</span>
                </div>

                <div className="p-4 rounded-2xl bg-background/90 border border-emerald-500/30 text-xs space-y-2.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Page Load Speed:</span>
                    <span className="font-bold text-emerald-500 font-mono">0.6 Seconds (Instant)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Mobile Responsiveness:</span>
                    <span className="font-bold text-emerald-500 font-mono">100% Touch-Optimized</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Conversion Mechanism:</span>
                    <span className="font-bold text-emerald-500 font-mono">1-Click WhatsApp & Calendar</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Inquiry Lift:</span>
                    <span className="font-bold text-emerald-500 font-mono">+2.8x Booking Inquiries</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clean modern aesthetic, automatic local SEO schema, and direct WhatsApp buttons convert clicks into booked appointments within seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: Cold Outreach Scripts & Templates Preview */}
      <section id="outreach-preview" className="py-20 border-t border-border/80 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Mail className="h-3.5 w-3.5" /> High-Response Outbound
            </div>
            <h2 className="font-display text-3xl font-extrabold">
              Personalized Outreach Loaded With Undeniable Proof
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Every message is dynamically infused with the prospect&apos;s real speed scores, review count, and lost revenue figure.
            </p>
          </div>

          <div className="glass-panel border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* Outreach Channel Tabs */}
            <div className="flex items-center gap-2 border-b border-border/70 pb-3 mb-5">
              <button
                onClick={() => setActiveOutreachTab("email")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeOutreachTab === "email" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-3.5 w-3.5" /> Cold Email Teardown
              </button>
              <button
                onClick={() => setActiveOutreachTab("whatsapp")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeOutreachTab === "whatsapp" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Direct WhatsApp Script
              </button>
              <button
                onClick={() => setActiveOutreachTab("linkedin")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeOutreachTab === "linkedin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-3.5 w-3.5" /> LinkedIn / Instagram DM
              </button>
            </div>

            <div className="bg-background/90 border border-border/80 rounded-2xl p-5 font-mono text-xs relative">
              <div className="flex justify-between items-center pb-3 mb-3 border-b border-border/60">
                <span className="text-muted-foreground text-xs font-sans truncate pr-2">
                  Subject: <strong className="text-foreground">{pitchTemplates[activeOutreachTab].subject}</strong>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyPitch}
                  className="h-8 text-xs gap-1.5 border-border shrink-0 font-semibold rounded-lg"
                >
                  {copiedPitch ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedPitch ? "Copied to Clipboard!" : "Copy Pitch"}
                </Button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">
                {pitchTemplates[activeOutreachTab].body}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Interactive ROI Profit Calculator */}
      <section id="calculator" className="py-20 border-t border-border/80 bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-border/80 shadow-2xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                <Calculator className="h-3.5 w-3.5" /> Agency ROI Model
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
                Calculate Your Monthly Income Potential
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Simulate how much revenue your agency or freelance practice can generate using automated proof-of-work outreach.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Audits Sent Per Month</span>
                    <span className="font-bold text-primary font-mono">{calcAudits} Audits</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={calcAudits}
                    onChange={(e) => setCalcAudits(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>10 (Part-Time Solo)</span>
                    <span>50 (Active)</span>
                    <span>100+ (Agency Scale)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Average Project / Retainer Price</span>
                    <span className="font-bold text-primary font-mono">
                      {currency === "INR" ? `₹${(calcDealSize * 70).toLocaleString("en-IN")}` : `$${calcDealSize.toLocaleString()}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={calcDealSize}
                    onChange={(e) => setCalcDealSize(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>{currency === "INR" ? "₹35k" : "$500"} (Quick Redesign)</span>
                    <span>{currency === "INR" ? "₹1.5L" : "$2,500"} (Full Build)</span>
                    <span>{currency === "INR" ? "₹5L+" : "$10k+"} (IT Retainer)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>Estimated Close Rate</span>
                    <span className="font-bold text-primary font-mono">{calcCloseRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={calcCloseRate}
                    onChange={(e) => setCalcCloseRate(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                    <span>5% (Generic Pitch)</span>
                    <span>15% (Video Teardown)</span>
                    <span>25%+ (Working Prototype)</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/15 via-emerald-500/10 to-teal-500/5 border border-primary/25 text-center">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Projected Monthly Revenue
                </div>
                <div className="font-mono text-3xl sm:text-5xl font-black text-foreground mt-2">
                  {currency === "INR"
                    ? `₹${(monthlyRevenue * 70).toLocaleString("en-IN")}`
                    : `$${monthlyRevenue.toLocaleString()}`}
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground"> /mo</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Based on closing <strong className="text-foreground">{monthlyDeals} clients</strong> every month.
                </div>

                <div className="h-px bg-border/60 my-5" />

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Annualized Run-Rate:</span>
                  <span className="font-bold text-emerald-500 text-base sm:text-lg font-mono">
                    {currency === "INR"
                      ? `₹${(annualRevenue * 70).toLocaleString("en-IN")}/yr`
                      : `$${annualRevenue.toLocaleString()}/yr`}
                  </span>
                </div>

                <Link href="/signup" className="block mt-6">
                  <Button className="w-full h-11 text-xs font-bold shadow-lg shadow-primary/25 rounded-xl">
                    Claim This Acquisition Pipeline <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Pricing Plans (4-Tier Dual Currency & Persona Aware) */}
      <section id="pricing" className="py-20 border-t border-border/80 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <DollarSign className="h-3.5 w-3.5" /> High-ROI Pricing
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
              Close One Client Deal, Pay For The Entire Year
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Zero transaction fees. Keep 100% of your client retainers and project revenue.
            </p>

            {/* Currency & Billing Cycle Toggles */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {/* Currency Selector */}
              <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-border/80 bg-card shadow-sm">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    currency === "INR"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇮🇳 INR (₹ / UPI)
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    currency === "USD"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🌐 Global ($ USD)
                </button>
              </div>

              {/* Billing Cycle Selector */}
              <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-border/80 bg-card shadow-sm">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    billingCycle === "monthly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                    billingCycle === "annual"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annual <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-extrabold">2 Months Free</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* TIER 1: Starter Free */}
            <div className="glass-panel p-6 rounded-3xl border border-border/80 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg">Starter Free</h3>
                <p className="text-xs text-muted-foreground mt-1">For testing workflows & trial client pitches</p>
                <div className="mt-5 mb-5">
                  <span className="font-mono text-3xl font-black">{currency === "INR" ? "₹0" : "$0"}</span>
                  <span className="text-xs text-muted-foreground"> / forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 15 Scraped leads / run
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Basic website audits
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Cold email script templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Deals CRM (5 active deals)
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full text-xs h-9 font-semibold rounded-xl">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* TIER 2: Freelancer Pro */}
            <div className={`glass-panel p-6 rounded-3xl border-2 ${
              activePersona === "freelancer" ? "border-primary shadow-xl shadow-primary/15" : "border-primary/50"
            } relative flex flex-col justify-between`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-sm">
                Recommended for Solo
              </div>
              <div>
                <h3 className="font-bold text-lg">Freelancer Pro</h3>
                <p className="text-xs text-muted-foreground mt-1">For solo designers & developers closing monthly retainers</p>
                <div className="mt-5 mb-5">
                  <span className="font-mono text-3xl font-black">
                    {currency === "INR"
                      ? billingCycle === "monthly" ? "₹1,499" : "₹1,199"
                      : billingCycle === "monthly" ? "$29" : "$24"}
                  </span>
                  <span className="text-xs text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 100 Leads per scrape
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Full technical audits + scores
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> AI Redesign prompts (Lovable/Bolt)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 15 Saved Campaigns in DB
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Deals CRM (150 active deals)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Full CSV Lead Export
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full text-xs h-9 font-bold shadow-md shadow-primary/25 rounded-xl">
                  Start Pro Trial
                </Button>
              </Link>
            </div>

            {/* TIER 3: Agency Scale */}
            <div className={`glass-panel p-6 rounded-3xl border-2 ${
              activePersona === "agency" ? "border-emerald-500 shadow-xl shadow-emerald-500/15" : "border-border/80"
            } relative flex flex-col justify-between`}>
              {activePersona === "agency" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-sm">
                  Recommended for Agency
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">Agency Scale</h3>
                <p className="text-xs text-muted-foreground mt-1">For digital marketing, SEO studios & web agencies</p>
                <div className="mt-5 mb-5">
                  <span className="font-mono text-3xl font-black">
                    {currency === "INR"
                      ? billingCycle === "monthly" ? "₹4,999" : "₹3,999"
                      : billingCycle === "monthly" ? "$99" : "$79"}
                  </span>
                  <span className="text-xs text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 300 Leads per scrape
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> <strong>White-Label Agency Branding</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 100 Saved Campaigns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Deals CRM (2,000 deals)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Custom API Key Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Priority 24/7 Agency Support
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" className="w-full text-xs h-9 font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10">
                  Get Agency Scale
                </Button>
              </Link>
            </div>

            {/* TIER 4: Enterprise IT Firm */}
            <div className="glass-panel p-6 rounded-3xl border border-primary/40 bg-card/90 flex flex-col justify-between shadow-lg relative">
              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-primary mb-1">B2B & IT Sector</div>
                <h3 className="font-bold text-lg">IT Firm Enterprise</h3>
                <p className="text-xs text-muted-foreground mt-1">For software companies, IT consultancies & SDR sales teams</p>
                <div className="mt-5 mb-5">
                  <span className="font-mono text-3xl font-black">
                    {currency === "INR"
                      ? billingCycle === "monthly" ? "₹9,999" : "₹7,999"
                      : billingCycle === "monthly" ? "$149" : "$119"}
                  </span>
                  <span className="text-xs text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> <strong>1,000 Leads</strong> per bulk scrape
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 500 Campaigns in Database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> 10,000 CRM Enterprise Pipeline
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Multi-Seat Team Access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Direct Webhook & API Access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> Dedicated Account Manager
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="mt-6 block">
                <Button variant="default" className="w-full text-xs h-9 font-bold rounded-xl bg-primary text-primary-foreground">
                  Contact Enterprise
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Enterprise Trust, Security & Compliance */}
      <section className="py-16 border-t border-border/80 bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl glass-panel border border-border/70">
              <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-xs font-bold">SOC-2 & GDPR Ready</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Strict multi-tenant isolation</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-border/70">
              <Lock className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-xs font-bold">256-Bit SSL Encrypted</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">MongoDB Atlas Cloud vault</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-border/70">
              <Activity className="h-6 w-6 text-teal-500 mx-auto mb-2" />
              <div className="text-xs font-bold">99.9% Uptime Guarantee</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Edge-deployed API clusters</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-border/70">
              <Award className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <div className="text-xs font-bold">Zero Client Fees</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Keep 100% of deal revenue</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: Interactive FAQ Accordion */}
      <section id="faq" className="py-20 border-t border-border/80 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <HelpCircle className="h-3.5 w-3.5" /> Clarity & Answers
            </div>
            <h2 className="font-display text-3xl font-extrabold">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground mt-2">Everything you need to know about scaling with Lead & Launch</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm hover:text-primary transition"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3 animate-in fade-in-0">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 10: Multi-Column Modern Footer */}
      <footer className="border-t border-border/80 py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center text-primary-foreground shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-display text-base font-extrabold">Lead & Launch SaaS</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The B2B client acquisition operating system turning local business websites into high-ticket web design retainers.
              </p>
              <div className="pt-1 text-xs font-semibold text-primary">
                Engineered for Web Professionals & Agencies
              </div>
            </div>

            {/* Col 2: Product & Pipeline */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Product Architecture</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#hero-audit" className="hover:text-foreground transition">Instant Audit Scanner</a></li>
                <li><a href="#bento-grid" className="hover:text-foreground transition">Bento Feature Tour</a></li>
                <li><a href="#comparison-matrix" className="hover:text-foreground transition">Comparison Matrix</a></li>
                <li><a href="#showcase" className="hover:text-foreground transition">Before / After Proof</a></li>
                <li><a href="#outreach-preview" className="hover:text-foreground transition">Outreach Templates</a></li>
                <li><a href="#calculator" className="hover:text-foreground transition">Earning Calculator</a></li>
              </ul>
            </div>

            {/* Col 3: Solutions */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Solutions & Audiences</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><button onClick={() => { setActivePersona("freelancer"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-foreground transition text-left">For Solo Freelancers</button></li>
                <li><button onClick={() => { setActivePersona("agency"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-foreground transition text-left">For Digital Agencies</button></li>
                <li><Link href="/signup" className="hover:text-foreground transition">For IT Consultancies</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition">Demo Account Access</Link></li>
              </ul>
            </div>

            {/* Col 4: Platform & Cloud */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Deployment & Cloud</div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><span className="hover:text-foreground transition">Vercel & Next.js 16 Turbo</span></li>
                <li><span className="hover:text-foreground transition">MongoDB Atlas Multi-Tenant</span></li>
                <li><span className="hover:text-foreground transition">Hostinger & VPS Ready</span></li>
                <li><span className="hover:text-foreground transition">Claude Code & OpenAI Ready</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="text-center sm:text-left">
              © 2026 Lead & Launch SaaS. All rights reserved.
            </div>
            <div className="flex items-center gap-5">
              <Link href="/login" className="hover:text-foreground transition">Sign In</Link>
              <Link href="/signup" className="hover:text-foreground transition">Create Account</Link>
              <Link href="/admin-login" className="hover:text-amber-500 transition text-[11px] text-muted-foreground/60">Admin Portal</Link>
              <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
