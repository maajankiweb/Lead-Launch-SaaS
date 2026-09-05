"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, AuditResult, CompetitorItem, CompetitiveReport } from "@/lib/types";
import { generateCompetitorReport } from "@/lib/competitorEngine";

interface CompetitorAnalysisViewProps {
  lead: Lead;
  audit: AuditResult;
  onGenerateOutreach?: () => void;
}

export function CompetitorAnalysisView({
  lead,
  audit,
  onGenerateOutreach,
}: CompetitorAnalysisViewProps) {
  const [report, setReport] = useState<CompetitiveReport>(() => generateCompetitorReport(lead, audit));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompUrl, setNewCompUrl] = useState("");
  const [newCompRating, setNewCompRating] = useState("4.6");
  const [newCompReviews, setNewCompReviews] = useState("65");

  const handleAddCompetitor = () => {
    if (!newCompName.trim() || !newCompUrl.trim()) {
      toast.error("Please provide a name and website URL");
      return;
    }

    const newComp: CompetitorItem = {
      id: "comp-" + Date.now(),
      name: newCompName.trim(),
      website: newCompUrl.trim().startsWith("http") ? newCompUrl.trim() : `https://${newCompUrl.trim()}`,
      rating: parseFloat(newCompRating) || 4.5,
      reviewsCount: parseInt(newCompReviews) || 50,
      pageSpeedScore: 78,
      mobileFriendly: true,
      hasWhatsApp: true,
      hasBooking: true,
      seoScore: 80,
      advantages: ["Active booking funnel", "Fast mobile loading"],
      gaps: ["No price list"],
    };

    const updatedCompetitors = [...report.competitors, newComp].slice(0, 5);
    const updatedReport = generateCompetitorReport(lead, audit, updatedCompetitors);
    setReport(updatedReport);

    setNewCompName("");
    setNewCompUrl("");
    setShowAddModal(false);
    toast.success(`Added ${newComp.name} to competitor analysis!`);
  };

  const handleRemoveCompetitor = (id: string) => {
    const updated = report.competitors.filter((c) => c.id !== id);
    setReport(generateCompetitorReport(lead, audit, updated));
    toast.success("Competitor removed");
  };

  const copyCompetitiveSummary = () => {
    const text = `📊 COMPETITIVE BENCHMARK REPORT
Target Business: ${lead.name} (${lead.rating || 4.5}★ • ${lead.reviewsCount || 40} reviews)

SUMMARY:
${report.summary}

KEY COMPETITOR ADVANTAGES:
${report.competitorStrengths.map((s) => `• ${s}`).join("\n")}

CRITICAL GAPS IN ${lead.name.toUpperCase()}'S DIGITAL PRESENCE:
${report.conversionGaps.map((g) => `• ${g}`).join("\n")}

RECOMMENDED STRATEGY:
${report.recommendedImprovements.map((r) => `• ${r}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    toast.success("Competitive Opportunity Report copied!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                Market Benchmarking
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {report.competitors.length} Local Competitors Analyzed
              </span>
            </div>
            <h2 className="text-2xl font-black font-display text-foreground tracking-tight">
              Competitive Opportunity Report
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparing {lead.name} against local market leaders in {lead.city || "the area"}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={copyCompetitiveSummary}
              className="h-9 text-xs gap-1.5 rounded-xl border-border/80"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Report
            </Button>

            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              disabled={report.competitors.length >= 5}
              className="h-9 text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground font-bold"
            >
              <Plus className="h-3.5 w-3.5" /> Add Competitor
            </Button>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs leading-relaxed space-y-1.5">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Strategic Market Assessment
          </div>
          <p className="text-muted-foreground leading-relaxed">{report.summary}</p>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Side-by-Side Metric Matrix
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="w-56 font-bold text-xs text-foreground">Business</TableHead>
                <TableHead className="text-center font-bold text-xs text-foreground">Rating & Reviews</TableHead>
                <TableHead className="text-center font-bold text-xs text-foreground">PageSpeed</TableHead>
                <TableHead className="text-center font-bold text-xs text-foreground">Mobile UX</TableHead>
                <TableHead className="text-center font-bold text-xs text-foreground">WhatsApp CTA</TableHead>
                <TableHead className="text-center font-bold text-xs text-foreground">Online Booking</TableHead>
                <TableHead className="text-center font-bold text-xs text-foreground">SEO Score</TableHead>
                <TableHead className="text-right font-bold text-xs text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {/* Target Prospect Row (Pinned on top with distinct highlight) */}
              <TableRow className="bg-primary/5 border-b-2 border-primary/30">
                <TableCell className="font-bold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-black">
                      YOU
                    </span>
                    <span className="truncate">{lead.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{lead.website || "No Website"}</div>
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {lead.rating || 4.5}★ ({lead.reviewsCount || 40})
                </TableCell>
                <TableCell className="text-center font-mono font-bold">
                  {audit.pageSpeedScore}/100
                </TableCell>
                <TableCell className="text-center">
                  {audit.mobileFriendly ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive inline" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {audit.conversionSignals?.hasWhatsAppCta ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                  ) : (
                    <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                      NO
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {audit.conversionSignals?.hasBookingSystem ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                  ) : (
                    <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                      NO
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono font-bold">
                  {audit.seoScore ?? 50}/100
                </TableCell>
                <TableCell className="text-right text-muted-foreground italic">Target Prospect</TableCell>
              </TableRow>

              {/* Competitors Rows */}
              {report.competitors.map((comp) => (
                <TableRow key={comp.id} className="hover:bg-muted/40 border-border/60">
                  <TableCell className="font-semibold text-foreground">
                    <div className="truncate">{comp.name}</div>
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      {comp.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    {comp.rating}★ ({comp.reviewsCount})
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-emerald-500">
                    {comp.pageSpeedScore}/100
                  </TableCell>
                  <TableCell className="text-center">
                    {comp.mobileFriendly ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {comp.hasWhatsApp ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        NO
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {comp.hasBooking ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        NO
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold">
                    {comp.seoScore}/100
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleRemoveCompetitor(comp.id)}
                      className="text-muted-foreground hover:text-destructive transition p-1"
                      title="Remove Competitor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Strategic Takeaways Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/15 space-y-3">
          <h4 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Critical Conversion Gaps vs. Rivals
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            {report.conversionGaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span className="leading-snug">{gap}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-3">
          <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" /> Recommended Offensive Positioning
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            {report.recommendedImprovements.map((rec, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span className="leading-snug">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Competitor Inline Modal */}
      {showAddModal && (
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xl space-y-4 max-w-lg mx-auto animate-in fade-in-50">
          <div className="font-bold text-sm text-foreground flex items-center justify-between">
            <span>Add Competitor URL for Benchmarking</span>
            <button onClick={() => setShowAddModal(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Competitor Name (e.g. City Dental)"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="text-xs h-9"
            />
            <Input
              placeholder="Website URL (e.g. citydental.in)"
              value={newCompUrl}
              onChange={(e) => setNewCompUrl(e.target.value)}
              className="text-xs h-9"
            />
            <Input
              placeholder="Rating (e.g. 4.7)"
              value={newCompRating}
              onChange={(e) => setNewCompRating(e.target.value)}
              className="text-xs h-9"
            />
            <Input
              placeholder="Reviews count (e.g. 85)"
              value={newCompReviews}
              onChange={(e) => setNewCompReviews(e.target.value)}
              className="text-xs h-9"
            />
          </div>
          <Button onClick={handleAddCompetitor} className="w-full text-xs h-9 font-bold bg-primary text-primary-foreground">
            Benchmark Competitor
          </Button>
        </div>
      )}
    </div>
  );
}
