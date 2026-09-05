"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Info } from "lucide-react";

interface LeadHealthBadgeProps {
  score: number;
  grade?: "High Opportunity" | "Medium Opportunity" | "Low Opportunity";
  reasons?: string[];
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

export function LeadHealthBadge({
  score,
  grade = "Medium Opportunity",
  reasons = [],
  size = "md",
  interactive = true,
}: LeadHealthBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isHigh = score >= 75 || grade === "High Opportunity";
  const isMedium = score >= 50 && score < 75;

  const colorConfig = isHigh
    ? {
        badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        dotBg: "bg-emerald-500",
        label: "High Opportunity",
      }
    : isMedium
    ? {
        badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        dotBg: "bg-amber-500",
        label: "Medium Opportunity",
      }
    : {
        badgeBg: "bg-muted text-muted-foreground border-border",
        dotBg: "bg-muted-foreground",
        label: "Low Opportunity",
      };

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => interactive && setShowTooltip(true)}
        onMouseLeave={() => interactive && setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 rounded-full font-bold border transition-colors ${
          colorConfig.badgeBg
        } ${size === "sm" ? "text-[10px] px-2 py-0.5" : size === "lg" ? "text-sm px-3.5 py-1.5" : "text-xs px-2.5 py-1"} ${
          interactive ? "cursor-help" : ""
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${colorConfig.dotBg} animate-pulse`} />
        <span className="font-mono">{score}/100</span>
        <span className="font-semibold">{grade || colorConfig.label}</span>
      </div>

      {showTooltip && reasons.length > 0 && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 p-3 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl text-left animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Opportunity Analysis
            </span>
            <span className="text-xs font-mono font-bold">{score}/100</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span className="leading-snug">{r}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 pt-2 border-t border-border/60 text-[10px] text-muted-foreground italic">
            Calculated from website speed, mobile UX, reviews volume, and reachability.
          </div>
        </div>
      )}
    </div>
  );
}
