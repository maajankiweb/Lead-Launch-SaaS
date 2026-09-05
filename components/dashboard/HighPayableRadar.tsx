"use client";

import React, { useState, useMemo } from "react";
import {
  Flame,
  TrendingUp,
  ShieldAlert,
  Phone,
  MessageCircle,
  Mail,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Building2,
  Send,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";

interface HighPayableRadarProps {
  leads: Lead[];
  audits: Record<string, AuditResult>;
  ranked: RankedLead[];
  onSelectLeadForPitch: (leadId: string) => void;
  onSelectLeadForAudit?: (leadId: string) => void;
  onOpenScraper: () => void;
}

export function HighPayableRadar({
  leads,
  audits,
  ranked,
  onSelectLeadForPitch,
  onOpenScraper,
}: HighPayableRadarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Filter & rank leads based on high-payable criteria
  const highPayableLeads = useMemo(() => {
    return leads
      .map((lead) => {
        const audit = audits[lead.id];
        const rank = ranked.find((r) => r.id === lead.id);

        // Calculate potential lost revenue
        const lostRevenue =
          audit?.estLostRevenuePerMonth ||
          (lead.reviewsCount && lead.reviewsCount > 30 ? 35000 : 20000);

        // Calculate priority score (0 - 100)
        let priority = 50;
        if (!lead.website) priority += 25; // Biggest need!
        if (audit && !audit.hasWebsite) priority += 25;
        if (audit && audit.pageSpeedScore < 50) priority += 15;
        if (lead.reviewsCount && lead.reviewsCount > 40) priority += 15;
        if (lead.rating && lead.rating >= 4.2) priority += 10;
        if (lead.phone || lead.whatsapp) priority += 10;
        if (rank?.score) priority = Math.max(priority, rank.score);

        return {
          lead,
          audit,
          rank,
          lostRevenue,
          priority: Math.min(priority, 99),
          isHighTicket: lostRevenue >= 25000 || priority >= 75 || !lead.website,
        };
      })
      .sort((a, b) => b.lostRevenue - a.lostRevenue || b.priority - a.priority);
  }, [leads, audits, ranked]);

  // Distinct categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    leads.forEach((l) => {
      if (l.category) cats.add(l.category);
    });
    return Array.from(cats);
  }, [leads]);

  // Filtered list
  const filtered = useMemo(() => {
    return highPayableLeads.filter((item) => {
      const matchesSearch =
        item.lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lead.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lead.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = filterCategory === "ALL" || item.lead.category === filterCategory;

      return matchesSearch && matchesCat;
    });
  }, [highPayableLeads, searchTerm, filterCategory]);

  const totalLeakage = useMemo(() => {
    return highPayableLeads.reduce((acc, curr) => acc + curr.lostRevenue, 0);
  }, [highPayableLeads]);

  if (leads.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mb-4">
          <Flame className="h-8 w-8" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">
          No Leads in Radar Yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          Run a quick Google Maps scrape in Phase 1 to automatically detect high-paying local businesses losing revenue due to slow or missing websites.
        </p>
        <Button onClick={onOpenScraper} className="gap-2 shadow-lg shadow-primary/20">
          <Search className="h-4 w-4" /> Start Lead Scraping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-background p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-wider mb-2">
              <Flame className="h-3.5 w-3.5 fill-orange-500" /> High-Ticket Client Radar
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              High-Payable Leads Spotlight
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              These businesses have high review volume, active customer cashflow, but are severely handicapped by a missing or slow website. They have the highest willingness to pay for a redesign.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card/80 backdrop-blur-md p-4 rounded-2xl border border-border/80 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                Total Revenue Leakage
              </div>
              <div className="font-mono text-2xl font-black text-foreground">
                ₹{totalLeakage.toLocaleString("en-IN")}<span className="text-xs text-muted-foreground font-normal">/mo</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border/80" />
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">
                Hot Prospects
              </div>
              <div className="font-mono text-2xl font-black text-orange-500">
                {highPayableLeads.filter((l) => l.isHighTicket).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search high-value business, city, or niche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/80 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filterCategory === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory("ALL")}
            className="text-xs h-9 rounded-xl font-semibold"
          >
            All Categories ({highPayableLeads.length})
          </Button>
          {categories.slice(0, 4).map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat)}
              className="text-xs h-9 rounded-xl font-semibold"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Leads Spotlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ lead, audit, rank, lostRevenue, priority, isHighTicket }) => {
          const hasPhone = Boolean(lead.phone || lead.whatsapp);
          const hasWebsite = Boolean(lead.website);

          return (
            <div
              key={lead.id}
              className={`rounded-2xl border p-5 bg-card/70 backdrop-blur-md flex flex-col justify-between transition-all hover:shadow-xl ${
                isHighTicket
                  ? "border-orange-500/40 hover:border-orange-500/80 bg-gradient-to-b from-card to-orange-500/[0.03]"
                  : "border-border/80 hover:border-primary/50"
              }`}
            >
              <div>
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                    {lead.category || "Local Business"}
                  </span>
                  {isHighTicket ? (
                    <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30 text-[10px] font-extrabold flex items-center gap-1">
                      <Flame className="h-3 w-3 fill-orange-500" /> ₹{(lostRevenue / 1000).toFixed(0)}k/mo Leakage
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Score: {priority}/100
                    </Badge>
                  )}
                </div>

                {/* Business Info */}
                <h4 className="font-bold text-base text-foreground leading-snug truncate" title={lead.name}>
                  {lead.name}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{lead.city || "Local City"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3 w-3 fill-amber-500" /> {lead.rating || 4.0} ({lead.reviewsCount || 10})
                  </span>
                </div>

                {/* The Urgent Gap / Reason to Buy */}
                <div className="mt-3 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    Why They Will Buy Now:
                  </div>
                  <p className="text-xs text-foreground font-medium line-clamp-2">
                    {!hasWebsite
                      ? "❌ Zero website present. Completely invisible to 80% of local smartphone searchers."
                      : audit?.pageSpeedScore && audit.pageSpeedScore < 50
                      ? `⚠️ Extremely slow site (${audit.pageSpeedScore}/100 speed). Loses ~35% of visitors before page loads.`
                      : audit?.biggestGap || "Needs modern mobile-first conversion design to capture appointments."}
                  </p>
                </div>

                {/* Contact availability */}
                <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                  <span className={`flex items-center gap-1 font-semibold ${lead.phone ? "text-emerald-500" : "text-muted-foreground"}`}>
                    <Phone className="h-3 w-3" /> {lead.phone ? "Phone verified" : "No phone"}
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${lead.email ? "text-blue-500" : "text-muted-foreground"}`}>
                    <Mail className="h-3 w-3" /> {lead.email ? "Email available" : "Direct call only"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <Button
                  onClick={() => onSelectLeadForPitch(lead.id)}
                  size="sm"
                  className="flex-1 h-9 text-xs font-bold gap-1.5 shadow-md bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
                >
                  <Send className="h-3.5 w-3.5" /> Generate Pitch
                </Button>

                {lead.phone && (
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hi ${lead.name}, noticed you have ${lead.reviewsCount || 30}+ top reviews in ${lead.city}! We generated a 60-second live website mockup to help you capture 2x more local clients.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition shrink-0"
                    title="Send WhatsApp Direct Hook"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
