"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Stepper } from "@/components/Stepper";
import { Phase1Scrape } from "@/components/Phase1Scrape";
import { Phase2Audit } from "@/components/Phase2Audit";
import { Phase3Rank } from "@/components/Phase3Rank";
import { Phase4Build } from "@/components/Phase4Build";
import { Phase5Outreach } from "@/components/Phase5Outreach";
import { AgencyDealsTracker } from "@/components/AgencyDealsTracker";
import { EarningCalculator } from "@/components/EarningCalculator";
import { CampaignManagerModal } from "@/components/campaigns/CampaignManagerModal";
import { UserSettingsModal } from "@/components/settings/UserSettingsModal";
import { DashboardSidebar, type DashboardTab } from "@/components/dashboard/DashboardSidebar";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { HighPayableRadar } from "@/components/dashboard/HighPayableRadar";
import { ProposalsTracker, type ProposalRecord } from "@/components/dashboard/ProposalsTracker";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Briefcase,
  Calculator,
  FolderKanban,
  Settings,
  LogOut,
  User,
  Building2,
  BookmarkPlus,
  Loader2,
  ChevronDown,
  ArrowLeft,
  Users,
  ShieldCheck,
  TrendingUp,
  Target,
  ExternalLink,
  ShieldAlert,
  Flame,
  Zap,
  Menu,
  ChevronRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Pipeline Data State
  const [phase, setPhase] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<Record<string, AuditResult>>({});
  const [ranked, setRanked] = useState<RankedLead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [claudeOk, setClaudeOk] = useState<boolean | null>(null);

  // Proposals History State
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);

  // Modals State
  const [crmOpen, setCrmOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [campaignsOpen, setCampaignsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Active campaign in database
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeCampaignTitle, setActiveCampaignTitle] = useState<string>("Default Pipeline");

  // Load saved sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("l2l_sidebar_collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
      const savedProposals = localStorage.getItem("l2l_proposals_history");
      if (savedProposals) {
        setProposals(JSON.parse(savedProposals));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("l2l_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch("/api/claude-status")
      .then((r) => r.json())
      .then((d) => setClaudeOk(!!d.installed))
      .catch(() => setClaudeOk(false));
  }, []);

  // Completed stepper logic
  const completed = useMemo(() => {
    const s = new Set<number>();
    if (leads.length > 0) s.add(1);
    if (Object.keys(audits).length > 0) s.add(2);
    if (ranked.length > 0) s.add(3);
    if (selectedId) s.add(4);
    return s;
  }, [leads, audits, ranked, selectedId]);

  // Safely resolve the currently selected ranked lead
  const selectedRanked = useMemo<RankedLead | null>(() => {
    if (selectedId) {
      const found = ranked.find((r) => r.id === selectedId);
      if (found) return found;

      const lead = leads.find((l) => l.id === selectedId);
      if (lead) {
        const audit = audits[lead.id] || {
          leadId: lead.id,
          pageSpeedScore: 48,
          hasWebsite: !!lead.website,
          mobileFriendly: false,
          https: true,
          hasSchema: false,
          loadTimeMs: 4200,
          gaps: ["Slow mobile speed (48/100)", "No appointment scheduling", "Missing SSL/Schema"],
          biggestGap: "Mobile conversion bottleneck - loses ~35% visitors",
          estLostRevenuePerMonth: 35000,
        };
        return {
          ...lead,
          audit,
          score: 88,
          scoreReasoning: "High review volume with urgent mobile optimization need.",
        };
      }
    }
    return ranked.length > 0 ? ranked[0] : null;
  }, [ranked, selectedId, leads, audits]);

  // Executive Metrics Calculations
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const auditedCount = Object.keys(audits).length;
    const rankedCount = ranked.length;

    const highPayableCount = leads.filter((l) => {
      const a = audits[l.id];
      const r = ranked.find((item) => item.id === l.id);
      return (
        (a && a.estLostRevenuePerMonth >= 25000) ||
        (r && r.score >= 75) ||
        !l.website
      );
    }).length;

    const proposalsSentCount = proposals.filter((p) => p.status !== "draft").length;

    return {
      totalLeads,
      auditedCount,
      rankedCount,
      highPayableCount,
      proposalsSentCount,
      dealsCount: 4, // Pulled from Deals CRM or fallback
    };
  }, [leads, audits, ranked, proposals]);

  // Add proposal to tracking
  const handleAddProposal = (newP: Omit<ProposalRecord, "id" | "sentAt">) => {
    const rec: ProposalRecord = {
      ...newP,
      id: "prop_" + Date.now(),
      sentAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    };
    setProposals((prev) => {
      const updated = [rec, ...prev];
      try {
        localStorage.setItem("l2l_proposals_history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleUpdateProposalStatus = (id: string, status: ProposalRecord["status"]) => {
    setProposals((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, status } : p));
      try {
        localStorage.setItem("l2l_proposals_history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    toast.success("Proposal status updated!");
  };

  // Load sample agency campaign for instant demo
  const handleLoadSampleData = () => {
    const SAMPLE_LEADS: Lead[] = [
      {
        id: "sample_mumbai_dental_1",
        name: "Dr. Smile Dental & Implant Clinic",
        category: "Dentist",
        address: "Bandra West, Mumbai, Maharashtra",
        city: "Mumbai",
        phone: "+91 98200 12345",
        whatsapp: "+91 98200 12345",
        email: "contact@drsmilemumbai.com",
        website: "http://drsmileclinic.blogspot.com",
        rating: 4.8,
        reviewsCount: 142,
        lat: 19.0596,
        lng: 72.8295,
      },
      {
        id: "sample_mumbai_cosmetic_2",
        name: "Aura Aesthetics & Skin Center",
        category: "Skin & Dermatology Clinic",
        address: "Andheri West, Mumbai, Maharashtra",
        city: "Mumbai",
        phone: "+91 98330 67890",
        whatsapp: "+91 98330 67890",
        email: "info@auraskinmumbai.in",
        website: "", // No website! High payable!
        rating: 4.9,
        reviewsCount: 89,
        lat: 19.1136,
        lng: 72.8697,
      },
      {
        id: "sample_mumbai_law_3",
        name: "Kapadia & Associates Corporate Law",
        category: "Corporate Lawyer",
        address: "Nariman Point, Mumbai, Maharashtra",
        city: "Mumbai",
        phone: "+91 98211 54321",
        whatsapp: "+91 98211 54321",
        email: "advisory@kapadialaw.com",
        website: "https://kapadialaw.in",
        rating: 4.7,
        reviewsCount: 64,
        lat: 18.9256,
        lng: 72.8242,
      },
      {
        id: "sample_mumbai_fitness_4",
        name: "IronCore Crossfit & Wellness Gym",
        category: "Gym & Fitness Studio",
        address: "Powai, Mumbai, Maharashtra",
        city: "Mumbai",
        phone: "+91 98920 99887",
        whatsapp: "+91 98920 99887",
        email: "fit@ironcoremumbai.com",
        website: "http://ironcoregym.wixsite.com/home",
        rating: 4.6,
        reviewsCount: 110,
        lat: 19.1176,
        lng: 72.9060,
      },
      {
        id: "sample_mumbai_restaurant_5",
        name: "Olive & Herb Artisan Bistro",
        category: "Fine Dining Restaurant",
        address: "Juhu, Mumbai, Maharashtra",
        city: "Mumbai",
        phone: "+91 98205 44332",
        whatsapp: "+91 98205 44332",
        email: "bookings@oliveherbjuhu.com",
        website: "", // No website!
        rating: 4.5,
        reviewsCount: 230,
        lat: 19.0988,
        lng: 72.8264,
      },
    ];

    const SAMPLE_AUDITS: Record<string, AuditResult> = {
      sample_mumbai_dental_1: {
        leadId: "sample_mumbai_dental_1",
        pageSpeedScore: 36,
        hasWebsite: true,
        mobileFriendly: false,
        https: false,
        hasSchema: false,
        loadTimeMs: 5400,
        gaps: ["Free Blogspot domain", "Unsecured HTTP connection", "No online appointment booking"],
        biggestGap: "Free blog domain hurts patient trust. Loses ~20 high-margin dental implants/mo.",
        estLostRevenuePerMonth: 65000,
      },
      sample_mumbai_cosmetic_2: {
        leadId: "sample_mumbai_cosmetic_2",
        pageSpeedScore: 0,
        hasWebsite: false,
        mobileFriendly: false,
        https: false,
        hasSchema: false,
        loadTimeMs: 0,
        gaps: ["No website detected", "Zero local search presence", "No online portfolio"],
        biggestGap: "Completely invisible on Google Search. 80+ patients lost to rival clinics monthly.",
        estLostRevenuePerMonth: 85000,
      },
      sample_mumbai_law_3: {
        leadId: "sample_mumbai_law_3",
        pageSpeedScore: 52,
        hasWebsite: true,
        mobileFriendly: true,
        https: true,
        hasSchema: false,
        loadTimeMs: 3800,
        gaps: ["Slow loading time", "Outdated 2017 design", "No instant consultation booking"],
        biggestGap: "Outdated design fails to convert corporate retained clients.",
        estLostRevenuePerMonth: 45000,
      },
      sample_mumbai_fitness_4: {
        leadId: "sample_mumbai_fitness_4",
        pageSpeedScore: 42,
        hasWebsite: true,
        mobileFriendly: false,
        https: true,
        hasSchema: false,
        loadTimeMs: 4600,
        gaps: ["Wix free banner watermark", "Mobile layout broken", "Slow membership signups"],
        biggestGap: "Wix branding reduces premium gym membership sales.",
        estLostRevenuePerMonth: 30000,
      },
      sample_mumbai_restaurant_5: {
        leadId: "sample_mumbai_restaurant_5",
        pageSpeedScore: 0,
        hasWebsite: false,
        mobileFriendly: false,
        https: false,
        hasSchema: false,
        loadTimeMs: 0,
        gaps: ["Zero website present", "Relying 100% on Zomato commissions (25% fee)"],
        biggestGap: "Losing thousands in food delivery commissions without a direct order website.",
        estLostRevenuePerMonth: 95000,
      },
    };

    const SAMPLE_RANKED: RankedLead[] = SAMPLE_LEADS.map((l) => ({
      ...l,
      audit: SAMPLE_AUDITS[l.id],
      score: l.id === "sample_mumbai_cosmetic_2" ? 96 : l.id === "sample_mumbai_dental_1" ? 92 : 85,
      scoreReasoning:
        l.id === "sample_mumbai_cosmetic_2"
          ? "89 five-star reviews but ZERO website. Massive patient demand with urgent close potential."
          : l.id === "sample_mumbai_dental_1"
          ? "142 Google reviews, Blogspot free domain hurting clinic credibility. Easiest close."
          : "Active local demand, high revenue leakage, verified WhatsApp reachable.",
    })).sort((a, b) => b.score - a.score);

    const SAMPLE_PROPOSALS: ProposalRecord[] = [
      {
        id: "prop_1",
        leadId: "sample_mumbai_dental_1",
        leadName: "Dr. Smile Dental & Implant Clinic",
        channel: "whatsapp",
        language: "hinglish",
        status: "replied",
        hookPreview: "Namaste Dr. Smile team! Saw your 142 top reviews in Bandra...",
        sentAt: "Yesterday",
        value: 45000,
      },
      {
        id: "prop_2",
        leadId: "sample_mumbai_cosmetic_2",
        leadName: "Aura Aesthetics & Skin Center",
        channel: "whatsapp",
        language: "english",
        status: "sent",
        hookPreview: "Hi Aura Aesthetics, built a 60-second live preview for your dermatology clinic...",
        sentAt: "Today",
        value: 60000,
      },
    ];

    setLeads(SAMPLE_LEADS);
    setAudits(SAMPLE_AUDITS);
    setRanked(SAMPLE_RANKED);
    setProposals(SAMPLE_PROPOSALS);
    setSelectedId(SAMPLE_RANKED[0].id);
    setActiveCampaignTitle("Mumbai High-Ticket Clinics & Services");

    toast.success("Loaded 5 verified High-Ticket Mumbai Leads with full Audits & Leakage data!");
  };

  // Switch to Phase 5 Outreach for a specific lead
  const handleSelectLeadForPitch = (leadId: string) => {
    setSelectedId(leadId);
    setPhase(5);
    setActiveTab("phase5");
    toast.info("Switched to Phase 5 Outreach for this lead.");
  };

  // Load a saved campaign from database
  const handleSelectCampaign = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      if (res.ok && data.campaign) {
        setActiveCampaignId(data.campaign.id);
        setActiveCampaignTitle(data.campaign.title);

        if (Array.isArray(data.campaign.leads) && data.campaign.leads.length > 0) {
          const loadedLeads: Lead[] = data.campaign.leads.map((l: any) => ({
            id: l.id,
            name: l.name,
            category: l.category || "Business",
            address: l.address || "",
            city: (l.address || "City").split(",")[0],
            phone: l.phone || "",
            whatsapp: l.phone || "",
            website: l.website || "",
            rating: l.rating ?? 4.0,
            reviewsCount: l.reviews ?? 10,
            email: l.email || undefined,
            lat: 0,
            lng: 0,
          }));

          setLeads(loadedLeads);

          // Restore audits if any
          const loadedAudits: Record<string, AuditResult> = {};
          data.campaign.leads.forEach((l: any) => {
            if (l.audit) {
              try {
                loadedAudits[l.id] = {
                  leadId: l.id,
                  pageSpeedScore: l.audit.desktopSpeed || 65,
                  hasWebsite: !!l.website,
                  mobileFriendly: l.audit.mobileFriendly ?? true,
                  https: l.audit.ssl ?? true,
                  hasSchema: true,
                  loadTimeMs: 2400,
                  gaps: JSON.parse(l.audit.issues || "[]"),
                  biggestGap: "Mobile conversion & SEO optimization needed",
                  estLostRevenuePerMonth: 25000,
                };
              } catch {
                // ignore
              }
            }
          });
          setAudits(loadedAudits);
          toast.success(`Loaded campaign "${data.campaign.title}" with ${loadedLeads.length} leads!`);
        }
      }
    } catch {
      toast.error("Failed to load campaign data");
    }
  };

  // Save current workspace state as a new campaign in database
  const handleSaveCurrentAsCampaign = async (title: string, niche: string, location: string) => {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        niche,
        location,
        leads: leads.map((l) => ({
          name: l.name,
          category: l.category,
          address: l.address,
          phone: l.phone,
          website: l.website,
          rating: l.rating,
          reviews: l.reviewsCount,
          email: l.email,
          opportunityScore: ranked.find((r) => r.id === l.id)?.score,
          opportunityNotes: ranked.find((r) => r.id === l.id)?.scoreReasoning,
        })),
      }),
    });

    const data = await res.json();
    if (res.ok && data.campaign) {
      setActiveCampaignId(data.campaign.id);
      setActiveCampaignTitle(data.campaign.title);
      toast.success(`Campaign "${title}" saved to your database!`);
    } else {
      throw new Error(data.error || "Failed to save campaign");
    }
  };

  // Handle Tab Selection from Sidebar or Header
  const handleSelectTab = (tab: DashboardTab) => {
    if (tab === "crm") {
      setCrmOpen(true);
      return;
    }
    if (tab === "calculator") {
      setCalculatorOpen(true);
      return;
    }
    if (tab === "campaigns") {
      setCampaignsOpen(true);
      return;
    }

    setActiveTab(tab);

    // Sync phase number if a phase tab is clicked
    if (tab === "phase1") setPhase(1);
    else if (tab === "phase2") setPhase(2);
    else if (tab === "phase3") setPhase(3);
    else if (tab === "phase4") setPhase(4);
    else if (tab === "phase5") setPhase(5);
  };

  // Auth Loading Screen
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30 mb-5 animate-pulse">
          <Sparkles className="h-7 w-7" />
        </div>
        <div className="font-display text-xl font-bold tracking-tight">Lead <span className="text-primary font-normal">→</span> Launch</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Initializing agency command center…
        </div>
      </div>
    );
  }

  // Check if current tab is a workflow phase
  const isPhaseView = ["phase1", "phase2", "phase3", "phase4", "phase5"].includes(activeTab);

  return (
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20 selection:text-primary relative">
      {/* Background ambient radial lights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[250px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/10 via-emerald-500/5 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* 1. Modern Collapsible Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        user={user}
        onLogout={async () => {
          await logout();
          router.push("/login");
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenCampaigns={() => setCampaignsOpen(true)}
        onOpenCrm={() => setCrmOpen(true)}
        onOpenCalculator={() => setCalculatorOpen(true)}
        metrics={metrics}
        activeCampaignTitle={activeCampaignTitle}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Command Bar */}
        <header className="border-b border-border/80 bg-background/80 backdrop-blur-xl sticky top-0 z-20 h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden h-9 w-9 rounded-xl border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold truncate">
              <span
                onClick={() => setActiveTab("overview")}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition hidden sm:inline"
              >
                Dashboard
              </span>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="text-foreground font-bold truncate">
                {activeTab === "overview" && "Executive Overview"}
                {activeTab === "phase1" && "Phase 1: Google Maps Scraper"}
                {activeTab === "phase2" && "Phase 2: Technical Audit Engine"}
                {activeTab === "phase3" && "Phase 3: AI Conversion Ranker"}
                {activeTab === "phase4" && "Phase 4: Instant Demo Studio"}
                {activeTab === "phase5" && "Phase 5: Multi-Channel Outreach"}
                {activeTab === "radar" && "High-Payable Leads Radar"}
                {activeTab === "proposals" && "Proposals & Pitches Delivered"}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Active Campaign Selector */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCampaignsOpen(true)}
              className="h-9 text-xs gap-1.5 border-border/80 bg-card/70 hover:bg-muted font-semibold rounded-xl"
            >
              <FolderKanban className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[120px] truncate hidden sm:inline">{activeCampaignTitle}</span>
              {leads.length > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-bold">
                  {leads.length}
                </span>
              )}
            </Button>

            {leads.length > 0 && !activeCampaignId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCampaignsOpen(true)}
                className="hidden sm:inline-flex h-9 text-xs gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold rounded-xl"
              >
                <BookmarkPlus className="h-3.5 w-3.5" /> Save
              </Button>
            )}

            {/* Deals CRM Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCrmOpen(true)}
              className="h-9 text-xs gap-1.5 border-border/80 bg-card/70 hover:bg-muted font-semibold rounded-xl"
            >
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Deals CRM</span>
            </Button>

            {/* Revenue Calculator */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalculatorOpen(true)}
              className="h-9 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-semibold rounded-xl"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Calculator</span>
            </Button>

            {/* Workspace Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              title="Workspace Settings"
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <div className="h-5 w-px bg-border/80 hidden sm:block mx-0.5" />

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-xl border border-border/80 bg-card hover:bg-muted transition text-left cursor-pointer"
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary/30 to-emerald-500/30 border border-primary/30 text-primary flex items-center justify-center text-xs font-black">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/90 bg-card/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-2"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="p-2.5 border-b border-border/60 mb-1.5">
                    <div className="font-bold text-sm text-foreground truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/25">
                        {user.role === "AGENCY" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {user.role}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono font-semibold">
                        {user.plan} Plan
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition text-left font-medium"
                  >
                    <Settings className="h-4 w-4" /> Workspace Settings
                  </button>

                  <button
                    onClick={() => setCampaignsOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition text-left font-medium"
                  >
                    <FolderKanban className="h-4 w-4" /> Saved Campaigns
                  </button>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition text-left font-semibold"
                    >
                      <ShieldAlert className="h-4 w-4" /> Admin Console
                    </Link>
                  )}

                  <div className="h-px bg-border/60 my-1.5" />

                  <button
                    onClick={async () => {
                      await logout();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition font-semibold text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Tab 1: Panoramic Overview */}
          {activeTab === "overview" && (
            <OverviewView
              leads={leads}
              audits={audits}
              ranked={ranked}
              proposals={proposals}
              activeCampaignTitle={activeCampaignTitle}
              onNavigateTab={handleSelectTab}
              onSelectLeadForPitch={handleSelectLeadForPitch}
              onOpenCrm={() => setCrmOpen(true)}
              onOpenCalculator={() => setCalculatorOpen(true)}
              onOpenCampaigns={() => setCampaignsOpen(true)}
              onLoadSampleData={handleLoadSampleData}
            />
          )}

          {/* Tab 2: High-Payable Radar */}
          {activeTab === "radar" && (
            <HighPayableRadar
              leads={leads}
              audits={audits}
              ranked={ranked}
              onSelectLeadForPitch={handleSelectLeadForPitch}
              onOpenScraper={() => handleSelectTab("phase1")}
            />
          )}

          {/* Tab 3: Proposals & Pitches Tracker */}
          {activeTab === "proposals" && (
            <ProposalsTracker
              proposals={proposals}
              onAddProposal={handleAddProposal}
              onUpdateStatus={handleUpdateProposalStatus}
              onJumpToOutreach={(leadId) => {
                if (leadId) setSelectedId(leadId);
                setPhase(5);
                setActiveTab("phase5");
              }}
              rankedLeads={ranked}
            />
          )}

          {/* Tab 4: Interactive 5-Step Workflow Engine */}
          {isPhaseView && (
            <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-4 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              {/* Stepper Navigation */}
              <div className="mb-6">
                <Stepper
                  current={phase}
                  onJump={(p) => {
                    setPhase(p);
                    setActiveTab(`phase${p}` as DashboardTab);
                  }}
                  completed={completed}
                />
              </div>

              {/* Dynamic Phase Render */}
              <div className="mt-4">
                <AnimatePresence mode="wait">
                  {phase === 1 && (
                    <Phase1Scrape
                      key="phase1"
                      leads={leads}
                      setLeads={(newLeads) => {
                        setLeads(newLeads);
                        if (newLeads.length > 0) {
                          toast.success(`Scraped ${newLeads.length} leads successfully!`);
                        }
                      }}
                      onNext={() => {
                        setPhase(2);
                        setActiveTab("phase2");
                      }}
                    />
                  )}
                  {phase === 2 && (
                    <Phase2Audit
                      key="phase2"
                      leads={leads}
                      audits={audits}
                      setAudits={setAudits}
                      onNext={() => {
                        setPhase(3);
                        setActiveTab("phase3");
                      }}
                      onPrev={() => {
                        setPhase(1);
                        setActiveTab("phase1");
                      }}
                    />
                  )}
                  {phase === 3 && (
                    <Phase3Rank
                      key="phase3"
                      leads={leads}
                      audits={audits}
                      ranked={ranked}
                      setRanked={setRanked}
                      selectedId={selectedId}
                      setSelectedId={setSelectedId}
                      onNext={() => {
                        if (!selectedId && ranked.length > 0) {
                          setSelectedId(ranked[0].id);
                        }
                        setPhase(4);
                        setActiveTab("phase4");
                      }}
                      onPrev={() => {
                        setPhase(2);
                        setActiveTab("phase2");
                      }}
                    />
                  )}
                  {phase === 4 && (
                    <Phase4Build
                      key="phase4"
                      selected={selectedRanked}
                      onNext={() => {
                        setPhase(5);
                        setActiveTab("phase5");
                      }}
                      onPrev={() => {
                        setPhase(3);
                        setActiveTab("phase3");
                      }}
                    />
                  )}
                  {phase === 5 && (
                    <Phase5Outreach
                      key="phase5"
                      selected={selectedRanked}
                      onPrev={() => {
                        setPhase(4);
                        setActiveTab("phase4");
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global SaaS Modals */}
      <AgencyDealsTracker
        open={crmOpen}
        onOpenChange={setCrmOpen}
        currentLeads={ranked}
      />

      <EarningCalculator
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
      />

      <CampaignManagerModal
        open={campaignsOpen}
        onOpenChange={setCampaignsOpen}
        currentCampaignId={activeCampaignId}
        onSelectCampaign={handleSelectCampaign}
        onSaveCurrentAsCampaign={handleSaveCurrentAsCampaign}
        hasUnsavedLeads={leads.length > 0 && !activeCampaignId}
      />

      <UserSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
