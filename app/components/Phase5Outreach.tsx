"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { ClaudeThinking, ClaudeRequired } from "./ClaudeStates";
import { MessageCircle, Mail, Camera, Copy, ExternalLink, Clock, Sparkles, FileText, Send, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import type { RankedLead, OutreachChannel, OutreachLanguage, OutreachResult } from "@/lib/types";
import { callClaude } from "@/lib/claudeClient";
import { toast } from "sonner";
import { AuditReportModal } from "./AuditReportModal";
import { Input } from "@/components/ui/input";

export function Phase5Outreach({
  selected,
  onPrev,
}: {
  selected: RankedLead | null;
  onPrev: () => void;
}) {
  const [channel, setChannel] = useState<OutreachChannel>("whatsapp");
  const [lang, setLang] = useState<OutreachLanguage>("hinglish");
  const [demoUrl, setDemoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [bestSendTime, setBestSendTime] = useState("");
  const [generating, setGenerating] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);
  const [claudeError, setClaudeError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const lastFor = useRef<string>("");

  // Clear drafts when lead / channel / language changes (they need a fresh Claude draft).
  useEffect(() => {
    const key = `${selected?.id ?? ""}:${channel}:${lang}`;
    if (key !== lastFor.current) {
      setMessage("");
      setFollowUp("");
      setBestSendTime("");
    }
  }, [selected, channel, lang]);

  async function generate() {
    if (!selected) return;
    setGenerating(true);
    setNotInstalled(false);
    setClaudeError(null);
    const res = await callClaude<OutreachResult>("/api/outreach", {
      lead: selected,
      channel,
      language: lang,
    });
    setGenerating(false);
    if (!res.ok) {
      if (res.notInstalled) setNotInstalled(true);
      else setClaudeError(res.error);
      toast.error(res.notInstalled ? "Claude Code required" : "Draft failed");
      return;
    }
    lastFor.current = `${selected.id}:${channel}:${lang}`;
    
    let firstMsg = res.data.first;
    let followUpMsg = res.data.followUp;
    if (demoUrl.trim()) {
      firstMsg = firstMsg.replace(/https:\/\/lead-launch\.demo\/[^\s]+|\[your-demo-link\]/g, demoUrl.trim());
      followUpMsg = followUpMsg.replace(/https:\/\/lead-launch\.demo\/[^\s]+|\[your-demo-link\]/g, demoUrl.trim());
    }

    setMessage(firstMsg);
    setFollowUp(followUpMsg);
    setBestSendTime(res.data.bestSendTime);
    toast.success("Outreach draft generated!");
  }

  function handleDemoUrlChange(url: string) {
    setDemoUrl(url);
    if (url.trim()) {
      setMessage((prev) => prev.replace(/https:\/\/lead-launch\.demo\/[^\s]+|\[your-demo-link\]/g, url.trim()));
      setFollowUp((prev) => prev.replace(/https:\/\/lead-launch\.demo\/[^\s]+|\[your-demo-link\]/g, url.trim()));
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function saveToCRM() {
    if (!selected) return;
    try {
      const saved = localStorage.getItem("lead_to_launch_deals");
      const list = saved ? JSON.parse(saved) : [];
      if (list.some((d: { id: string }) => d.id === selected.id)) {
        toast.info("Deal is already saved in CRM pipeline.");
        return;
      }
      const newDeal = {
        id: selected.id,
        businessName: selected.name,
        city: selected.city,
        phone: selected.phone,
        whatsapp: selected.whatsapp,
        rating: selected.rating,
        reviewsCount: selected.reviewsCount,
        stage: "pitch_sent",
        setupFee: 25000,
        monthlyRetainer: 2000,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("lead_to_launch_deals", JSON.stringify([newDeal, ...list]));
      toast.success("Saved to Agency Deals CRM under 'Pitch Sent'!");
    } catch {
      toast.error("Could not save to CRM");
    }
  }

  function openChannel() {
    if (!selected) return;
    if (channel === "whatsapp" && (selected.whatsapp || selected.phone)) {
      const rawNum = (selected.whatsapp || selected.phone || "").replace(/\D/g, "");
      const num = rawNum.length === 10 ? `91${rawNum}` : rawNum;
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
      saveToCRM();
    } else if (channel === "email" && selected.email) {
      const subject = lang === "hinglish" ? `Website demo for ${selected.name}` : `Built a modern website demo for ${selected.name}`;
      window.open(`mailto:${selected.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, "_blank");
      saveToCRM();
    } else if (channel === "instagram") {
      window.open(`https://instagram.com/`, "_blank");
    } else {
      toast.error("No contact for this channel");
    }
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 5 — Outreach"
        subtitle="Claude Code writes a personalized first message + day-3 follow-up, tailored to the lead. Hinglish or English."
        onPrev={onPrev}
      >
        <IncompleteState
          title="No lead selected yet"
          description="Outreach is written per-lead by Claude — using the name, biggest gap, and reachable channels. Run the earlier phases and pick a prospect to draft WhatsApp, email, or Instagram messages here."
          prevPhaseLabel="Rank"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  const channels: { id: OutreachChannel; label: string; icon: typeof MessageCircle; enabled: boolean }[] = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, enabled: !!selected.whatsapp },
    { id: "email", label: "Email", icon: Mail, enabled: !!selected.email },
    { id: "instagram", label: "Instagram", icon: Camera, enabled: true },
  ];

  const hasDrafts = !!message || !!followUp;

  return (
    <PhaseShell title="Phase 5 — Outreach" subtitle="Claude Code writes a personalized first touch + day-3 follow-up. Hinglish converts better in India." onPrev={onPrev}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Sending to</div>
          <div className="font-display text-2xl mt-1">{selected.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{selected.phone}{selected.email ? ` · ${selected.email}` : ""}</div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="lang" className="text-sm text-muted-foreground">English</Label>
          <Switch id="lang" checked={lang === "hinglish"} onCheckedChange={(c) => setLang(c ? "hinglish" : "english")} />
          <Label htmlFor="lang" className="text-sm">Hinglish</Label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {channels.map(({ id, label, icon: Icon, enabled }) => (
            <Button
              key={id}
              variant={channel === id ? "default" : "outline"}
              size="sm"
              disabled={!enabled}
              onClick={() => setChannel(id)}
            >
              <Icon className="h-4 w-4 mr-2" /> {label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
            <FileText className="h-4 w-4 mr-1.5 text-primary" /> View PDF Audit Report
          </Button>
          <Button onClick={generate} disabled={generating} className="h-10 px-4">
            {generating ? "Claude is writing…" : hasDrafts ? "Regenerate" : "Draft with Claude"}
          </Button>
        </div>
      </div>

      {/* Demo URL Bar */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <LinkIcon className="h-3.5 w-3.5" /> Deployed Demo Website Link (Optional)
            </div>
            <div className="text-[11px] text-muted-foreground">
              Paste your Lovable / Vercel demo link here — it will auto-replace the link in your messages.
            </div>
          </div>
          <Input
            value={demoUrl}
            onChange={(e) => handleDemoUrlChange(e.target.value)}
            placeholder="e.g. https://dr-mehta-bandra.lovable.app"
            className="w-full sm:w-[320px] h-9 text-xs bg-background"
          />
        </CardContent>
      </Card>

      {generating && <div className="mb-6"><ClaudeThinking label="Claude is writing your outreach…" /></div>}
      {notInstalled && <div className="mb-6"><ClaudeRequired error={claudeError ?? undefined} onRetry={generate} /></div>}
      {claudeError && !notInstalled && (
        <div className="mb-6 rounded-md border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/5 p-3 text-sm text-[color:var(--destructive)]" role="alert">
          {claudeError}
        </div>
      )}

      {!hasDrafts && !generating && !notInstalled && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="font-display text-xl mb-1">Pick a channel + language</div>
            <p className="text-sm text-muted-foreground">Then hit &ldquo;Draft with Claude&rdquo; — you&apos;ll get a first message and a day-3 follow-up.</p>
          </CardContent>
        </Card>
      )}

      {hasDrafts && !generating && (
        <>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">First touch message</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(message)}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
                  <Button size="sm" onClick={openChannel} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Open & Send
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="font-mono text-sm min-h-[300px]" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Day-3 follow-up</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(followUp)}><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="font-mono text-sm min-h-[300px]" />
              </CardContent>
            </Card>
          </div>

          {bestSendTime && (
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} /> Recommended Send Time: {bestSendTime}
              </div>
              <Button size="sm" variant="outline" onClick={saveToCRM} className="text-xs">
                💼 Save to Deals CRM (Pitch Sent)
              </Button>
            </div>
          )}

          <Card className="mt-4 bg-accent/40 border-accent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-base">✓</div>
                  <div>
                    <div className="font-medium tracking-tight">Pipeline complete for {selected.name}</div>
                    <div className="text-sm text-muted-foreground">Lead ➔ audit ➔ ranked ➔ site prompt ➔ outreach pitch ready. Send via WhatsApp to begin deal conversation!</div>
                  </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setReportOpen(true)}>
                  <FileText className="h-4 w-4 mr-1.5" /> Download Client PDF Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Client Audit Report Modal */}
      <AuditReportModal lead={selected} open={reportOpen} onOpenChange={setReportOpen} />
    </PhaseShell>
  );
}
