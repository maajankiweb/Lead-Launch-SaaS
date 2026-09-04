"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Zap,
  HelpCircle,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Target,
  DollarSign,
  Copy,
  Check,
  ChevronRight,
  Activity,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export function EarningCalculator({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Default values
  const [dailyPitches, setDailyPitches] = useState(8);
  const [closeRate, setCloseRate] = useState(8); // %
  const [setupFee, setSetupFee] = useState(25000); // ₹
  const [monthlyRetainer, setMonthlyRetainer] = useState(2000); // ₹/mo
  const [activeTab, setActiveTab] = useState<"calculator" | "packages" | "objections">("calculator");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Dynamic calculations
  const workingDaysPerMonth = 24;
  const monthlyPitches = dailyPitches * workingDaysPerMonth;
  const monthlyClients = Math.max(1, Math.round(monthlyPitches * (closeRate / 100)));
  const month1Upfront = monthlyClients * setupFee;
  const month1MRR = monthlyClients * monthlyRetainer;
  const month3MRR = monthlyClients * 3 * monthlyRetainer;
  const month6MRR = monthlyClients * 6 * monthlyRetainer;
  const month12MRR = monthlyClients * 12 * monthlyRetainer;
  const annualTotalProjected = (monthlyClients * 12 * setupFee) + (monthlyClients * 78 * monthlyRetainer);
  const annualARR = month12MRR * 12;

  const presets = [
    { label: "Solo Starter", pitches: 4, rate: 8, setup: 20000, retainer: 1500, icon: Clock, tag: "1h / day" },
    { label: "Growth Agency", pitches: 8, rate: 10, setup: 25000, retainer: 2000, icon: Flame, tag: "Recommended", isHot: true },
    { label: "Scale Enterprise", pitches: 16, rate: 12, setup: 35000, retainer: 3000, icon: Zap, tag: "Aggressive" },
  ];

  function copyScript(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[92vw] md:w-[90vw] lg:w-[86vw] max-w-5xl max-h-[92vh] overflow-y-auto overflow-x-hidden p-0 border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl">
        {/* SaaS Top Navigation Header */}
        <div className="relative border-b border-border/70 p-6 sm:p-8 bg-gradient-to-b from-muted/30 via-background to-background overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-32 bg-primary/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Revenue Intelligence Engine v2.4
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                Agency Unit Economics & Forecast
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                Simulate your pipeline velocity, upfront cash, and compound Monthly Recurring Revenue (MRR).
              </p>
            </div>

            {/* SaaS Segmented Control Bar */}
            <div className="flex items-center gap-1 bg-muted/70 p-1.5 rounded-2xl border border-border/60 shadow-xs self-start md:self-center overflow-x-auto w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("calculator")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "calculator"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Activity className="h-3.5 w-3.5 text-primary" /> Forecast Model
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("packages")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "packages"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-primary" /> Offer Tiers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("objections")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "objections"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5 text-primary" /> Close Scripts
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Live SaaS Model */}
        {activeTab === "calculator" && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Speed Presets */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <span>Select Strategy Velocity</span>
                <span>Active Model: {dailyPitches} Demos/Day</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presets.map((p) => {
                  const Icon = p.icon;
                  const isSelected = dailyPitches === p.pitches && setupFee === p.setup;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setDailyPitches(p.pitches);
                        setCloseRate(p.rate);
                        setSetupFee(p.setup);
                        setMonthlyRetainer(p.retainer);
                      }}
                      className={`relative flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/40"
                          : "border-border/70 bg-card/60 hover:bg-muted/40 hover:border-border"
                      }`}
                    >
                      {p.isHot && (
                        <span className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          Popular
                        </span>
                      )}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/80 text-muted-foreground border-border/80"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {p.label}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {p.pitches} pitches/d • ₹{p.setup.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SaaS Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6 rounded-3xl border border-border/80 bg-card/80 shadow-sm relative">
              {/* Slider 1 */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Daily WhatsApp Outreach Demos</span>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                    {dailyPitches} demos / day
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={dailyPitches}
                  onChange={(e) => setDailyPitches(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>2 (Casual)</span>
                  <span className="text-primary font-semibold">~{monthlyPitches} prospects / mo</span>
                  <span>25 (Agency Scale)</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Conversion / Close Rate</span>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                    {closeRate}% close rate
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={closeRate}
                  onChange={(e) => setCloseRate(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>3% (Cold Text)</span>
                  <span className="text-primary font-semibold">Demo-first converts at 8–15%</span>
                  <span>20% (High-Ticket)</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Average Website Setup Price</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    ₹{setupFee.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="60000"
                  step="2500"
                  value={setupFee}
                  onChange={(e) => setSetupFee(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>₹10,000 (Basic)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Standard: ₹25,000</span>
                  <span>₹60,000 (Premium)</span>
                </div>
              </div>

              {/* Slider 4 */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Monthly Maintenance Retainer (AMC)</span>
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                    ₹{monthlyRetainer.toLocaleString("en-IN")} / mo
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="6000"
                  step="500"
                  value={monthlyRetainer}
                  onChange={(e) => setMonthlyRetainer(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>₹1,000 / mo</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Standard: ₹2,000 / mo</span>
                  <span>₹6,000 / mo</span>
                </div>
              </div>
            </div>

            {/* SaaS Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1 */}
              <div className="p-5 rounded-3xl border border-primary/25 bg-gradient-to-b from-primary/10 to-primary/5 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Monthly Closed Deals</div>
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-primary mt-2">
                  {monthlyClients} <span className="text-xs font-normal text-muted-foreground">clients/mo</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" /> From {monthlyPitches} outreach demos
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Month 1 Upfront Cash</div>
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                  ₹{month1Upfront.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Immediate project cashflow
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-blue-500/5 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Month 6 Recurring MRR</div>
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                  ₹{month6MRR.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-500" /> Pure passive retainer revenue
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-5 rounded-3xl border border-border/90 bg-card shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Year 1 Total Value</div>
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mt-2">
                  ₹{annualTotalProjected.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3 text-primary" /> Total annual agency run rate
                </div>
              </div>
            </div>

            {/* Compound MRR Growth Timeline */}
            <div className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Monthly Passive Retainer (MRR) Growth Timeline
                  </div>
                  <div className="text-[11px] text-muted-foreground">Cumulative monthly revenue as client retainers compound</div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Year 1 ARR Potential: ₹{annualARR.toLocaleString("en-IN")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 text-center">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Month 01</div>
                  <div className="font-display text-lg font-bold text-primary mt-1">₹{month1MRR.toLocaleString("en-IN")}/mo</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{monthlyClients} client accounts</div>
                </div>

                <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 text-center">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Month 03</div>
                  <div className="font-display text-lg font-bold text-primary mt-1">₹{month3MRR.toLocaleString("en-IN")}/mo</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{monthlyClients * 3} client accounts</div>
                </div>

                <div className="p-3.5 rounded-2xl border border-primary/30 bg-primary/5 text-center">
                  <div className="text-[10px] font-mono text-primary uppercase font-bold">Month 06</div>
                  <div className="font-display text-lg font-bold text-primary mt-1">₹{month6MRR.toLocaleString("en-IN")}/mo</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{monthlyClients * 6} client accounts</div>
                </div>

                <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
                  <div className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Month 12</div>
                  <div className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹{month12MRR.toLocaleString("en-IN")}/mo</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{monthlyClients * 12} client accounts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SaaS Pricing Tiers */}
        {activeTab === "packages" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold">High-Converting Client Pricing Packaging</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Preset agency tiers ready to pitch on WhatsApp and client proposal meetings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Package 1 */}
              <div className="p-6 rounded-3xl border border-border/80 bg-card/70 flex flex-col justify-between space-y-4 shadow-xs">
                <div className="space-y-2.5">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">Starter Package</Badge>
                  <div className="font-display text-xl font-bold">Fast Launch Site</div>
                  <div className="font-display text-2xl font-black text-primary">₹15,000 <span className="text-xs font-normal text-muted-foreground">one-time</span></div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Designed for budget-conscious clinics needing a fast, mobile-friendly digital identity.
                  </p>
                  <ul className="text-xs space-y-2 pt-2 text-foreground/90">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 1-Page Ultra Fast Mobile Landing Page</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 1-Click WhatsApp Instant Consultation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Google Reviews 5★ Rating Embed</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Free 1 Month Hosting & Bug Warranty</li>
                  </ul>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground pt-3 border-t border-border/50">
                  Target: Solo practitioners &lt; 50 reviews
                </div>
              </div>

              {/* Package 2 */}
              <div className="p-6 rounded-3xl border-2 border-primary bg-primary/5 flex flex-col justify-between space-y-4 shadow-lg relative">
                <div className="absolute -top-3 right-5 bg-primary text-primary-foreground text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  80% Close Rate (Core Offer)
                </div>
                <div className="space-y-2.5">
                  <Badge className="text-[10px] font-mono uppercase bg-primary/20 text-primary hover:bg-primary/20">Growth Retainer</Badge>
                  <div className="font-display text-xl font-bold">Patient Acquisition Pro</div>
                  <div className="font-display text-2xl font-black text-primary">₹28,000 <span className="text-xs font-normal text-muted-foreground">+ ₹2,000/mo</span></div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The complete growth engine that turns local searches into daily appointment inquiries.
                  </p>
                  <ul className="text-xs space-y-2 pt-2 text-foreground/90 font-medium">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Luxury Multi-Section Modern UI/UX</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Interactive WhatsApp Consultation Routing</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> LocalBusiness Schema (Google Top 3 Rank)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Monthly Maintenance, Speed Care & Updates</li>
                  </ul>
                </div>
                <div className="text-[10px] font-mono text-primary font-semibold pt-3 border-t border-primary/20">
                  Target: Established practices with 50–250 reviews
                </div>
              </div>

              {/* Package 3 */}
              <div className="p-6 rounded-3xl border border-border/80 bg-card/70 flex flex-col justify-between space-y-4 shadow-xs">
                <div className="space-y-2.5">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">Dominance Tier</Badge>
                  <div className="font-display text-xl font-bold">Local Market Dominator</div>
                  <div className="font-display text-2xl font-black text-primary">₹45,000 <span className="text-xs font-normal text-muted-foreground">+ ₹4,000/mo</span></div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    High-end custom aesthetic presence for multi-branch clinics and cosmetic surgeons.
                  </p>
                  <ul className="text-xs space-y-2 pt-2 text-foreground/90">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Full Brand Identity, Domain & Custom Email</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Before/After Interactive Treatment Case Studies</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Automated Google 5★ QR Review Engine</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 24/7 Priority Tech Support & Monthly SEO Audits</li>
                  </ul>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground pt-3 border-t border-border/50">
                  Target: High-ticket cosmetic & multi-chair dental centers
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SaaS Objection Handling Scripts */}
        {activeTab === "objections" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold">Indian Local Business High-Ticket Closing Scripts</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click copy to use these word-for-word responses during WhatsApp / call discussions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  objection: "Hamare paas already Google Maps listing hai, website ki kya zaroorat?",
                  reply: "Sir Google Maps pe log clinic dekhte zaroor hain, par jab treatment decide karna ho toh 80% log website pe doctor credentials, before/after cases aur pricing check karke WhatsApp karte hain. Website na hone ki wajah se direct inquiries nearby clinics ke paas divert ho jaati hain.",
                },
                {
                  objection: "Abhi budget nahi hai / agle mahine dekhenge.",
                  reply: "Sir maine aapke clinic ka demo already design kar diya hai. Aap ek baar dekh lijiye — agar sirf 2-3 extra consultations bhi aate hain har mahine, toh iska complete cost pehle 15 dino me recover ho jata hai.",
                },
                {
                  objection: "Pahle bhi kisi se website banwayi thi, koi inquiries nahi aayi.",
                  reply: "Sir puraani websites slow aur outdated form wali hoti thi. Hum jo site de rahe hain usme 1-click direct WhatsApp booking button aur local SEO schema baked-in hai, jisse inquiry aana instant aur easy ho jata hai.",
                },
                {
                  objection: "Website maintain kaun karega baad me?",
                  reply: "Sir maintenance ki complete responsibility hamari hai. Hosting, backup, timing change ya koi bhi content update — aapko sirf WhatsApp pe message karna hoga aur hum update kar denge.",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-3xl border border-border/80 bg-card/80 space-y-3 relative group shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-destructive flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />
                      &ldquo;{item.objection}&rdquo;
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyScript(item.reply, idx)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3.5 rounded-2xl border border-border/40 leading-relaxed font-sans">
                    <strong className="text-foreground">Reply:</strong> &ldquo;{item.reply}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
