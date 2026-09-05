"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, HelpCircle, Sparkles, RefreshCw, IndianRupee, DollarSign, ArrowRight } from "lucide-react";
import type { Lead, RevenueAssumptions } from "@/lib/types";

interface RevenueCalculatorProps {
  lead?: Lead | null;
  allLeads?: Lead[];
  onSelectLead?: (leadId: string) => void;
  onNavigateToScraper?: () => void;
  initialMonthlyVisitors?: number;
  initialAvgValue?: number;
  businessName?: string;
  category?: string;
}

export function RevenueOpportunityCalculator({
  lead,
  allLeads = [],
  onSelectLead,
  onNavigateToScraper,
  initialMonthlyVisitors = 1200,
  initialAvgValue = 3500,
  businessName = "",
  category = "",
}: RevenueCalculatorProps) {
  const effectiveBusinessName = lead?.name || businessName;
  const effectiveCategory = lead?.category || category;

  if (!lead && (!allLeads || allLeads.length === 0)) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Calculator className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold font-display text-foreground">
            No Prospect Available for Revenue ROI Modeling
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Scrape local businesses in Phase 1 to calculate exact revenue leakages, mobile conversion upside, and annual ROI projections.
          </p>
        </div>
        {onNavigateToScraper && (
          <Button
            onClick={onNavigateToScraper}
            className="h-10 px-5 text-xs font-bold gap-2 shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 rounded-xl"
          >
            <Sparkles className="h-4 w-4" /> Go to Phase 1 Scraper
          </Button>
        )}
      </div>
    );
  }

  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [visitors, setVisitors] = useState<number>(() => {
    if (lead?.reviewsCount) return Math.max(600, lead.reviewsCount * 20);
    return initialMonthlyVisitors;
  });
  const [currentConvRate, setCurrentConvRate] = useState<number>(1.2);
  const [targetConvRate, setTargetConvRate] = useState<number>(3.8);
  const [avgCustomerValue, setAvgCustomerValue] = useState<number>(initialAvgValue);
  const [closeRate, setCloseRate] = useState<number>(45);

  const calculations = useMemo(() => {
    // Current Monthly Leads & Customers
    const currentLeads = Math.round(visitors * (currentConvRate / 100));
    const currentCustomers = Math.round(currentLeads * (closeRate / 100));
    const currentMonthlyRevenue = currentCustomers * avgCustomerValue;

    // Potential Monthly Leads & Customers
    const potentialLeads = Math.round(visitors * (targetConvRate / 100));
    const potentialCustomers = Math.round(potentialLeads * (closeRate / 100));
    const potentialMonthlyRevenue = potentialCustomers * avgCustomerValue;

    // Opportunity Upside
    const monthlyOpportunity = Math.max(0, potentialMonthlyRevenue - currentMonthlyRevenue);
    const annualOpportunity = monthlyOpportunity * 12;
    const additionalLeadsMonthly = Math.max(0, potentialLeads - currentLeads);
    const additionalClientsMonthly = Math.max(0, potentialCustomers - currentCustomers);

    return {
      currentLeads,
      currentCustomers,
      currentMonthlyRevenue,
      potentialLeads,
      potentialCustomers,
      potentialMonthlyRevenue,
      monthlyOpportunity,
      annualOpportunity,
      additionalLeadsMonthly,
      additionalClientsMonthly,
    };
  }, [visitors, currentConvRate, targetConvRate, avgCustomerValue, closeRate]);

  const currencySymbol = currency === "INR" ? "₹" : "$";

  return (
    <Card className="rounded-3xl border-border/80 bg-card/90 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
              Transparent Financial Model
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Client Acquisition ROI
            </span>
          </div>
          <CardTitle className="text-xl font-bold font-display text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Revenue Opportunity Engine
          </CardTitle>
          {effectiveBusinessName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Transparent revenue upside projection based on conversion funnel optimization for <strong>{effectiveBusinessName}</strong> ({effectiveCategory || "Target Prospect"}).
            </p>
          )}

          {allLeads && allLeads.length > 1 && onSelectLead && (
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Select Prospect:</span>
              <select
                value={lead?.id}
                onChange={(e) => onSelectLead(e.target.value)}
                className="text-xs font-bold bg-muted/80 border border-border/80 rounded-xl px-2.5 py-1 cursor-pointer max-w-xs truncate text-foreground"
              >
                {allLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.category || "Business"})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-semibold">
            <button
              onClick={() => {
                setCurrency("INR");
                setAvgCustomerValue(3500);
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                currency === "INR" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => {
                setCurrency("USD");
                setAvgCustomerValue(150);
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                currency === "USD" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Highlight Result Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent border border-primary/20">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Estimated Monthly Opportunity
            </div>
            <div className="text-3xl font-black font-mono text-primary mt-1">
              {currencySymbol}{calculations.monthlyOpportunity.toLocaleString("en-IN")}
              <span className="text-xs font-semibold text-muted-foreground"> / month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From recovering ~<strong>{calculations.additionalClientsMonthly}</strong> additional paying clients per month.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Estimated Annual Revenue Upside
            </div>
            <div className="text-3xl font-black font-mono text-emerald-500 mt-1">
              {currencySymbol}{calculations.annualOpportunity.toLocaleString("en-IN")}
              <span className="text-xs font-semibold text-muted-foreground"> / year</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on modern mobile UX, sub-second speed, and 1-click WhatsApp booking.
            </p>
          </div>
        </div>

        {/* Interactive Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Monthly Visitors */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Monthly Visitors</span>
              <span className="font-mono text-primary font-bold">{visitors.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={visitors}
              onChange={(e) => setVisitors(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="text-[10px] text-muted-foreground">Local searchers & Maps visitors</div>
          </div>

          {/* Current Conversion Rate */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Current Conv. Rate</span>
              <span className="font-mono text-amber-500 font-bold">{currentConvRate}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={currentConvRate}
              onChange={(e) => setCurrentConvRate(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="text-[10px] text-muted-foreground">Typical benchmark for slow/no website: 0.8%–1.5%</div>
          </div>

          {/* Target Conversion Rate */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Target Conv. Rate</span>
              <span className="font-mono text-emerald-500 font-bold">{targetConvRate}%</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="8.0"
              step="0.2"
              value={targetConvRate}
              onChange={(e) => setTargetConvRate(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="text-[10px] text-muted-foreground">With mobile-first UX & WhatsApp chat: 3.5%–5.5%</div>
          </div>

          {/* Average Customer Value */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Avg. Client Value</span>
              <span className="font-mono text-foreground font-bold">
                {currencySymbol}{avgCustomerValue.toLocaleString()}
              </span>
            </div>
            <Input
              type="number"
              value={avgCustomerValue}
              onChange={(e) => setAvgCustomerValue(Number(e.target.value))}
              className="h-9 text-xs font-mono"
            />
            <div className="text-[10px] text-muted-foreground">Average transaction or treatment fee</div>
          </div>

          {/* Lead-to-Customer Close Rate */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Lead Close Rate</span>
              <span className="font-mono text-purple-500 font-bold">{closeRate}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="85"
              step="5"
              value={closeRate}
              onChange={(e) => setCloseRate(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="text-[10px] text-muted-foreground">Percentage of inquiries turning into paying clients</div>
          </div>

          {/* Funnel Comparison Summary */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2 flex flex-col justify-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Funnel Comparison
            </div>
            <div className="text-xs text-foreground flex items-center justify-between">
              <span>Current Leads:</span>
              <span className="font-mono font-bold">{calculations.currentLeads} / mo</span>
            </div>
            <div className="text-xs text-emerald-500 font-bold flex items-center justify-between">
              <span>Target Leads:</span>
              <span className="font-mono">{calculations.potentialLeads} / mo (+{calculations.additionalLeadsMonthly})</span>
            </div>
          </div>
        </div>

        {/* Assumptions & Methodology Section */}
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-2 text-xs text-muted-foreground">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary" /> Assumptions & Methodology
          </div>
          <p className="leading-relaxed">
            • These projections calculate the <strong>estimated commercial opportunity</strong> resulting from modern website design, Core Web Vitals optimization, and 1-click WhatsApp booking funnels.
          </p>
          <p className="leading-relaxed">
            • They do not constitute a guaranteed financial return, but reflect empirical conversion lifts documented across local service businesses in comparable metropolitan markets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
