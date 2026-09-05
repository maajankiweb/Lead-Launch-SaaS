"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { ClaudeThinking, ClaudeRequired } from "./ClaudeStates";
import {
  MessageCircle,
  Mail,
  Camera,
  Phone,
  PhoneCall,
  Copy,
  ExternalLink,
  Clock,
  Sparkles,
  FileText,
  Send,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import type { RankedLead, OutreachChannel, OutreachLanguage, OutreachResult } from "@/lib/types";
import { callClaude } from "@/lib/claudeClient";
import { toast } from "sonner";
import { AuditReportModal } from "./AuditReportModal";

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
  const [customEmail, setCustomEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [message, setMessage] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [callScriptData, setCallScriptData] = useState<OutreachResult["callScript"] | null>(null);
  const [bestSendTime, setBestSendTime] = useState("");
  const [generating, setGenerating] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);
  const [claudeError, setClaudeError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [activeObjectionIndex, setActiveObjectionIndex] = useState<number | null>(0);
  const lastFor = useRef<string>("");

  // Initialize email from lead
  useEffect(() => {
    if (selected?.email) {
      setCustomEmail(selected.email);
    } else {
      setCustomEmail("");
    }
  }, [selected]);

  // Clear drafts when lead / channel / language changes.
  useEffect(() => {
    const key = `${selected?.id ?? ""}:${channel}:${lang}`;
    if (key !== lastFor.current) {
      setMessage("");
      setFollowUp("");
      setEmailSubject("");
      setCallScriptData(null);
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
    setEmailSubject(res.data.emailSubject || (lang === "hinglish" ? `Website demo & inquiry question for ${selected.name}` : `Modern website demo for ${selected.name}`));
    setCallScriptData(res.data.callScript || null);
    setBestSendTime(res.data.bestSendTime);
    toast.success(`${channel === "call" ? "Phone call script" : channel === "email" ? "Email draft" : "Outreach message"} generated!`);
  }

  function handleDemoUrlChange(url: string) {
    setDemoUrl(url);
    if (url.trim()) {
      setMessage((prev) => prev.replace(/https:\/\/lead-launch\.demo\/[^\s]+|\[your-demo-link\]/g, url.trim()));
      setFollowUp((prev) => prev.replace(/https:\/\/lead-launch\.demo\/[^\s]+|\[your-demo-link\]/g, url.trim()));
    }
  }

  function copy(text: string, label = "Copied to clipboard") {
    navigator.clipboard.writeText(text);
    toast.success(label);
  }

  function saveToCRM(stage: "pitch_sent" | "call_booked" = "pitch_sent", notes = "") {
    if (!selected) return;
    try {
      const saved = localStorage.getItem("lead_to_launch_deals");
      const list = saved ? JSON.parse(saved) : [];
      const existingIndex = list.findIndex((d: { id: string }) => d.id === selected.id);

      const dealData = {
        id: selected.id,
        businessName: selected.name,
        city: selected.city,
        phone: selected.phone,
        whatsapp: selected.whatsapp,
        email: customEmail || selected.email,
        rating: selected.rating,
        reviewsCount: selected.reviewsCount,
        stage,
        notes: notes || `Outreach via ${channel.toUpperCase()} (${lang}) at ${new Date().toLocaleDateString()}`,
        setupFee: 25000,
        monthlyRetainer: 2000,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...dealData };
        localStorage.setItem("lead_to_launch_deals", JSON.stringify(list));
        toast.success(`CRM deal updated to '${stage.replace("_", " ").toUpperCase()}'!`);
      } else {
        localStorage.setItem("lead_to_launch_deals", JSON.stringify([dealData, ...list]));
        toast.success(`Saved to Deals CRM under '${stage.replace("_", " ").toUpperCase()}'!`);
      }

      // Sync to l2l_v2_deals for Kanban pipeline
      try {
        const v2Saved = localStorage.getItem("l2l_v2_deals");
        const v2List = v2Saved ? JSON.parse(v2Saved) : [];
        const v2Index = v2List.findIndex((d: { id: string }) => d.id === selected.id);
        const v2Deal = {
          id: selected.id,
          company: selected.name,
          clientName: selected.name,
          service: "Website Redesign & Conversion OS",
          value: 35000,
          probability: (stage as string) === "won" ? 100 : 75,
          stage: "contacted",
          targetDate: "Next 14 Days",
          notes: notes || `Outreach sent via ${channel.toUpperCase()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          leadId: selected.id,
        };
        if (v2Index >= 0) {
          v2List[v2Index] = { ...v2List[v2Index], ...v2Deal };
        } else {
          v2List.unshift(v2Deal);
        }
        localStorage.setItem("l2l_v2_deals", JSON.stringify(v2List));
      } catch {
        // ignore
      }

      // Sync to l2l_v2_clients for Client Portal View
      try {
        const clientsSaved = localStorage.getItem("l2l_v2_clients");
        const clientsList = clientsSaved ? JSON.parse(clientsSaved) : [];
        const cIndex = clientsList.findIndex(
          (c: { id: string; company: string }) =>
            c.id === `client-${selected.id}` || c.company === selected.name
        );
        const newClient = {
          id: `client-${selected.id}`,
          name: selected.name,
          company: selected.name,
          email: customEmail || selected.email || "client@direct.com",
          phone: selected.phone || selected.whatsapp || "",
          website: selected.website || "",
          status: "onboarding" as const,
          projectTitle: "Turnkey Website & Digital Growth OS",
          progressPercent: 25,
          milestones: [
            { id: "m1", title: "Outreach & Pitch Sent", completed: true, dueDate: "Done" },
            { id: "m2", title: "Discovery Call & Demo Review", completed: false, dueDate: "In Progress" },
            { id: "m3", title: "Contract Scope & Deposit Sign-off", completed: false, dueDate: "Upcoming" },
            { id: "m4", title: "Turnkey Next.js Site Delivery", completed: false, dueDate: "Upcoming" },
            { id: "m5", title: "Domain Cutover & Live Launch", completed: false, dueDate: "Upcoming" },
          ],
          totalContractValue: 35000,
          portalAccessKey: `portal_${selected.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6)}`,
          createdAt: new Date().toISOString(),
        };
        if (cIndex >= 0) {
          clientsList[cIndex] = { ...clientsList[cIndex], ...newClient };
        } else {
          clientsList.unshift(newClient);
        }
        localStorage.setItem("l2l_v2_clients", JSON.stringify(clientsList));
      } catch {
        // ignore
      }

      // Sync to proposals history
      try {
        const propsSaved = localStorage.getItem("l2l_proposals_history");
        const propsList = propsSaved ? JSON.parse(propsSaved) : [];
        const newProp = {
          id: "prop_" + Date.now(),
          leadId: selected.id,
          leadName: selected.name,
          channel: channel === "call" ? "whatsapp" : channel,
          language: lang,
          status: "sent",
          hookPreview: (message || "").slice(0, 140) + "...",
          sentAt: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          value: 35000,
        };
        localStorage.setItem("l2l_proposals_history", JSON.stringify([newProp, ...propsList]));
      } catch {
        // ignore
      }

      // Sync to database backend via /api/deals
      fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: selected.name,
          company: selected.name,
          service: "Turnkey Website & Digital Growth OS",
          value: 35000,
          stage: "pitch_sent",
          notes: notes || `Outreach sent via ${channel.toUpperCase()}`,
          leadId: selected.id,
        }),
      }).catch(() => {
        // ignore
      });
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
      saveToCRM("pitch_sent", "Sent pitch message via WhatsApp");
    } else if (channel === "email") {
      const targetEmail = (customEmail || selected.email || "").trim();
      if (!targetEmail) {
        toast.error("Please enter a recipient email address below first");
        return;
      }
      const subject = emailSubject || `Built a modern website demo for ${selected.name}`;
      window.open(`mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, "_blank");
      saveToCRM("pitch_sent", `Sent pitch email to ${targetEmail}`);
    } else if (channel === "call") {
      const phoneNum = (selected.phone || selected.whatsapp || "").replace(/[^\d+]/g, "");
      if (!phoneNum) {
        toast.error("No phone number available for this lead");
        return;
      }
      window.open(`tel:${phoneNum}`, "_self");
      saveToCRM("pitch_sent", "Initiated telephone call with prospect");
    } else if (channel === "instagram") {
      window.open(`https://instagram.com/`, "_blank");
      saveToCRM("pitch_sent", "Sent outreach message via Instagram");
    } else {
      toast.error("Contact info not available for this channel");
    }
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 5 — Outreach"
        subtitle="Claude writes a personalized first message + day-3 follow-up, tailored to the lead. WhatsApp, Email, Phone Call, or Instagram."
        onPrev={onPrev}
      >
        <IncompleteState
          title="No lead selected yet"
          description="Outreach is written per-lead by AI — using their business name, biggest gap, and reachable channels. Pick a prospect in Phase 3 to draft outreach here."
          prevPhaseLabel="Rank"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  const channels: { id: OutreachChannel; label: string; icon: typeof MessageCircle; badge?: string }[] = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, badge: selected.whatsapp || selected.phone ? "Ready" : undefined },
    { id: "call", label: "Phone Call", icon: Phone, badge: selected.phone ? "Dialer" : undefined },
    { id: "email", label: "Email", icon: Mail, badge: customEmail || selected.email ? "Direct" : "Editable" },
    { id: "instagram", label: "Instagram", icon: Camera },
  ];

  const hasDrafts = !!message || !!followUp;

  return (
    <PhaseShell
      title="Phase 5 — Multi-Channel Outreach"
      subtitle="AI writes custom high-converting outreach: WhatsApp messages, cold-call phone scripts, professional emails, and day-3 follow-ups."
      onPrev={onPrev}
    >
      {/* Lead Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-card border border-border">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Target Prospect</div>
          <div className="font-display text-2xl font-bold mt-1 text-foreground">{selected.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
            <span>{selected.category} · {selected.city}</span>
            {selected.phone && (
              <>
                <span>·</span>
                <a href={`tel:${selected.phone}`} className="text-primary hover:underline flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {selected.phone}
                </a>
              </>
            )}
            {(customEmail || selected.email) && (
              <>
                <span>·</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {customEmail || selected.email}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-muted/40 p-2 rounded-xl border border-border/60 self-start sm:self-auto">
          <Label htmlFor="lang" className="text-xs font-medium cursor-pointer">English</Label>
          <Switch
            id="lang"
            checked={lang === "hinglish"}
            onCheckedChange={(c) => setLang(c ? "hinglish" : "english")}
          />
          <Label htmlFor="lang" className="text-xs font-bold text-primary cursor-pointer">Hinglish</Label>
        </div>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {channels.map(({ id, label, icon: Icon, badge }) => (
            <Button
              key={id}
              variant={channel === id ? "default" : "outline"}
              size="sm"
              onClick={() => setChannel(id)}
              className={`h-9 text-xs gap-1.5 rounded-xl ${channel === id ? "shadow-md shadow-primary/20 font-bold" : ""}`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                  channel === id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}>
                  {badge}
                </span>
              )}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => setReportOpen(true)} className="text-xs h-9 rounded-xl">
            <FileText className="h-4 w-4 mr-1.5 text-primary" /> View PDF Audit
          </Button>
          <Button onClick={generate} disabled={generating} className="h-9 px-4 text-xs font-bold rounded-xl shadow-md">
            {generating ? "AI is drafting…" : hasDrafts ? "Regenerate" : "Draft with AI"}
          </Button>
        </div>
      </div>

      {/* Demo URL & Recipient Bar */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
              <LinkIcon className="h-3.5 w-3.5" /> Deployed Demo Website URL
            </div>
            <Input
              value={demoUrl}
              onChange={(e) => handleDemoUrlChange(e.target.value)}
              placeholder="e.g. https://dr-mehta-bandra.vercel.app"
              className="h-9 text-xs bg-background"
            />
            <div className="text-[10px] text-muted-foreground">
              Auto-replaces demo placeholders across all messages and call scripts.
            </div>
          </div>

          {channel === "email" && (
            <div className="space-y-1">
              <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                <Mail className="h-3.5 w-3.5" /> Recipient Email Address
              </div>
              <Input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="Enter client email (e.g. contact@business.com)"
                className="h-9 text-xs bg-background"
              />
              <div className="text-[10px] text-muted-foreground">
                Target address for the 1-click email client launcher.
              </div>
            </div>
          )}

          {channel === "call" && (
            <div className="space-y-1">
              <div className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                <PhoneCall className="h-3.5 w-3.5" /> Phone Dialer Destination
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={selected.phone || selected.whatsapp || "No number on file"}
                  readOnly
                  className="h-9 text-xs bg-background/80 font-mono"
                />
                <Button
                  size="sm"
                  onClick={() => openChannel()}
                  disabled={!selected.phone && !selected.whatsapp}
                  className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shrink-0"
                >
                  <Phone className="h-3.5 w-3.5" /> Dial Now
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Opens your native phone dialer or VoIP caller directly.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generating && <div className="mb-6"><ClaudeThinking label="AI is writing tailored outreach for this prospect…" /></div>}
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
            <div className="font-display text-xl mb-1">Pick a channel + language above</div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Select WhatsApp, Phone Call, Email, or Instagram and click &ldquo;Draft with AI&rdquo; to generate ready-to-use outreach copy.
            </p>
          </CardContent>
        </Card>
      )}

      {hasDrafts && !generating && (
        <>
          {/* SPECIAL VIEW: PHONE CALL CHANNEL */}
          {channel === "call" ? (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Script Card */}
                <Card className="lg:col-span-2 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-emerald-500" />
                      <span>Cold Call Tele-Pitch Script</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => copy(message, "Call script copied!")} className="text-xs h-8">
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy Script
                      </Button>
                      <Button size="sm" onClick={openChannel} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-bold">
                        <Phone className="h-3.5 w-3.5 mr-1" /> Call Now
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {callScriptData ? (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> 1. OPENER & HOOK (10 SECONDS)
                          </div>
                          <p className="text-sm leading-relaxed text-foreground font-medium">{callScriptData.hook}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500" /> 2. OBSERVATION & REVENUE LEAK (20 SECONDS)
                          </div>
                          <p className="text-sm leading-relaxed text-foreground">{callScriptData.observation}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                          <div className="text-[10px] uppercase font-bold tracking-wider text-primary mb-1 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-primary" /> 3. THE FREE DEMO OFFER (15 SECONDS)
                          </div>
                          <p className="text-sm leading-relaxed text-foreground font-medium">{callScriptData.offer}</p>
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="font-mono text-xs min-h-[280px]"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Objection Handling & Outcome */}
                <div className="space-y-4">
                  {/* Objection Handling Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-1.5 text-amber-500">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Live Objection Battle Cards</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(callScriptData?.objectionHandling || [
                        { objection: "Already have a guy / website", response: "Bilkul sir! Bas hamara 1-min demo link dekh lijiye WhatsApp pe, conversions 3x badh jaate hain without extra spend." },
                        { objection: "Too busy right now", response: "Completely understand sir! Main bas WhatsApp pe link drop kar deta hoon, jab free ho tab review kar lijiye." },
                        { objection: "What is the cost?", response: "Demo preview is 100% free with no commitment. Live hosting packages start from just ₹15,000." },
                      ]).map((item, idx) => (
                        <div key={idx} className="border border-border/80 rounded-xl overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => setActiveObjectionIndex(activeObjectionIndex === idx ? null : idx)}
                            className="w-full text-left px-3 py-2 bg-muted/50 hover:bg-muted font-semibold flex items-center justify-between transition"
                          >
                            <span>&ldquo;{item.objection}&rdquo;</span>
                            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${activeObjectionIndex === idx ? "rotate-180" : ""}`} />
                          </button>
                          {activeObjectionIndex === idx && (
                            <div className="p-3 bg-card border-t border-border/60 text-muted-foreground leading-relaxed">
                              <span className="font-bold text-foreground block mb-1">Say this:</span>
                              {item.response}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Call Outcome Logging */}
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Briefcase className="h-4 w-4" /> Log Call Outcome
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        size="sm"
                        onClick={() => saveToCRM("call_booked", "Spoke with owner - Call booked for demo walkthrough")}
                        className="w-full justify-start text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8"
                      >
                        ✅ Call Booked / Demo Sent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveToCRM("pitch_sent", "Called owner - Follow-up requested")}
                        className="w-full justify-start text-xs h-8"
                      >
                        ⏳ Follow-up Later
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Day 3 Follow up Call Script */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Day-3 Follow-Up Call Script</span>
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => copy(followUp, "Follow-up script copied!")} className="text-xs h-7">
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="font-mono text-xs min-h-[90px]"
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            /* STANDARD VIEW: WHATSAPP, EMAIL, INSTAGRAM */
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Primary Pitch Message */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-bold">
                    {channel === "email" ? "Email Pitch" : channel === "whatsapp" ? "WhatsApp Pitch" : "Instagram DM"}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(message)} className="text-xs h-8">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={openChannel}
                      className={`text-xs h-8 font-bold ${
                        channel === "whatsapp" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                      }`}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      {channel === "email" ? "Launch Email Client" : "Open & Send"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {channel === "email" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground">Subject Line</Label>
                        <button
                          type="button"
                          onClick={() => copy(emailSubject, "Subject line copied")}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Copy className="h-2.5 w-2.5" /> Copy Subject
                        </button>
                      </div>
                      <Input
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="font-mono text-xs bg-muted/30"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    {channel === "email" && (
                      <Label className="text-xs font-semibold text-muted-foreground">Email Body</Label>
                    )}
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="font-mono text-xs min-h-[280px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Day-3 Follow-up */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-bold">Day-3 Follow-Up</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(followUp)} className="text-xs h-8">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="font-mono text-xs min-h-[320px]"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bottom Action / Best Send Time Bar */}
          {bestSendTime && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground bg-muted/30 p-3.5 rounded-2xl border border-border">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                <span>Recommended Outreach Time: <strong className="text-foreground">{bestSendTime}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => saveToCRM("pitch_sent")} className="text-xs h-8 font-semibold rounded-xl">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5 text-primary" /> Save to Deals CRM (Pitch Sent)
                </Button>
              </div>
            </div>
          )}

          {/* Completion Banner */}
          <Card className="mt-4 bg-accent/40 border-accent">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-base shrink-0">✓</div>
                  <div>
                    <div className="font-semibold tracking-tight text-foreground">Pipeline complete for {selected.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Lead ➔ audit ➔ ranked ➔ live demo ➔ multi-channel outreach ready. Start connecting to close deals!
                    </div>
                  </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setReportOpen(true)} className="text-xs h-8 font-semibold shrink-0">
                  <FileText className="h-3.5 w-3.5 mr-1.5" /> Download Client PDF Report
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
