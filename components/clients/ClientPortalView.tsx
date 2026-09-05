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
} from "lucide-react";
import { toast } from "sonner";
import type { ClientRecord } from "@/lib/types";

const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: "client-01",
    name: "Dr. Rohan Kapoor",
    company: "Kapoor Skin & Cosmetology",
    email: "drrohan.kapoor@gmail.com",
    phone: "+91 98204 55555",
    website: "https://kapoorskin.in",
    status: "active",
    projectTitle: "Turnkey Healthcare Portal & WhatsApp Booking Engine",
    progressPercent: 75,
    milestones: [
      { id: "m1", title: "Project Scope & Contract Sign-off", completed: true, dueDate: "Done" },
      { id: "m2", title: "Clinic Content & Treatment Catalog Received", completed: true, dueDate: "Done" },
      { id: "m3", title: "Figma UI/UX Mockup Approved", completed: true, dueDate: "Done" },
      { id: "m4", title: "Next.js Development & WhatsApp Integration", completed: true, dueDate: "In Progress" },
      { id: "m5", title: "Client Staging Review & Domain DNS Cutover", completed: false, dueDate: "Next Tuesday" },
    ],
    totalContractValue: 95000,
    portalAccessKey: "portal_kapoor_89a3f2",
    createdAt: new Date().toISOString(),
  },
];

export function ClientPortalView() {
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    try {
      const saved = localStorage.getItem("l2l_v2_clients");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  });

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
      <div className="p-8 text-center text-muted-foreground">
        No active clients yet. Close a deal in the CRM to convert your first client!
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
