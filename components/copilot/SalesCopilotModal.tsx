"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  HelpCircle,
  Phone,
  MessageCircle,
  FileText,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, AuditResult } from "@/lib/types";
import { answerCopilotQuery, type CopilotQueryResponse } from "@/lib/copilotEngine";

interface MessageItem {
  id: string;
  sender: "user" | "copilot";
  text: string;
  suggestedAction?: string;
  confidence?: "high" | "medium" | "inferred";
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Why should I contact this business?",
  "What should I sell them?",
  "What are their biggest website problems?",
  "Write a WhatsApp message.",
  "Write an email.",
  "Handle price objection (too expensive).",
  "Create a 15-minute discovery call agenda.",
  "What should I do next?",
];

export function SalesCopilotModal({
  open,
  onOpenChange,
  lead,
  audit,
  onExecuteAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  audit?: AuditResult;
  onExecuteAction?: (action: string) => void;
}) {
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Copilot welcome message when opened for a lead
  useEffect(() => {
    if (open && lead) {
      const initialAnswer = answerCopilotQuery("Summarize this prospect.", lead, audit);
      setMessages([
        {
          id: "welcome-" + Date.now(),
          sender: "copilot",
          text: `Hello! I am your AI Sales Copilot for **${lead.name}**.\n\n${initialAnswer.answer}\n\nAsk me anything below, or click one of the suggested prompts to draft pitches, handle objections, or plan your next step.`,
          suggestedAction: initialAnswer.suggestedAction,
          confidence: "high",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [open, lead, audit]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!lead) return null;

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: MessageItem = {
      id: "user-" + Date.now(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");

    // Generate grounded Copilot response
    setTimeout(() => {
      const response: CopilotQueryResponse = answerCopilotQuery(text, lead, audit);
      const botMsg: MessageItem = {
        id: "bot-" + Date.now(),
        sender: "copilot",
        text: response.answer,
        suggestedAction: response.suggestedAction,
        confidence: response.sourceConfidence,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 250);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[750px] max-w-2xl h-[85vh] max-h-[750px] flex flex-col p-0 border-border bg-background shadow-2xl rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-border/80 bg-muted/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-foreground">AI Sales Copilot</span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Grounded Intelligence
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-md">
                Active for: <strong className="text-foreground">{lead.name}</strong> ({lead.category} • {lead.city})
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "copilot" && (
                <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-none ml-auto"
                    : "bg-card border border-border/80 text-foreground shadow-sm rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                {m.suggestedAction && (
                  <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Next Action: {m.suggestedAction}
                    </span>
                    <button
                      onClick={() => copyText(m.id, m.text)}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
                    >
                      {copiedId === m.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copiedId === m.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}

                <div
                  className={`text-[9px] ${
                    m.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  } text-right`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === "user" && (
                <div className="h-8 w-8 rounded-xl bg-muted text-muted-foreground border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-border/60 bg-muted/20 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/70 text-muted-foreground shrink-0 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 border-t border-border/80 bg-background flex items-center gap-2">
          <Input
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputQuery)}
            placeholder={`Ask anything about selling to ${lead.name}…`}
            className="h-10 text-xs rounded-xl bg-muted/30 border-border/80"
          />
          <Button
            onClick={() => handleSend(inputQuery)}
            disabled={!inputQuery.trim()}
            className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
