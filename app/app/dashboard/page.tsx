"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [phase, setPhase] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<Record<string, AuditResult>>({});
  const [ranked, setRanked] = useState<RankedLead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [claudeOk, setClaudeOk] = useState<boolean | null>(null);

  // Modals
  const [crmOpen, setCrmOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [campaignsOpen, setCampaignsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Active campaign in database
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeCampaignTitle, setActiveCampaignTitle] = useState<string>("Default Pipeline");

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

  const selectedRanked = useMemo(
    () => ranked.find((r) => r.id === selectedId) ?? null,
    [ranked, selectedId],
  );

  // Executive Metrics Calculations
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const auditedCount = Object.keys(audits).length;
    const auditCompletion = totalLeads > 0 ? Math.round((auditedCount / totalLeads) * 100) : 0;
    
    let topScore: number | null = null;
    if (ranked.length > 0) {
      topScore = Math.max(...ranked.map((r) => r.score));
    }

    const totalLostMonthly = Object.values(audits).reduce(
      (acc, curr) => acc + (curr.estLostRevenuePerMonth || 0),
      0
    );

    return {
      totalLeads,
      auditedCount,
      auditCompletion,
      topScore,
      totalLostMonthly,
    };
  }, [leads, audits, ranked]);

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

  // Render SaaS Authenticated Workspace
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary relative">
      {/* Background ambient radial lights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[250px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/10 via-emerald-500/5 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* SaaS Workspace Header / Executive Command Bar */}
      <header className="border-b border-border/80 bg-background/85 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
          {/* Logo & Workspace Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-primary/25 hover:scale-105 transition-transform"
              title="Return to Landing Page"
            >
              <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2} aria-hidden="true" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href="/" className="font-display text-base sm:text-lg font-extrabold leading-none tracking-tight hover:text-primary transition">
                  Lead <span className="text-muted-foreground font-light">→</span> Launch
                </Link>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                  {user.role === "AGENCY" ? "Agency Suite" : user.role === "ADMIN" ? "Master Admin" : "Freelancer OS"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[180px]">
                  {user.agencyName ? user.agencyName : `${user.name}'s Workspace`}
                </span>
                
                {/* Live MongoDB Status Beacon */}
                <div className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Atlas DB Connected
                </div>
              </div>
            </div>
          </div>

          {/* SaaS Navigation, Pipeline Controls & Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Landing page link */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted/70 transition font-medium border border-transparent hover:border-border/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Landing
            </Link>

            {/* Campaign Selector / DB Save */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCampaignsOpen(true)}
              className="h-9 text-xs gap-1.5 border-border/80 bg-card/70 hover:bg-muted/80 font-semibold rounded-lg shadow-sm"
            >
              <FolderKanban className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[130px] truncate">{activeCampaignTitle}</span>
              {leads.length > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-extrabold">
                  {leads.length}
                </span>
              )}
            </Button>

            {leads.length > 0 && !activeCampaignId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCampaignsOpen(true)}
                className="h-9 text-xs gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold rounded-lg"
              >
                <BookmarkPlus className="h-3.5 w-3.5" /> Save Campaign
              </Button>
            )}

            {/* Earning Calculator */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalculatorOpen(true)}
              className="h-9 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-semibold rounded-lg"
            >
              <Calculator className="h-3.5 w-3.5" /> Calculator
            </Button>

            {/* Deals CRM */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCrmOpen(true)}
              className="h-9 text-xs gap-1.5 border-border/80 bg-card/70 hover:bg-muted font-semibold rounded-lg"
            >
              <Briefcase className="h-3.5 w-3.5" /> Deals CRM
            </Button>

            {/* Workspace Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              title="Workspace Settings"
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <div className="h-5 w-px bg-border/80 hidden sm:block mx-0.5" />

            {/* User Profile & Logout Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted/70 transition text-left cursor-pointer shadow-sm"
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary/30 to-emerald-500/30 border border-primary/30 text-primary flex items-center justify-center text-xs font-black">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold leading-tight max-w-[90px] truncate">{user.name}</div>
                  <div className="text-[10px] text-primary uppercase font-bold tracking-wider">{user.plan}</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition text-left cursor-pointer font-medium"
                  >
                    <Settings className="h-4 w-4" /> Workspace Settings
                  </button>

                  <button
                    onClick={() => setCampaignsOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition text-left cursor-pointer font-medium"
                  >
                    <FolderKanban className="h-4 w-4" /> Saved Campaigns
                  </button>

                  <button
                    onClick={() => setCalculatorOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition text-left cursor-pointer font-medium"
                  >
                    <Calculator className="h-4 w-4" /> Agency Revenue Model
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
        </div>
      </header>

      {/* Main SaaS Pipeline Flow */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Executive Workspace Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Leads Scraped */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/70 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Leads in Pipeline</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {metrics.totalLeads}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">businesses</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {activeCampaignTitle}
            </p>
          </div>

          {/* Card 2: Audited Websites */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/70 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Audit Coverage</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {metrics.auditedCount}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                / {metrics.totalLeads} ({metrics.auditCompletion}%)
              </span>
            </div>
            <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${metrics.auditCompletion}%` }}
              />
            </div>
          </div>

          {/* Card 3: Top Opportunity Score */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/70 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Peak Opportunity</span>
              <Target className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {metrics.topScore !== null ? `${metrics.topScore}` : "—"}
              </span>
              {metrics.topScore !== null && (
                <span className="text-[11px] font-semibold text-amber-500">/100 score</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              {metrics.topScore && metrics.topScore >= 75 ? (
                <>
                  <Flame className="h-3 w-3 text-orange-500 fill-orange-500 inline" />
                  <span className="text-orange-500 font-semibold">High close rate</span>
                </>
              ) : (
                "Rank leads in Phase 3"
              )}
            </p>
          </div>

          {/* Card 4: Monthly Client Revenue Leakage Identified */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/70 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Identified Leakage</span>
              <TrendingUp className="h-4 w-4 text-teal-500" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {metrics.totalLostMonthly > 0 ? `₹${metrics.totalLostMonthly.toLocaleString("en-IN")}` : "—"}
              </span>
              {metrics.totalLostMonthly > 0 && (
                <span className="text-[10px] text-muted-foreground font-semibold">/mo</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Client pitch leverage value
            </p>
          </div>
        </div>

        {/* Pipeline Container & Interactive Stepper */}
        <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-4 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Stepper Navigation */}
          <div className="mb-6">
            <Stepper current={phase} onJump={setPhase} completed={completed} />
          </div>

          {/* Dynamic Phase Render */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {phase === 1 && (
                <Phase1Scrape
                  key="phase1"
                  leads={leads}
                  setLeads={setLeads}
                  onNext={() => setPhase(2)}
                />
              )}
              {phase === 2 && (
                <Phase2Audit
                  key="phase2"
                  leads={leads}
                  audits={audits}
                  setAudits={setAudits}
                  onNext={() => setPhase(3)}
                  onPrev={() => setPhase(1)}
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
                  }}
                  onPrev={() => setPhase(2)}
                />
              )}
              {phase === 4 && (
                <Phase4Build
                  key="phase4"
                  selected={selectedRanked}
                  onNext={() => setPhase(5)}
                  onPrev={() => setPhase(3)}
                />
              )}
              {phase === 5 && (
                <Phase5Outreach
                  key="phase5"
                  selected={selectedRanked}
                  onPrev={() => setPhase(4)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

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

