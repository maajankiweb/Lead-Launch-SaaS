"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhaseShell } from "./PhaseShell";
import { IncompleteState } from "./IncompleteState";
import { ClaudeThinking, ClaudeRequired } from "./ClaudeStates";
import {
  Copy,
  ExternalLink,
  Sparkles,
  Check,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Rocket,
  Code2,
  Maximize2,
  RefreshCw,
  FileCode,
  CheckCircle2,
  Terminal,
} from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
import type { RankedLead, BuildPromptResult } from "@/lib/types";
import { callClaude } from "@/lib/claudeClient";
import { generateDemoSiteHtml, type DemoSiteTheme } from "@/lib/demoSiteGenerator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PLATFORMS = [
  { id: "lovable", label: "Lovable", url: "https://lovable.dev" },
  { id: "claude-code", label: "Claude Code", url: "https://claude.com/claude-code" },
  { id: "bolt", label: "Bolt.new", url: "https://bolt.new" },
  { id: "codex", label: "Codex / Static", url: "https://chat.openai.com" },
];

export function Phase4Build({
  selected,
  onNext,
  onPrev,
}: {
  selected: RankedLead | null;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [platform, setPlatform] = useState("lovable");
  const [theme, setTheme] = useState<DemoSiteTheme>("modern");
  const [prompt, setPrompt] = useState("");
  const [pitchPoints, setPitchPoints] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingSite, setGeneratingSite] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);
  const [claudeError, setClaudeError] = useState<string | null>(null);

  // Demo Site State
  const [siteHtml, setSiteHtml] = useState("");
  const [viewportMode, setViewportMode] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "prompt">("preview");
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  const lastFor = useRef<string>("");

  // Initialize or re-generate demo site when selected lead changes
  useEffect(() => {
    if (selected) {
      const generated = generateDemoSiteHtml(selected, { theme });
      setSiteHtml(generated);
    } else {
      setSiteHtml("");
    }
  }, [selected, theme]);

  // Clear the generated prompt when the target lead or platform changes.
  useEffect(() => {
    const key = `${selected?.id ?? ""}:${platform}`;
    if (key !== lastFor.current) {
      setPrompt("");
      setPitchPoints([]);
      setTyped("");
    }
  }, [selected, platform]);

  // Typewriter for the generated prompt.
  useEffect(() => {
    setTyped("");
    if (!prompt) return;
    let i = 0;
    const id = setInterval(() => {
      i += 12;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) clearInterval(id);
    }, 10);
    return () => clearInterval(id);
  }, [prompt]);

  // AI-powered demo site re-generation
  async function generateCustomDemoSite() {
    if (!selected) return;
    setGeneratingSite(true);
    try {
      const res = await fetch("/api/demo-site", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lead: selected, theme }),
      });
      const data = await res.json();
      if (data.html) {
        setSiteHtml(data.html);
        toast.success("AI synthesized custom demo website!");
      } else {
        const fallback = generateDemoSiteHtml(selected, { theme });
        setSiteHtml(fallback);
        toast.success("Generated tailored demo website!");
      }
    } catch {
      const fallback = generateDemoSiteHtml(selected, { theme });
      setSiteHtml(fallback);
      toast.success("Generated tailored demo website!");
    } finally {
      setGeneratingSite(false);
    }
  }

  // Claude prompt generation
  async function generatePrompt() {
    if (!selected) return;
    setGenerating(true);
    setNotInstalled(false);
    setClaudeError(null);
    const res = await callClaude<BuildPromptResult>("/api/build-prompt", { lead: selected, platform });
    setGenerating(false);
    if (!res.ok) {
      if (res.notInstalled) setNotInstalled(true);
      else setClaudeError(res.error);
      toast.error(res.notInstalled ? "Claude Code required" : "Generation failed");
      return;
    }
    lastFor.current = `${selected.id}:${platform}`;
    setPrompt(res.data.prompt);
    setPitchPoints(res.data.pitchPoints ?? []);
    toast.success("AI generated your website prompt");
  }

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied. Paste into " + PLATFORMS.find((p) => p.id === platform)?.label);
  }

  function copyHtmlCode() {
    navigator.clipboard.writeText(siteHtml);
    toast.success("Full HTML source code copied to clipboard!");
  }

  function downloadHtmlFile() {
    if (!selected || !siteHtml) return;
    const blob = new Blob([siteHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `${(selected.name || "demo-site").toLowerCase().replace(/[^a-z0-9]/g, "-")}-index.html`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}!`);
  }

  function openFullscreenDemo() {
    if (!siteHtml) return;
    const blob = new Blob([siteHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  function openPlatform() {
    const url = PLATFORMS.find((p) => p.id === platform)?.url;
    if (url) window.open(url, "_blank");
  }

  if (!selected) {
    return (
      <PhaseShell
        title="Phase 4 — Instant Demo Studio"
        subtitle="AI generates a high-converting, live responsive website demo for your prospect, complete with GitHub & Vercel deployment options."
        onPrev={onPrev}
        onNext={onNext}
        nextDisabled
        nextLabel="Draft outreach"
      >
        <IncompleteState
          title="No lead selected yet"
          description="Run scrape, audit, and rank first, then pick a prospect in Phase 3. The system will build a full live demo website and generator prompt here."
          prevPhaseLabel="Rank"
          onPrev={onPrev}
        />
      </PhaseShell>
    );
  }

  return (
    <PhaseShell
      title="Phase 4 — Instant Demo Studio"
      subtitle="Generate a complete live, tailored website demo for this prospect. Preview on mobile, tablet, and desktop, or deploy in 1-click to Vercel and GitHub."
      onPrev={onPrev}
      onNext={onNext}
      nextLabel="Draft outreach"
    >
      {/* Top Prospect & Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-card border border-border">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Generating for</div>
          <div className="font-display text-2xl font-bold mt-1 text-foreground">{selected.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{selected.category} · {selected.address}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Theme Switcher */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/60">
            <span className="text-[10px] uppercase font-bold text-muted-foreground px-2">Theme:</span>
            <Select value={theme} onValueChange={(v) => setTheme(v as DemoSiteTheme)}>
              <SelectTrigger className="w-[130px] h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern Dark Luxe</SelectItem>
                <SelectItem value="editorial">Warm Editorial</SelectItem>
                <SelectItem value="corporate">Clean Corporate</SelectItem>
                <SelectItem value="vibrant">Vibrant Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateCustomDemoSite}
            disabled={generatingSite}
            className="h-9 px-4 text-xs font-bold gap-1.5 rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generatingSite ? "animate-spin" : ""}`} />
            {generatingSite ? "AI Generating…" : "Regenerate Site"}
          </Button>

          {/* Quick Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={downloadHtmlFile}
            className="h-9 text-xs gap-1.5 rounded-xl"
            title="Download ready-to-host HTML file"
          >
            <Download className="h-3.5 w-3.5 text-primary" /> Download HTML
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeployModalOpen(true)}
            className="h-9 text-xs gap-1.5 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
          >
            <Rocket className="h-3.5 w-3.5" /> Deploy to Vercel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setGithubModalOpen(true)}
            className="h-9 text-xs gap-1.5 rounded-xl border-border hover:bg-muted font-bold"
          >
            <GithubIcon className="h-3.5 w-3.5" /> Export to GitHub
          </Button>
        </div>
      </div>

      {notInstalled && <div className="mb-6"><ClaudeRequired error={claudeError ?? undefined} onRetry={generatePrompt} /></div>}
      {claudeError && !notInstalled && (
        <div className="mb-6 rounded-md border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/5 p-3 text-sm text-[color:var(--destructive)]" role="alert">
          {claudeError}
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Live Interactive Preview */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/80 overflow-hidden shadow-xl">
            {/* Viewport & Device Switcher Toolbar */}
            <div className="p-3 border-b border-border/80 bg-muted/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setViewportMode("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewportMode === "desktop" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewportMode === "tablet" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Tablet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tablet (768px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewportMode === "mobile" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile (375px)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyHtmlCode}
                  className="text-xs h-8 gap-1 rounded-lg"
                >
                  <Copy className="h-3 w-3" /> Copy HTML
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={openFullscreenDemo}
                  className="text-xs h-8 gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Maximize2 className="h-3 w-3" /> Live Fullscreen
                </Button>
              </div>
            </div>

            {/* Responsive Container for iframe */}
            <div className="p-4 bg-slate-950/60 flex items-center justify-center min-h-[580px] overflow-x-auto">
              <div
                className={`transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-background ${
                  viewportMode === "mobile"
                    ? "w-[375px] h-[640px]"
                    : viewportMode === "tablet"
                    ? "w-[768px] h-[640px]"
                    : "w-full h-[640px]"
                }`}
              >
                <iframe
                  title="Interactive Website Preview"
                  srcDoc={siteHtml}
                  className="w-full h-full border-0 bg-transparent"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: AI Prompt & Pitch Intelligence */}
        <div className="lg:col-span-4 space-y-4">
          {/* Pitch Highlights Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-primary">
                <Sparkles className="h-4 w-4" />
                <span>30-Sec Value Pitch for Owner</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Instant WhatsApp Funnel:</strong> Prospective clients in {selected.city} can book appointments in 1-click without phone tag.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Mobile-First Performance:</strong> 90%+ local searches happen on mobile; this site scores 95+ PageSpeed.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Trust & Social Proof:</strong> Prominently highlights their {selected.rating}★ rating and {selected.reviewsCount}+ verified Google reviews.</span>
              </div>
            </CardContent>
          </Card>

          {/* Builder Prompts Generator */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-primary" />
                <span>AI Builder Prompt</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                  <SelectTrigger className="w-[110px] h-7 text-[11px] bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  onClick={generatePrompt}
                  disabled={generating}
                  className="h-8 text-xs font-bold w-full"
                >
                  {generating ? "AI Writing Prompt…" : prompt ? "Regenerate Prompt" : "Generate Platform Prompt"}
                </Button>
              </div>

              {generating ? (
                <ClaudeThinking label="Generating tailored website prompt…" />
              ) : prompt ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Generated Prompt:</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" onClick={openPlatform} className="text-[11px] h-6 px-2 text-primary">
                        <ExternalLink className="h-3 w-3 mr-1" /> Open {PLATFORMS.find((p) => p.id === platform)?.label}
                      </Button>
                      <Button size="sm" variant="outline" onClick={copyPrompt} className="text-[11px] h-6 px-2">
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                    </div>
                  </div>
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono bg-muted/40 rounded-xl p-3.5 max-h-[320px] overflow-y-auto border border-border">
                    {typed}
                    {typed.length < prompt.length && <span className="animate-pulse">▌</span>}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Need to customize in Lovable, Bolt.new, or Claude Code? Click above to generate the full architecture prompt.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deploy to Vercel Modal */}
      <Dialog open={deployModalOpen} onOpenChange={setDeployModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-emerald-500" />
              <span>Deploy Demo Site to Vercel</span>
            </DialogTitle>
            <DialogDescription>
              Launch this demo website live on a free SSL *.vercel.app domain in under 60 seconds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="font-bold text-foreground">Option 1: 1-Click Vercel CLI Deploy</div>
              <p className="text-muted-foreground">
                Download the HTML, open your terminal in the downloaded folder, and run:
              </p>
              <div className="p-2 rounded-lg bg-slate-950 font-mono text-emerald-400 text-[11px] flex items-center justify-between">
                <span>npx vercel --prod</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("npx vercel --prod");
                    toast.success("Command copied!");
                  }}
                  className="text-muted-foreground hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="font-bold text-foreground">Option 2: Deploy from GitHub Repo</div>
              <p className="text-muted-foreground">
                Push the downloaded HTML to your GitHub, then click to import on Vercel:
              </p>
              <Button
                size="sm"
                onClick={() => window.open("https://vercel.com/new", "_blank")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs"
              >
                Open Vercel New Project ↗
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadHtmlFile}
              className="w-full text-xs font-semibold h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download `index.html` Bundle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export to GitHub Modal */}
      <Dialog open={githubModalOpen} onOpenChange={setGithubModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GithubIcon className="h-5 w-5" />
              <span>Export Demo Website to GitHub</span>
            </DialogTitle>
            <DialogDescription>
              Host on GitHub Pages or keep the demo website in your version-controlled portfolio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="font-bold text-foreground">Option 1: Instant GitHub Gist</div>
              <p className="text-muted-foreground">
                Copy the full HTML source code and paste it into a GitHub Gist:
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={copyHtmlCode} className="flex-1 text-xs h-8">
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy HTML
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open("https://gist.github.com", "_blank")}
                  className="flex-1 text-xs h-8"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Gist.github.com
                </Button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
              <div className="font-bold text-foreground">Option 2: Git CLI Push</div>
              <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-300 space-y-1">
                <div>git init</div>
                <div>git add index.html</div>
                <div>git commit -m &quot;feat: demo website for {selected.name}&quot;</div>
                <div>gh repo create demo-{selected.name.toLowerCase().replace(/[^a-z0-9]/g, "-")} --public --push</div>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={downloadHtmlFile}
              className="w-full text-xs font-bold h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download index.html
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PhaseShell>
  );
}
