"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  FolderKanban,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  IndianRupee,
  DollarSign,
  ArrowRight,
  MoreHorizontal,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Kanban,
  List,
} from "lucide-react";
import { toast } from "sonner";
import type { CRMStage, DealItemV2 } from "@/lib/types";

export const STAGES: Array<{ id: CRMStage; label: string; color: string; dotColor: string }> = [
  { id: "new_lead", label: "New Lead", color: "border-border/80 bg-muted/40", dotColor: "bg-muted-foreground" },
  { id: "qualified", label: "Qualified", color: "border-blue-500/20 bg-blue-500/5", dotColor: "bg-blue-500" },
  { id: "audited", label: "Audited", color: "border-purple-500/20 bg-purple-500/5", dotColor: "bg-purple-500" },
  { id: "contacted", label: "Contacted", color: "border-amber-500/20 bg-amber-500/5", dotColor: "bg-amber-500" },
  { id: "interested", label: "Interested", color: "border-cyan-500/20 bg-cyan-500/5", dotColor: "bg-cyan-500" },
  { id: "meeting_scheduled", label: "Meeting Booked", color: "border-indigo-500/20 bg-indigo-500/5", dotColor: "bg-indigo-500" },
  { id: "proposal_sent", label: "Proposal Sent", color: "border-orange-500/20 bg-orange-500/5", dotColor: "bg-orange-500" },
  { id: "negotiation", label: "Negotiation", color: "border-pink-500/20 bg-pink-500/5", dotColor: "bg-pink-500" },
  { id: "won", label: "Closed Won 🎉", color: "border-emerald-500/30 bg-emerald-500/10 font-bold", dotColor: "bg-emerald-500" },
  { id: "lost", label: "Closed Lost", color: "border-destructive/20 bg-destructive/5", dotColor: "bg-destructive" },
];

const INITIAL_DEALS: DealItemV2[] = [];

interface KanbanPipelineProps {
  onConvertToClient?: (deal: DealItemV2) => void;
  onOpenDealDetail?: (deal: DealItemV2) => void;
}

