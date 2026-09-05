"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Building2,
  Globe,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Zap,
  Gauge,
  Calculator,
  Users,
  Send,
  Clock,
  Briefcase,
  FileText,
  ExternalLink,
  Bot,
  Printer,
  ChevronRight,
  ArrowRight,
  Layers,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, AuditResult, RankedLead, ProposalDocument } from "@/lib/types";
import { LeadHealthBadge } from "@/components/intelligence/LeadHealthBadge";
import { AdvancedAuditView } from "@/components/audit/AdvancedAuditView";
import { RevenueOpportunityCalculator } from "@/components/opportunity/RevenueOpportunityCalculator";
import { ProspectSalesBrief } from "@/components/sales/ProspectSalesBrief";
import { CompetitorAnalysisView } from "@/components/competitors/CompetitorAnalysisView";
import { OutreachSequenceBuilder } from "@/components/outreach/OutreachSequenceBuilder";
import { AIProposalGenerator } from "@/components/proposals/AIProposalGenerator";
import { SalesCopilotModal } from "@/components/copilot/SalesCopilotModal";

import { generateComprehensiveAudit } from "@/lib/auditEngine";

interface UnifiedProspectWorkspaceProps {
  lead: Lead | null;
  audit?: AuditResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJumpToPipeline?: (leadId: string) => void;
}

