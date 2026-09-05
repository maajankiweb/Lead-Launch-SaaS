"use client";

import React, { useState, useMemo } from "react";
import {
  Send,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Plus,
  Search,
  Filter,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { RankedLead } from "@/lib/types";

export interface ProposalRecord {
  id: string;
  leadId: string;
  leadName: string;
  channel: "whatsapp" | "email" | "instagram" | "call";
  language: "hinglish" | "english";
  status: "draft" | "sent" | "opened" | "replied" | "closed_won";
  hookPreview: string;
  sentAt: string;
  value: number;
}

interface ProposalsTrackerProps {
  proposals: ProposalRecord[];
  onAddProposal: (proposal: Omit<ProposalRecord, "id" | "sentAt">) => void;
  onUpdateStatus: (id: string, status: ProposalRecord["status"]) => void;
  onJumpToOutreach: (leadId?: string) => void;
  rankedLeads: RankedLead[];
}

export function ProposalsTracker({
  proposals,
  onUpdateStatus,
  onJumpToOutreach,
  rankedLeads,
}: ProposalsTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      const matchesSearch =
        p.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hookPreview.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChannel = channelFilter === "ALL" || p.channel === channelFilter;
      return matchesSearch && matchesChannel;
    });
  }, [proposals, searchTerm, channelFilter]);

  const stats = useMemo(() => {
    const total = proposals.length;
    const sent = proposals.filter((p) => p.status !== "draft").length;
    const replied = proposals.filter((p) => p.status === "replied" || p.status === "closed_won").length;
    const won = proposals.filter((p) => p.status === "closed_won").length;
    const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;
    const totalValue = proposals
      .filter((p) => p.status === "closed_won")
      .reduce((acc, curr) => acc + curr.value, 0);

    return { total, sent, replied, won, replyRate, totalValue };
  }, [proposals]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Pitch script copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-border/80">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pitches Created</span>
            <Send className="h-4 w-4 text-primary" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-foreground">{stats.total}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Multi-channel proposals</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-border/80">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Delivered & Sent</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-emerald-500">{stats.sent}</div>
          <p className="text-[11px] text-muted-foreground mt-1">WhatsApp & Email</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-border/80">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Client Response Rate</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-purple-500">{stats.replyRate}%</div>
          <p className="text-[11px] text-muted-foreground mt-1">{stats.replied} positive replies</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-border/80">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Won Retainers</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-extrabold text-amber-500">{stats.won} Deals</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {stats.totalValue > 0 ? `₹${stats.totalValue.toLocaleString("en-IN")}` : "Closed contracts"}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposal by business or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card border-border/80 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={channelFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setChannelFilter("ALL")}
            className="text-xs h-9 rounded-xl font-semibold"
          >
            All Channels
          </Button>
          <Button
            variant={channelFilter === "whatsapp" ? "default" : "outline"}
            size="sm"
            onClick={() => setChannelFilter("whatsapp")}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </Button>
          <Button
            variant={channelFilter === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => setChannelFilter("email")}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </Button>

          <Button
            onClick={() => onJumpToOutreach()}
            className="text-xs h-9 rounded-xl font-bold gap-1.5 shadow-md shadow-primary/20 bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Create New Pitch
          </Button>
        </div>
      </div>

      {/* Proposals List Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <Send className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-base text-foreground">No Proposals Sent Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            Head to Step 5 (Outreach) to generate personalized WhatsApp & Cold Email scripts for your leads, or start an instant pitch now.
          </p>
          <Button onClick={() => onJumpToOutreach()} size="sm" className="gap-2">
            <Send className="h-4 w-4" /> Go to Outreach Engine
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border/80 text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                <tr>
                  <th className="py-3 px-4">Business / Lead</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Script Preview</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Delivered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition">
                    <td className="py-3 px-4 font-bold text-foreground">
                      <div className="truncate max-w-[180px]">{item.leadName}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        Value: ₹{item.value.toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                        {item.channel === "whatsapp" ? (
                          <MessageCircle className="h-3 w-3 text-emerald-500" />
                        ) : item.channel === "email" ? (
                          <Mail className="h-3 w-3 text-blue-500" />
                        ) : item.channel === "call" ? (
                          <Phone className="h-3 w-3 text-amber-500" />
                        ) : (
                          <Send className="h-3 w-3 text-pink-500" />
                        )}
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[280px]">
                      <div className="text-xs text-foreground font-mono truncate" title={item.hookPreview}>
                        {item.hookPreview}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                        className="text-[11px] font-bold bg-muted/60 border border-border/80 rounded-lg px-2 py-1 cursor-pointer"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="opened">Opened / Read</option>
                        <option value="replied">Replied (Call Scheduled)</option>
                        <option value="closed_won">Closed Won 🎉</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-muted-foreground whitespace-nowrap">
                      {item.sentAt}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyText(item.hookPreview)}
                          title="Copy script"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-bold px-2"
                          onClick={() => onJumpToOutreach(item.leadId)}
                        >
                          Open in Phase 5
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
