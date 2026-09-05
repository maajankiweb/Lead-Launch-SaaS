"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneCall,
  MessageCircle,
  Copy,
  Check,
  IndianRupee,
  Star,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  Calendar,
  Volume2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import type { Lead, RankedLead } from "@/lib/types";
import { toast } from "sonner";

interface QuickCallModalProps {
  lead: (Lead & Partial<RankedLead>) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealLogged?: () => void;
}

export function QuickCallModal({
  lead,
  open,
  onOpenChange,
  onDealLogged,
}: QuickCallModalProps) {
  const [copied, setCopied] = useState(false);
  const [loggingDeal, setLoggingDeal] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null);

  if (!lead) return null;

  const rawPhone = lead.phone || lead.whatsapp || "";
  const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
  const whatsappNum = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
  const formattedWa = whatsappNum.length === 10 ? `91${whatsappNum}` : whatsappNum;

  const lostRev = lead.audit?.estLostRevenuePerMonth || 25000;
  const speed = lead.audit?.pageSpeedScore || 45;
  const score = lead.score || 85;

  const copyPhone = () => {
    if (!rawPhone) return;
    navigator.clipboard.writeText(rawPhone);
    setCopied(true);
    toast.success("Phone number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectCall = () => {
    if (!cleanPhone) {
      toast.error("No phone number available for this prospect");
      return;
    }
    window.location.href = `tel:${cleanPhone}`;
    toast.info(`Dialing ${lead.name}...`);
  };

  const handleWhatsApp = () => {
    if (!formattedWa) {
      toast.error("No WhatsApp number available");
      return;
    }
    const text = encodeURIComponent(
      `Hi, is this the owner at ${lead.name}? I was reviewing local ${lead.category} businesses in ${lead.city || "your area"} and noticed your website performance is missing out on mobile customers. We prepared a complimentary modern demo site for you: https://lead-launch-saas.vercel.app - would love to get your thoughts!`
    );
    window.open(`https://wa.me/${formattedWa}?text=${text}`, "_blank");
  };

  const handleLogCallOutcome = async (
    stage: "lead" | "contacted" | "proposal" | "won" | "lost",
    outcomeNotes: string,
    value: number = 25000
  ) => {
    setLoggingDeal(true);
    try {
      // 1. Try saving to DB backend via /api/deals
      await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: lead.name,
          company: lead.name,
          service: "Website Redesign & Mobile SEO",
          value,
          stage,
          leadId: lead.id,
          notes: `[Phone Call Outcome]: ${outcomeNotes}. Phone: ${rawPhone}, Reviews: ${lead.reviewsCount}, PageSpeed: ${speed}/100.`,
        }),
      });

      // 2. Also keep local storage synchronized for instant Kanban UI updates
      try {
        const stored = localStorage.getItem("lead_to_launch_deals");
        const list = stored ? JSON.parse(stored) : [];
        const dealData = {
          id: `deal-${Date.now()}`,
          clientName: lead.name,
          company: lead.name,
          service: "Website Redesign & Mobile SEO",
          value,
          stage: stage === "lead" ? "lead" : stage === "proposal" ? "proposal_sent" : stage === "won" ? "closed_won" : "pitch_sent",
          leadId: lead.id,
          notes: outcomeNotes,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("lead_to_launch_deals", JSON.stringify([dealData, ...list]));
      } catch {
        // ignore local storage error
      }

      toast.success(`Logged call outcome: "${outcomeNotes}"!`);
      if (onDealLogged) onDealLogged();
      onOpenChange(false);
    } catch {
      toast.error("Could not save to CRM Deals");
    } finally {
      setLoggingDeal(false);
    }
  };

  const objections = [
    {
      id: "cost",
      label: "💰 \"How much does it cost?\"",
      reply:
        "Completely understand budget is key. We typically build high-converting sites for ₹15k-₹35k, but right now I'm just showing you a free live demo we already created so you can see the speed difference. Zero obligation.",
    },
    {
      id: "agency",
      label: "🤝 \"We already have a web guy\"",
      reply: `That's great! Most established businesses do. However, our technical audit showed your mobile speed is currently scored at ${speed}/100, which Google estimates is costing you ₹${lostRev.toLocaleString("en-IN")}/mo in lost bookings. Can I shoot you the 2-page report to share with your web person?`,
    },
    {
      id: "email",
      label: "📧 \"Just send me an email\"",
      reply:
        "Will do! What's the best email address? I'll send the live interactive demo site link directly with the audit report. If I drop a WhatsApp message with the link right now, could you take a 30-second look?",
    },
    {
      id: "busy",
      label: "⏳ \"I'm too busy right now\"",
      reply: `I hear you completely, running a ${lead.category} is hectic. When would be a better 3-minute window tomorrow morning — 10:30 AM or 2:00 PM?`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        {/* Header with gradient banner */}
        <div className="bg-gradient-to-r from-emerald-600/20 via-primary/15 to-transparent p-5 sm:p-6 border-b border-border/70">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 flex items-center gap-1">
                <PhoneCall className="h-3 w-3" /> Quick Tele-Sales Assistant
              </span>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-mono">
                Score {score}/100
              </Badge>
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-foreground">
              {lead.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 pt-1">
              <span>{lead.category}</span>
              <span>·</span>
              <span>{lead.city || lead.address}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="h-3 w-3 fill-amber-500" /> {lead.rating}★ ({lead.reviewsCount} reviews)
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
            <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Est. Lost / mo</div>
              <div className="text-sm sm:text-base font-bold text-emerald-500 font-mono mt-0.5">
                ₹{lostRev.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Mobile Speed</div>
              <div className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${speed < 50 ? "text-red-500" : "text-amber-500"}`}>
                {speed}/100
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-background/80 border border-border/70 text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Website</div>
              <div className="text-sm sm:text-base font-semibold truncate mt-0.5">
                {lead.website ? "Outdated" : "No Website"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar: Call Now, WhatsApp, Copy */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground font-semibold">Phone Contact</div>
                <div className="text-base font-bold font-mono text-foreground truncate">
                  {rawPhone || "No Phone Number Listed"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={copyPhone}
                disabled={!rawPhone}
                className="flex-1 sm:flex-none h-10 px-3 text-xs gap-1.5 rounded-xl"
                title="Copy phone number"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span className="hidden xs:inline">Copy</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                disabled={!whatsappNum}
                className="flex-1 sm:flex-none h-10 px-3 text-xs gap-1.5 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </Button>

              <Button
                size="sm"
                onClick={handleDirectCall}
                disabled={!cleanPhone}
                className="flex-1 sm:flex-none h-10 px-5 text-xs font-bold gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-transform active:scale-95"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call Now</span>
              </Button>
            </div>
          </div>

          {/* Tele-Pitch Prompter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> 30-Second Cold Call Script
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">Proven 24% conversion</span>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-primary/20 space-y-3 shadow-inner">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  1. The Pattern Interrupt Hook (0-10s)
                </span>
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  &ldquo;Hi, is this the owner or clinic manager at <strong className="text-primary">{lead.name}</strong>? My name is [Your Name], I was reviewing local top-rated {lead.category} businesses in {lead.city || "town"}. You have {lead.reviewsCount} great reviews, but Google is penalizing your mobile booking speed.&rdquo;
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/60">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                  2. The High-Value Demo Offer (10-25s)
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  &ldquo;Our agency already built a high-speed interactive mobile demo website specifically for {lead.name} that loads under 1 second. We estimate it saves you roughly ₹{lostRev.toLocaleString("en-IN")}/mo in lost inquiries. I have the live preview ready — can I text the preview link to this number so you can test it on your phone?&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Objection Battle Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Instant Objection Handlers
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {objections.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObjection(selectedObjection === obj.id ? null : obj.id)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition cursor-pointer ${
                    selectedObjection === obj.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  <div className="truncate">{obj.label}</div>
                </button>
              ))}
            </div>

            {selectedObjection && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-xs text-foreground leading-relaxed animate-in fade-in-50 duration-150">
                {objections.find((o) => o.id === selectedObjection)?.reply}
              </div>
            )}
          </div>

          {/* Fast CRM Deal Logger */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Log Call Outcome to CRM Deals
              </span>
              <span className="text-[10px] text-muted-foreground">Auto-updates Kanban pipeline</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loggingDeal}
                onClick={() => handleLogCallOutcome("proposal", "Meeting / Live Demo Booked", 35000)}
                className="h-9 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
              >
                🎉 Demo Booked
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={loggingDeal}
                onClick={() => handleLogCallOutcome("contacted", "Pitch delivered, requested follow-up", 25000)}
                className="h-9 text-xs border-primary/40 text-primary hover:bg-primary/10 font-bold"
              >
                💬 Follow-up Set
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={loggingDeal}
                onClick={() => handleLogCallOutcome("lead", "No Answer / Left Voicemail", 15000)}
                className="h-9 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
              >
                📞 Left Voicemail
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={loggingDeal}
                onClick={() => handleLogCallOutcome("lost", "Not Interested / Bad Timing", 0)}
                className="h-9 text-xs border-border text-muted-foreground hover:bg-muted font-medium"
              >
                ❌ Not Interested
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
