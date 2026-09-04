"use client";

import { useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Copy, CheckCircle2, AlertTriangle, TrendingDown, Sparkles, Building2, Star } from "lucide-react";
import type { RankedLead } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthContext";
import { getPlanConfig } from "@/lib/plans";
import { toast } from "sonner";

export function AuditReportModal({
  lead,
  open,
  onOpenChange,
}: {
  lead: RankedLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const planConfig = getPlanConfig(user?.plan);

  if (!lead) return null;
  const currentLead = lead;

  const { audit } = currentLead;
  const lostRev = (audit.estLostRevenuePerMonth || 50000).toLocaleString("en-IN");
  const annualLost = ((audit.estLostRevenuePerMonth || 50000) * 12).toLocaleString("en-IN");

  const agencyBranding = planConfig.features.customAgencyBranding && user?.agencyName ? user.agencyName : null;

  function handlePrint() {
    window.print();
  }

  function copySummary() {
    if (!currentLead) return;
    const brandingLine = agencyBranding ? `\n\n💼 Audit prepared & verified by: ${agencyBranding}` : "";
    const text = `📊 DIGITAL AUDIT REPORT FOR: ${currentLead.name} (${currentLead.city})
⭐️ Google Rating: ${currentLead.rating}★ (${currentLead.reviewsCount || 0} reviews)
🌐 Website Status: ${audit.hasWebsite ? `Active (${audit.pageSpeedScore}/100 PageSpeed)` : "NO ACTIVE WEBSITE"}
⚠️ Critical Digital Gap: ${audit.biggestGap}
💰 Estimated Lost Revenue: ₹${lostRev}/month (~₹${annualLost}/year)
💡 Recommended Action: Deploy modern mobile website with instant WhatsApp booking & local SEO schema.${brandingLine}`;
    navigator.clipboard.writeText(text);
    toast.success("Audit summary copied for WhatsApp / Email!");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 border-border bg-background shadow-2xl rounded-2xl">
        {/* Top Action Bar */}
        <div className="bg-muted/60 p-4 border-b border-border flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">Client-Ready Teaser Report</span>
              {agencyBranding && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> White-Label: {agencyBranding}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg leading-tight">{lead.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={copySummary}>
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Summary
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-primary text-primary-foreground">
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div ref={reportRef} className="p-6 md:p-8 space-y-6 text-foreground bg-background print:p-0 print:m-0">
          {/* Header Banner */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                <Sparkles className="h-3 w-3" /> Growth & Conversion Audit
                {agencyBranding && (
                  <span className="ml-1 pl-1.5 border-l border-primary/40 font-bold">
                    by {agencyBranding}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{lead.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span>{lead.category}</span> • <span>{lead.address || lead.city}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-display text-lg font-bold">{lead.rating}★</span>
                <span className="text-xs text-muted-foreground">({lead.reviewsCount} reviews)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Audit Date: {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>

          {/* Revenue Loss Hero Card */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-destructive text-sm font-semibold uppercase tracking-wider">
                <TrendingDown className="h-4 w-4" /> Estimated Revenue Left on Table
              </div>
              <div className="font-display text-3xl md:text-4xl font-extrabold text-destructive">
                ₹{lostRev} <span className="text-base font-normal text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Incurred from missing out on Google search inquiries, slow mobile loading, and lack of 1-click appointment booking.
              </p>
            </div>
            <div className="bg-background/80 border border-border rounded-lg p-3 text-center min-w-[140px]">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Annualized Loss</div>
              <div className="font-display text-xl font-bold text-destructive">~₹{annualLost}</div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border p-3.5 bg-card">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">PageSpeed Score</div>
              <div className="font-display text-2xl font-bold mt-1 text-amber-500">{audit.pageSpeedScore}/100</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Google Lighthouse</div>
            </div>
            <div className="rounded-lg border border-border p-3.5 bg-card">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Mobile Friendly</div>
              <div className="font-display text-2xl font-bold mt-1 text-destructive">
                {audit.mobileFriendly ? "Pass" : "Failed"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Mobile viewport test</div>
            </div>
            <div className="rounded-lg border border-border p-3.5 bg-card">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">SSL Certificate</div>
              <div className="font-display text-2xl font-bold mt-1 text-emerald-500">
                {audit.https ? "Active" : "Insecure"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">HTTPS security</div>
            </div>
            <div className="rounded-lg border border-border p-3.5 bg-card">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Local SEO Schema</div>
              <div className="font-display text-2xl font-bold mt-1 text-destructive">
                {audit.hasSchema ? "Detected" : "Missing"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Google Maps booster</div>
            </div>
          </div>

          {/* Biggest Gap Highlight */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 md:p-5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm mb-1.5">
              <AlertTriangle className="h-4 w-4" /> Single Biggest Growth Opportunity
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {audit.biggestGap}
            </p>
          </div>

          {/* Identified Gaps Checklist */}
          <div>
            <h4 className="font-display text-base font-semibold mb-3">Identified Friction Points & Gaps:</h4>
            <div className="grid md:grid-cols-2 gap-2.5">
              {audit.gaps.map((gap, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs md:text-sm p-2.5 rounded-lg border border-border/80 bg-muted/30">
                  <span className="text-destructive font-bold">✕</span>
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modernization Roadmap */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h4 className="font-display text-base font-semibold text-primary mb-3">Recommended 24-Hour Transformation:</h4>
            <ul className="space-y-2 text-xs md:text-sm text-foreground/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Instant WhatsApp Booking</strong>: Direct 1-click consultation flow for patient inquiries.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Lighthouse 95+ Mobile Speed</strong>: Sub-second load times eliminating visitor bounce rates.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Social Proof Showcase</strong>: Verified carousel highlighting your {lead.rating}★ rating and {lead.reviewsCount}+ patient reviews.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Local SEO Schema</strong>: Structured data to rank #1 on Google searches for {lead.category} in {lead.city}.</span>
              </li>
            </ul>

            {agencyBranding && (
              <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between text-xs text-muted-foreground">
                <span>Executive Strategy by <strong>{agencyBranding}</strong></span>
                <span className="text-[11px] font-mono">Confidential Client Audit</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
