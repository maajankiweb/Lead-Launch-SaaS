"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  Laptop,
  Send,
  Flame,
  Briefcase,
  Calculator,
  FolderKanban,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Building2,
  User,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  Database,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type DashboardTab =
  | "overview"
  | "phase1"
  | "phase2"
  | "phase3"
  | "phase4"
  | "phase5"
  | "radar"
  | "proposals"
  | "crm"
  | "calculator"
  | "campaigns"
  | "competitors"
  | "tasks"
  | "clients";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  user: any;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenCampaigns: () => void;
  onOpenCrm: () => void;
  onOpenCalculator: () => void;
  metrics: {
    totalLeads: number;
    auditedCount: number;
    rankedCount: number;
    highPayableCount: number;
    proposalsSentCount: number;
    dealsCount: number;
  };
  activeCampaignTitle: string;
}

export function DashboardSidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  user,
  onLogout,
  metrics,
  activeCampaignTitle,
}: DashboardSidebarProps) {
  const navItems = [
    {
      group: "MAIN HUB",
      items: [
        {
          id: "overview" as DashboardTab,
          label: "Executive Overview",
          shortLabel: "Hub",
          icon: LayoutDashboard,
          badge: null,
          highlight: false,
        },
      ],
    },
    {
      group: "CLIENT PIPELINE",
      items: [
        {
          id: "phase1" as DashboardTab,
          label: "1. Google Scraper",
          shortLabel: "Scrape",
          icon: Search,
          badge: metrics.totalLeads > 0 ? `${metrics.totalLeads}` : null,
          highlight: false,
        },
        {
          id: "phase2" as DashboardTab,
          label: "2. Technical Audit",
          shortLabel: "Audit",
          icon: ShieldCheck,
          badge: metrics.auditedCount > 0 ? `${metrics.auditedCount}` : null,
          highlight: false,
        },
        {
          id: "phase3" as DashboardTab,
          label: "3. AI Lead Ranker",
          shortLabel: "Rank",
          icon: Sparkles,
          badge: metrics.rankedCount > 0 ? `${metrics.rankedCount}` : null,
          highlight: false,
        },
        {
          id: "phase4" as DashboardTab,
          label: "4. Demo Studio",
          shortLabel: "Demo",
          icon: Laptop,
          badge: null,
          highlight: false,
        },
        {
          id: "phase5" as DashboardTab,
          label: "5. Outreach & Pitch",
          shortLabel: "Pitch",
          icon: Send,
          badge: metrics.proposalsSentCount > 0 ? `${metrics.proposalsSentCount}` : null,
          highlight: false,
        },
      ],
    },
    {
      group: "RESEARCH & BENCHMARKS",
      items: [
        {
          id: "competitors" as DashboardTab,
          label: "Competitor Analysis",
          shortLabel: "Rivals",
          icon: Building2,
          badge: null,
          highlight: false,
        },
        {
          id: "calculator" as DashboardTab,
          label: "Revenue ROI Engine",
          shortLabel: "ROI",
          icon: Calculator,
          badge: null,
          highlight: false,
        },
      ],
    },
    {
      group: "CRM & CLOSING",
      items: [
        {
          id: "radar" as DashboardTab,
          label: "High-Payable Radar",
          shortLabel: "Radar",
          icon: Flame,
          badge: metrics.highPayableCount > 0 ? `${metrics.highPayableCount} Hot` : null,
          highlight: true,
        },
        {
          id: "crm" as DashboardTab,
          label: "Deals Pipeline",
          shortLabel: "Pipeline",
          icon: Briefcase,
          badge: metrics.dealsCount > 0 ? `${metrics.dealsCount}` : null,
          highlight: false,
        },
        {
          id: "tasks" as DashboardTab,
          label: "Follow-up Tasks",
          shortLabel: "Tasks",
          icon: Clock,
          badge: "Active",
          highlight: false,
        },
        {
          id: "proposals" as DashboardTab,
          label: "Proposals & Pitches",
          shortLabel: "Proposals",
          icon: FileText,
          badge: metrics.proposalsSentCount > 0 ? `${metrics.proposalsSentCount}` : null,
          highlight: false,
        },
        {
          id: "campaigns" as DashboardTab,
          label: "Saved Campaigns",
          shortLabel: "Campaigns",
          icon: FolderKanban,
          badge: null,
          highlight: false,
        },
      ],
    },
    {
      group: "CLIENT DELIVERY",
      items: [
        {
          id: "clients" as DashboardTab,
          label: "Client Portals",
          shortLabel: "Clients",
          icon: CheckCircle2,
          badge: null,
          highlight: false,
        },
      ],
    },
  ];

  const handleItemClick = (id: DashboardTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-xl border-r border-border/80 select-none text-foreground">
      {/* Brand Header & Collapse Toggle */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/70 gap-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 min-w-0 group"
          title="Lead → Launch Homepage"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary via-emerald-500 to-teal-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-black text-sm tracking-tight truncate leading-none">
                Lead <span className="text-primary font-normal">→</span> Launch
              </span>
              <span className="text-[10px] font-mono text-muted-foreground font-semibold mt-0.5">
                Agency OS v2.5
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-7 w-7 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer shrink-0"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden flex h-7 w-7 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Active Campaign & DB Status Card */}
      {!collapsed ? (
        <div className="p-3 mx-3 my-2 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              Active Pipeline
            </span>
            <span className="flex items-center gap-1 text-emerald-500 font-bold text-[10px]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Atlas DB
            </span>
          </div>
          <div className="font-semibold text-xs text-foreground truncate" title={activeCampaignTitle}>
            {activeCampaignTitle}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground font-medium">
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
              {metrics.totalLeads} leads
            </span>
            {metrics.highPayableCount > 0 && (
              <span className="bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                <Flame className="h-2.5 w-2.5 inline" /> {metrics.highPayableCount} high-ticket
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="py-2.5 flex flex-col items-center justify-center border-b border-border/60 gap-1" title={`${activeCampaignTitle} (${metrics.totalLeads} leads)`}>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-muted-foreground">{metrics.totalLeads}L</span>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 custom-scrollbar">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-1">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={collapsed ? `${item.label} ${item.badge ? `(${item.badge})` : ""}` : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : item.highlight
                      ? "text-orange-500 hover:bg-orange-500/10 dark:hover:bg-orange-500/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  } ${collapsed ? "justify-center px-0 py-2.5" : ""}`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive ? "text-primary-foreground scale-110" : item.highlight ? "text-orange-500" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : item.highlight
                          ? "bg-orange-500/15 text-orange-500 border border-orange-500/30"
                          : "bg-muted text-muted-foreground border border-border/80"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Footer Profile & Settings */}
      <div className="border-t border-border/70 p-2.5 space-y-1.5 bg-background/50">
        {!collapsed ? (
          <div className="p-2 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary/30 to-emerald-500/30 border border-primary/30 text-primary flex items-center justify-center text-xs font-black shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-foreground truncate leading-tight">
                  {user?.name || "Agency User"}
                </span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                  {user?.plan || "FREE"}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-1 gap-2">
            <div
              className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-black cursor-pointer"
              title={`${user?.name} (${user?.plan})`}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <button
              onClick={onLogout}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Back to landing link */}
        {!collapsed && (
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-muted/60 transition font-medium"
          >
            <ArrowLeft className="h-3 w-3" /> View Public Landing Page
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-screen transition-all duration-300 z-30 ${
          collapsed ? "w-18" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