export function KanbanPipeline({ onConvertToClient, onOpenDealDetail }: KanbanPipelineProps) {
  const [deals, setDeals] = useState<DealItemV2[]>(() => {
    try {
      const saved = localStorage.getItem("l2l_v2_deals");
      if (saved) {
        const parsed: DealItemV2[] = JSON.parse(saved);
        const cleaned = parsed.filter(
          (d) =>
            d.id !== "deal-01" &&
            d.id !== "deal-02" &&
            d.id !== "deal-03" &&
            !d.clientName.includes("Dr. Ananya") &&
            !d.clientName.includes("Vikram Malhotra") &&
            !d.clientName.includes("Dr. Rohan Kapoor")
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem("l2l_v2_deals", JSON.stringify(cleaned));
        }
        return cleaned;
      }
    } catch {
      // ignore
    }
    return INITIAL_DEALS;
  });

  // Sync with /api/deals on mount
  React.useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((d) => {
        if (d.deals && Array.isArray(d.deals) && d.deals.length > 0) {
          const mapped: DealItemV2[] = d.deals.map((deal: any) => {
            let stage: CRMStage = "new_lead";
            if (deal.stage === "contacted" || deal.stage === "demo_built") stage = "contacted";
            else if (deal.stage === "pitch_sent") stage = "contacted";
            else if (deal.stage === "meeting" || deal.stage === "meeting_scheduled" || deal.stage === "call_booked") stage = "meeting_scheduled";
            else if (deal.stage === "proposal" || deal.stage === "proposal_sent") stage = "proposal_sent";
            else if (deal.stage === "won" || deal.stage === "closed_won") stage = "won";
            else if (deal.stage === "lost") stage = "lost";

            return {
              id: deal.id,
              clientName: deal.clientName,
              company: deal.company,
              service: deal.service || "Website Redesign & SEO",
              value: Number(deal.value) || 35000,
              probability: stage === "won" ? 100 : stage === "proposal_sent" ? 75 : stage === "meeting_scheduled" ? 60 : 40,
              stage,
              targetDate: deal.targetDate || "Next 14 Days",
              notes: deal.notes || "",
              createdAt: deal.createdAt || new Date().toISOString(),
              updatedAt: deal.updatedAt || new Date().toISOString(),
              leadId: deal.leadId,
            };
          });

          setDeals((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newOnes = mapped.filter((item) => !existingIds.has(item.id));
            if (newOnes.length > 0) {
              const merged = [...prev, ...newOnes];
              localStorage.setItem("l2l_v2_deals", JSON.stringify(merged));
              return merged;
            }
            return prev.length === 0 ? mapped : prev;
          });
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDealModal, setShowNewDealModal] = useState(false);

  // New Deal form state
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newValue, setNewValue] = useState("45000");
  const [newService, setNewService] = useState("Website Redesign & SEO");
  const [newStage, setNewStage] = useState<CRMStage>("new_lead");

  const saveDeals = (updated: DealItemV2[]) => {
    setDeals(updated);
    try {
      localStorage.setItem("l2l_v2_deals", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleStageChange = (dealId: string, newStageId: CRMStage) => {
    const updated = deals.map((d) => {
      if (d.id === dealId) {
        const prob =
          newStageId === "won" ? 100 : newStageId === "lost" ? 0 : newStageId === "proposal_sent" ? 75 : 50;
        return { ...d, stage: newStageId, probability: prob, updatedAt: new Date().toISOString() };
      }
      return d;
    });
    saveDeals(updated);
    toast.success("Deal stage updated!");

    // If deal won, prompt client conversion
    if (newStageId === "won" && onConvertToClient) {
      const wonDeal = updated.find((d) => d.id === dealId);
      if (wonDeal) {
        toast.success("Deal Won! Prompting client conversion…");
        onConvertToClient(wonDeal);
      }
    }
  };

  const handleCreateDeal = () => {
    if (!newCompany.trim() || !newContact.trim()) {
      toast.error("Please enter company and client name");
      return;
    }

    const created: DealItemV2 = {
      id: "deal-" + Date.now(),
      company: newCompany.trim(),
      clientName: newContact.trim(),
      service: newService,
      value: parseFloat(newValue) || 35000,
      probability: newStage === "won" ? 100 : 40,
      stage: newStage,
      targetDate: "Next 14 Days",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveDeals([created, ...deals]);
    setShowNewDealModal(false);
    setNewCompany("");
    setNewContact("");
    toast.success(`Deal created for ${created.company}!`);

    // Persist to MongoDB backend
    fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: created.clientName,
        company: created.company,
        service: created.service,
        value: created.value,
        stage: created.stage,
        notes: created.notes || "",
      }),
    }).catch(() => {
      // ignore
    });
  };

  const handleDeleteDeal = (id: string) => {
    const updated = deals.filter((d) => d.id !== id);
    saveDeals(updated);
    toast.success("Deal deleted");
  };

  // Pipeline Metrics
  const metrics = useMemo(() => {
    const totalPipeline = deals
      .filter((d) => d.stage !== "lost")
      .reduce((acc, curr) => acc + curr.value, 0);

    const weightedRevenue = deals
      .filter((d) => d.stage !== "lost")
      .reduce((acc, curr) => acc + curr.value * (curr.probability / 100), 0);

    const wonCount = deals.filter((d) => d.stage === "won").length;
    const closedCount = deals.filter((d) => d.stage === "won" || d.stage === "lost").length;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

    return { totalPipeline, weightedRevenue, wonCount, winRate };
  }, [deals]);

  const filteredDeals = deals.filter((d) =>
    d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Row */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                Sales Pipeline OS
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {deals.length} Opportunities Tracked
              </span>
            </div>
            <h2 className="text-2xl font-black font-display text-foreground tracking-tight">
              Agency Deals Pipeline
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage client negotiations from qualified prospect to closed won and client delivery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 text-xs">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                  viewMode === "kanban" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" /> Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                  viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
            </div>

            <Button
              size="sm"
              onClick={() => setShowNewDealModal(true)}
              className="h-9 text-xs gap-1.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20"
            >
              <Plus className="h-3.5 w-3.5" /> New Deal
            </Button>
          </div>
        </div>

        {/* 4 Pipeline Financial Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
          <div className="p-3.5 rounded-2xl bg-card border border-border/60">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Pipeline</div>
            <div className="text-xl font-black font-mono text-foreground mt-0.5">
              ₹{metrics.totalPipeline.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-muted-foreground">Unweighted sum</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border/60">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Weighted Revenue</div>
            <div className="text-xl font-black font-mono text-primary mt-0.5">
              ₹{Math.round(metrics.weightedRevenue).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-muted-foreground">Probability adjusted</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border/60">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Won Deals</div>
            <div className="text-xl font-black font-mono text-emerald-500 mt-0.5">
              {metrics.wonCount} Closed
            </div>
            <div className="text-[10px] text-muted-foreground">Ready for delivery</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border/60">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Agency Win Rate</div>
            <div className="text-xl font-black font-mono text-cyan-500 mt-0.5">
              {metrics.winRate}%
            </div>
            <div className="text-[10px] text-muted-foreground">Conversion efficiency</div>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals by company, client, or service…"
            className="h-10 pl-9 text-xs rounded-xl bg-card border-border/80"
          />
        </div>
      </div>

      {/* Deals Display Area */}
      {deals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FolderKanban className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold font-display text-foreground">
              No Deals in Your Pipeline Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your CRM pipeline is ready. Log call outcomes from Phase 3, send proposals from Phase 5, or manually create your first opportunity.
            </p>
          </div>
          <Button
            onClick={() => setShowNewDealModal(true)}
            className="h-10 px-5 text-xs font-bold gap-2 shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Create First Deal
          </Button>
        </div>
      ) : viewMode === "kanban" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1400px]">
            {STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
              const stageValue = stageDeals.reduce((acc, curr) => acc + curr.value, 0);

              return (
                <div
                  key={stage.id}
                  className={`w-72 shrink-0 rounded-2xl border p-3 flex flex-col max-h-[70vh] ${stage.color}`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
                      <span className="font-bold text-xs text-foreground">{stage.label}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono font-semibold text-muted-foreground mb-3">
                    ₹{stageValue.toLocaleString("en-IN")}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => onOpenDealDetail && onOpenDealDetail(deal)}
                        className="p-3.5 rounded-xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-foreground leading-tight group-hover:text-primary transition">
                            {deal.company}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDeal(deal.id);
                            }}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-[11px] text-muted-foreground truncate">{deal.clientName}</div>

                        <div className="text-[10px] text-muted-foreground bg-muted/40 p-1 rounded font-medium truncate">
                          {deal.service}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs font-mono font-bold">
                          <span className="text-primary">₹{deal.value.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {deal.probability}% win
                          </span>
                        </div>

                        {/* Quick Stage Progression Dropdown */}
                        <div className="pt-1">
                          <select
                            value={deal.stage}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStageChange(deal.id, e.target.value as CRMStage)}
                            className="w-full text-[10px] font-semibold bg-muted/50 border border-border/60 rounded-lg p-1 text-muted-foreground cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move to: {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-muted-foreground border border-dashed border-border/60 rounded-xl">
                        No deals in stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <Card className="rounded-3xl border-border/80 bg-card overflow-hidden">
          <div className="divide-y divide-border/60">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-foreground">{deal.company}</div>
                  <div className="text-muted-foreground">{deal.clientName} • {deal.service}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-primary">₹{deal.value.toLocaleString("en-IN")}</div>
                    <div className="text-[10px] text-muted-foreground">{deal.probability}% Probability</div>
                  </div>

                  <select
                    value={deal.stage}
                    onChange={(e) => handleStageChange(deal.id, e.target.value as CRMStage)}
                    className="text-xs font-semibold bg-muted border border-border/60 rounded-xl px-2.5 py-1.5 text-foreground cursor-pointer"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDeleteDeal(deal.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-2xl max-w-md mx-auto space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">Create New Deal</h3>
            <button onClick={() => setShowNewDealModal(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Company / Practice</label>
              <Input
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="e.g. Apex Health Clinic"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Client Contact Name</label>
              <Input
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="e.g. Contact Person / Decision Maker"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Deal Value (₹)</label>
                <Input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Initial Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as CRMStage)}
                  className="w-full h-9 text-xs bg-muted border border-border rounded-lg px-2 text-foreground"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Service Offering</label>
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <Button onClick={handleCreateDeal} className="w-full h-10 font-bold bg-primary text-primary-foreground rounded-xl">
            Save Deal to Pipeline
          </Button>
        </div>
      )}
    </div>
  );
}
