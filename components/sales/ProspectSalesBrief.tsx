"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Copy,
  Printer,
  Share2,
  Edit3,
  RefreshCw,
  Building2,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Send,
  Check,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, AuditResult, SalesBrief } from "@/lib/types";
import { generateSalesBrief } from "@/lib/salesBriefEngine";

interface ProspectSalesBriefProps {
  lead: Lead;
  audit: AuditResult;
  onJumpToOutreach?: () => void;
  onGenerateProposal?: () => void;
}

export function ProspectSalesBrief({
  lead,
  audit,
  onJumpToOutreach,
  onGenerateProposal,
}: ProspectSalesBriefProps) {
  const [brief, setBrief] = useState<SalesBrief>(() => generateSalesBrief(lead, audit));
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegenerate = () => {
    const fresh = generateSalesBrief(lead, audit);
    setBrief(fresh);
    toast.success("Sales Brief regenerated with latest signals!");
  };

  const handleCopySummary = () => {
    const text = `📋 PROSPECT INTELLIGENCE BRIEF
Company: ${brief.companyName} (${brief.industry} • ${brief.location})
Website Score: ${brief.websiteScore}/100 [${brief.opportunityLevel} Opportunity]

⚠️ TOP PROBLEMS:
${brief.topProblems.map((p, i) => `${i + 1}. ${p}`).join("\n")}

💡 TOP OPPORTUNITIES:
${brief.topOpportunities.map((o, i) => `${i + 1}. ${o}`).join("\n")}

🎯 RECOMMENDED SERVICES:
${brief.recommendedServices.map((s) => `• ${s}`).join("\n")}

💰 ESTIMATED PROJECT VALUE:
₹${brief.estimatedProjectRange.min.toLocaleString("en-IN")} – ₹${brief.estimatedProjectRange.max.toLocaleString("en-IN")}

🔥 PITCH ANGLE:
${brief.pitchAngle}

👉 NEXT BEST ACTION:
${brief.nextAction}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Sales Brief copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Action Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
              Executive Briefing Sheet
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              Updated {new Date(brief.generatedAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground mt-1">
            Prospect Intelligence Brief: {brief.companyName}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerate}
            className="h-8 text-xs gap-1.5 rounded-xl border-border/80"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopySummary}
            className="h-8 text-xs gap-1.5 rounded-xl border-border/80"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Brief"}
          </Button>

          {onJumpToOutreach && (
            <Button
              size="sm"
              onClick={onJumpToOutreach}
              className="h-8 text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground font-bold"
            >
              <Send className="h-3.5 w-3.5" /> Outreach Pitch
            </Button>
          )}

          {onGenerateProposal && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateProposal}
              className="h-8 text-xs gap-1.5 rounded-xl border-primary/40 text-primary font-bold hover:bg-primary/10"
            >
              <Briefcase className="h-3.5 w-3.5" /> Create Proposal
            </Button>
          )}
        </div>
      </div>

      {/* 1-Page Printable Briefing Sheet */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden print:border-none print:shadow-none">
        <CardHeader className="p-6 pb-4 border-b border-border/60 bg-gradient-to-r from-card via-card to-primary/[0.03]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> 1-Page Salesperson Brief
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                  {brief.industry}
                </span>
              </div>
              <h2 className="text-2xl font-black font-display text-foreground mt-1">
                {brief.companyName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {brief.location} • Google Rating: <strong>{lead.rating || 4.5}★</strong> ({lead.reviewsCount || 40} reviews)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Website Health</div>
                <div className="text-xl font-black font-mono text-foreground">{brief.websiteScore}/100</div>
              </div>
              <Badge
                className={`text-xs px-2.5 py-1 font-bold ${
                  brief.opportunityLevel === "High"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {brief.opportunityLevel} Opportunity
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Section 1: Primary Vulnerabilities vs Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/15 space-y-3">
              <h4 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Top Commercial Vulnerabilities
              </h4>
              <div className="space-y-2 text-xs">
                {brief.topProblems.map((prob, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <span className="font-bold text-destructive">{idx + 1}.</span>
                    <span className="leading-snug">{prob}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-3">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> High-Value Opportunities
              </h4>
              <div className="space-y-2 text-xs">
                {brief.topOpportunities.map((opp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <span className="font-bold text-emerald-500">{idx + 1}.</span>
                    <span className="leading-snug">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Recommended Solution & Estimated Project Value */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" /> Recommended Service Package
              </h4>
              <div className="font-semibold text-sm text-foreground">
                {brief.suggestedProject}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {brief.recommendedServices.map((service, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-primary font-bold">✓</span>
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 flex flex-col justify-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Estimated Project Range
              </div>
              <div className="text-2xl font-black font-mono text-primary">
                ₹{brief.estimatedProjectRange.min.toLocaleString("en-IN")} – ₹{brief.estimatedProjectRange.max.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Plus optional ₹5k–₹15k/mo recurring SEO / maintenance retainer.
              </p>
            </div>
          </div>

          {/* Section 3: Pitch Strategy & Next Best Action */}
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-primary" /> Suggested Pitch Angle (Consultative Hook)
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "{brief.pitchAngle}"
              </p>
            </div>

            {/* Persistent Next Best Action Alert Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-primary/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Persistent Next Best Action
                </div>
                <div className="text-sm font-bold text-foreground">
                  {brief.nextAction}
                </div>
              </div>

              {onJumpToOutreach && (
                <Button
                  size="sm"
                  onClick={onJumpToOutreach}
                  className="shrink-0 gap-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                >
                  Execute Next Action <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
