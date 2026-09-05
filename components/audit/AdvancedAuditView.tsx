"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gauge,
  Search,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Phone,
  MessageCircle,
} from "lucide-react";
import type { Lead, AuditResult, AuditIssue } from "@/lib/types";

interface AdvancedAuditViewProps {
  lead: Lead;
  audit: AuditResult;
  agencyBranding?: string | null;
  onOpenPdfReport?: () => void;
}

export function AdvancedAuditView({
  lead,
  audit,
  agencyBranding,
  onOpenPdfReport,
}: AdvancedAuditViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "warning" | "optimal">("all");
  const [selectedPillar, setSelectedPillar] = useState<string>("all");

  const overallScore = audit.overallScore ?? (audit.hasWebsite ? audit.pageSpeedScore : 24);
  const perfScore = audit.performanceScore ?? (audit.hasWebsite ? audit.pageSpeedScore : 0);
  const seoScore = audit.seoScore ?? (audit.hasWebsite ? 54 : 15);
  const techScore = audit.technicalScore ?? (audit.https ? 75 : 35);
  const mobScore = audit.mobileScore ?? (audit.mobileFriendly ? 65 : 20);
  const convScore = audit.conversionScore ?? (audit.hasWebsite ? 42 : 18);
  const contentScore = audit.contentScore ?? (audit.hasWebsite ? 60 : 15);

  const issues: AuditIssue[] = audit.issues || [];
  const filteredIssues = issues.filter((issue) => {
    const matchesSeverity = activeFilter === "all" || issue.severity === activeFilter;
    const matchesPillar = selectedPillar === "all" || issue.pillar === selectedPillar;
    return matchesSeverity && matchesPillar;
  });

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const optimalCount = issues.filter((i) => i.severity === "optimal").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive Score Card */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/[0.03] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                5-Pillar Comprehensive Audit
              </span>
              {agencyBranding && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Branded by {agencyBranding}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-foreground tracking-tight">
              {lead.name}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{lead.category}</span> • <span>{lead.city}</span> •{" "}
              {audit.hasWebsite ? (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-mono"
                >
                  {lead.website?.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-destructive font-semibold">No Website Found</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/80">
              <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center font-mono text-2xl font-black ${
                  overallScore >= 70
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : overallScore >= 45
                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    : "bg-destructive/15 text-destructive border border-destructive/30"
                }`}
              >
                {overallScore}
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Overall Score
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {overallScore >= 70 ? "Good Foundation" : overallScore >= 45 ? "Moderate Gap" : "Critical Opportunity"}
                </div>
              </div>
            </div>

            {onOpenPdfReport && (
              <Button
                onClick={onOpenPdfReport}
                className="gap-1.5 h-11 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Printer className="h-4 w-4" /> Export Audit PDF
              </Button>
            )}
          </div>
        </div>

        {/* 6 Sub-Pillar Score Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-border/60">
          <div className="p-3 rounded-xl bg-card border border-border/60 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Performance</div>
            <div className="text-xl font-black font-mono text-foreground mt-0.5">{perfScore}/100</div>
            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${perfScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Tech SEO</div>
            <div className="text-xl font-black font-mono text-foreground mt-0.5">{seoScore}/100</div>
            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${seoScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Technical</div>
            <div className="text-xl font-black font-mono text-foreground mt-0.5">{techScore}/100</div>
            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${techScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Mobile UX</div>
            <div className="text-xl font-black font-mono text-foreground mt-0.5">{mobScore}/100</div>
            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mobScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Conversion</div>
            <div className="text-xl font-black font-mono text-foreground mt-0.5">{convScore}/100</div>
            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${convScore}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/60 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Content</div>
            <div className="text-xl font-black font-mono text-foreground mt-0.5">{contentScore}/100</div>
            <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${contentScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Core Web Vitals & Conversion Checklist Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals */}
        <Card className="rounded-2xl border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" /> Google Core Web Vitals (CWV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">LCP</div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  {audit.coreWebVitals?.lcp || "4.6s"}
                </div>
                <div className="text-[9px] text-muted-foreground">Largest Contentful</div>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">CLS</div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  {audit.coreWebVitals?.cls || "0.22"}
                </div>
                <div className="text-[9px] text-muted-foreground">Layout Shift</div>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">TTFB</div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  {audit.coreWebVitals?.ttfb || "1.2s"}
                </div>
                <div className="text-[9px] text-muted-foreground">Time to First Byte</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground p-3 rounded-xl bg-muted/20 border border-border/60 leading-relaxed">
              <strong>Bottleneck Insight:</strong> {audit.biggestGap}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Signals Detector */}
        <Card className="rounded-2xl border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Conversion Elements Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp CTA
                </span>
                {audit.conversionSignals?.hasWhatsAppCta ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    MISSING
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-blue-500" /> Click-to-Call
                </span>
                {lead.phone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    MISSING
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-purple-500" /> Online Booking
                </span>
                {audit.conversionSignals?.hasBookingSystem ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    MISSING
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> SSL / HTTPS
                </span>
                {audit.https ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    UNSECURED
                  </span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium flex items-center justify-between">
              <span>Estimated monthly inquiry leakage:</span>
              <span className="font-mono font-bold text-sm">
                ₹{(audit.estLostRevenuePerMonth || 45000).toLocaleString("en-IN")}/mo
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues & Opportunities Detail List */}
      <Card className="rounded-2xl border-border/80 bg-card">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Audit Findings & Recommended Fixes
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Identified vulnerabilities with severity and client-ready explanations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 text-xs">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  activeFilter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                All ({issues.length})
              </button>
              <button
                onClick={() => setActiveFilter("critical")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  activeFilter === "critical" ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setActiveFilter("warning")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  activeFilter === "warning" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground"
                }`}
              >
                Warning ({warningCount})
              </button>
              <button
                onClick={() => setActiveFilter("optimal")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  activeFilter === "optimal" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground"
                }`}
              >
                Optimal ({optimalCount})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 divide-y divide-border/60">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No issues matching this filter.
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        issue.severity === "critical"
                          ? "bg-destructive/15 text-destructive border-destructive/30"
                          : issue.severity === "warning"
                          ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-0.5 rounded bg-muted">
                      {issue.pillar}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">{issue.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Why it matters:</strong> {issue.impact}
                </p>

                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-primary font-medium flex items-start gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Recommended Fix:</strong> {issue.recommendation}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
