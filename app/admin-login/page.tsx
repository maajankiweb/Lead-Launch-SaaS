"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, Key } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";

export default function AdminLoginPage() {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter admin credentials");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Admin authentication failed");
      }

      toast.success("Admin authenticated successfully!");
      await refreshUser();
      // Use window.location.href to guarantee cookie session pickup
      window.location.href = "/admin";
    } catch (err: any) {
      toast.error(err.message || "Failed to log into Admin Portal");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-foreground flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-black">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display font-black text-sm tracking-tight flex items-center gap-1.5 text-white">
              <span>Lead & Launch</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Admin Gateway
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">MaaJanki Web Tech Root Portal</p>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-white transition flex items-center gap-1"
        >
          User Login <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-[#0e121b]/95 border border-red-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <Lock className="h-3.5 w-3.5" /> Restricted System Area
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              Master Admin Authentication
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign in with your administrative credentials to manage platform users, global scrapers, and system clusters.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-red-400" /> Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-red-400" /> Master Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/25 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying Credentials…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Authorize & Enter Dashboard
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center text-[11px] text-muted-foreground/60 border-t border-white/5">
            IP Address and session access are encrypted & monitored.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-muted-foreground/60 border-t border-white/5 relative z-10">
        © 2026 Lead & Launch SaaS. Protected by MaaJanki Web Tech Security Guard.
      </footer>
    </div>
  );
}
