"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Search,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  TrendingUp,
  Database,
  Download,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Building2,
  Mail,
  Key,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Activity,
  DollarSign,
  Briefcase,
  Sliders,
  Flame,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Stepper } from "@/components/Stepper";
import { Phase1Scrape } from "@/components/Phase1Scrape";
import { Phase2Audit } from "@/components/Phase2Audit";
import { Phase3Rank } from "@/components/Phase3Rank";
import { Phase4Build } from "@/components/Phase4Build";
import { Phase5Outreach } from "@/components/Phase5Outreach";
import type { Lead, AuditResult, RankedLead } from "@/lib/types";
import { toast } from "sonner";

type AdminTab = "overview" | "users" | "scraper" | "payments" | "system";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Overview Data
  const [overviewData, setOverviewData] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Users Data
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Super Scraper 5-Phase Pipeline State (Admin Exclusive)
  const [adminPhase, setAdminPhase] = useState(1);
  const [adminLeads, setAdminLeads] = useState<Lead[]>([]);
  const [adminAudits, setAdminAudits] = useState<Record<string, AuditResult>>({});
  const [adminRanked, setAdminRanked] = useState<RankedLead[]>([]);
  const [adminSelectedId, setAdminSelectedId] = useState<string | null>(null);

  // Payments State
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // System Diagnostics State
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [systemLoading, setSystemLoading] = useState(false);

  // Initial Auth Check
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role?.toUpperCase() !== "ADMIN") {
        router.push("/admin-login");
      }
    }
  }, [user, authLoading, router]);

  // Stepper completion logic for Admin Super Pipeline
  const adminCompleted = useMemo(() => {
    const s = new Set<number>();
    if (adminLeads.length > 0) s.add(1);
    if (Object.keys(adminAudits).length > 0) s.add(2);
    if (adminRanked.length > 0) s.add(3);
    if (adminSelectedId) s.add(4);
    return s;
  }, [adminLeads, adminAudits, adminRanked, adminSelectedId]);

  const adminSelectedRanked = useMemo(
    () => adminRanked.find((r) => r.id === adminSelectedId) ?? null,
    [adminRanked, adminSelectedId]
  );

  // Load Overview Data
  const fetchOverview = async () => {
    try {
      setOverviewLoading(true);
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (res.ok) {
        setOverviewData(data);
      } else {
        toast.error(data.error || "Failed to load admin stats");
      }
    } catch {
      toast.error("Error connecting to admin APIs");
    } finally {
      setOverviewLoading(false);
    }
  };

  // Load Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsersList(data.users);
      }
    } catch {
      toast.error("Failed to load user list");
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Payments
  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (res.ok && data.payments) {
        setPaymentsList(data.payments);
      }
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Load System Diagnostics
  const fetchSystem = async () => {
    try {
      setSystemLoading(true);
      const res = await fetch("/api/admin/system");
      const data = await res.json();
      if (res.ok) {
        setSystemInfo(data);
      }
    } catch {
      toast.error("Failed to load system diagnostics");
    } finally {
      setSystemLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role?.toUpperCase() === "ADMIN") {
      if (activeTab === "overview") fetchOverview();
      if (activeTab === "users") fetchUsers();
      if (activeTab === "payments") fetchPayments();
      if (activeTab === "system") fetchSystem();
    }
  }, [activeTab, user]);

  // User Action Handlers
  const handleUpdateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: newPlan }),
      });
      if (res.ok) {
        toast.success(`User plan updated to ${newPlan}`);
        setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u)));
      } else {
        toast.error("Failed to update user plan");
      }
    } catch {
      toast.error("Error updating user");
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        toast.success(`User role changed to ${newRole}`);
        setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch {
      toast.error("Error updating role");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("User deleted");
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  // Clean all test/dummy accounts from database
  const handleCleanDemoData = async () => {
    if (!confirm("Are you sure you want to purge all dummy/test accounts from MongoDB? Only real registered users and Master Admin will be kept.")) return;
    try {
      const res = await fetch("/api/admin/clean-demo", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Cleaned demo accounts");
        fetchUsers();
        fetchOverview();
      } else {
        toast.error(data.error || "Failed to clean demo data");
      }
    } catch {
      toast.error("Cleanup error");
    }
  };

  if (authLoading || (!user && !overviewData)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-mono text-muted-foreground">Authenticating Master Session…</span>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.agencyName?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans antialiased">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 border-r border-border bg-card/80 backdrop-blur-xl flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-black shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                <span>Lead & Launch</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/25">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">MaaJanki Web Tech HQ</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>SaaS Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>User Directory</span>
            </button>

            <button
              onClick={() => setActiveTab("scraper")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "scraper"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>Super Scraper (5 Phases)</span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "payments"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Payments & MRR</span>
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "system"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Database className="h-4 w-4 shrink-0" />
              <span>System Diagnostics</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2.5">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-foreground truncate">{user?.name || "Super Admin"}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-[11px] h-8 border-border text-foreground hover:bg-muted cursor-pointer">
                <ExternalLink className="h-3 w-3 mr-1" /> View Site
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                window.location.href = "/admin-login";
              }}
              className="text-[11px] h-8 text-destructive border-border hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto max-h-screen">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">SaaS Platform Overview</h1>
                <p className="text-xs text-muted-foreground">Live platform telemetry, MongoDB Atlas clusters, and authentic account counts</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleCleanDemoData} className="border-border text-xs h-9 gap-1.5 cursor-pointer rounded-xl">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" /> Clean Dummy Data
                </Button>
                <Button size="sm" onClick={fetchOverview} className="bg-primary text-primary-foreground text-xs h-9 gap-1.5 cursor-pointer rounded-xl">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
                </Button>
              </div>
            </div>

            {overviewLoading ? (
              <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Computing aggregated cluster metrics…</span>
              </div>
            ) : overviewData ? (
              <>
                {/* 4 Unified KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Users */}
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Total Users</span>
                      <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                        <Users className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-foreground">{overviewData.stats.totalUsers}</div>
                    <div className="text-[11px] text-muted-foreground">Registered Freelancers & Agencies</div>
                  </div>

                  {/* Campaigns */}
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Total Campaigns</span>
                      <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                        <Layers className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-foreground">{overviewData.stats.totalCampaigns}</div>
                    <div className="text-[11px] text-muted-foreground">Active prospecting pipelines</div>
                  </div>

                  {/* Leads */}
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Leads Ingested</span>
                      <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                        <Search className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-foreground">{overviewData.stats.totalLeads}</div>
                    <div className="text-[11px] text-muted-foreground">Scraped from Google Maps</div>
                  </div>

                  {/* Revenue */}
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground">Platform Revenue</span>
                      <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <DollarSign className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${overviewData.stats.totalRevenue?.toLocaleString() || "0"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Recorded subscription volume</div>
                  </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plan distribution */}
                  <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" /> Active Subscription Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-muted/40 border border-border">
                        <span className="font-medium">Starter Free ($0)</span>
                        <span className="font-mono font-bold text-foreground">{overviewData.planStats.FREE || 0} accounts</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-foreground">
                        <span className="font-bold text-primary">Freelancer Pro ($29/mo)</span>
                        <span className="font-mono font-bold text-primary">{overviewData.planStats.PRO || 0} accounts</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-foreground">
                        <span className="font-bold text-purple-600 dark:text-purple-400">Agency Scale ($99/mo)</span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                          {overviewData.planStats.AGENCY_SCALE || overviewData.planStats.AGENCY || 0} accounts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Registered Users */}
                  <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Registered Users
                      </h3>
                      <button onClick={() => setActiveTab("users")} className="text-xs text-primary hover:underline font-semibold cursor-pointer">
                        View all
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {overviewData.recentUsers?.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-muted/30 border border-border">
                          <div>
                            <span className="font-semibold text-foreground">{u.name}</span>
                            <div className="text-[10px] text-muted-foreground font-mono">{u.email}</div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono border-border">
                            {u.plan}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeTab === "users" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">User & Agency Directory</h1>
                <p className="text-xs text-muted-foreground">Authentic accounts registered in MongoDB Atlas ({usersList.length})</p>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, agency..."
                  className="px-3.5 py-2 rounded-xl text-xs bg-background border border-border text-foreground w-64 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button size="sm" onClick={fetchUsers} className="bg-primary text-primary-foreground text-xs h-9 cursor-pointer rounded-xl">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {usersLoading ? (
              <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Loading user database…</span>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Agency Profile</th>
                        <th className="p-4">Subscription Plan</th>
                        <th className="p-4">System Role</th>
                        <th className="p-4 text-center">Campaigns</th>
                        <th className="p-4 text-center">Deals</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition">
                          <td className="p-4">
                            <div className="font-bold text-foreground">{u.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{u.email}</div>
                          </td>
                          <td className="p-4">
                            {u.agencyName ? (
                              <span className="text-foreground font-medium flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {u.agencyName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">Solo Freelancer</span>
                            )}
                          </td>
                          <td className="p-4">
                            <select
                              value={u.plan || "FREE"}
                              onChange={(e) => handleUpdateUserPlan(u.id, e.target.value)}
                              className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground font-mono cursor-pointer"
                            >
                              <option value="FREE">Starter Free ($0)</option>
                              <option value="PRO">Freelancer Pro ($29)</option>
                              <option value="AGENCY_SCALE">Agency Scale ($99)</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.role || "FREELANCER"}
                              onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                              className={`bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                                u.role === "ADMIN" ? "text-primary" : "text-foreground"
                              }`}
                            >
                              <option value="FREELANCER">FREELANCER</option>
                              <option value="AGENCY">AGENCY</option>
                              <option value="ADMIN">SUPER ADMIN</option>
                            </select>
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-primary">
                            {u.campaignsCount || 0}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {u.dealsCount || 0}
                          </td>
                          <td className="p-4 text-right">
                            {u.id !== user?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUPER SCRAPER (FULL 5-PHASE PIPELINE FOR SUPER ADMIN) */}
        {activeTab === "scraper" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
                  <Flame className="h-6 w-6 text-primary" /> Admin Super Scraper & Prospecting Engine
                </h1>
                <p className="text-xs text-muted-foreground">
                  Execute the complete 5-Phase pipeline (Lead Scraping, Technical Audit, Opportunity Ranking, AI Mockups, and Outreach Scripts)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAdminLeads([]);
                    setAdminAudits({});
                    setAdminRanked([]);
                    setAdminSelectedId(null);
                    setAdminPhase(1);
                    toast.info("Super pipeline reset");
                  }}
                  className="text-xs h-9 border-border hover:bg-muted cursor-pointer rounded-xl"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Engine
                </Button>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
              <Stepper current={adminPhase} onJump={setAdminPhase} completed={adminCompleted} />
            </div>

            {/* 5-Phase Super Workflow Container */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <AnimatePresence mode="wait">
                {adminPhase === 1 && (
                  <Phase1Scrape
                    key="p1"
                    leads={adminLeads}
                    setLeads={setAdminLeads}
                    onNext={() => setAdminPhase(2)}
                  />
                )}

                {adminPhase === 2 && (
                  <Phase2Audit
                    key="p2"
                    leads={adminLeads}
                    audits={adminAudits}
                    setAudits={setAdminAudits}
                    onPrev={() => setAdminPhase(1)}
                    onNext={() => setAdminPhase(3)}
                  />
                )}

                {adminPhase === 3 && (
                  <Phase3Rank
                    key="p3"
                    leads={adminLeads}
                    audits={adminAudits}
                    ranked={adminRanked}
                    setRanked={setAdminRanked}
                    selectedId={adminSelectedId}
                    setSelectedId={setAdminSelectedId}
                    onPrev={() => setAdminPhase(2)}
                    onNext={() => {
                      if (!adminSelectedId && adminRanked.length > 0) {
                        setAdminSelectedId(adminRanked[0].id);
                      }
                      setAdminPhase(4);
                    }}
                  />
                )}

                {adminPhase === 4 && (
                  <Phase4Build
                    key="p4"
                    selected={adminSelectedRanked}
                    onPrev={() => setAdminPhase(3)}
                    onNext={() => setAdminPhase(5)}
                  />
                )}

                {adminPhase === 5 && (
                  <Phase5Outreach
                    key="p5"
                    selected={adminSelectedRanked}
                    onPrev={() => setAdminPhase(4)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENTS & MRR */}
        {activeTab === "payments" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">Payment & Subscription Logs</h1>
                <p className="text-xs text-muted-foreground">Track all subscription orders, Stripe/Razorpay invoices, and MRR volume</p>
              </div>
              <Button size="sm" onClick={fetchPayments} className="bg-primary text-primary-foreground text-xs h-9 gap-1.5 cursor-pointer rounded-xl">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>

            {paymentsLoading ? (
              <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Loading transaction records…</span>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Purchased Plan</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Gateway</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground">
                      {paymentsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                            No payment transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        paymentsList.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/30 transition">
                            <td className="p-4 font-mono text-muted-foreground">{p.transactionId || p.id}</td>
                            <td className="p-4">
                              <div className="font-bold text-foreground">{p.userName || "Subscriber"}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{p.userEmail}</div>
                            </td>
                            <td className="p-4 font-bold text-primary uppercase">{p.plan}</td>
                            <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {p.currency === "INR" ? `₹${p.amount}` : `$${p.amount}`}
                            </td>
                            <td className="p-4 uppercase font-mono text-[10px] text-muted-foreground">{p.provider}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-right text-muted-foreground font-mono text-[11px]">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SYSTEM DIAGNOSTICS */}
        {activeTab === "system" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">System Diagnostics & DB Clusters</h1>
                <p className="text-xs text-muted-foreground">Monitor live MongoDB Atlas status, Apify crawlers, and server runtime</p>
              </div>
              <Button size="sm" onClick={fetchSystem} className="bg-primary text-primary-foreground text-xs h-9 gap-1.5 cursor-pointer rounded-xl">
                <RefreshCw className="h-3.5 w-3.5" /> Re-Test
              </Button>
            </div>

            {systemLoading ? (
              <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Running cluster diagnostics…</span>
              </div>
            ) : systemInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Health Card */}
                <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-500" /> MongoDB Atlas Cloud Connection
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-muted-foreground">Cluster URI</span>
                      <span className="font-mono text-foreground">cluster0.772mcnf.mongodb.net</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-muted-foreground">Database Status</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Operational ({systemInfo.database?.latencyMs}ms latency)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-muted-foreground">Active Node Runtime</span>
                      <span className="font-mono text-foreground">{systemInfo.nodeVersion} ({systemInfo.environment?.nodeEnv})</span>
                    </div>
                  </div>
                </div>

                {/* API Integrations Card */}
                <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" /> Integrated Service Tokens
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-muted-foreground">Google Places (Apify Token)</span>
                      <span className={systemInfo.environment?.hasApifyToken ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-500 font-medium"}>
                        {systemInfo.environment?.hasApifyToken ? "Configured & Active" : "Seed Simulator Fallback"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-muted-foreground">Auth JWT Secret</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Encrypted & Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <span className="text-muted-foreground">Anthropic Claude CLI/API</span>
                      <span className="text-foreground font-mono">User/System Managed</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
