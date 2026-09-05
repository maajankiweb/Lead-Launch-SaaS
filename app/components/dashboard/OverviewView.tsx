"use client";

import React, { useMemo } from "react";
import {
  Users,
  ShieldCheck,
  Target,
  TrendingUp,
  Flame,
  Send,
  Sparkles,
  Laptop,
  ArrowRight,
  Search,
  Briefcase,
  Calculator,
  FolderKanban,
  Star,
  CheckCircle2,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";
import type { ProposalRecord } from "./ProposalsTracker";

interface OverviewViewProps {
  leads: Lead[];
  audits: Record<string, AuditResult>;
  ranked: RankedLead[];
  proposals: ProposalRecord[];
  activeCampaignTitle: string;
  onNavigateTab: (tab: any) => void;
  onSelectLeadForPitch: (leadId: string) => void;
  onOpenCrm: () => void;
  onOpenCalculator: () => void;
  onOpenCampaigns: () => void;
}

export function OverviewView({
  leads,
  audits,
  ranked,
  proposals,
  activeCampaignTitle,
  onNavigateTab,
  onSelectLeadForPitch,
  onOpenCrm,
  onOpenCalculator,
  onOpenCampaigns,
}: OverviewViewProps) {
  // Metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const auditedCount = Object.keys(audits).length;
    const auditCompletion = totalLeads > 0 ? Math.round((auditedCount / totalLeads) * 100) : 0;
    const rankedCount = ranked.length;
    const proposalsSentCount = proposals.filter((p) => p.status !== "draft").length;

    // High payable leads (leakage >= 25k or score >= 75)
    const highPayableLeads = leads.filter((l) => {
      const a = audits[l.id];
      const r = ranked.find((item) => item.id === l.id);
      return (
        (a && a.estLostRevenuePerMonth >= 25000) ||
        (r && r.score >= 75) ||
        !l.website
      );
    });

    const totalLostMonthly = Object.values(audits).reduce(
      (acc, curr) => acc + (curr.estLostRevenuePerMonth || 0),
      0
    );

    return {
      totalLeads,
      auditedCount,
      auditCompletion,
      rankedCount,
      proposalsSentCount,
      highPayableCount: highPayableLeads.length,
      highPayableList: highPayableLeads.slice(0, 4),
      totalLostMonthly,
    };
  }, [leads, audits, ranked, proposals]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Workspace Status */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/[0.04] p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 uppercase tracking-wider">
                Autonomous Pipeline Active
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                • {activeCampaignTitle}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              Agency Command Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Track real-time Google Maps lead extractions, technical Core Web Vitals audits, client revenue leakages, AI prototype demos, and multi-channel outreach pitches.
            </p>
          </div>

          {/* Quick Launcher CTA */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Button
              onClick={() => onNavigateTab("phase1")}
              className="h-10 text-xs font-bold gap-2 shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
            >
              <Search className="h-4 w-4" /> Scrape New Leads
            </Button>
            <Button
              variant="outline"
              onClick={onOpenCrm}
              className="h-10 text-xs font-semibold gap-1.5 border-border/80 bg-card hover:bg-muted"
            >
              <Briefcase className="h-4 w-4 text-primary" /> Deals CRM
            </Button>
          </div>
        </div>
      </div>

      {/* 5-Card Executive Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Leads Scraped */}
        <div
          onClick={() => onNavigateTab("phase1")}
          className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/80 hover:border-primary/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Leads Scraped</span>
            <Users className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
              {metrics.totalLeads}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">businesses</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>Phase 1 Scraper</span>
            <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 2: Audited Websites */}
        <div
          onClick={() => onNavigateTab("phase2")}
          className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/80 hover:border-emerald-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Technical Audits</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
              {metrics.auditedCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              ({metrics.auditCompletion}%)
            </span>
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${metrics.auditCompletion}%` }}
            />
          </div>
        </div>

        {/* Card 3: Proposals Sent */}
        <div
          onClick={() => onNavigateTab("proposals")}
          className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/80 hover:border-purple-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Proposals Sent</span>
            <Send className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
              {metrics.proposalsSentCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">delivered</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>WhatsApp & Email</span>
            <ArrowRight className="h-3 w-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 4: High-Payable Radar */}
        <div
          onClick={() => onNavigateTab("radar")}
          className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-orange-500/40 hover:border-orange-500 bg-orange-500/[0.03] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-500">
              High-Payable Leads
            </span>
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-orange-500">
              {metrics.highPayableCount}
            </span>
            <span className="text-[10px] text-orange-500/80 font-bold uppercase">Prime Targets</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>High Retention</span>
            <ArrowRight className="h-3 w-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 5: Pipeline Revenue Leakage */}
        <div
          onClick={onOpenCalculator}
          className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-border/80 hover:border-teal-500/50 transition cursor-pointer group col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Identified Leakage</span>
            <TrendingUp className="h-4 w-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-xl sm:text-2xl font-black text-foreground truncate">
              {metrics.totalLostMonthly > 0
                ? `₹${metrics.totalLostMonthly.toLocaleString("en-IN")}`
                : "₹0"}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">/mo</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>Client pitch leverage</span>
            <ArrowRight className="h-3 w-3 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
      </div>

      {/* Visual Acquisition Funnel */}
      <div className="rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> End-to-End Client Acquisition Funnel
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              How businesses move from raw Google Maps listings into closed high-ticket retainers
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab("phase1")}
            className="text-xs text-primary font-bold gap-1"
          >
            Launch Step 1 <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {/* Funnel 1 */}
          <div
            onClick={() => onNavigateTab("phase1")}
            className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 hover:bg-muted/70 transition cursor-pointer"
          >
            <div className="text-[10px] uppercase font-bold text-muted-foreground">1. Scraped</div>
            <div className="font-mono text-xl font-extrabold text-foreground mt-1">
              {metrics.totalLeads}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Verified listings</div>
          </div>

          {/* Funnel 2 */}
          <div
            onClick={() => onNavigateTab("phase2")}
            className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 hover:bg-muted/70 transition cursor-pointer"
          >
            <div className="text-[10px] uppercase font-bold text-muted-foreground">2. Audited</div>
            <div className="font-mono text-xl font-extrabold text-emerald-500 mt-1">
              {metrics.auditedCount}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Speed & gap analysis</div>
          </div>

          {/* Funnel 3 */}
          <div
            onClick={() => onNavigateTab("phase3")}
            className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 hover:bg-muted/70 transition cursor-pointer"
          >
            <div className="text-[10px] uppercase font-bold text-muted-foreground">3. AI Ranked</div>
            <div className="font-mono text-xl font-extrabold text-primary mt-1">
              {metrics.rankedCount}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Scored by conversion</div>
          </div>

          {/* Funnel 4 */}
          <div
            onClick={() => onNavigateTab("phase4")}
            className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 hover:bg-muted/70 transition cursor-pointer"
          >
            <div className="text-[10px] uppercase font-bold text-muted-foreground">4. Demo Studio</div>
            <div className="font-mono text-xl font-extrabold text-teal-500 mt-1">
              {metrics.rankedCount > 0 ? "Ready" : "0"}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Bolt / Lovable Prompts</div>
          </div>

          {/* Funnel 5 */}
          <div
            onClick={() => onNavigateTab("proposals")}
            className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 hover:bg-muted/70 transition cursor-pointer"
          >
            <div className="text-[10px] uppercase font-bold text-muted-foreground">5. Pitches Sent</div>
            <div className="font-mono text-xl font-extrabold text-purple-500 mt-1">
              {metrics.proposalsSentCount}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">WhatsApp / Cold Email</div>
          </div>
        </div>
      </div>

      {/* High-Payable Leads Spotlight (User's Key Feature) */}
      <div className="rounded-3xl border border-orange-500/30 bg-card/70 backdrop-blur-xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider mb-1">
              <Flame className="h-3 w-3 fill-orange-500" /> High-Value Opportunities
            </div>
            <h3 className="font-bold text-base text-foreground">
              High-Payable Leads Spotlight
            </h3>
            <p className="text-xs text-muted-foreground">
              Businesses losing the most revenue every month with verified buying demand
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab("radar")}
            className="text-xs font-bold gap-1.5 border-orange-500/40 text-orange-500 hover:bg-orange-500/10"
          >
            View All in Radar ({metrics.highPayableCount}) <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {metrics.highPayableList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/80 rounded-2xl">
            <p className="text-xs text-muted-foreground">
              No high-payable leads filtered yet. Run a live scrape in Phase 1 to detect high-value businesses losing revenue.
            </p>
            <Button
              onClick={() => onNavigateTab("phase1")}
              size="sm"
              className="mt-3 gap-1.5 text-xs font-bold shadow-md bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
            >
              <Search className="h-3.5 w-3.5" /> Scrape High-Ticket Leads
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.highPayableList.map((lead) => {
              const audit = audits[lead.id];
              const lost = audit?.estLostRevenuePerMonth || 35000;
              return (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-orange-500/25 bg-card/80 p-4 flex flex-col justify-between hover:border-orange-500 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                      <span className="truncate max-w-[110px]">{lead.category || "Business"}</span>
                      <span className="text-orange-500 font-extrabold">₹{(lost / 1000).toFixed(0)}k/mo</span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground truncate" title={lead.name}>
                      {lead.name}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{lead.rating || 4.2} ({lead.reviewsCount || 25})</span>
                      <span>•</span>
                      <span className="truncate">{lead.city || "City"}</span>
                    </div>

                    <div className="mt-2.5 p-2 rounded-xl bg-muted/40 text-[11px] text-foreground font-medium line-clamp-2">
                      {!lead.website
                        ? "Zero website. Losing ~80% of online customers."
                        : audit?.biggestGap || "Severe speed lag & low conversion rate."}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2">
                    <Button
                      onClick={() => onSelectLeadForPitch(lead.id)}
                      size="sm"
                      className="flex-1 h-8 text-[11px] font-bold gap-1 bg-gradient-to-r from-primary to-emerald-600"
                    >
                      <Send className="h-3 w-3" /> Pitch Client
                    </Button>
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 w-8 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition shrink-0"
                        title="Open WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agency Growth Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tool 1 */}
        <div
          onClick={onOpenCrm}
          className="rounded-2xl border border-border/80 bg-card/60 p-5 hover:border-primary/50 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Briefcase className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Deals CRM & Pipeline</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Track prospects, demo links sent, calls booked, and won web design retainers.
            </p>
          </div>
          <div className="mt-4 pt-2 text-xs font-bold text-primary flex items-center gap-1">
            Open Pipeline Tracker <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Tool 2 */}
        <div
          onClick={onOpenCalculator}
          className="rounded-2xl border border-border/80 bg-card/60 p-5 hover:border-primary/50 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calculator className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Revenue Forecaster</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Simulate setup fees, monthly retainers, client churn, and annual recurring revenue.
            </p>
          </div>
          <div className="mt-4 pt-2 text-xs font-bold text-teal-500 flex items-center gap-1">
            Calculate Earnings <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Tool 3 */}
        <div
          onClick={onOpenCampaigns}
          className="rounded-2xl border border-border/80 bg-card/60 p-5 hover:border-primary/50 transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Saved Campaigns</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Switch across dental, legal, fitness, and restaurant niches stored in MongoDB Atlas.
            </p>
          </div>
          <div className="mt-4 pt-2 text-xs font-bold text-purple-500 flex items-center gap-1">
            Manage Campaigns <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
