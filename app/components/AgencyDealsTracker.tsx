"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Briefcase,
  IndianRupee,
  Phone,
  MessageCircle,
  TrendingUp,
  Trash2,
  Download,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  Check,
  Building2,
  DollarSign,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import type { RankedLead } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthContext";
import { getPlanConfig } from "@/lib/plans";

export type DealStage = "prospect" | "demo_built" | "pitch_sent" | "call_booked" | "closed_won" | "lost";

export interface DealItem {
  id: string;
  businessName: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  rating?: number;
  reviewsCount?: number;
  stage: DealStage;
  setupFee: number;
  monthlyRetainer: number;
  notes?: string;
  updatedAt: string;
}

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; dotColor: string }> = {
  prospect: { label: "Prospect", color: "bg-muted/80 text-muted-foreground border-border", dotColor: "bg-muted-foreground" },
  demo_built: { label: "Demo Built", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25", dotColor: "bg-blue-500" },
  pitch_sent: { label: "Pitch Sent", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25", dotColor: "bg-purple-500" },
  call_booked: { label: "Call Booked", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25", dotColor: "bg-amber-500" },
  closed_won: { label: "Closed Won 🎉", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold", dotColor: "bg-emerald-500" },
  lost: { label: "Not Interested", color: "bg-destructive/10 text-destructive border-destructive/25", dotColor: "bg-destructive" },
};

export function AgencyDealsTracker({
  open,
  onOpenChange,
  currentLeads = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLeads?: RankedLead[];
}) {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customFee, setCustomFee] = useState("25000");
  const [customRetainer, setCustomRetainer] = useState("2000");

  const { user } = useAuth();
  const planConfig = getPlanConfig(user?.plan);

  // Load from database / local storage
  useEffect(() => {
    if (open) {
      fetch("/api/deals")
        .then((r) => r.json())
        .then((d) => {
          if (d.deals && Array.isArray(d.deals) && d.deals.length > 0) {
            const mapped: DealItem[] = d.deals.map((deal: any) => ({
              id: deal.id,
              businessName: deal.company || deal.clientName,
              city: deal.notes?.includes("City:") ? deal.notes.split("City:")[1]?.split("\n")[0]?.trim() : "India",
              phone: deal.leadId || "",
              stage: (deal.stage as DealStage) || "prospect",
              setupFee: deal.value || 25000,
              monthlyRetainer: 2000,
              notes: deal.notes || "",
              updatedAt: deal.updatedAt || new Date().toISOString(),
            }));
            setDeals(mapped);
          } else {
            const saved = localStorage.getItem("lead_to_launch_deals");
            if (saved) setDeals(JSON.parse(saved));
          }
        })
        .catch(() => {
          const saved = localStorage.getItem("lead_to_launch_deals");
          if (saved) setDeals(JSON.parse(saved));
        });
    }
  }, [open]);

  function saveDeals(updated: DealItem[]) {
    setDeals(updated);
    try {
      localStorage.setItem("lead_to_launch_deals", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  function importCurrentRanked() {
    if (!currentLeads || currentLeads.length === 0) {
      toast.info("No ranked leads available in current session to import.");
      return;
    }

    if (deals.length >= planConfig.limits.maxCrmDeals) {
      toast.error(
        `${planConfig.name} is limited to ${planConfig.limits.maxCrmDeals} CRM deals. Upgrade to Freelancer Pro or Agency Scale for unlimited CRM pipelines!`
      );
      return;
    }

    const existingIds = new Set(deals.map((d) => d.id));
    const availableSlots = planConfig.limits.maxCrmDeals - deals.length;

    const newItems: DealItem[] = currentLeads
      .filter((l) => !existingIds.has(l.id))
      .slice(0, availableSlots)
      .map((l) => ({
        id: l.id,
        businessName: l.name,
        city: l.city,
        phone: l.phone,
        whatsapp: l.whatsapp,
        rating: l.rating,
        reviewsCount: l.reviewsCount,
        stage: "demo_built",
        setupFee: 25000,
        monthlyRetainer: 2000,
        notes: `Est. lost: ₹${l.audit.estLostRevenuePerMonth.toLocaleString("en-IN")}/mo`,
        updatedAt: new Date().toISOString(),
      }));

    if (newItems.length === 0) {
      toast.info("All current leads are already in your CRM!");
      return;
    }

    const updated = [...newItems, ...deals];
    saveDeals(updated);
    toast.success(`Imported ${newItems.length} leads into Deals CRM!`);
  }

  function updateDeal(id: string, partial: Partial<DealItem>) {
    const updated = deals.map((d) => (d.id === id ? { ...d, ...partial, updatedAt: new Date().toISOString() } : d));
    saveDeals(updated);
  }

  function deleteDeal(id: string) {
    const updated = deals.filter((d) => d.id !== id);
    saveDeals(updated);
    toast.success("Deal removed from pipeline");
  }

  function handleAddCustomDeal() {
    if (!customName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    if (deals.length >= planConfig.limits.maxCrmDeals) {
      toast.error(
        `${planConfig.name} is limited to ${planConfig.limits.maxCrmDeals} CRM deals. Upgrade to Freelancer Pro or Agency Scale!`
      );
      return;
    }

    const newDeal: DealItem = {
      id: "deal-" + Date.now(),
      businessName: customName.trim(),
      city: customCity.trim() || "India",
      phone: customPhone.trim(),
      whatsapp: customPhone.trim(),
      stage: "pitch_sent",
      setupFee: Number(customFee) || 25000,
      monthlyRetainer: Number(customRetainer) || 2000,
      notes: "Direct manual entry",
      updatedAt: new Date().toISOString(),
    };
    saveDeals([newDeal, ...deals]);
    setCustomName("");
    setCustomCity("");
    setCustomPhone("");
    setIsAddingCustom(false);
    toast.success("New deal added to CRM!");
  }

  function exportToCsv() {
    if (!planConfig.features.csvExport) {
      toast.error("CSV Export is available on Freelancer Pro and Agency Scale plans.");
      return;
    }
    const headers = ["Business Name", "City", "Phone", "Stage", "Setup Fee", "Monthly Retainer", "Notes", "Updated At"];
    const rows = deals.map((d) => [
      `"${(d.businessName || "").replace(/"/g, '""')}"`,
      `"${(d.city || "").replace(/"/g, '""')}"`,
      `"${d.phone || ""}"`,
      `"${d.stage}"`,
      d.setupFee,
      d.monthlyRetainer,
      `"${(d.notes || "").replace(/"/g, '""')}"`,
      `"${d.updatedAt}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agency-pipeline-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CRM pipeline exported to CSV!");
  }

  function openWhatsApp(deal: DealItem) {
    const raw = (deal.whatsapp || deal.phone || "").replace(/\D/g, "");
    if (!raw) {
      toast.error("No phone number saved for this deal");
      return;
    }
    const num = raw.length === 10 ? `91${raw}` : raw;
    const msg = `Namaste ${deal.businessName} team! Maine aapke clinic ke liye ek fast modern website demo ready kiya hai: https://lead-launch.demo/${deal.id} - Kya aapke paas 2 minute hain ise dekhne ke liye?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      const matchesStage = stageFilter === "all" || d.stage === stageFilter;
      const matchesSearch =
        searchQuery === "" ||
        d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.city && d.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.phone && d.phone.includes(searchQuery));
      return matchesStage && matchesSearch;
    });
  }, [deals, stageFilter, searchQuery]);

  const totalPipelineValue = deals.reduce((acc, d) => acc + (d.setupFee || 0), 0);
  const closedWonDeals = deals.filter((d) => d.stage === "closed_won");
  const totalClosedCash = closedWonDeals.reduce((acc, d) => acc + (d.setupFee || 0), 0);
  const totalMonthlyMRR = closedWonDeals.reduce((acc, d) => acc + (d.monthlyRetainer || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[92vw] md:w-[90vw] lg:w-[86vw] max-w-5xl max-h-[92vh] overflow-y-auto overflow-x-hidden p-0 border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl">
        {/* SaaS Workspace Header */}
        <div className="relative border-b border-border/70 p-6 sm:p-8 bg-gradient-to-b from-muted/30 via-background to-background overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Agency Workspace CRM
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                Client Deals Pipeline & Retainers
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage prospect stages, negotiate deal sizes, and track monthly recurring maintenance contracts.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {currentLeads.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={importCurrentRanked}
                  className="text-xs h-9 gap-1.5 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer rounded-xl"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Import ({currentLeads.length}) Leads
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className="text-xs h-9 gap-1.5 cursor-pointer rounded-xl"
              >
                <Plus className="h-3.5 w-3.5" /> New Deal
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportToCsv}
                className="text-xs h-9 gap-1.5 cursor-pointer rounded-xl"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
          </div>

          {/* SaaS KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="p-4 rounded-2xl border border-border/80 bg-card/80 shadow-xs">
              <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Active Deals</div>
              <div className="font-display text-2xl font-black text-foreground mt-1">{deals.length}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Tracked in pipeline</div>
            </div>

            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 shadow-xs">
              <div className="text-[10px] font-mono uppercase font-bold text-primary">Pipeline Potential</div>
              <div className="font-display text-2xl font-black text-primary mt-1">₹{totalPipelineValue.toLocaleString("en-IN")}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Total setup volume</div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
              <div className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">Closed Cash Won</div>
              <div className="font-display text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{totalClosedCash.toLocaleString("en-IN")}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{closedWonDeals.length} deals closed</div>
            </div>

            <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 shadow-xs">
              <div className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-blue-400">Active Retainer MRR</div>
              <div className="font-display text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{totalMonthlyMRR.toLocaleString("en-IN")}<span className="text-xs font-normal">/mo</span></div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Passive monthly cashflow</div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Custom Deal Inline Form */}
          {isAddingCustom && (
            <div className="p-5 rounded-3xl border border-primary/30 bg-primary/5 space-y-3.5 shadow-sm">
              <div className="text-xs font-bold text-primary flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Manual Client Deal to Pipeline
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                <Input
                  placeholder="Business / Clinic Name *"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-9 text-xs bg-background rounded-xl"
                />
                <Input
                  placeholder="City (e.g. Mumbai, Patna)"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="h-9 text-xs bg-background rounded-xl"
                />
                <Input
                  placeholder="WhatsApp Number"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="h-9 text-xs bg-background rounded-xl"
                />
                <Input
                  placeholder="Setup Fee (₹)"
                  type="number"
                  value={customFee}
                  onChange={(e) => setCustomFee(e.target.value)}
                  className="h-9 text-xs bg-background font-mono rounded-xl"
                />
                <Input
                  placeholder="Retainer (₹/mo)"
                  type="number"
                  value={customRetainer}
                  onChange={(e) => setCustomRetainer(e.target.value)}
                  className="h-9 text-xs bg-background font-mono rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="ghost" onClick={() => setIsAddingCustom(false)} className="h-8 text-xs rounded-xl cursor-pointer">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddCustomDeal} className="h-8 text-xs rounded-xl cursor-pointer">
                  Save Deal
                </Button>
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Stage Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: `All (${deals.length})` },
                { id: "demo_built", label: `Demo Built (${deals.filter((d) => d.stage === "demo_built").length})` },
                { id: "pitch_sent", label: `Pitch Sent (${deals.filter((d) => d.stage === "pitch_sent").length})` },
                { id: "call_booked", label: `Call Booked (${deals.filter((d) => d.stage === "call_booked").length})` },
                { id: "closed_won", label: `Closed Won (${deals.filter((d) => d.stage === "closed_won").length})` },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={stageFilter === tab.id ? "default" : "outline"}
                  onClick={() => setStageFilter(tab.id)}
                  className="text-xs h-8 px-3 rounded-xl whitespace-nowrap cursor-pointer"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search business or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Deals Table & Mobile Responsive Cards */}
          {filteredDeals.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/80 rounded-3xl bg-muted/15 space-y-2.5">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="font-semibold text-sm">No deals in this stage</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Import scraped leads from Phase 3, send a pitch in Phase 5, or click &ldquo;New Deal&rdquo; to add clients.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop SaaS Table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border/70">
                      <TableHead>Business & City</TableHead>
                      <TableHead className="w-[180px]">Pipeline Stage</TableHead>
                      <TableHead className="w-[130px]">Setup Fee (₹)</TableHead>
                      <TableHead className="w-[130px]">Retainer (₹/mo)</TableHead>
                      <TableHead>Contact / Outreach</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeals.map((deal) => {
                      const stageInfo = STAGE_CONFIG[deal.stage] || STAGE_CONFIG.prospect;
                      return (
                        <TableRow key={deal.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                          <TableCell className="align-top py-3.5">
                            <div className="font-bold text-sm text-foreground">{deal.businessName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                              <MapPin className="h-3 w-3 text-muted-foreground/70" /> {deal.city || "Patna, India"}
                              {deal.rating ? ` · ${deal.rating}★ (${deal.reviewsCount || 0})` : ""}
                            </div>
                            {deal.notes && (
                              <div className="text-[11px] text-muted-foreground/80 italic mt-1">{deal.notes}</div>
                            )}
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <select
                              value={deal.stage}
                              onChange={(e) => updateDeal(deal.id, { stage: e.target.value as DealStage })}
                              className="text-xs rounded-xl border border-border bg-background px-2.5 py-1.5 font-medium cursor-pointer"
                            >
                              <option value="prospect">1. Prospect</option>
                              <option value="demo_built">2. Demo Built</option>
                              <option value="pitch_sent">3. Pitch Sent</option>
                              <option value="call_booked">4. Call Booked</option>
                              <option value="closed_won">5. Closed Won 🎉</option>
                              <option value="lost">6. Not Interested</option>
                            </select>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground font-mono">₹</span>
                              <input
                                type="number"
                                value={deal.setupFee}
                                onChange={(e) => updateDeal(deal.id, { setupFee: Number(e.target.value) || 0 })}
                                className="w-20 font-mono text-xs border border-border rounded-lg px-2 py-1 bg-background"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground font-mono">₹</span>
                              <input
                                type="number"
                                value={deal.monthlyRetainer}
                                onChange={(e) => updateDeal(deal.id, { monthlyRetainer: Number(e.target.value) || 0 })}
                                className="w-20 font-mono text-xs border border-border rounded-lg px-2 py-1 bg-background"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <div className="flex items-center gap-2">
                              {(deal.whatsapp || deal.phone) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openWhatsApp(deal)}
                                  className="h-7 text-xs px-2.5 gap-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-300/60 rounded-xl cursor-pointer"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                                </Button>
                              )}
                              {deal.phone && (
                                <span className="text-xs text-muted-foreground font-mono">{deal.phone}</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-3.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteDeal(deal.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile / Tablet SaaS Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
                {filteredDeals.map((deal) => {
                  const stageInfo = STAGE_CONFIG[deal.stage] || STAGE_CONFIG.prospect;
                  return (
                    <div key={deal.id} className="p-4.5 rounded-3xl border border-border/80 bg-card space-y-3.5 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-foreground">{deal.businessName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                            <MapPin className="h-3 w-3" /> {deal.city || "India"}
                          </div>
                        </div>
                        <Badge className={`${stageInfo.color} text-[10px] font-mono border rounded-lg`}>
                          {stageInfo.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-muted/40 border border-border/40 font-mono">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Setup Fee</span>
                          <div className="font-bold text-foreground">₹{deal.setupFee.toLocaleString("en-IN")}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Retainer</span>
                          <div className="font-bold text-primary">₹{deal.monthlyRetainer.toLocaleString("en-IN")}/mo</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                        <select
                          value={deal.stage}
                          onChange={(e) => updateDeal(deal.id, { stage: e.target.value as DealStage })}
                          className="text-xs rounded-xl border border-border bg-background px-2.5 py-1 font-medium cursor-pointer"
                        >
                          <option value="prospect">Prospect</option>
                          <option value="demo_built">Demo Built</option>
                          <option value="pitch_sent">Pitch Sent</option>
                          <option value="call_booked">Call Booked</option>
                          <option value="closed_won">Closed Won 🎉</option>
                          <option value="lost">Lost</option>
                        </select>

                        <div className="flex items-center gap-1.5">
                          {(deal.whatsapp || deal.phone) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openWhatsApp(deal)}
                              className="h-7 text-xs px-2 gap-1 text-emerald-600 border-emerald-300 rounded-xl cursor-pointer"
                            >
                              <MessageCircle className="h-3 w-3" /> WA
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteDeal(deal.id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