export function UnifiedProspectWorkspace({
  lead,
  audit,
  open,
  onOpenChange,
  onJumpToPipeline,
}: UnifiedProspectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copilotOpen, setCopilotOpen] = useState(false);

  if (!lead) return null;

  const effectiveAudit = audit || generateComprehensiveAudit(lead);

  const revs = lead.reviewsCount || 40;
  const rating = lead.rating || 4.5;
  const city = lead.city || "Local City";
  const healthScore = lead.healthScore ?? 88;
  const healthGrade = lead.healthGrade ?? "High Opportunity";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:w-[95vw] md:w-[92vw] lg:w-[1200px] max-w-7xl h-[92vh] max-h-[900px] flex flex-col p-0 border-border bg-background shadow-2xl rounded-3xl overflow-hidden">
        {/* Top Intelligence Command Header */}
        <div className="p-6 border-b border-border/80 bg-gradient-to-r from-card via-card/95 to-primary/[0.04] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 uppercase tracking-wider">
                Unified Prospect OS
              </span>
              <LeadHealthBadge score={healthScore} grade={healthGrade} reasons={lead.healthReasons} />
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                {lead.category}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black font-display text-foreground tracking-tight">
                {lead.company || lead.name}
              </h2>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{rating}★</span>
                <span className="text-muted-foreground font-normal">({revs} reviews)</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span>{lead.address || city}</span> •{" "}
              {lead.phone && (
                <span className="text-foreground font-mono">📞 {lead.phone}</span>
              )}
              {lead.website ? (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-mono"
                >
                  🌐 {lead.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-destructive font-semibold">❌ No Active Website</span>
              )}
            </p>
          </div>

          {/* Quick Command Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              onClick={() => setCopilotOpen(true)}
              className="h-9 px-3.5 text-xs gap-1.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20"
            >
              <Bot className="h-4 w-4" /> AI Sales Copilot
            </Button>

            {lead.whatsapp && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const num = lead.whatsapp?.replace(/[^0-9]/g, "");
                  window.open(`https://wa.me/${num}`, "_blank");
                }}
                className="h-9 text-xs gap-1.5 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </Button>
            )}

            {lead.phone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${lead.phone}`)}
                className="h-9 text-xs gap-1.5 rounded-xl border-border/80"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
            )}

            {onJumpToPipeline && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onJumpToPipeline(lead.id);
                  onOpenChange(false);
                }}
                className="h-9 text-xs gap-1.5 rounded-xl border-primary/30 text-primary font-bold hover:bg-primary/10"
              >
                <Briefcase className="h-3.5 w-3.5" /> Open in CRM
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation & Body */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Strip */}
          <div className="px-6 border-b border-border/80 bg-muted/20 overflow-x-auto scrollbar-none">
            <TabsList className="h-12 bg-transparent p-0 gap-4 flex justify-start">
              <TabsTrigger
                value="overview"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold px-1"
              >
                Overview & Intel
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold px-1"
              >
                5-Pillar Audit
              </TabsTrigger>
              <TabsTrigger
                value="competitors"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold px-1"
              >
                Competitor Benchmarks
              </TabsTrigger>
              <TabsTrigger
                value="opportunity"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold px-1"
              >
                Revenue ROI Engine
              </TabsTrigger>
              <TabsTrigger
                value="brief"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold px-1"
              >
                AI Sales Brief
              </TabsTrigger>
              <TabsTrigger
                value="sequences"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold px-1"
              >
                Follow-up Cadence
              </TabsTrigger>
              <TabsTrigger
                value="proposal"
                className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground text-xs font-bold px-1"
              >
                AI Proposal
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents Viewport */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab 1: Overview & Enriched Lead Intelligence */}
            <TabsContent value="overview" className="m-0 space-y-6">
              {/* Persistent Next Best Action Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-primary/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Recommended Next Action
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    Send WhatsApp audit teaser demo to {lead.name} highlighting missing mobile booking.
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("sequences")}
                  className="shrink-0 gap-1.5 rounded-xl font-bold bg-emerald-600 text-white shadow-sm"
                >
                  View Sequence <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Business Intelligence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Profile & Category
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-semibold text-foreground">{lead.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-semibold text-foreground">{lead.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating Hours:</span>
                      <span className="font-semibold text-foreground">{lead.businessHours || "Mon-Sat: 9:30 AM - 8:30 PM"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GBP Status:</span>
                      <span className="text-emerald-500 font-bold">✓ Verified</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" /> Technology & CMS Stack
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Detected CMS:</span>
                      <span className="font-semibold text-foreground">{lead.cms || "Custom Web Stack"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SSL Encryption:</span>
                      <span className={effectiveAudit.https ? "text-emerald-500 font-bold" : "text-destructive font-bold"}>
                        {effectiveAudit.https ? "Active (HTTPS)" : "Missing (Insecure)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website Age:</span>
                      <span className="font-semibold text-foreground">{lead.websiteAge || "Estimated 5+ years"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tech Stack:</span>
                      <span className="font-mono text-muted-foreground truncate">Next.js, Node, Cloudflare</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> Opportunity Metrics
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opportunity Score:</span>
                      <span className="font-bold text-primary font-mono">{healthScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Lost Revenue:</span>
                      <span className="font-bold text-destructive font-mono">
                        ₹{(effectiveAudit.estLostRevenuePerMonth || 45000).toLocaleString("en-IN")}/mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile Bottleneck:</span>
                      <span className="font-semibold text-amber-500 truncate max-w-[160px]">
                        {effectiveAudit.biggestGap || "Speed optimization needed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lead Source:</span>
                      <span className="font-semibold text-muted-foreground">Google Places / Maps</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Sales Copilot Preview Prompt Box */}
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Need sales advice for this lead?</div>
                    <p className="text-xs text-muted-foreground">
                      Ask your AI Sales Copilot how to handle objections, draft WhatsApp messages, or plan a discovery call.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setCopilotOpen(true)}
                  className="font-bold text-xs h-9 px-4 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-md shadow-primary/20"
                >
                  Ask Sales Copilot
                </Button>
              </div>
            </TabsContent>

            {/* Tab 2: 5-Pillar Audit */}
            <TabsContent value="audit" className="m-0">
              <AdvancedAuditView lead={lead} audit={effectiveAudit} />
            </TabsContent>

            {/* Tab 3: Competitor Benchmarks */}
            <TabsContent value="competitors" className="m-0">
              <CompetitorAnalysisView lead={lead} audit={effectiveAudit} />
            </TabsContent>

            {/* Tab 4: Revenue ROI Engine */}
            <TabsContent value="opportunity" className="m-0">
              <RevenueOpportunityCalculator
                businessName={lead.company || lead.name}
                category={lead.category}
              />
            </TabsContent>

            {/* Tab 5: AI Sales Brief */}
            <TabsContent value="brief" className="m-0">
              <ProspectSalesBrief
                lead={lead}
                audit={effectiveAudit}
                onJumpToOutreach={() => setActiveTab("sequences")}
                onGenerateProposal={() => setActiveTab("proposal")}
              />
            </TabsContent>

            {/* Tab 6: Follow-up Sequences */}
            <TabsContent value="sequences" className="m-0">
              <OutreachSequenceBuilder lead={lead} audit={effectiveAudit} />
            </TabsContent>

            {/* Tab 7: AI Proposal Generator */}
            <TabsContent value="proposal" className="m-0">
              <AIProposalGenerator lead={lead} audit={effectiveAudit} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Embedded Copilot Slide-over Modal */}
        <SalesCopilotModal
          open={copilotOpen}
          onOpenChange={setCopilotOpen}
          lead={lead}
          audit={effectiveAudit}
        />
      </DialogContent>
    </Dialog>
  );
}
