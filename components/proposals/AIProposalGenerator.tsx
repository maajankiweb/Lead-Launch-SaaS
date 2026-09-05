"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Copy,
  Check,
  Send,
  Sparkles,
  Calendar,
  Building2,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, AuditResult, ProposalDocument, ProposalTemplate } from "@/lib/types";
import { generateProposalDocument } from "@/lib/proposalEngine";

const TEMPLATE_OPTIONS: Array<{ id: ProposalTemplate; label: string; desc: string }> = [
  { id: "website_redesign", label: "Website Redesign & Mobile Funnel", desc: "Next.js speed & WhatsApp booking" },
  { id: "local_seo", label: "Google 3-Pack Local SEO", desc: "Maps ranking & citation domination" },
  { id: "google_ads", label: "Google Ads & Paid Lead Gen", desc: "High-intent patient acquisition" },
  { id: "website_seo_bundle", label: "Website + Local SEO Bundle", desc: "Most popular agency combination" },
  { id: "full_digital_growth", label: "Full Digital Growth OS", desc: "Comprehensive agency retainer" },
];

interface AIProposalGeneratorProps {
  lead: Lead;
  audit: AuditResult;
  agencyName?: string | null;
  onProposalCreated?: (prop: ProposalDocument) => void;
}

export function AIProposalGenerator({
  lead,
  audit,
  agencyName,
  onProposalCreated,
}: AIProposalGeneratorProps) {
  const [template, setTemplate] = useState<ProposalTemplate>("website_redesign");
  const [proposal, setProposal] = useState<ProposalDocument>(() =>
    generateProposalDocument(lead, audit, "website_redesign")
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleTemplateChange = (newTemp: ProposalTemplate) => {
    setTemplate(newTemp);
    const updated = generateProposalDocument(lead, audit, newTemp);
    setProposal(updated);
    toast.info(`Switched template to "${newTemp.replace(/_/g, " ").toUpperCase()}"`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const link = `https://lead-launch.agency/p/${proposal.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Shareable Client Proposal link copied!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                Closing System
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                AI Proposal Builder & Deliverables Engine
              </span>
            </div>
            <h2 className="text-2xl font-black font-display text-foreground tracking-tight">
              Client Proposal Generator
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate structured, high-ticket proposals with transparent deliverables, timeline, and ROI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyShareLink}
              className="h-9 text-xs gap-1.5 rounded-xl border-border/80"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? "Link Copied" : "Share Link"}
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="h-9 text-xs gap-1.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20"
            >
              <Printer className="h-3.5 w-3.5" /> Export PDF / Print
            </Button>
          </div>
        </div>

        {/* 5 Service Template Switcher Chips */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-border/60 overflow-x-auto scrollbar-none">
          {TEMPLATE_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTemplateChange(item.id)}
              className={`p-2.5 px-3.5 rounded-xl border text-left shrink-0 transition ${
                template === item.id
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-md shadow-primary/20"
                  : "bg-card text-muted-foreground border-border/70 hover:bg-muted/60"
              }`}
            >
              <div className="text-xs">{item.label}</div>
              <div
                className={`text-[10px] ${
                  template === item.id ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Printable / Viewable Proposal Document */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-2xl overflow-hidden print:border-none print:shadow-none print:m-0">
        {/* Document Header */}
        <div className="p-8 md:p-12 border-b border-border/60 bg-gradient-to-b from-muted/30 to-transparent space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">
                {agencyName ? `${agencyName} • Client Proposal` : "Strategic Digital Growth Proposal"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-foreground leading-tight">
                {proposal.title}
              </h1>
              <p className="text-xs text-muted-foreground mt-2">
                Prepared for: <strong className="text-foreground">{proposal.clientName}</strong> ({proposal.company})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 text-right space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Investment Overview</div>
              <div className="text-2xl font-black font-mono text-primary">
                ₹{proposal.setupInvestment.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                + ₹{proposal.monthlyRetainer.toLocaleString("en-IN")}/mo Retainer
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Estimated Timeline: {proposal.timeline}</div>
            </div>
          </div>
        </div>

        {/* Document Body */}
        <CardContent className="p-8 md:p-12 space-y-8 text-xs text-foreground leading-relaxed">
          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> 1. Executive Summary & Market Context
            </h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              {proposal.executiveSummary}
            </p>
          </div>

          {/* Section 2: Problem Statement */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> 2. Current Digital Bottlenecks Identified
            </h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              {proposal.problemStatement}
            </p>
          </div>

          {/* Section 3: Proposed Solution & Scope */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> 3. Proposed Strategic Solution & Deliverables
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {proposal.proposedSolution}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {proposal.deliverables.map((del, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-foreground">{del}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Timeline & Investment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" /> Implementation Timeline
              </h4>
              <div className="text-lg font-bold font-mono text-foreground">{proposal.timeline}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Staged review process: Architecture review → Design approval → Development → Staging test → Live DNS cutover.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" /> Projected Financial ROI
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {proposal.roiProjection}
              </p>
            </div>
          </div>

          {/* Section 5: Terms & Agreement */}
          <div className="p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Terms & Conditions
            </h4>
            <div className="whitespace-pre-line text-xs text-muted-foreground leading-relaxed font-mono">
              {proposal.terms}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
