"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  LifeBuoy,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Download,
  Copy,
  Building2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientRecord } from "@/lib/types";

const INITIAL_CLIENTS: ClientRecord[] = [];

interface ClientPortalViewProps {
  onNavigateToOutreach?: () => void;
}

export function ClientPortalView({ onNavigateToOutreach }: ClientPortalViewProps) {
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    try {
      const saved = localStorage.getItem("l2l_v2_clients");
      if (saved) {
        const parsed: ClientRecord[] = JSON.parse(saved);
        const cleaned = parsed.filter(
          (c) => c.id !== "client-01" && !c.name.includes("Dr. Rohan Kapoor")
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem("l2l_v2_clients", JSON.stringify(cleaned));
        }
        return cleaned;
      }
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  });

  // Sync clients with real outreach sent from database and local storage
  React.useEffect(() => {
    const loadClients = async () => {
      let fetchedClients: ClientRecord[] = [];
      try {
        const res = await fetch("/api/clients");
        const data = await res.json();
        if (data.clients && Array.isArray(data.clients)) {
          fetchedClients = data.clients.filter(
            (c: any) => c.id !== "client-01" && !c.name.includes("Dr. Rohan Kapoor")
          );
        }
      } catch {
        // ignore
      }

      // Also read deals with outreach sent from localStorage
      const localOutreachClients: ClientRecord[] = [];
      try {
        const savedDeals = localStorage.getItem("lead_to_launch_deals");
        if (savedDeals) {
          const parsedDeals = JSON.parse(savedDeals);
          if (Array.isArray(parsedDeals)) {
            const activeStages = [
              "pitch_sent",
              "contacted",
              "proposal_sent",
              "meeting_scheduled",
              "won",
              "closed_won",
            ];
            parsedDeals.forEach((deal) => {
              if (activeStages.includes(deal.stage) && (deal.businessName || deal.company)) {
                const name = deal.businessName || deal.company;
                const isWon = deal.stage === "won" || deal.stage === "closed_won";
                localOutreachClients.push({
                  id: `client-${deal.id || name.replace(/\s+/g, "-")}`,
                  name: deal.clientName || name,
                  company: name,
                  email: deal.email || "client@direct.com",
                  phone: deal.phone || deal.whatsapp || "",
                  website: "",
                  status: isWon ? "active" : "onboarding",
                  projectTitle: "Turnkey Website & Digital Growth OS",
                  progressPercent: isWon ? 80 : 25,
                  milestones: [
                    { id: "m1", title: "Outreach & Pitch Sent", completed: true, dueDate: "Done" },
                    {
                      id: "m2",
                      title: "Discovery Call & Demo Review",
                      completed: isWon || deal.stage === "meeting_scheduled",
                      dueDate: isWon ? "Done" : "In Progress",
                    },
                    {
                      id: "m3",
                      title: "Contract Scope & Pricing Sign-off",
                      completed: isWon,
                      dueDate: isWon ? "Done" : "Upcoming",
                    },
                    {
                      id: "m4",
                      title: "Turnkey Next.js Site Delivery",
                      completed: isWon,
                      dueDate: "Upcoming",
                    },
                    {
                      id: "m5",
                      title: "Domain Cutover & Live Launch",
                      completed: false,
                      dueDate: "Upcoming",
                    },
                  ],
                  totalContractValue: deal.setupFee || deal.value || 35000,
                  portalAccessKey: `portal_${String(deal.id || "c").slice(-6)}`,
                  createdAt: deal.updatedAt || new Date().toISOString(),
                });
              }
            });
          }
        }
      } catch {
        // ignore
      }

      setClients((prev) => {
        const existingNames = new Set(prev.map((c) => c.company.toLowerCase()));
        const toAdd = [...fetchedClients, ...localOutreachClients].filter(
          (c) => !existingNames.has(c.company.toLowerCase())
        );
        const combined = [...prev, ...toAdd];
        if (combined.length > 0) {
          try {
            localStorage.setItem("l2l_v2_clients", JSON.stringify(combined));
          } catch {}
        }
        return combined;
      });
    };

    loadClients();
  }, []);

  const [activeClientIndex, setActiveClientIndex] = useState(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  const activeClient = clients[activeClientIndex] || clients[0];

  const handleToggleMilestone = (milestoneId: string) => {
    if (!activeClient) return;
    const updatedMilestones = activeClient.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    const updatedClients = [...clients];
    updatedClients[activeClientIndex] = {
      ...activeClient,
      milestones: updatedMilestones,
      progressPercent: newProgress,
    };

    setClients(updatedClients);
    try {
      localStorage.setItem("l2l_v2_clients", JSON.stringify(updatedClients));
    } catch {
      // ignore
    }
    toast.success("Project milestone updated!");
  };

  const handleCopyPortalLink = () => {
    if (!activeClient) return;
    const link = `https://lead-launch.agency/portal/${activeClient.portalAccessKey}`;
    navigator.clipboard.writeText(link);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    toast.success("Client Portal Access Link copied!");
  };

  const handleSendTicket = () => {
    if (!ticketSubject.trim() || !ticketMsg.trim()) {
      toast.error("Please fill in the subject and message");
      return;
    }
    toast.success("Support ticket sent to agency project manager!");
    setTicketSubject("");
    setTicketMsg("");
  };

  if (!activeClient) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <FolderKanban className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold font-display text-foreground">
            No Active Clients in Portal
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Clients automatically appear here once you send an outreach message via WhatsApp, Phone Call, or Email in Phase 5, or close a deal in your CRM.
          </p>
        </div>
        {onNavigateToOutreach && (
          <Button
            onClick={onNavigateToOutreach}
            className="h-10 px-5 text-xs font-bold gap-2 shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 rounded-xl"
          >
            <Send className="h-4 w-4" /> Go to Phase 5 Outreach
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Switcher when multiple clients exist */}
      {clients.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1">Switch Client:</span>
          {clients.map((c, idx) => (
            <Button
              key={c.id}
              variant={idx === activeClientIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveClientIndex(idx)}
              className="text-xs h-8 rounded-xl font-bold gap-1.5 shrink-0"
            >
              <Building2 className="h-3.5 w-3.5" /> {c.company}
            </Button>
          ))}
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Client Delivery OS
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Client Onboarding & Project Management
              </span>
            </div>
            <h2 className="text-2xl font-black font-display text-foreground tracking-tight">
              {activeClient.company}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client: <strong>{activeClient.name}</strong> • Project: {activeClient.projectTitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyPortalLink}
              className="h-9 text-xs gap-1.5 rounded-xl border-border/80"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Client Portal Link
            </Button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="mt-6 pt-6 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground">Project Completion Status</span>
            <span className="font-mono font-bold text-primary">{activeClient.progressPercent}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${activeClient.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Milestones & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestones Checklist (2 cols) */}
        <Card className="lg:col-span-2 rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden">
          <CardHeader className="p-6 pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" /> Project Milestones & Deliverables
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 divide-y divide-border/60">
            {activeClient.milestones.map((m) => (
              <div
                key={m.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleMilestone(m.id)}
                    className="h-5 w-5 rounded-md border border-border flex items-center justify-center text-primary transition hover:border-primary"
                  >
                    {m.completed && <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />}
                  </button>
                  <span className={`font-medium ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {m.title}
                  </span>
                </div>

                <Badge
                  className={`text-[10px] font-mono font-bold ${
                    m.completed
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.dueDate}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Client Documents & Support (1 col) */}
        <div className="space-y-6">
          {/* Shared Documents */}
          <Card className="rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" /> Project Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="font-semibold text-foreground">Signed Proposal & Scope</span>
                <button
                  onClick={() => toast.success("Downloading proposal PDF…")}
                  className="text-primary hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="font-semibold text-foreground">Contract Agreement</span>
                <button
                  onClick={() => toast.success("Downloading contract…")}
                  className="text-primary hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <span className="font-semibold text-foreground">50% Advance Invoice</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 rounded">
                  PAID
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Client Ticket / Support Box */}
          <Card className="rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <LifeBuoy className="h-3.5 w-3.5 text-primary" /> Client Support Request
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <Input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Topic (e.g. Add extra doctor profile)"
                className="h-9 text-xs rounded-xl"
              />
              <Input
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                placeholder="Details of your request…"
                className="h-9 text-xs rounded-xl"
              />
              <Button
                onClick={handleSendTicket}
                className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground rounded-xl"
              >
                Submit Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
