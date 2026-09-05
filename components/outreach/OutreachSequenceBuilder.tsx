"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  MessageCircle,
  Mail,
  Clock,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Calendar,
  Layers,
  Edit2,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, AuditResult, OutreachSequence, SequenceStep, OutreachChannel } from "@/lib/types";
import { generateOutreachSequence } from "@/lib/sequenceEngine";

interface SequenceBuilderProps {
  lead: Lead;
  audit: AuditResult;
}

export function OutreachSequenceBuilder({ lead, audit }: SequenceBuilderProps) {
  const [channel, setChannel] = useState<OutreachChannel>("whatsapp");
  const [sequence, setSequence] = useState<OutreachSequence>(() =>
    generateOutreachSequence(lead, audit, "whatsapp")
  );
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleChannelChange = (newChan: OutreachChannel) => {
    setChannel(newChan);
    setSequence(generateOutreachSequence(lead, audit, newChan));
    setActiveStepIndex(0);
    toast.info(`Switched sequence to ${newChan.toUpperCase()}`);
  };

  const handleUpdateStepMessage = (index: number, newMsg: string) => {
    setSequence((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps[index] = { ...updatedSteps[index], message: newMsg };
      return { ...prev, steps: updatedSteps };
    });
  };

  const copyStepText = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success(`Day ${sequence.steps[index].day} message copied!`);
  };

  const launchDirectAction = (step: SequenceStep) => {
    if (channel === "whatsapp") {
      const phoneNum = (lead.whatsapp || lead.phone || "").replace(/[^0-9]/g, "");
      if (!phoneNum) {
        toast.error("No phone number available for this prospect");
        return;
      }
      const encText = encodeURIComponent(step.message);
      window.open(`https://wa.me/${phoneNum}?text=${encText}`, "_blank");
    } else if (channel === "email") {
      if (!lead.email) {
        toast.info("No email found; text copied to clipboard instead");
        navigator.clipboard.writeText(step.message);
        return;
      }
      const encSub = encodeURIComponent(step.subject || `Inquiry for ${lead.name}`);
      const encBody = encodeURIComponent(step.message);
      window.open(`mailto:${lead.email}?subject=${encSub}&body=${encBody}`, "_blank");
    } else {
      navigator.clipboard.writeText(step.message);
      toast.success("Script copied for LinkedIn / SMS outreach!");
    }
  };

  const activeStep = sequence.steps[activeStepIndex];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                Multi-Touch Cadence
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                5-Touch Follow-up System
              </span>
            </div>
            <h2 className="text-2xl font-black font-display text-foreground tracking-tight">
              Automated Follow-up Sequences
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalized cold-to-close campaign grounded in {lead.name}'s real audit numbers.
            </p>
          </div>

          {/* Channel Selector */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-semibold">
            <button
              onClick={() => handleChannelChange("whatsapp")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                channel === "whatsapp" ? "bg-card text-emerald-500 shadow-sm" : "text-muted-foreground"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </button>
            <button
              onClick={() => handleChannelChange("email")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                channel === "email" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
            <button
              onClick={() => handleChannelChange("linkedin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                channel === "linkedin" ? "bg-card text-blue-500 shadow-sm" : "text-muted-foreground"
              }`}
            >
              LinkedIn
            </button>
          </div>
        </div>

        {/* 5-Step Timeline Navigation */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-6 border-t border-border/60">
          {sequence.steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                activeStepIndex === idx
                  ? "bg-primary/10 border-primary shadow-md shadow-primary/10 text-foreground"
                  : "bg-card/70 border-border/60 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold font-mono mb-1">
                <span>DAY {step.day}</span>
                {activeStepIndex === idx && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
              <div className="text-xs font-bold truncate">{step.stepTitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Editor & Preview Card */}
      {activeStep && (
        <Card className="rounded-3xl border-border/80 bg-card shadow-xl overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                  Day {activeStep.day} Follow-up
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground">
                  Channel: <strong className="text-foreground uppercase">{activeStep.channel}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mt-1">
                {activeStep.stepTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyStepText(activeStepIndex, activeStep.message)}
                className="h-9 text-xs gap-1.5 rounded-xl border-border/80"
              >
                {copiedIndex === activeStepIndex ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedIndex === activeStepIndex ? "Copied" : "Copy Message"}
              </Button>

              <Button
                size="sm"
                onClick={() => launchDirectAction(activeStep)}
                className="h-9 text-xs gap-1.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20"
              >
                <Send className="h-3.5 w-3.5" /> Launch {channel === "whatsapp" ? "WhatsApp" : "Email"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {activeStep.subject && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">
                  Subject Line:
                </span>
                <span className="font-semibold text-foreground">{activeStep.subject}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Message Content (Editable)</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Personalized with {lead.rating}★ rating, {lead.city}, and revenue estimates.
                </span>
              </div>
              <Textarea
                value={activeStep.message}
                onChange={(e) => handleUpdateStepMessage(activeStepIndex, e.target.value)}
                rows={8}
                className="text-xs leading-relaxed font-sans rounded-2xl border-border/80 bg-muted/20"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
